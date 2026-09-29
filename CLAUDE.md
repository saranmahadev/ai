@AGENTS.md

# CLAUDE.md

`AGENTS.md` (imported above) holds the vault rules, the change guardrail, and the vault-to-site mapping. This file is the technical guide to the site in `.site/`.

## What this repo is

- An Obsidian vault of Markdown notes about AI (`*.md` at the root and in `Math/`).
- A static site called **AI Base** in `.site/` (the vault itself is the "AI Knowledge Brain") that presents the vault as a galaxy: each domain is a **planet**, you fly there by rocket, walk the **road** of topics, and open a topic as an article. The vault is the source of truth; the site is derived.

## Commands (run in `.site/`)

```bash
npm ci              # install (only dependency: marked)
npm run content     # build the vault into .site/content.json
npm test            # build in memory and print content warnings (unresolved links, unassigned notes, missing bench modules)
npm run test:benches  # opens every topic with a bench in Chromium (needs Playwright), exercises its controls, fails on console errors; --shots=DIR saves screenshots
npm run dev         # build content and serve the site at http://localhost:8000
```

`content.json` is generated and gitignored. Deployment (`.github/workflows/deploy-site.yml`) runs `npm ci && npm run content`, then publishes `.site/` to the `web` branch, excluding build files.

## Site architecture

```
.site/
  planets.json             planets: id, title, color, blurb, root notes/folder, or `planned`
  scripts/build-content.mjs  vault → content.json (planets, districts, topics, links, backlinks, rendered HTML)
  index.html, styles.css   shell + clay UI
  theme.js                 time-of-day theme (local clock, or ?time=HH:MM to test): CSS variables + scene re-lighting, refreshed each minute
  nav.js                   navigation model: Back button, breadcrumb trail and actions for each route
  transition.js            the warp: full-screen tunnel (streaks, rings, iris) that swaps the route at its peak
  main.js                  hash router (#/, #/galaxy, #/list, #/<planet>, #/<planet>/<topic>) + galaxy UI + text views
  scenes/                  stage.js (one shared WebGL renderer), home.js (rocket + launch), galaxy.js (planets + rocket flight), planet.js (walkable planet: road, gates, signposts, landing)
  models/                  procedural clay models (rocket, astronaut)
  benches/                 interactive demos embedded in articles: kit.js (shared helpers) + one module per bench id
  vendor/                  three.js and the Nunito fonts (OFL), vendored: the site makes no external requests
  favicon.svg, og.png      icon and 1200×630 social preview (regenerate og.png from a Playwright screenshot of the home page when visuals change)
```

- **Style:** claymorphism. Pastel palette, matte clay materials (`scenes/clay.js`), soft shadows, no bloom. Everything is procedural: no downloaded models or textures.
- **Routing:** hash-based so it works on static hosting. Topic ids are `<planet>/<slug-of-note-title>`; the overview note is `ai`.
- **Scenes** share one renderer via `scenes/stage.js`: a scene is `{ scene, camera, update(dt, t), resize(w, h) }`. `main.js` activates the scene for the current route; other routes hide the canvas.
- **Text views** (`main.js`) render the galaxy, planets and articles as accessible HTML. They are the permanent fallback for no-WebGL and reduced-motion users, and the article renderer the 3D flow opens.
- **Planet scene:** the world is a sphere of radius scaled by topic count; the player is a unit position `P` and heading `H` moved with quaternions, and the camera follows with `up = P`. The road is a spiral sampled on the sphere; signposts sit at fixed road distances. Interactables (rocket, signposts) are found by proximity. Circular obstacles (trees, rocks, gate posts, signposts, the pad) push the walker out so it slides around them.
- **Warp:** `warp.play({ color, dir, swap })` (dir 1 = into a topic, -1 = back to the road) runs on wall-clock time, calls `swap()` at its peak (where `main.js` sets `location.hash`), and is skipped under reduced motion. Only navigations that start from the planet scene or from inside an article use it; text-list pages navigate instantly.
- **Navigation:** one levelled path, Home → Galaxy → Planet → Topic. `nav.js` (`navFor`) describes the bar for a route and `main.js` renders it: a Back button that names where it leads, a clickable breadcrumb trail, and a few actions. Esc always presses Back. Home has no bar. Never add ad-hoc back links or in-page breadcrumbs; extend `navFor` instead.

  | Route | Back goes to | Actions |
  | --- | --- | --- |
  | `#/` | none | Launch |
  | `#/galaxy` (3D) | Home | The big picture, List view |
  | `#/list` (text) | Home | 3D galaxy |
  | `#/<planet>` (3D road) | Galaxy (rocket boards) | List view; shows "n / N topics" |
  | `#/<planet>?text` | Galaxy | Walk the road |
  | `#/<planet>/<topic>` | that planet's road (reverse warp) | none |
