const AUTH_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_ROOT = 'https://api.spotify.com/v1';
const SDK_URL = 'https://sdk.scdn.co/spotify-player.js';
export const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
];

const TOKEN_KEY = 'ampdeck.spotify.tokens';
const CLIENT_ID_KEY = 'ampdeck.spotify.clientId';
const VERIFIER_KEY = 'ampdeck.spotify.pkce.verifier';
const STATE_KEY = 'ampdeck.spotify.pkce.state';

export function createRandomString(length = 64) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return [...bytes].map((value) => alphabet[value % alphabet.length]).join('');
}

export async function createCodeChallenge(verifier) {
  const bytes = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function makeSpotifyTrack(track) {
  return {
    url: track.uri,
    defaultName: track.name,
    duration: track.duration_ms / 1000,
    metaData: {
      title: track.name,
      artist: track.artists?.map((artist) => artist.name).join(', ') || 'Spotify artist',
      album: track.album?.name || 'Spotify',
      albumArtUrl: track.album?.images?.[0]?.url,
    },
  };
}

export class SpotifyPlayback {
  constructor() {
    this.player = null;
    this.deviceId = null;
    this.state = null;
    this.status = 'disconnected';
    this.listeners = new Map();
    this.sdkPromise = null;
    this.connectingPromise = null;
    this.clientId = typeof window === 'undefined' ? '' : window.localStorage.getItem(CLIENT_ID_KEY) || '';
    this.tokens = this.#readTokens();
  }

  #readTokens() {
    try { return JSON.parse(typeof window === 'undefined' ? 'null' : window.sessionStorage.getItem(TOKEN_KEY) || 'null'); }
    catch { return null; }
  }

  #saveTokens(tokens) {
    this.tokens = tokens;
    if (typeof window === 'undefined') return;
    if (tokens) window.sessionStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    else window.sessionStorage.removeItem(TOKEN_KEY);
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  emit(event, value) {
    for (const callback of this.listeners.get(event) || []) callback(value);
  }

  setClientId(value) {
    this.clientId = String(value || '').trim();
    if (typeof window === 'undefined') return;
    if (this.clientId) window.localStorage.setItem(CLIENT_ID_KEY, this.clientId);
    else window.localStorage.removeItem(CLIENT_ID_KEY);
  }

  getRedirectUri() {
    const base = new URL(import.meta.env.BASE_URL, location.origin);
    if (base.hostname === 'localhost') base.hostname = '127.0.0.1';
    return base.href;
  }

  get connected() {
    return Boolean(this.player && this.deviceId && this.status === 'ready');
  }

  async beginLogin(clientId = this.clientId) {
    this.setClientId(clientId);
    if (!this.clientId) throw new Error('Enter your Spotify Developer Client ID first.');
    if (location.hostname === 'localhost') throw new Error('Spotify no longer accepts localhost OAuth redirects. Reopen Ampdeck at the matching 127.0.0.1 address shown below, then connect.');
    const verifier = createRandomString(96);
    const state = createRandomString(32);
    sessionStorage.setItem(VERIFIER_KEY, verifier);
    sessionStorage.setItem(STATE_KEY, state);
    const challenge = await createCodeChallenge(verifier);
    const query = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.getRedirectUri(),
      code_challenge_method: 'S256',
      code_challenge: challenge,
      state,
      scope: SPOTIFY_SCOPES.join(' '),
    });
    location.assign(`${AUTH_URL}?${query.toString()}`);
  }

  async handleRedirect() {
    const url = new URL(location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    if (!code && !error) return false;
    const state = url.searchParams.get('state');
    const expectedState = sessionStorage.getItem(STATE_KEY);
    const verifier = sessionStorage.getItem(VERIFIER_KEY);
    sessionStorage.removeItem(STATE_KEY);
    sessionStorage.removeItem(VERIFIER_KEY);
    history.replaceState({}, document.title, `${url.pathname}${url.hash}`);
    if (!state || state !== expectedState) throw new Error('Spotify login state did not match. Please connect again.');
    if (error) throw new Error(error === 'access_denied' ? 'Spotify authorization was cancelled.' : `Spotify authorization failed: ${error}`);
    if (!code || !verifier) throw new Error('Spotify authorization response was incomplete. Please connect again.');
    const body = new URLSearchParams({
      client_id: this.clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.getRedirectUri(),
      code_verifier: verifier,
    });
    const response = await fetch(TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    if (!response.ok) throw await this.#responseError(response);
    this.#storeTokenResponse(await response.json());
    return true;
  }

  #storeTokenResponse(data, prior = null) {
    const now = Date.now();
    this.#saveTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token || prior?.refresh_token,
      expires_at: now + (data.expires_in || 3600) * 1000,
    });
  }

  async accessToken() {
    if (!this.tokens?.access_token) throw new Error('Connect your Spotify account first.');
    if (this.tokens.expires_at > Date.now() + 60_000) return this.tokens.access_token;
    if (!this.tokens.refresh_token) {
      this.#saveTokens(null);
      throw new Error('Spotify login expired. Connect again.');
    }
    const body = new URLSearchParams({
      client_id: this.clientId,
      grant_type: 'refresh_token',
      refresh_token: this.tokens.refresh_token,
    });
    const response = await fetch(TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    if (!response.ok) {
      this.#saveTokens(null);
      throw new Error('Spotify login expired. Connect again.');
    }
    this.#storeTokenResponse(await response.json(), this.tokens);
    return this.tokens.access_token;
  }

  async bootstrap() {
    await this.handleRedirect();
    if (this.tokens?.access_token) await this.connect();
  }

  async #loadSdk() {
    if (window.Spotify?.Player) return;
    if (!this.sdkPromise) {
      this.sdkPromise = new Promise((resolve, reject) => {
        let settled = false;
        const finish = (callback, value) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          callback(value);
        };
        const timeout = setTimeout(() => finish(reject, new Error('Spotify Player SDK did not load. Check the connection and try again.')), 15000);
        window.onSpotifyWebPlaybackSDKReady = () => finish(resolve);
        const existing = document.querySelector(`script[src="${SDK_URL}"]`);
        if (existing) return;
        const script = document.createElement('script');
        script.src = SDK_URL;
        script.async = true;
        script.onerror = () => finish(reject, new Error('Could not load Spotify Player SDK.'));
        document.head.appendChild(script);
      }).catch((error) => {
        this.sdkPromise = null;
        document.querySelector(`script[src="${SDK_URL}"]`)?.remove();
        throw error;
      });
    }
    await this.sdkPromise;
  }

  async connect() {
    if (this.connected) return this.deviceId;
    if (this.connectingPromise) return this.connectingPromise;
    this.connectingPromise = this.#connectAndWait();
    try { return await this.connectingPromise; }
    finally { this.connectingPromise = null; }
  }

  async #connectAndWait() {
    if (!this.clientId) throw new Error('Enter a Spotify Developer Client ID first.');
    if (this.player) {
      try { await this.player.disconnect(); } catch { /* replace a stale SDK device */ }
      this.player = null;
      this.deviceId = null;
    }
    await this.#loadSdk();
    this.status = 'connecting';
    this.emit('status', this.status);
    let resolveReady;
    let rejectReady;
    const ready = new Promise((resolve, reject) => { resolveReady = resolve; rejectReady = reject; });
    const readyTimeout = window.setTimeout(() => rejectReady(new Error('Spotify player did not become ready. Confirm that this browser supports EME/protected playback.')), 20000);
    this.player = new window.Spotify.Player({
      name: 'Ampdeck Winamp Player',
      getOAuthToken: async (callback) => {
        try { callback(await this.accessToken()); }
        catch (error) { this.emit('error', error); }
      },
      volume: 0.78,
    });
    this.player.addListener('ready', ({ device_id: deviceId }) => {
      this.deviceId = deviceId;
      this.status = 'ready';
      this.emit('status', this.status);
      resolveReady(deviceId);
    });
    this.player.addListener('not_ready', () => {
      this.deviceId = null;
      this.status = 'reconnecting';
      this.emit('status', this.status);
    });
    this.player.addListener('player_state_changed', (state) => {
      this.state = state;
      this.emit('state', state);
    });
    for (const name of ['authentication_error', 'account_error', 'playback_error', 'initialization_error']) {
      this.player.addListener(name, ({ message }) => {
        const error = new Error(message || `Spotify ${name.replaceAll('_', ' ')}.`);
        this.status = 'error';
        this.emit('status', this.status);
        this.emit('error', error);
        rejectReady(error);
      });
    }
    try {
      const connected = await this.player.connect();
      if (!connected) throw new Error('Spotify Player SDK could not connect. Confirm this browser supports protected playback (EME).');
      return await ready;
    } catch (error) {
      this.player.disconnect();
      this.player = null;
      this.status = 'error';
      this.emit('status', this.status);
      throw error;
    } finally {
      clearTimeout(readyTimeout);
    }
  }

  async request(path, options = {}) {
    const token = await this.accessToken();
    const headers = { Authorization: `Bearer ${token}`, ...options.headers };
    if (options.body && !headers['Content-Type'] && !headers['content-type']) headers['Content-Type'] = 'application/json';
    const response = await fetch(`${API_ROOT}${path}`, { ...options, headers });
    if (!response.ok && response.status !== 204) throw await this.#responseError(response);
    return response.status === 204 ? null : response.json();
  }

  async #responseError(response) {
    let details = '';
    let reason = '';
    try {
      const body = await response.json();
      details = body.error?.message || body.error_description || '';
      reason = body.error?.reason || '';
    } catch { /* response may not be JSON */ }
    if (response.status === 401) return new Error('Spotify authorization expired. Reconnect your account.');
    if (response.status === 403) return new Error(details || 'Spotify denied playback. Check your Premium subscription and that this Spotify account is authorized in the Developer app.');
    if (response.status === 429) return new Error(reason === 'QUOTA_EXCEEDED' ? 'Spotify API quota exceeded for this Developer app. Try again later.' : 'Spotify rate limit reached. Wait a moment and retry.');
    return new Error(details || `Spotify request failed (${response.status}).`);
  }

  async getTrack(id) {
    return this.request(`/tracks/${encodeURIComponent(id)}`);
  }

  async searchTracks(query) {
    const params = new URLSearchParams({ q: query, type: 'track', limit: '8' });
    const data = await this.request(`/search?${params}`);
    return data.tracks?.items || [];
  }

  async playUri(uri) {
    if (!this.deviceId) await this.connect();
    if (!/^spotify:track:[A-Za-z0-9]+$/.test(uri)) throw new Error('Only Spotify track URIs are supported in this first player build.');
    return this.request(`/me/player/play?device_id=${encodeURIComponent(this.deviceId)}`, {
      method: 'PUT',
      body: JSON.stringify({ uris: [uri] }),
    });
  }

  async resume() {
    if (this.player) return this.player.resume();
    if (this.state?.track_window?.current_track?.uri) return this.playUri(this.state.track_window.current_track.uri);
    throw new Error('Choose a Spotify track to start playback.');
  }

  async pause() { return this.player?.pause(); }
  async pauseActive() {
    try { await this.request('/me/player/pause', { method: 'PUT' }); }
    catch { /* No active Spotify device is normal when switching from local mode. */ }
    try { await this.player?.pause(); } catch { /* best effort to keep sources exclusive */ }
  }
  async togglePlay() { return this.player?.togglePlay(); }
  async nextTrack() { return this.player?.nextTrack(); }
  async previousTrack() { return this.player?.previousTrack(); }
  async seek(positionMs) { return this.player?.seek(positionMs); }
  async setVolume(value) { return this.player?.setVolume(Math.max(0, Math.min(1, value))); }

  async disconnect({ forget = false } = {}) {
    try { await this.player?.pause(); } catch { /* best effort */ }
    if (this.player) {
      try { await this.player.disconnect(); } catch { /* best effort */ }
    }
    this.player = null;
    this.deviceId = null;
    this.state = null;
    this.status = 'disconnected';
    if (forget) this.#saveTokens(null);
    this.emit('state', null);
    this.emit('status', this.status);
  }
}

export const spotifyPlayback = new SpotifyPlayback();
