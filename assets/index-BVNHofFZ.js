(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{constructor(){this.providers=new Map}register(e){if(!e?.id||this.providers.has(e.id))throw Error(`Provider needs a unique id.`);return this.providers.set(e.id,e),this}get(e){return this.providers.get(e)}list(){return[...this.providers.values()]}},t=class{id=`local`;name=`Local files`;accepts(e){return e.type.startsWith(`audio/`)||/\.(mp3|wav|ogg|oga|flac|m4a|aac|opus|aiff|wma)$/i.test(e.name)}describe(e,t,n){let r=e.name.replace(/\.[^.]+$/,``);return{title:r,artist:`Local file`,source:e.name,duration:n,url:t,file:e,album:`Local library`,metaData:{title:r,artist:`Local file`,album:`Local library`}}}},n=new Set([`track`,`playlist`,`album`,`artist`,`show`,`episode`]),r=/^[A-Za-z0-9]+$/,i=class{id=`spotify-link`;name=`Spotify (external)`;parse(e){let t=String(e||``).trim(),i,a,o=t.match(/^spotify:(track|playlist|album|artist|show|episode):([A-Za-z0-9]+)$/i);if(o)[,i,a]=o;else{let e;try{e=new URL(t)}catch{throw Error(`Paste a full Spotify link or URI.`)}if(e.protocol!==`https:`||e.hostname!==`open.spotify.com`)throw Error(`Use a standard https://open.spotify.com/ link (short links are not supported).`);let r=e.pathname.split(`/`).filter(Boolean),o=r.findIndex(e=>n.has(e.toLowerCase()));if(o<0||!r[o+1])throw Error(`That Spotify link is not a track, playlist, album, artist, show, or episode.`);i=r[o].toLowerCase(),a=r[o+1]}if(!n.has(i.toLowerCase())||!r.test(a))throw Error(`That Spotify link or URI is not valid.`);return i=i.toLowerCase(),{type:i,id:a,canonicalUrl:`https://open.spotify.com/${i}/${a}`}}},a=new e().register(new t).register(new i),o=`modulepreload`,s=function(e){return`/ampdeck/`+e},c={},l=function(e){return e.pathname.endsWith(`.css`)},u=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function u(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function d(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=u(t.map(t=>{t=s(t,n);let r=d(t);if(r.href in c)return;c[r.href]=!0;let i=l(r);if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let u=document.createElement(`link`);if(u.rel=i?`stylesheet`:o,i||(u.as=`script`),u.crossOrigin=``,u.href=r.href,a&&u.setAttribute(`nonce`,a),document.head.appendChild(u),i)return new Promise((e,t)=>{u.addEventListener(`load`,e),u.addEventListener(`error`,()=>t(Error(`Unable to preload CSS for ${r}`)))})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},d=`/ampdeck/`,f=a.get(`local`),p=a.get(`spotify-link`),m=(e=``)=>String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]),h=(e,t=18)=>{let n={wave:`<path d="M3 12h3l2-7 4 14 3-10 2 6h4"/>`,disc:`<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/><path d="M7 7l2 2m6 6 2 2"/>`,list:`<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>`,skin:`<path d="m12 3 2.4 4.9L20 9l-4 3.9.9 5.6-4.9-2.6-4.9 2.6.9-5.6L4 9l5.6-1.1L12 3Z"/><path d="M19 14v5m-2.5-2.5h5"/>`,spotify:`<path d="M4.8 9.1c4.7-1.4 10.6-.8 14.6 1.7M6.1 12.4c3.8-1 8.4-.5 11.7 1.5M7.4 15.6c2.8-.7 6.2-.3 8.7 1.1"/>`,arrow:`<path d="M5 12h14m-6-6 6 6-6 6"/>`,plus:`<path d="M12 5v14M5 12h14"/>`,upload:`<path d="M12 16V4m-4 4 4-4 4 4"/><path d="M4 16v4h16v-4"/>`,chevron:`<path d="m9 18 6-6-6-6"/>`,volume:`<path d="M4 10v4h4l5 4V6l-5 4H4Z"/><path d="M17 9a5 5 0 0 1 0 6m2-9a9 9 0 0 1 0 12"/>`,play:`<path d="m8 5 12 7-12 7V5Z" fill="currentColor" stroke="none"/>`,pause:`<path d="M8 5h3v14H8zM15 5h3v14h-3z" fill="currentColor" stroke="none"/>`,prev:`<path d="M6 5v14m13-14-11 7 11 7V5Z"/>`,next:`<path d="M18 5v14M5 5l11 7-11 7V5Z"/>`,close:`<path d="m6 6 12 12M18 6 6 18"/>`,copy:`<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>`,external:`<path d="M14 4h6v6m0-6-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>`};return`<svg width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${n[e]||n.wave}</svg>`},g=document.querySelector(`#app`);g.innerHTML=`
  <div class="app-shell" id="app-shell">
    <aside class="sidebar">
      <a class="brand" href="#top" aria-label="Ampdeck home">
        <span class="brand-mark">${h(`wave`,21)}</span><span class="brand-name">ampdeck<span>®</span></span>
      </a>
      <div class="sidebar-kicker">YOUR LISTENING DESK</div>
      <nav class="side-nav" aria-label="Main navigation">
        <a class="nav-item active" href="#desk">${h(`disc`)}<span>Now playing</span><b class="nav-dot"></b></a>
        <a class="nav-item" href="#library">${h(`list`)}<span>Local library</span><small id="library-count">01</small></a>
        <a class="nav-item" href="#skins">${h(`skin`)}<span>Skins & looks</span></a>
      </nav>
      <div class="sidebar-spacer"></div>
      <div class="sidebar-note">
        <div class="note-mark">✳</div>
        <div class="note-title">Built for the<br>beautifully<br>un-square.</div>
        <div class="note-copy">Your skins. Your setup.<br>No algorithm required.</div>
        <a href="#about" class="quiet-link">HOW IT WORKS ${h(`arrow`,13)}</a>
      </div>
      <div class="sidebar-bottom"><span class="green-led"></span> PLAYER READY <span class="version">v0.1</span></div>
    </aside>

    <main class="main-content" id="top">
      <header class="topbar">
        <div class="crumb"><span>AMPDECK</span><i>/</i><b>LISTENING DESK</b></div>
        <div class="top-actions">
          <span class="clock-label"><span class="green-led"></span> YOUR MUSIC, YOUR MACHINE</span>
          <button class="connect-pill" id="connect-top">${h(`spotify`,17)} <span>Open Spotify</span> ${h(`arrow`,14)}</button>
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
            <button class="button button-light" id="import-top">${h(`plus`,16)} Add music</button>
            <button class="button button-outline" id="skin-top">${h(`skin`,16)} Load a skin</button>
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
                <div class="mini-art" id="mini-art"><img src="${d}cover.svg" alt="Abstract record artwork"></div>
                <div class="mini-meta"><span class="micro-label">ON DECK</span><b id="track-title">Night Shift (demo)</b><span id="track-artist">Ampdeck Generator</span></div>
              </div>
              <div class="transport-hint"><span class="keycap">DRAG</span> audio files anywhere onto the desk</div>
              <button class="square-button" id="play-button" title="Play or pause">${h(`play`,16)}</button>
              <button class="square-button" id="next-button" title="Next track">${h(`next`,16)}</button>
            </div>
          </div>

          <aside class="side-column">
            <section class="spotify-card" id="spotify-card">
              <div class="card-head"><span class="card-icon spotify-icon">${h(`spotify`,18)}</span><span class="service-status"><span class="status-dot"></span> OPEN IN SPOTIFY</span></div>
              <div class="spotify-title-row"><div><div class="micro-label">EXTERNAL SERVICE / 01</div><h2>Spotify</h2></div><div class="spot-orbit"><span></span><span></span><span></span></div></div>
              <p class="spotify-copy" id="spotify-copy">Open a Spotify link in Spotify’s own site or app. Ampdeck never asks for your Spotify password or API key.</p>
              <form class="spotify-url-row" id="spotify-open-form">
                <input id="spotify-url" type="text" inputmode="url" placeholder="Paste a Spotify link or URI" aria-label="Spotify link or URI" autocomplete="off">
                <button type="submit" aria-label="Open in Spotify">OPEN</button>
              </form>
              <div class="spotify-shortcuts"><a href="https://open.spotify.com/" target="_blank" rel="noreferrer">Sign in / open Spotify ${h(`external`,11)}</a><a href="https://www.spotify.com/us/premium/" target="_blank" rel="noreferrer">Plans & trial info ${h(`external`,11)}</a></div>
              <div class="spotify-foot"><span>LOGIN & PLAYBACK BY SPOTIFY</span><span class="legal-links"><a href="${d}terms.html" target="_blank" rel="noreferrer">TERMS</a><a href="${d}privacy.html" target="_blank" rel="noreferrer">PRIVACY</a></span></div>
            </section>

            <section class="library-card" id="library">
              <div class="library-head"><div><div class="micro-label">YOUR FILES / 01</div><h3>Local library</h3></div><button class="add-round" id="import-button" aria-label="Add music">${h(`plus`,16)}</button></div>
              <div class="track-list" id="track-list"></div>
              <button class="drop-target" id="drop-target"><span class="drop-icon">${h(`upload`,17)}</span><span><b>Drop in a track</b><small>MP3, WAV, OGG, FLAC + more</small></span>${h(`chevron`,16)}</button>
            </section>
          </aside>
        </section>

        <section class="lower-row" id="skins">
          <div class="lower-card skin-lower-card">
            <div class="lower-icon">${h(`skin`,19)}</div><div class="lower-copy"><span class="micro-label">MAKE IT YOURS / 02</span><h3>Skin it your way.</h3><p>Drop in a classic <code>.wsz</code> skin. Bitmap region masks keep the weird silhouettes intact.</p></div><button class="text-button" id="skin-bottom">Browse skins ${h(`arrow`,15)}</button>
          </div>
          <div class="lower-card provider-lower-card">
            <div class="provider-orbit">✳</div><div class="lower-copy"><span class="micro-label">MORE SOURCES, LATER / 03</span><h3>One deck. Many worlds.</h3><p>Ampdeck plays local audio; Spotify links open in Spotify. Any future service adapter needs its own policy review.</p></div><span class="soon-label"><span class="green-led"></span> EXTENSIBLE</span>
          </div>
        </section>
        <footer class="page-footer" id="about"><span>AMPDECK © 2026</span><span>MADE FOR MUSIC LOVERS & SKIN COLLECTORS</span><span><a href="${d}terms.html">TERMS</a> · <a href="${d}privacy.html">PRIVACY</a> · <a href="https://github.com/moai-heads/ampdeck" target="_blank" rel="noreferrer">OPEN SOURCE ${h(`external`,12)}</a></span></footer>
      </div>
    </main>
  </div>

  <input type="file" id="audio-input" accept="audio/*,.flac,.opus,.m4a,.aiff" multiple hidden>
  <input type="file" id="skin-input" accept=".wsz,.zip,application/zip" hidden>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
`;var _=e=>document.getElementById(e),v=_(`audio-input`),y=_(`skin-input`),b=[{title:`Night Shift (demo)`,artist:`Ampdeck Generator`,source:`Built-in sample`,url:`${d}demo-loop.wav`,duration:`00:08`}],x,S=null,C;function w(e,t=!1){let n=_(`toast`);n.textContent=e,n.classList.toggle(`error`,t),n.classList.add(`show`),clearTimeout(C),C=setTimeout(()=>n.classList.remove(`show`),3600)}function T(e={}){let t=e.metaData?.title||e.title||e.defaultName||`Unknown track`,n=e.metaData?.artist||e.artist||`Local audio`;_(`track-title`).textContent=t,_(`track-artist`).textContent=n,e.metaData?.albumArtUrl&&(_(`mini-art`).innerHTML=`<img src="${m(e.metaData.albumArtUrl)}" alt="Album artwork">`)}function E(){_(`library-count`).textContent=String(b.length).padStart(2,`0`),_(`track-list`).innerHTML=b.map((e,t)=>`
    <button class="track-row ${t===0?`selected`:``}" data-track="${t}">
      <span class="track-number">${String(t+1).padStart(2,`0`)}</span>
      <span class="track-art-small"><img src="${d}cover.svg" alt=""></span>
      <span class="track-row-info"><b>${m(e.title)}</b><small>${m(e.artist)}</small></span>
      <span class="track-duration">${m(e.duration||`—`)}</span>
    </button>`).join(``),_(`track-list`).querySelectorAll(`[data-track]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.track);x?.setCurrentTrack(t),x?.play(),T(b[t])})})}async function D(){let{default:e}=await u(async()=>{let{default:e}=await import(`./webamp.bundle.min-DztkecmR.js`);return{default:e}},[]);if(!e.browserIsSupported()){_(`player-host`).innerHTML=`<div class="player-error">This browser does not support the audio features needed by the classic skin player.</div>`;return}x=new e({initialTracks:b.map((e,t)=>({url:e.url.startsWith(`blob:`)?e.url:`${location.origin}${e.url}`,duration:t===0?8.72:void 0,defaultName:e.title,metaData:{title:e.title,artist:e.artist,album:e.album||(t===0?`Field Recordings · 001`:`Local library`),...t===0?{albumArtUrl:`${location.origin}${d}cover.svg`}:{}}})),enableHotkeys:!1}),x.renderInto(_(`player-host`)).then(()=>{_(`skin-name`).textContent=`BASE SKIN`,x.onTrackDidChange(e=>{e&&T(e)})}).catch(e=>{console.error(e),w(`The classic player could not start. Try a current desktop browser.`,!0)})}function O(e=_(`spotify-url`).value){try{let t=p.parse(e);window.open(t.canonicalUrl,`_blank`,`noopener,noreferrer`),w(`Opened Spotify ${t.type} in a new tab.`)}catch(e){w(e.message,!0)}}async function k(e){let t=[...e].filter(e=>f.accepts(e));if(!t.length)return w(`No audio files found. Drop in an audio file to add it.`,!0);let n=[];for(let e of t){let t=URL.createObjectURL(e),r=await new Promise(t=>{let n=new Audio,r=URL.createObjectURL(e),i=e=>{URL.revokeObjectURL(r),t(e)};n.preload=`metadata`,n.onloadedmetadata=()=>i(Number.isFinite(n.duration)?`${String(Math.floor(n.duration/60)).padStart(2,`0`)}:${String(Math.floor(n.duration%60)).padStart(2,`0`)}`:`—`),n.onerror=()=>i(`—`),n.src=r}),i=f.describe(e,t,r);b.push(i),n.push({url:t,defaultName:i.title,metaData:i.metaData})}x&&x.appendTracks(n),E(),w(`${t.length} track${t.length>1?`s`:``} added to your local library.`)}async function A(e){if(!e)return;let t=e.name.toLowerCase().split(`.`).pop();if(![`wsz`,`zip`].includes(t))return w(`Ampdeck currently accepts classic .wsz skin archives.`,!0);let n=URL.createObjectURL(e),r=S;S=n,_(`skin-name`).textContent=`LOADING…`;try{if(!x)throw Error(`The classic player is not ready yet.`);x.setSkinFromUrl(n),await x.skinIsLoaded(),_(`skin-name`).textContent=e.name.replace(/\.(wsz|zip)$/i,``).toUpperCase().slice(0,22),w(`Loaded skin: ${e.name}`),r&&URL.revokeObjectURL(r)}catch(e){S=r,URL.revokeObjectURL(n),_(`skin-name`).textContent=r?`CUSTOM SKIN`:`BASE SKIN`,w(`Could not load that skin archive: ${e.message}`,!0)}}function j(e){document.body.dataset.theme=e,localStorage.setItem(`ampdeck.theme`,e)}function M(){E(),j(localStorage.getItem(`ampdeck.theme`)||`moss`),_(`theme-button`).addEventListener(`click`,()=>{let e=[`moss`,`violet`,`ember`],t=document.body.dataset.theme;j(e[(e.indexOf(t)+1)%e.length]),w(`Desk palette: ${document.body.dataset.theme}.`)}),_(`connect-top`).addEventListener(`click`,()=>window.open(`https://open.spotify.com/`,`_blank`,`noopener,noreferrer`)),_(`spotify-open-form`).addEventListener(`submit`,e=>{e.preventDefault(),O()}),[`import-top`,`import-button`,`drop-target`].forEach(e=>_(e).addEventListener(`click`,()=>v.click())),[`skin-top`,`skin-bottom`].forEach(e=>_(e).addEventListener(`click`,()=>y.click())),v.addEventListener(`change`,()=>{k(v.files),v.value=``}),y.addEventListener(`change`,()=>{A(y.files[0]),y.value=``}),_(`play-button`).addEventListener(`click`,()=>{x?.getMediaStatus()===`PLAYING`?x.pause():x?.play()}),_(`next-button`).addEventListener(`click`,()=>x?.nextTrack());let e=0;document.addEventListener(`dragenter`,t=>{t.dataTransfer?.types?.includes(`Files`)&&(t.preventDefault(),e+=1,document.body.classList.add(`dragging-files`))},!0),document.addEventListener(`dragover`,e=>{e.dataTransfer?.types?.includes(`Files`)&&e.preventDefault()},!0),document.addEventListener(`dragleave`,t=>{t.dataTransfer?.types?.includes(`Files`)&&(e=Math.max(0,e-1),e===0&&document.body.classList.remove(`dragging-files`))},!0),document.addEventListener(`drop`,t=>{t.dataTransfer?.files?.length&&(t.preventDefault(),t.stopPropagation(),e=0,document.body.classList.remove(`dragging-files`),k(t.dataTransfer.files))},!0)}M(),D();