@AGENTS.md

# CLAUDE.md

`AGENTS.md` (imported above) holds the vault rules, the change guardrail, and the vault-to-site mapping. This file is the technical guide to the site in `.site/`.

## What this repo is

- An Obsidian vault of Markdown notes about AI (`*.md` at the root and in `Math/`).
- A static site in `.site/` that presents the vault as a galaxy: each domain is a **planet**, you fly there by rocket, walk the **road** of topics, and open a topic as an article. The vault is the source of truth; the site is derived.

## Commands (run in `.site/`)

```bash
npm ci              # install (only dependency: marked)
npm run content     # build the vault into .site/content.json
npm test            # build in memory and print content warnings (unresolved links, unassigned notes)
npm run dev         # build content and serve the site at http://localhost:8000
```

`content.json` is generated and gitignored. Deployment (`.github/workflows/deploy-site.yml`) runs `npm ci && npm run content`, then publishes `.site/` to the `web` branch, excluding build files.

## Site architecture

```
.site/
  planets.json             planets: id, title, color, blurb, root notes/folder, or `planned`
  scripts/build-content.mjs  vault → content.json (planets, districts, topics, links, backlinks, rendered HTML)
  index.html, styles.css   shell + clay UI
  main.js                  hash router (#/, #/galaxy, #/list, #/<planet>, #/<planet>/<topic>) + galaxy UI + text views
  scenes/                  stage.js (one shared WebGL renderer), home.js (rocket + launch), galaxy.js (planets + rocket flight), planet.js (walkable planet: road, gates, signposts, landing)
  models/                  procedural clay models (rocket, astronaut)
  vendor/                  three.js, vendored (no CDN for 3D)
```

- **Style:** claymorphism. Pastel palette, matte clay materials (`scenes/clay.js`), soft shadows, no bloom. Everything is procedural: no downloaded models or textures.
- **Routing:** hash-based so it works on static hosting. Topic ids are `<planet>/<slug-of-note-title>`; the overview note is `ai`.
- **Scenes** share one renderer via `scenes/stage.js`: a scene is `{ scene, camera, update(dt, t), resize(w, h) }`. `main.js` activates the scene for the current route; other routes hide the canvas.
- **Text views** (`main.js`) render the galaxy, planets and articles as accessible HTML. They are the permanent fallback for no-WebGL and reduced-motion users, and the article renderer the 3D flow opens.
- **Planet scene:** the world is a sphere of radius scaled by topic count; the player is a unit position `P` and heading `H` moved with quaternions, and the camera follows with `up = P`. The road is a spiral sampled on the sphere; signposts sit at fixed road distances. Interactables (rocket, signposts) are found by proximity; `onOpen(topicId)` is where PR 4 hooks the warp transition.
- **`reduce` motion:** every scene must honour `prefers-reduced-motion` and skip long animations.

## Content pipeline rules

- Planets are configured in `.site/planets.json`; adding a domain means adding an entry there (a folder planet needs `folder` and `index`; a single-note planet lists `notes`). The build warns about notes not assigned to any planet.
- Topic status is derived: empty → `outlined`, link-list only → `index`, otherwise `written` (frontmatter `status` overrides).
- Wiki links resolve by note title, case-insensitively; links to a planned planet's title resolve to that planet.
- Do not put knowledge in `.site/`. If the site needs different content, change the notes (with approval) or the pipeline.

## Migration status

Delivered in order, one PR each:

1. **Foundation** ✅ content pipeline, `AGENTS.md`/`CLAUDE.md`, minimal home with the rocket and lift-off, text explorer (galaxy, planet, article).
2. **Galaxy** ✅ inside the galaxy you rotate a ring of planets (drag, scroll, arrows, swipe); clicking or "Fly to" sends the rocket to that planet, then lands on its topics page (`#/<planet>`). `#/list` is the text list of planets.
3. **Planet** ✅ `#/<planet>` lands the rocket on a spherical clay planet; walk an astronaut along the road (WASD/arrows, Shift to run, touch joystick, click-to-travel, ‹ › to jump between signposts). Districts are gates, topics are signposts (solid = written, hollow ring = outlined, cube = index). Walk near one and press E / tap to open it. Returning from a topic resumes at that signpost. `#/<planet>?text` is the text list.
4. **Topic pages** ☐ warp/zoom transition into the article, table of contents, related-topic fast travel, return to the same spot on the road.
5. **Polish** ☐ mobile controls, performance, accessibility, social preview.

## Verifying changes

There is no test suite. For site work: run `npm test` (must build with no unexpected warnings), serve the site, and check it in a real browser (Playwright with Chromium is available in the cloud environment: launch with `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`). Look at screenshots of the home, galaxy, a planet and an article, and check the console for errors.
