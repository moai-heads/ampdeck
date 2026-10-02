import { providerRegistry } from './providers.js';
import './style.css';

const BASE = import.meta.env.BASE_URL;
const localProvider = providerRegistry.get('local');
const spotifyProvider = providerRegistry.get('spotify-link');
const localControls = ['import-top', 'import-button', 'drop-target', 'play-button', 'next-button'];
const esc = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (name, size = 18) => {
  const paths = {
    wave: '<path d="M3 12h3l2-7 4 14 3-10 2 6h4"/>',
    disc: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M7 7l2 2m6 6 2 2"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    skin: '<path d="m12 3 2.4 4.9L20 9l-4 3.9.9 5.6-4.9-2.6-4.9 2.6.9-5.6L4 9l5.6-1.1L12 3Z"/><path d="M19 14v5m-2.5-2.5h5"/>',
    spotify: '<path d="M4.8 9.1c4.7-1.4 10.6-.8 14.6 1.7M6.1 12.4c3.8-1 8.4-.5 11.7 1.5M7.4 15.6c2.8-.7 6.2-.3 8.7 1.1"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    upload: '<path d="M12 16V4m-4 4 4-4 4 4"/><path d="M4 16v4h16v-4"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    volume: '<path d="M4 10v4h4l5 4V6l-5 4H4Z"/><path d="M17 9a5 5 0 0 1 0 6m2-9a9 9 0 0 1 0 12"/>',
    play: '<path d="m8 5 12 7-12 7V5Z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M8 5h3v14H8zM15 5h3v14h-3z" fill="currentColor" stroke="none"/>',
    prev: '<path d="M6 5v14m13-14-11 7 11 7V5Z"/>',
    next: '<path d="M18 5v14M5 5l11 7-11 7V5Z"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    external: '<path d="M14 4h6v6m0-6-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.wave}</svg>`;
};

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="app-shell" id="app-shell">
    <aside class="sidebar">
      <a class="brand" href="#top" aria-label="Ampdeck home">
        <span class="brand-mark">${icon('wave', 21)}</span><span class="brand-name">ampdeck<span>®</span></span>
      </a>
      <div class="sidebar-kicker">YOUR LISTENING DESK</div>
      <nav class="side-nav" aria-label="Main navigation">
        <a class="nav-item active" href="#desk">${icon('disc')}<span>Now playing</span><b class="nav-dot"></b></a>
        <a class="nav-item" href="#library">${icon('list')}<span>Local library</span><small id="library-count">01</small></a>
        <a class="nav-item" href="#skins">${icon('skin')}<span>Skins & looks</span></a>
      </nav>
      <div class="sidebar-spacer"></div>
      <div class="sidebar-note">
        <div class="note-mark">✳</div>
        <div class="note-title">Built for the<br>beautifully<br>un-square.</div>
        <div class="note-copy">Your skins. Your setup.<br>No algorithm required.</div>
        <a href="#about" class="quiet-link">HOW IT WORKS ${icon('arrow', 13)}</a>
      </div>
      <div class="sidebar-bottom"><span class="green-led"></span> PLAYER READY <span class="version">v0.1</span></div>
    </aside>

    <main class="main-content" id="top">
      <header class="topbar">
        <div class="crumb"><span>AMPDECK</span><i>/</i><b>LISTENING DESK</b></div>
        <div class="top-actions">
          <span class="clock-label"><span class="green-led"></span> YOUR MUSIC, YOUR MACHINE</span>
          <button class="connect-pill" id="connect-top">${icon('spotify', 17)} <span>Open Spotify</span> ${icon('arrow', 14)}</button>
          <button class="avatar-button" title="Customize appearance" id="theme-button">A</button>
        </div>
      </header>

      <div class="page-wrap" id="desk">
        <section class="intro-row">
          <div>
            <div class="eyebrow"><span class="eyebrow-line"></span> THE SKIN-FIRST MUSIC DESK <span class="issue">VOL. 01 · 2026</span></div>
            <h1>Music, <em>your shape.</em></h1>
            <p class="intro-copy">A little modern. A little bit 2002. Completely yours.</p>
          </div>
          <div class="intro-actions">
            <button class="button button-light" id="import-top">${icon('plus', 16)} Add music</button>
            <button class="button button-outline" id="skin-top">${icon('skin', 16)} Load a skin</button>
          </div>
        </section>

        <section class="workbench" aria-label="Music player workbench">
          <div class="deck-column">
            <div class="section-head">
              <div class="section-title"><span class="section-index">01</span><div><span class="micro-label">THE PLAYER</span><h2>Classic mode</h2></div></div>
              <div class="skin-state"><span class="green-led"></span><span id="skin-name">BASE SKIN</span><span class="skin-state-sep">·</span><span>REGION MASK READY</span></div>
            </div>
            <div class="player-stage">
              <div class="stage-grid"></div>
              <div class="stage-topline"><span>AMPDECK / WINDOW RENDERER</span><span>SKIN ENGINE <b>●</b></span></div>
              <div class="stage-halo"></div>
              <div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
              <div id="player-host" class="player-host" aria-label="Webamp classic player"></div>
              <div class="stage-coordinates"><span>34° 03' 12.8" N</span><span>01 — 03</span></div>
              <div class="stage-caption"><span class="stage-caption-mark">◈</span> FREEFORM WINDOWS / CLASSIC SKIN</div>
            </div>
            <div class="transport-row">
              <div class="now-playing-mini">
                <div class="mini-art" id="mini-art"><img src="${BASE}cover.svg" alt="Abstract record artwork"></div>
                <div class="mini-meta"><span class="micro-label">ON DECK</span><b id="track-title">Night Shift (demo)</b><span id="track-artist">Ampdeck Generator</span></div>
              </div>
              <div class="transport-hint"><span class="keycap">DRAG</span> audio files anywhere onto the desk</div>
              <button class="square-button" id="play-button" title="Play or pause">${icon('play', 16)}</button>
              <button class="square-button" id="next-button" title="Next track">${icon('next', 16)}</button>
            </div>
          </div>

          <aside class="side-column">
            <section class="spotify-card" id="spotify-card">
              <div class="card-head"><span class="card-icon spotify-icon">${icon('spotify', 18)}</span><span class="service-status"><span class="status-dot"></span> OPEN IN SPOTIFY</span></div>
              <div class="spotify-title-row"><div><div class="micro-label">EXTERNAL SERVICE / 01</div><h2>Spotify</h2></div><div class="spot-orbit"><span></span><span></span><span></span></div></div>
              <p class="spotify-copy" id="spotify-copy">Open a Spotify link in Spotify’s own site or app. Ampdeck never asks for your Spotify password or API key.</p>
              <form class="spotify-url-row" id="spotify-open-form">
                <input id="spotify-url" type="text" inputmode="url" placeholder="Paste a Spotify link or URI" aria-label="Spotify link or URI" autocomplete="off">
                <button type="submit" aria-label="Open in Spotify">OPEN</button>
              </form>
              <div class="spotify-shortcuts"><a href="https://open.spotify.com/" target="_blank" rel="noreferrer">Sign in / open Spotify ${icon('external', 11)}</a><a href="https://www.spotify.com/us/premium/" target="_blank" rel="noreferrer">Plans & trial info ${icon('external', 11)}</a></div>
              <div class="spotify-foot"><span>LOGIN & PLAYBACK BY SPOTIFY</span><span class="legal-links"><a href="${BASE}terms.html" target="_blank" rel="noreferrer">TERMS</a><a href="${BASE}privacy.html" target="_blank" rel="noreferrer">PRIVACY</a></span></div>
            </section>

            <section class="library-card" id="library">
              <div class="library-head"><div><div class="micro-label">YOUR FILES / 01</div><h3>Local library</h3></div><button class="add-round" id="import-button" aria-label="Add music">${icon('plus', 16)}</button></div>
              <div class="track-list" id="track-list"></div>
              <button class="drop-target" id="drop-target"><span class="drop-icon">${icon('upload', 17)}</span><span><b>Drop in a track</b><small>MP3, WAV, OGG, FLAC + more</small></span>${icon('chevron', 16)}</button>
            </section>
          </aside>
        </section>

        <section class="lower-row" id="skins">
          <div class="lower-card skin-lower-card">
            <div class="lower-icon">${icon('skin', 19)}</div><div class="lower-copy"><span class="micro-label">MAKE IT YOURS / 02</span><h3>Skin it your way.</h3><p>Drop in a classic <code>.wsz</code> skin. Bitmap region masks keep the weird silhouettes intact.</p></div><button class="text-button" id="skin-bottom">Browse skins ${icon('arrow', 15)}</button>
          </div>
          <div class="lower-card provider-lower-card">
            <div class="provider-orbit">✳</div><div class="lower-copy"><span class="micro-label">MORE SOURCES, LATER / 03</span><h3>One deck. Many worlds.</h3><p>Ampdeck plays local audio; Spotify links open in Spotify. Any future service adapter needs its own policy review.</p></div><span class="soon-label"><span class="green-led"></span> EXTENSIBLE</span>
          </div>
        </section>
        <footer class="page-footer" id="about"><span>AMPDECK © 2026</span><span>MADE FOR MUSIC LOVERS & SKIN COLLECTORS</span><span><a href="${BASE}terms.html">TERMS</a> · <a href="${BASE}privacy.html">PRIVACY</a> · <a href="https://github.com/moai-heads/ampdeck" target="_blank" rel="noreferrer">OPEN SOURCE ${icon('external', 12)}</a></span></footer>
      </div>
    </main>
  </div>

  <input type="file" id="audio-input" accept="audio/*,.flac,.opus,.m4a,.aiff" multiple hidden>
  <input type="file" id="skin-input" accept=".wsz,.zip,application/zip" hidden>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
`;

const get = (id) => document.getElementById(id);
const audioInput = get('audio-input');
const skinInput = get('skin-input');
const tracks = [{ title: 'Night Shift (demo)', artist: 'Ampdeck Generator', source: 'Built-in sample', url: `${BASE}demo-loop.wav`, duration: '00:08' }];
let webamp;
let currentSkinUrl = null;
let toastTimer;

function toast(message, isError = false) {
  const node = get('toast');
  node.textContent = message;
  node.classList.toggle('error', isError);
  node.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), 3600);
}

function setTrackDisplay(track = {}) {
  const title = track.metaData?.title || track.title || track.defaultName || 'Unknown track';
  const artist = track.metaData?.artist || track.artist || 'Local audio';
  get('track-title').textContent = title;
  get('track-artist').textContent = artist;
  if (track.metaData?.albumArtUrl) get('mini-art').innerHTML = `<img src="${esc(track.metaData.albumArtUrl)}" alt="Album artwork">`;
}

function renderTrackList() {
  get('library-count').textContent = String(tracks.length).padStart(2, '0');
  get('track-list').innerHTML = tracks.map((track, index) => `
    <button class="track-row ${index === 0 ? 'selected' : ''}" data-track="${index}">
      <span class="track-number">${String(index + 1).padStart(2, '0')}</span>
      <span class="track-art-small"><img src="${BASE}cover.svg" alt=""></span>
      <span class="track-row-info"><b>${esc(track.title)}</b><small>${esc(track.artist)}</small></span>
      <span class="track-duration">${esc(track.duration || '—')}</span>
    </button>`).join('');
  get('track-list').querySelectorAll('[data-track]').forEach((node) => {
    node.addEventListener('click', () => {
      const index = Number(node.dataset.track);
      webamp?.setCurrentTrack(index);
      webamp?.play();
      setTrackDisplay(tracks[index]);
    });
  });
}

async function setupWebamp() {
  const { default: Webamp } = await import('webamp');
  if (!Webamp.browserIsSupported()) {
    get('player-host').innerHTML = '<div class="player-error">This browser does not support the audio features needed by the classic skin player.</div>';
    return;
  }
  webamp = new Webamp({
    initialTracks: tracks.map((track, index) => ({
      url: track.url.startsWith('blob:') ? track.url : `${location.origin}${track.url}`,
      duration: index === 0 ? 8.72 : undefined,
      defaultName: track.title,
      metaData: { title: track.title, artist: track.artist, album: track.album || (index === 0 ? 'Field Recordings · 001' : 'Local library'), ...(index === 0 ? { albumArtUrl: `${location.origin}${BASE}cover.svg` } : {}) },
    })),
    enableHotkeys: false,
  });
  webamp.renderInto(get('player-host')).then(() => {
    get('skin-name').textContent = 'BASE SKIN';
    webamp.onTrackDidChange((track) => {
      if (track) setTrackDisplay(track);
    });
  }).catch((error) => {
    console.error(error);
    toast('The classic player could not start. Try a current desktop browser.', true);
  });
}

function openSpotifyLink(raw = get('spotify-url').value) {
  try {
    const target = spotifyProvider.parse(raw);
    window.open(target.canonicalUrl, '_blank', 'noopener,noreferrer');
    toast(`Opened Spotify ${target.type} in a new tab.`);
  } catch (error) {
    toast(error.message, true);
  }
}

async function handleAudioFiles(files) {
  const audioFiles = [...files].filter((file) => localProvider.accepts(file));
  if (!audioFiles.length) return toast('No audio files found. Drop in an audio file to add it.', true);
  const add = [];
  for (const file of audioFiles) {
    const url = URL.createObjectURL(file);
    const duration = await new Promise((resolve) => {
      const audio = new Audio();
      const probeUrl = URL.createObjectURL(file);
      const finish = (value) => { URL.revokeObjectURL(probeUrl); resolve(value); };
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => finish(Number.isFinite(audio.duration) ? `${String(Math.floor(audio.duration / 60)).padStart(2, '0')}:${String(Math.floor(audio.duration % 60)).padStart(2, '0')}` : '—');
      audio.onerror = () => finish('—');
      audio.src = probeUrl;
    });
    const track = localProvider.describe(file, url, duration);
    tracks.push(track);
    add.push({ url, defaultName: track.title, metaData: track.metaData });
  }
  if (webamp) webamp.appendTracks(add);
  renderTrackList();
  toast(`${audioFiles.length} track${audioFiles.length > 1 ? 's' : ''} added to your local library.`);
}

async function loadSkin(file) {
  if (!file) return;
  const ext = file.name.toLowerCase().split('.').pop();
  if (!['wsz', 'zip'].includes(ext)) return toast('Ampdeck currently accepts classic .wsz skin archives.', true);
  const url = URL.createObjectURL(file);
  const oldUrl = currentSkinUrl;
  currentSkinUrl = url;
  get('skin-name').textContent = 'LOADING…';
  try {
    if (!webamp) throw new Error('The classic player is not ready yet.');
    webamp.setSkinFromUrl(url);
    await webamp.skinIsLoaded();
    get('skin-name').textContent = file.name.replace(/\.(wsz|zip)$/i, '').toUpperCase().slice(0, 22);
    toast(`Loaded skin: ${file.name}`);
    if (oldUrl) URL.revokeObjectURL(oldUrl);
  } catch (error) {
    currentSkinUrl = oldUrl;
    URL.revokeObjectURL(url);
    get('skin-name').textContent = oldUrl ? 'CUSTOM SKIN' : 'BASE SKIN';
    toast(`Could not load that skin archive: ${error.message}`, true);
  }
}


function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem('ampdeck.theme', theme);
}

function setupInteractions() {
  renderTrackList();
  const savedTheme = localStorage.getItem('ampdeck.theme') || 'moss';
  setTheme(savedTheme);
  get('theme-button').addEventListener('click', () => {
    const order = ['moss', 'violet', 'ember'];
    const now = document.body.dataset.theme;
    setTheme(order[(order.indexOf(now) + 1) % order.length]);
    toast(`Desk palette: ${document.body.dataset.theme}.`);
  });
  get('connect-top').addEventListener('click', () => window.open('https://open.spotify.com/', '_blank', 'noopener,noreferrer'));
  get('spotify-open-form').addEventListener('submit', (event) => { event.preventDefault(); openSpotifyLink(); });
  ['import-top', 'import-button', 'drop-target'].forEach((id) => get(id).addEventListener('click', () => audioInput.click()));
  ['skin-top', 'skin-bottom'].forEach((id) => get(id).addEventListener('click', () => skinInput.click()));
  audioInput.addEventListener('change', () => { handleAudioFiles(audioInput.files); audioInput.value = ''; });
  skinInput.addEventListener('change', () => { loadSkin(skinInput.files[0]); skinInput.value = ''; });
  get('play-button').addEventListener('click', () => { if (webamp?.getMediaStatus() === 'PLAYING') webamp.pause(); else webamp?.play(); });
  get('next-button').addEventListener('click', () => webamp?.nextTrack());
  let dragDepth = 0;
  document.addEventListener('dragenter', (event) => {
    if (!event.dataTransfer?.types?.includes('Files')) return;
    event.preventDefault();
    dragDepth += 1;
    document.body.classList.add('dragging-files');
  }, true);
  document.addEventListener('dragover', (event) => {
    if (event.dataTransfer?.types?.includes('Files')) event.preventDefault();
  }, true);
  document.addEventListener('dragleave', (event) => {
    if (!event.dataTransfer?.types?.includes('Files')) return;
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) document.body.classList.remove('dragging-files');
  }, true);
  document.addEventListener('drop', (event) => {
    if (!event.dataTransfer?.files?.length) return;
    event.preventDefault();
    event.stopPropagation();
    dragDepth = 0;
    document.body.classList.remove('dragging-files');
    handleAudioFiles(event.dataTransfer.files);
  }, true);
}

setupInteractions();
setupWebamp();
