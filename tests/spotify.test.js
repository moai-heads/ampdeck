import test from 'node:test';
import assert from 'node:assert/strict';
import { createCodeChallenge, createRandomString, makeSpotifyTrack, SPOTIFY_SCOPES, spotifyPlayback } from '../src/spotify.js';

// RFC 7636 PKCE SHA-256 test vector.
test('PKCE challenge is the RFC 7636 S256 value', async () => {
  const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
  assert.equal(await createCodeChallenge(verifier), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
});

test('PKCE verifier uses only URL-safe characters and requested length', () => {
  const verifier = createRandomString(96);
  assert.equal(verifier.length, 96);
  assert.match(verifier, /^[A-Za-z0-9._~-]+$/);
});

test('SDK requests playback, current state and user authorization scopes', () => {
  assert.ok(SPOTIFY_SCOPES.includes('streaming'));
  assert.ok(SPOTIFY_SCOPES.includes('user-modify-playback-state'));
  assert.ok(SPOTIFY_SCOPES.includes('user-read-playback-state'));
});

test('Spotify API search track becomes a Webamp track with Spotify metadata', () => {
  const item = {
    uri: 'spotify:track:abc123',
    name: 'Night Signal',
    duration_ms: 185000,
    artists: [{ name: 'Nova' }, { name: 'Halcyon' }],
    album: { name: 'Signals', images: [{ url: 'https://i.scdn.co/image/art' }] },
  };
  assert.deepEqual(makeSpotifyTrack(item), {
    url: 'spotify:track:abc123',
    defaultName: 'Night Signal',
    duration: 185,
    metaData: { title: 'Night Signal', artist: 'Nova, Halcyon', album: 'Signals', albumArtUrl: 'https://i.scdn.co/image/art' },
  });
});

test('Spotify and local sources switch through separate, unprocessed media paths', async () => {
  const oldWindow = globalThis.window;
  const oldAudio = globalThis.Audio;
  const originalPauseActive = spotifyPlayback.pauseActive;
  const originalPlayUri = spotifyPlayback.playUri;
  let pausedSpotify = 0;
  let playedSpotify = 0;

  class FakeAudio {
    constructor() { this.currentTime = 0; this.duration = 0; this.volume = 1; this.src = ''; this.paused = true; }
    addEventListener() {}
    pause() { this.paused = true; }
    removeAttribute(name) { if (name === 'src') this.src = ''; }
    load() {}
    async play() { this.paused = false; }
  }
  class FakeAudioContext {
    constructor() { this.state = 'running'; }
    createAnalyser() { return { fftSize: 2048 }; }
    async close() { this.state = 'closed'; }
  }

  globalThis.window = { AudioContext: FakeAudioContext, setInterval: () => 1, clearInterval() {} };
  globalThis.Audio = FakeAudio;
  spotifyPlayback.pauseActive = async () => { pausedSpotify += 1; };
  spotifyPlayback.playUri = async () => { playedSpotify += 1; };

  try {
    const { SpotifyMediaAdapter } = await import('../src/spotify-media.js');
    const media = new SpotifyMediaAdapter();
    await media.loadFromUrl('spotify:track:abc123', true);
    assert.equal(media.mode, 'spotify');
    assert.equal(playedSpotify, 1);
    assert.equal(media.audio.paused, true);

    await media.loadFromUrl('blob:local-track', false);
    assert.equal(media.mode, 'local');
    assert.equal(pausedSpotify, 1);
    assert.equal(media.audio.src, 'blob:local-track');
    assert.ok(media.getAnalyser(), 'analyser is inert and has no Spotify audio source');
    media.dispose();
  } finally {
    spotifyPlayback.pauseActive = originalPauseActive;
    spotifyPlayback.playUri = originalPlayUri;
    if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow;
    if (oldAudio === undefined) delete globalThis.Audio; else globalThis.Audio = oldAudio;
  }
});
