# Qibla Line explainer

A 48-second film that shows how [Qibla Line](https://qiblaline.com) works: why a phone compass can't be trusted indoors, how the app lines a map up with a wall of your room, and the turn to face the Qibla. It plays on the qiblaline.com landing page. The app itself lives at [hashmil/qibla-line](https://github.com/hashmil/qibla-line).

It is a single [HyperFrames](https://hyperframes.heygen.com) composition (`index.html`, 1920x1080, 30fps): one Three.js world with a scripted camera, holding an outlined living room, a real Jumeirah 1 villa and its neighbours drawn from OpenStreetMap footprints, and a Natural Earth globe. The phone shows real screen captures of the live app. Captions are part of the picture. Design tokens are in `frame.md` and come from the app's own `DESIGN.md`.

## Preview and render

Needs Node.js 22 or newer and FFmpeg.

```bash
npm install
npm run dev
npm run check
npm run render
```

`npm run dev` opens the HyperFrames Studio preview. Studio adds `data-hf-id` attributes to `index.html` while it is open; strip them before committing.

The site uses a web encode of the render:

```bash
ffmpeg -i renders/qibla-line-explainer.mp4 -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart qibla-line.mp4
```

## Regenerating assets

- `scripts/capture-screens.mjs` captures the app's screens with Playwright and Chrome into `assets/screens/` (not committed). Run it as `APP_URL=https://qiblaline.com/ FINAL_BEARING=297 node scripts/capture-screens.mjs`, then make the two sizes the film reads: 780x1688 JPEGs in `assets/screens-jpg/` and 390x844 JPEGs in `assets/screens-sm/`.
- `scripts/tick-tracks.py` builds the ratchet tick tracks for the dial and the turn.
- `scripts/eleven-sfx.mjs` generates the sound effects with ElevenLabs. It reads an API key from a local `.env` outside this repository; no key is stored here.
- `scripts/coastlines.mjs` and `scripts/globe-sketch.mjs` build the globe's coastlines from Natural Earth.
- `.overpass-jumeirah.json` is the OpenStreetMap building data for the villa and its neighbours.

## Credits

- Map data, map imagery and building footprints © OpenStreetMap contributors
- Coastlines from Natural Earth via world-atlas, public domain
- Chivo and Chivo Mono by Omnibus-Type, SIL Open Font License
- Sound effects generated with ElevenLabs
