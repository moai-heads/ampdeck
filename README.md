# Ampdeck

A skin-first, non-commercial music player prototype. Classic `.wsz` skins are rendered with Webamp, including their irregular bitmap window regions. Local audio uses a separate browser audio element; Spotify playback uses Spotify's official Web Playback SDK. The loaded Winamp skin's transport controls are connected to that SDK through Webamp's custom media adapter.

## Run locally

```sh
npm install
npm test
npm run build
npm run dev
# Open http://127.0.0.1:5173/ampdeck/ for local Spotify OAuth (not localhost)
```

GitHub Pages publishes the static browser build from the `gh-pages` branch with `npm run publish:pages`. This does **not** publish a native SDL/WebView desktop wrapper; that is a separate packaging milestone.

## Connect Spotify

1. Create a Spotify Developer app and add the exact redirect URI shown in Ampdeck's Spotify panel. For the Pages build it is `https://moai-heads.github.io/ampdeck/`. For local Vite development, open `http://127.0.0.1:5173/ampdeck/` (not `localhost`) and register the exact loopback URI shown in the panel; Spotify rejects `localhost` redirects.
2. In Spotify Developer Mode, the app owner must have an active Premium subscription, and each app can authorize up to five Spotify users. Add each test account to the app's allowlist. See Spotify's current [quota-mode rules](https://developer.spotify.com/documentation/web-api/concepts/quota-modes).
3. Paste the app's **Client ID** into Ampdeck and choose **Connect**. Spotify login happens through OAuth Authorization Code with PKCE. Do not paste your Spotify password, client secret, access token, or a supposed “Premium key.” The Client ID is public; Premium is an account entitlement.
4. Search for a track or paste a Spotify track URL/URI. Search results form an Ampdeck queue; play, pause, seek, volume, and next/previous from the Winamp skin control Spotify playback.

Spotify Premium is required for Web Playback SDK streaming. The SDK creates an Ampdeck Connect device in the browser; Spotify supplies and plays the protected audio. Ampdeck never receives Spotify audio bytes. This initial adapter supports track search and individual track links; album/playlist context playback is not implemented.

OAuth access/refresh tokens are held in the current tab's `sessionStorage`; the Client ID is held in `localStorage`. There is no Ampdeck token server. Disconnect clears the browser-session tokens. The app sends Spotify search/playback requests directly to Spotify.

## Source separation and audio processing

Spotify and local files use mutually exclusive playback paths. Starting local playback asks Spotify to pause the active device; starting Spotify pauses the local element. Spotify audio is not routed through Webamp's equalizer, DSP, or analyser; the analyser is intentionally disconnected, so Spotify visualizers do not receive audio data. This build does not broadcast, record, download, transform, or synchronize Spotify audio with video/visual media.

This app is non-commercial: no ads, sponsorships, paid features, or sales. Spotify's Developer Policy requires prior written permission for products Spotify considers attempts to replace a core Spotify experience, and restricts integrating Spotify streams/content with another service. Spotify does not publish a precise definition or UI checklist for “core experience.” Ampdeck is an experimental, independent skin-first prototype, not represented as Spotify-approved. Open source does not grant Spotify rights or policy approval; obtain Spotify's written guidance before broad distribution. Do not commercialize or combine Spotify playback with another streaming service.

## Skins

The renderer is **Webamp**, targeting the classic Winamp 2 `.wsz`/ZIP skin format. Classic bitmap region masks preserve many non-rectangular window shapes. This does not implement Winamp 5 Modern `.wal`/XML skins, plugin-dependent features, or MAKI scripts. Individual archival skins may still fail if malformed or unsupported.

## Architecture and limits

- Browser-first JavaScript/Vite app; Webamp is pinned to 2.3.1 because the custom media adapter uses its currently private `__customMediaClass` integration point.
- Spotify browser playback requires a modern browser with Encrypted Media Extensions. The official SDK does not promise support for every embedded WebView; a native WebView shell must be tested for EME/CDM support on each target OS before claiming compatibility.
- This repository does not yet contain a C++/SDL native desktop shell. The feasible low-overhead target is an SDL/native window with a platform WebView hosting the SDK—not a pure C++ Spotify decoder. Spotify's public playback Web API controls a Spotify device but does not return audio samples to a C++ player.
- Spotify Developer Policy and SDK restrictions apply. Spotify and Winamp are third-party marks/services; Ampdeck is not affiliated with or endorsed by them.

See the [privacy notice](public/privacy.html) and [user terms](public/terms.html).
