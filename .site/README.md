# AI Roadmap site

A static, build-free 3D roadmap of this vault, in a soft claymorphism style, made with [three.js](https://threejs.org).

- `index.html`: page shell and import map
- `data.js`: roadmap stages, taken from the vault's structure (`AI.md` chain, `Math/` folders)
- `scene.js`: the scroll-driven three.js scene (clay path, milestones, clouds, soft shadows)
- `main.js`: HUD, stage nav, detail panel and the text fallback
- `styles.css`: clay UI styling
- `vendor/`: three.js 0.170.0 (MIT, see `LICENSE-three`), vendored so the site has no CDN dependency for 3D

Run it locally with any static server, for example `python3 -m http.server -d .site`.
The deploy workflow publishes this directory to the `web` branch.
