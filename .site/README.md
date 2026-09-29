# AI Roadmap site

A static, build-free 3D roadmap of this vault, made with [three.js](https://threejs.org).

- `index.html`: page shell and import map (three.js is loaded from the jsDelivr CDN)
- `data.js`: roadmap stages, taken from the vault's structure (`AI.md` chain, `Math/` folders)
- `scene.js`: the scroll-driven three.js scene (path, milestones, bloom)
- `main.js`: HUD, stage nav, detail panel and the text fallback
- `styles.css`: styling

Run it locally with any static server, for example `python3 -m http.server -d .site`.
The deploy workflow publishes this directory to the `web` branch.
