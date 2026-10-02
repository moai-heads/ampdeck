# Ampdeck

A skin-first music desk prototype: classic Winamp-style skins and local audio, with a safe Spotify link handoff. Static-site friendly, with a provider boundary for future adapters.

## Run it

```sh
npm install
npm test
npm run build
npm run publish:pages # publish the production build to GitHub Pages
```

For development, run `npm run dev`; to inspect the production build locally, run `npm run preview` after building.

GitHub Pages serves the built site from the `gh-pages` branch. Build and publish updates with `npm run publish:pages` (requires GitHub push access). The Vite base path is `/ampdeck/`.

## What works in this prototype

- Webamp's browser player, with the bundled classic skin and support for user-selected classic `.wsz` / ZIP skin archives.
- Browser file picker and drag/drop for local audio; files are read as browser `Blob` URLs and are not uploaded.
- Paste a Spotify track, playlist, album, artist, show, or episode link/URI and open it in Spotify’s official site or app. Ampdeck does not collect logins/tokens or play Spotify audio.
- User-selectable desk palettes, responsive layout, keyboard-accessible controls, and a privacy notice.
- Spotify links open in Spotify; local audio playback is handled separately by Webamp.

## Skin compatibility notes

The rendering engine is **Webamp**, which targets the classic Winamp 2 skin format. Classic `.wsz` skins are ZIP archives containing the classic skin assets; their bitmap region masks are what give many skins their irregular window outlines. Ampdeck passes those archives to Webamp instead of flattening the player into rectangular CSS panels.

This is **not** a complete Winamp 5 Modern skin renderer. Modern `.wal`/XML skins and plugin-dependent features are not supported by this prototype. The input accepts classic `.wsz` or ZIP archives; a separate parser/renderer and compatibility test suite would be needed for the Winamp 5 Modern format. Test archival skins individually; unsupported or malformed assets can fail to load.

## Spotify setup and limitations

Paste a standard Spotify link or `spotify:` URI into the Spotify panel. Ampdeck validates the content type/ID, then opens only the canonical link in Spotify's own site/app. Spotify login and playback stay outside Ampdeck; the Spotify iframe/widget is intentionally not loaded here. Use Spotify's official site for account access and trial offers.

To avoid an unapproved Spotify integration, Ampdeck does not embed Spotify, use its Web API/SDK, collect credentials, or play Spotify streams. Pasting a supported Spotify URL only opens its canonical link in the Spotify site/app; Spotify handles login, playback, and any free-trial eligibility. As checked October 2, 2026, Spotify's [Widget Terms](https://developer.spotify.com/documentation/embeds/terms) restrict integrating its widget with streams from another service and using the platform to compete with Spotify without permission. Ampdeck is a skinnable local player, so adding Spotify's widget or building custom Spotify controls would need a fresh terms review and likely authorization. Do not add another streaming service alongside a Spotify widget unless permitted by current terms or written approval. This prototype does not claim Spotify approval.

See the [privacy notice](public/privacy.html) and [user terms](public/terms.html). Because Spotify is opened externally, its cookies and account data are handled on Spotify's own site, not inside Ampdeck.

## Architecture

This is a browser-first JavaScript/Vite app. Webamp was chosen for the first milestone because classic skin artwork and non-rectangular region masks are a native fit for its rendering engine. There is no C++/SDL native target in this MVP; an SDL/Emscripten port would be a separate renderer and would not automatically gain Webamp's skin-format coverage.

## License

Ampdeck source: MIT. The bundled player dependency, Webamp, is also distributed under MIT; see its package metadata. Spotify and Winamp are third-party marks/services and are not affiliated with Ampdeck.
