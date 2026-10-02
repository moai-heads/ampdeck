/** Small provider registry: source adapters can register without coupling their
 *  details to the UI. Spotify URI parsing stays provider-agnostic. */
export class ProviderRegistry {
  constructor() { this.providers = new Map(); }
  register(provider) {
    if (!provider?.id || this.providers.has(provider.id)) throw new Error('Provider needs a unique id.');
    this.providers.set(provider.id, provider);
    return this;
  }
  get(id) { return this.providers.get(id); }
  list() { return [...this.providers.values()]; }
}

export class LocalAudioProvider {
  id = 'local';
  name = 'Local files';
  accepts(file) {
    return file.type.startsWith('audio/') || /\.(mp3|wav|ogg|oga|flac|m4a|aac|opus|aiff|wma)$/i.test(file.name);
  }
  describe(file, url, duration) {
    const title = file.name.replace(/\.[^.]+$/, '');
    return {
      title, artist: 'Local file', source: file.name, duration, url, file,
      album: 'Local library',
      metaData: { title, artist: 'Local file', album: 'Local library' },
    };
  }
}

const SPOTIFY_TYPES = new Set(['track', 'playlist', 'album', 'artist', 'show', 'episode']);
const SPOTIFY_ID = /^[A-Za-z0-9]+$/;

export class SpotifyLinkProvider {
  id = 'spotify';
  name = 'Spotify';

  parse(input) {
    const value = String(input || '').trim();
    let type;
    let id;
    const uri = value.match(/^spotify:(track|playlist|album|artist|show|episode):([A-Za-z0-9]+)$/i);
    if (uri) {
      [, type, id] = uri;
    } else {
      let url;
      try { url = new URL(value); }
      catch { throw new Error('Paste a full Spotify link or URI.'); }
      if (url.protocol !== 'https:' || url.hostname !== 'open.spotify.com') {
        throw new Error('Use a standard https://open.spotify.com/ link (short links are not supported).');
      }
      const parts = url.pathname.split('/').filter(Boolean);
      const index = parts.findIndex((part) => SPOTIFY_TYPES.has(part.toLowerCase()));
      if (index < 0 || !parts[index + 1]) throw new Error('That Spotify link is not a track, playlist, album, artist, show, or episode.');
      type = parts[index].toLowerCase();
      id = parts[index + 1];
    }
    if (!SPOTIFY_TYPES.has(type.toLowerCase()) || !SPOTIFY_ID.test(id)) throw new Error('That Spotify link or URI is not valid.');
    type = type.toLowerCase();
    return { type, id, canonicalUrl: `https://open.spotify.com/${type}/${id}` };
  }
}

export const providerRegistry = new ProviderRegistry()
  .register(new LocalAudioProvider())
  .register(new SpotifyLinkProvider());
