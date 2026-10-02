import { spotifyPlayback } from './spotify.js';

const isSpotifyUri = (value) => /^spotify:track:[A-Za-z0-9]+$/.test(String(value));

class EventHub {
  constructor() { this.listeners = new Map(); }
  on(name, callback) {
    if (!this.listeners.has(name)) this.listeners.set(name, new Set());
    this.listeners.get(name).add(callback);
  }
  emit(name, ...args) {
    for (const callback of this.listeners.get(name) || []) callback(...args);
  }
  clear() { this.listeners.clear(); }
}

/**
 * Adapts Webamp's transport/skin UI to Spotify's official Web Playback SDK.
 * Spotify's protected stream stays inside the SDK; Ampdeck never receives or
 * processes Spotify audio samples. Local files use a separate HTMLAudioElement.
 */
export class SpotifyMediaAdapter {
  constructor() {
    this.events = new EventHub();
    this.audio = new Audio();
    this.mode = 'local';
    this.url = '';
    this.remoteState = spotifyPlayback.state;
    this.durationSeconds = 0;
    this.lastUri = '';
    this.lastRemoteProgress = 0;
    this.lastRemoteProgressAt = performance.now();
    this.volume = 0.78;
    this.context = null;
    this.inertAnalyser = null;
    this.disposed = false;

    // Webamp expects an analyser node. Keep it deliberately disconnected: the
    // SDK does not expose Spotify's audio, and no Spotify visualizer is produced.
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.context = new AudioContextClass();
        this.inertAnalyser = this.context.createAnalyser();
      }
    } catch { /* AudioContext is not required for playback. */ }

    this.audio.addEventListener('timeupdate', () => this.events.emit('timeupdate'));
    this.audio.addEventListener('durationchange', () => {
      this.events.emit('fileLoaded');
      this.events.emit('stopWaiting');
    });
    this.audio.addEventListener('playing', () => {
      this.events.emit('playing');
      this.events.emit('stopWaiting');
    });
    this.audio.addEventListener('waiting', () => this.events.emit('waiting'));
    this.audio.addEventListener('ended', () => this.events.emit('ended'));
    this.unsubscribeState = spotifyPlayback.on('state', (state) => this.onRemoteState(state));
    this.remoteTimer = window.setInterval(() => {
      if (this.mode === 'spotify' && this.remoteState && !this.remoteState.paused) this.events.emit('timeupdate');
    }, 500);
  }

  on(name, callback) { this.events.on(name, callback); }

  onRemoteState(state) {
    const priorUri = this.remoteState?.track_window?.current_track?.uri || '';
    this.remoteState = state;
    const track = state?.track_window?.current_track;
    const uri = track?.uri || '';
    if (state) {
      this.lastRemoteProgress = state.position || 0;
      this.lastRemoteProgressAt = performance.now();
      if (uri && uri !== priorUri) this.events.emit('fileLoaded');
      if (!state.paused) this.events.emit('playing');
      this.events.emit('stopWaiting');
      this.events.emit('timeupdate');
    }
    const duration = track?.duration_ms || 0;
    if (duration) this.durationSeconds = duration / 1000;
  }

  timeElapsed() {
    if (this.mode !== 'spotify') return this.audio.currentTime || 0;
    const progress = this.remoteState?.position || this.lastRemoteProgress || 0;
    const advancing = this.remoteState && !this.remoteState.paused ? performance.now() - this.lastRemoteProgressAt : 0;
    return Math.max(0, (progress + advancing) / 1000);
  }

  duration() {
    if (this.mode === 'spotify') {
      return (this.remoteState?.track_window?.current_track?.duration_ms || 0) / 1000 || this.durationSeconds;
    }
    return Number.isFinite(this.audio.duration) ? this.audio.duration : 0;
  }

  async loadFromUrl(url, autoPlay) {
    this.url = String(url || '');
    if (isSpotifyUri(this.url)) {
      this.mode = 'spotify';
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.remoteState = spotifyPlayback.state;
      this.durationSeconds = 0;
      if (autoPlay) {
        try { await spotifyPlayback.playUri(this.url); }
        catch (error) { spotifyPlayback.emit('error', error); this.events.emit('stopWaiting'); }
      } else this.events.emit('fileLoaded');
      return;
    }

    // Strictly exclusive sources: stop Spotify before loading local audio.
    if (this.mode === 'spotify') await spotifyPlayback.pauseActive();
    this.mode = 'local';
    this.remoteState = null;
    this.audio.src = this.url;
    this.audio.load();
    if (autoPlay) {
      this.events.emit('waiting');
      try { await this.audio.play(); }
      catch (error) { spotifyPlayback.emit('error', error); this.events.emit('stopWaiting'); }
    }
  }

  async play() {
    if (this.mode === 'spotify') {
      try {
        if (this.remoteState?.track_window?.current_track?.uri === this.url) return await spotifyPlayback.resume();
        return await spotifyPlayback.playUri(this.url);
      } catch (error) { spotifyPlayback.emit('error', error); }
    }
    if (!this.audio.src && this.url) this.audio.src = this.url;
    try { return await this.audio.play(); }
    catch (error) { spotifyPlayback.emit('error', error); }
  }

  pause() {
    if (this.mode === 'spotify') { spotifyPlayback.pause().catch((error) => spotifyPlayback.emit('error', error)); return; }
    this.audio.pause();
  }

  stop() {
    if (this.mode === 'spotify') {
      spotifyPlayback.pause().catch(() => {});
      spotifyPlayback.seek(0).catch(() => {});
      return;
    }
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  seekToPercentComplete(percent) {
    const duration = this.duration();
    const target = Math.max(0, Math.min(duration, duration * Number(percent) / 100));
    if (this.mode === 'spotify') { spotifyPlayback.seek(Math.round(target * 1000)).catch((error) => spotifyPlayback.emit('error', error)); return; }
    if (Number.isFinite(this.audio.duration)) this.audio.currentTime = target;
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(100, Number(value))) / 100;
    if (this.mode === 'spotify') { spotifyPlayback.setVolume(this.volume).catch((error) => spotifyPlayback.emit('error', error)); return; }
    this.audio.volume = this.volume;
  }

  setBalance() {}
  setPreamp() {}
  setEqBand() {}
  disableEq() {}
  enableEq() {}
  getAnalyser() { return this.inertAnalyser; }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    window.clearInterval(this.remoteTimer);
    this.unsubscribeState?.();
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.events.clear();
    if (this.context && this.context.state !== 'closed') this.context.close();
  }
}

export const isSpotifyTrackUri = isSpotifyUri;