- **Time-of-day theme:** `theme.js` blends keyframes (night, sunrise, day, sunset, twilight) by the visitor's local time and sets `--sky1..3` and an `html.night` class (dark clay UI). Each scene builds a `createSkyRig` (`scenes/clay.js`: sky, fog, lights, stars, moon, night glow on signposts) and exposes `applyTheme(t)`; new scenes must do the same. Use theme variables in CSS (`--clay`, `--ink`, `--soft`, `--white`…), never hard-coded light colours. Test with `?time=22:30` (night), `?time=18:40` (sunset), `?time=07:00` (sunrise).
- **`reduce` motion:** every scene must honour `prefers-reduced-motion` and skip long animations.

## Benches (interactive demos in articles)

A **bench** is a small simulation embedded in a topic (sliders, draggable points, step-throughs). Benches only simulate; the explanation lives in the note.

- **Note syntax:** a fenced block whose language is `bench`:

  ````
  ```bench
  id: dot-product
  title: Dot product playground
  fallback: One sentence describing the bench for readers without JavaScript.
  ```
  ````
  `id` (lowercase letters, digits, dashes) must match `.site/benches/<id>.js`; the build warns if it does not. Follow the block with a **Try this** list (3–4 experiments) and a **What you should notice** paragraph, written in the note.
- **Module contract:** `export default function mount(root, kit) { …; return cleanup; }`. `kit` is `benches/kit.js`: `h` (DOM), `frame`, `canvas` (DPR-aware, redraws on resize and theme change), `slider`, `button`, `stats`, `live` (screen-reader announcements), `dragHandles`, `palette` (theme colours read from CSS variables), `fmt`. Vanilla canvas/SVG only, no external requests, no dependencies.
- **Loading:** `main.js` (`mountBenches`) imports a bench when its placeholder scrolls near the viewport and mounts it into `.bench[data-bench]`; the placeholder text is the fallback, and a failed import leaves it with a "could not load" note.
- **Rules:** benches must be operable by keyboard (every draggable quantity also has a slider), announce results via `live`, use theme colours (never hard-coded light ones), honour `reduceMotion`, and work at phone width. Add a bench with the note that uses it, then run `npm run test:benches`.

## Topic template (for notes that publish well)

One topic answers one question. Every written topic follows this arc, about 800–1500 words:

1. Summary paragraph (becomes the topic summary), then **You need:** links to prerequisites that exist.
2. The question it answers → intuition (plain language, an analogy) → definition and notation → a worked example with small numbers.
3. **Bench** with **Try this** and **What you should notice**.
4. Where it appears in AI → common pitfalls → **Quick check** (3 questions, answers in `<details>`) → **Related** links.

The site has no LaTeX renderer: write formulas in Unicode inside code fences (`a · b = a₁b₁ + a₂b₂`).

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
4. **Topic pages** ✅ pressing E on a signpost dives the camera into its orb while the warp tunnel (`transition.js`) rushes in and opens on the article. The article has an animated title, reading bar, sticky scroll-spy table of contents (level 1–3 headings), reveal-on-scroll, parallax clay blobs, related/mentioned-in chips, and previous/next cards. Every topic link inside an article warps; "Back to the road" (or Esc, or the planet breadcrumb) runs the warp in reverse and returns to that topic's signpost.
5. **Polish** ✅ renamed to AI Base, single GitHub link in the header, no "skip to text version" (the list view stays reachable from the galaxy and planet screens); self-hosted fonts (no external requests); favicon and social preview; collision with trees, rocks, gates and signposts; adaptive quality (lighter pixel ratio and shadows on phones, drops to 1× if the first seconds run slowly); boot loader; route announcements and heading focus for screen readers.
6. **Time theme + navigation** ✅ local-time colours and a night mode across UI and all three scenes; a single Back/breadcrumb bar on every screen; fixes: reversing keeps the camera behind the astronaut, ‹ › walk to the previous/next signpost along the road.
7. **Benches (Wave 0)** ✅ `bench` blocks, `benches/kit.js`, the smoke test, and three pilot topics that set the quality bar: Dot Product, Derivatives, Bayes Theorem. The curriculum is being rewritten from scratch in waves (math spine first); the pilot notes replace the earlier stubs.

## Verifying changes

There is no test suite. For site work: run `npm test` (must build with no unexpected warnings), serve the site, and check it in a real browser (Playwright with Chromium is available in the cloud environment: launch with `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`). Look at screenshots of the home, galaxy, a planet and an article, and check the console for errors.
