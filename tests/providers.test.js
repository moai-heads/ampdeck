import test from 'node:test';
import assert from 'node:assert/strict';
import { LocalAudioProvider, SpotifyLinkProvider, providerRegistry } from '../src/providers.js';

const spotify = new SpotifyLinkProvider();
const id = '4uLU6hMCjMI75M1A2tKUQC';

test('provider registry exposes local audio and Spotify providers', () => {
  assert.deepEqual(providerRegistry.list().map(({ id }) => id), ['local', 'spotify']);
  assert.equal(providerRegistry.get('spotify').name, 'Spotify');
});

test('local provider accepts common audio file types and describes files', () => {
  const provider = new LocalAudioProvider();
  const file = { name: 'Night Shift.FLAC', type: 'audio/flac' };
  assert.equal(provider.accepts(file), true);
  assert.equal(provider.accepts({ name: 'demo.txt', type: 'text/plain' }), false);
  assert.deepEqual(provider.describe(file, 'blob:audio', '03:12'), {
    title: 'Night Shift', artist: 'Local file', source: 'Night Shift.FLAC',
    duration: '03:12', url: 'blob:audio', file, album: 'Local library',
    metaData: { title: 'Night Shift', artist: 'Local file', album: 'Local library' },
  });
});

test('Spotify share URLs become safe canonical destinations', () => {
  const result = spotify.parse(`https://open.spotify.com/track/${id}?si=share-token`);
  assert.equal(result.type, 'track');
  assert.equal(result.id, id);
  assert.equal(result.canonicalUrl, `https://open.spotify.com/track/${id}`);
  assert.equal(Object.hasOwn(result, 'embedUrl'), false);
});

test('Spotify URIs and links for supported item types are accepted', () => {
  assert.equal(spotify.parse(`spotify:playlist:${id}`).type, 'playlist');
  for (const type of ['album', 'artist', 'show', 'episode']) {
    assert.equal(spotify.parse(`https://open.spotify.com/${type}/${id}`).type, type);
  }
});

test('Spotify parser rejects unsafe hosts, insecure URLs, malformed IDs, and unknown types', () => {
  for (const value of [
    `https://open.spotify.com.evil.example/track/${id}`,
    `http://open.spotify.com/track/${id}`,
    `https://evil.example/track/${id}`,
    'spotify:track:bad-id',
    'https://open.spotify.com/search/ambient',
    '',
  ]) assert.throws(() => spotify.parse(value));
});
