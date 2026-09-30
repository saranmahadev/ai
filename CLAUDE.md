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
npm run test:benches  # opens every bench at 1280, 768 and 390px in Chromium (needs Playwright), exercises its controls, fails on console errors or horizontal overflow; --shots=DIR saves screenshots
npm run test:reader   # exercises the article reading experience in Chromium: type, cover, street strip, settings and themes, drawer, previews, key terms, selection bar, resume, ?at= links, phone width; --shots=DIR
npm run test:planet   # walks a planet in Chromium: HUD (weather, detail, connections, radar), draw-call budget, seeded scenery, weather with motion, then › to the kiosk and first street, E opens the article, Back returns; --planet=id --time=HH:MM --shots=DIR
npm run test:site     # search, My path progress, cross-planet tags and lazy bodies in Chromium
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
  main.js                  hash router (#/, #/galaxy, #/list, #/path, #/<planet>, #/<planet>/<topic>) + galaxy UI + text views + My path; article bodies load on demand
  search.js                topic search (titles, key terms, summaries; / or Ctrl+K)
  content/                 generated per-topic bodies (`<id>.json`: html, toc), gitignored; content.json holds only the index
  scenes/                  stage.js (one shared WebGL renderer), home.js (rocket + launch), galaxy.js (planets + rocket flight), planet.js (walkable planet: road, gates, signposts, landing),
                           city.js (tech layer: textures, materials, landmarks, pulses, pod, drones), grid.js (connection beams + radar), weather.js (weather modes and particles)
  models/                  procedural clay models (rocket, astronaut)
  cover.js                 generated SVG cover art for an article, seeded from its title and planet colour
  reader.js                the reading experience: preferences, floating bar with the street strip, settings, outline drawer, resume, link previews, key-term popovers, selection bar
  benches/                 interactive demos embedded in articles: kit.js (shared helpers) + one module per bench id
  vendor/                  three.js, the Nunito fonts and Source Serif 4 (both OFL), vendored: the site makes no external requests
  favicon.svg, og.png      icon and 1200×630 social preview (regenerate og.png from a Playwright screenshot of the home page when visuals change)
```

- **Style:** the *world* (home, galaxy, planet scenes and their overlays) is claymorphism: pastel palette, matte clay materials (`scenes/clay.js`), soft shadows, no bloom, everything procedural. The *reading pages* (articles and text lists, `body.reading`) are a standard, Medium-style document: flat top bar and breadcrumb that tuck away while you read down, a 720px column of Source Serif 4 body text (or sans, by preference) with Nunito headings, a lede first paragraph, a generated cover, pull quotes, wide figures for benches, and Read next / Keep exploring cards at the end. Three reader themes (light, sepia, dark) plus "auto" (follows `html.night`) are `--r-*` tokens in `styles.css`, switched by `body[data-theme]`; the size and typeface preferences live in `localStorage` (`ai-base-reader`). Do not bring clay shadows or pills into reading pages.
- **Routing:** hash-based so it works on static hosting. Topic ids are `<planet>/<slug-of-note-title>`; the overview note is `ai`.
- **Scenes** share one renderer via `scenes/stage.js`: a scene is `{ scene, camera, update(dt, t), resize(w, h) }`. `main.js` activates the scene for the current route; other routes hide the canvas.
- **Text views** (`main.js`) render the galaxy, planets and articles as accessible HTML. They are the permanent fallback for no-WebGL and reduced-motion users, and the article renderer the 3D flow opens.
- **Planet scene:** the world is a sphere whose radius grows until every street has room (`build()` in `scenes/planet.js` solves this); the player is a unit position `P` and heading `H` moved with quaternions, and the camera follows with `up = P`. The **main road** is a spiral sampled on the sphere. Each district is a big **arch on a round plaza**; the district's landing note is a **kiosk** on that plaza. Every other topic has its own **street**: a great-circle lane leaving the road at right angles (alternating sides), with a street-name post at the entrance, lamps, houses (instanced), and a **reading lodge** at the end with the topic's status plaque in front of it (solid orb = written, ring = outlined, cube = index). Interactables (rocket, plaques) are found by proximity; the lodge plaque is only near once you have walked the street. Click-to-travel and ‹ › follow waypoints along the road and down the street. Circular obstacles (trees, rocks, arch posts, plaques, lamps, houses, lodges, the pad) push the walker out so it slides around them.
- **Door transition:** pressing E at a plaque glides the camera to the lodge door while `warpTo()` in `main.js` fades a white overlay (`#white.door`, about 0.4s), sets `location.hash`, then fades back in; going back to the road uses the same fade and resumes on that topic's street. It is skipped under reduced motion. Topic-to-topic links inside articles are plain page changes.
- **Navigation:** one levelled path, Home → Galaxy → Planet → Topic. `nav.js` (`navFor`) describes the bar for a route and `main.js` renders it: a Back button that names where it leads, a clickable breadcrumb trail, and a few actions. Esc always presses Back. Home has no bar. Never add ad-hoc back links or in-page breadcrumbs; extend `navFor` instead.

  | Route | Back goes to | Actions |
  | --- | --- | --- |
  | `#/` | none | Launch |
  | `#/galaxy` (3D) | Home | The big picture, List view |
  | `#/list` (text) | Home | 3D galaxy |
  | `#/<planet>` (3D road) | Galaxy (rocket boards) | List view; shows "n / N topics" |
  | `#/<planet>?text` | Galaxy | Walk the road |
  | `#/<planet>/<topic>` | that planet's road, on that topic's street (fade) | none |
- **Time-of-day theme:** `theme.js` blends keyframes (night, sunrise, day, sunset, twilight) by the visitor's local time and sets `--sky1..3` and an `html.night` class (dark clay UI). Each scene builds a `createSkyRig` (`scenes/clay.js`: sky, fog, lights, stars, moon, night glow on signposts) and exposes `applyTheme(t)`; new scenes must do the same. Use theme variables in CSS (`--clay`, `--ink`, `--soft`, `--white`…), never hard-coded light colours. Test with `?time=22:30` (night), `?time=18:40` (sunset), `?time=07:00` (sunrise).
- **`reduce` motion:** every scene must honour `prefers-reduced-motion` and skip long animations.

## Tech city, knowledge grid and weather (planet scene)

Luminous accents on top of the clay look: pastel by day, glowing at night (through `sky.addGlow`, which scales emissive with `sky.night`).

- **`city.js`**: `createTech` (circuit-trace road texture, windowed houses, lodge doors and status panels; generated canvas textures, no assets) and `buildCity` (smart-lamp light cones, lodge terminals, one landmark per district by position `k % 4`: server spire, radar dish, antenna array, energy core, sized by topic count; rooftop masts, kiosk terminals, holo billboards, data pulses, a maglev pod at height 6.6 so it clears the arches, up to 6 drones). Scenery (trees, rocks, clouds) and the city use seeded streams from the planet id, so a planet looks the same every visit (`planetScene.stats().sceneryHash`). Never use `Math.random()` for placing things.
- **`grid.js`**: `buildGrid` draws arcs between lodges whose notes link each other (brighter near the lodge you stand by; Connections toggle); `createRadar` draws the HUD minimap (heading up, rings = unread, pulse/arrow = nearest unread; `M` toggles).
- **Read progress**: `reader.js` records a topic in localStorage `ai-base-read` at 90% scroll (`markRead`, `readSet`). Read lodges glow mint, unread written ones warm, hubs cyan, outlined stay dark. Read from the vault's own notes only; nothing is stored server-side.
- **`weather.js`**: Auto (seeded by planet id, date and six-hour block), Clear, Cloudy, Mist, Rain, Snow, Storm. It scales fog, light, sky and clouds, adds rain/snow particles around the walker, wet sheen, snow cover and storm lightning, easing between modes. `weather.reapply()` must run after every `sky.apply` (planet `applyTheme` does). The choice is stored in `ai-base-weather`; `#planet[data-weather]` shows the resolved mode. Reduced motion: no particles, no lightning, no drifting clouds.
- **Detail**: Full or Lite (fewer pulses, no drones/billboards/cones, half the particles). Lite is the default on touch screens; the scene drops to Lite by itself if the first ~3s average under 24 fps, unless chosen (HUD, stored in `ai-base-hud`) or forced with `?detail=full|lite`.
- **HUD** (`#phud` in `index.html`): radar `#pmap`, `#pweather`, `#pdetail`, `#pconn`, `#pradar`; a ⚙ button opens it on phones.
- **`?debug`**: shows fps, draw calls and triangles and exposes `window.__aiBase = { stage, planetScene }`. `test:planet` keeps Full detail within `100 + 0.6 × topics` draw calls (plaques, posts, lodges and street ribbons are instanced or merged: about 91 on Fundamentals, 128 on Math).

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
- **Module contract:** `export default function mount(root, kit) { …; return cleanup; }`. `kit` is `benches/kit.js`: `h` (DOM), `frame`, `canvas` (DPR-aware, redraws on resize and theme change), `plot` (data-to-pixel mapping with axes), `slider`, `button`, `toggles`, `choice`, `stepper` (step/play/reset; never autoplays), `sorter` (click or drag items into bins, with a check), `reveal`, `stats`, `live` (screen-reader announcements), `dragHandles`, `rng` (seeded, for reproducible demos), `palette` (theme colours read from CSS variables), `fmt`. `benches/grid.js` is shared code, not a bench: grid layout, stepwise BFS/DFS/A*/greedy search and wall painting for the Classic AI benches. `benches/mathkit.js` is shared code for the Math benches: world-to-pixel views, arrows, function curves, 2×2 matrix controls and grid warping, heat maps, and probability, statistics and polynomial-fitting helpers (pure functions, so notes' worked numbers can be computed with them in Node); `benches/network-kit.js` holds the tiny-network maths and diagram shared by the two network benches; `benches/mlkit.js` is shared code for the Machine Learning benches: seeded toy datasets (blobs, moons, ring), ridge/lasso/logistic/SVM/kNN learners, decision trees, forests, boosting stumps, k-means, hierarchical clustering, PCA, EM, a grid world with value iteration and Q-learning, and bandits (pure functions, so the notes' numbers can be computed in Node); `benches/rlkit.js` draws the grid world. Vanilla canvas/SVG only, no external requests, no dependencies.
- **Loading:** `main.js` (`mountBenches`) imports a bench when its placeholder scrolls near the viewport and mounts it into `.bench[data-bench]`; the placeholder text is the fallback, and a failed import leaves it with a "could not load" note.
- **Layout and text:** `frame(root, { title })` gives a title and two panes: visuals (canvas, grids, sorters, tables, lists) on the **stage**, controls and one readout strip in the **panel**; `body.append(...)` routes nodes automatically (add class `stage` to force one into the stage). Wide screens show them side by side (the canvas stays in view while you drag sliders); small screens stack them. Benches carry **no explanatory prose**: no hint line, no live lesson sentences. Explanation belongs in the note ("Try this", "What you should notice"); a bench shows a title, self-explanatory labels, numbers, and feedback for an action (the sorter's result, a rule engine's derived facts). Text that only helps screen-reader users goes through `live()`.
- **Rules:** benches must be operable by keyboard (every draggable quantity also has a slider), announce results via `live`, use theme colours (never hard-coded light ones), honour `reduceMotion`, and work at phone width. Add a bench with the note that uses it, then run `npm run test:benches` (it also checks for horizontal overflow at three widths).

## Topic template (for notes that publish well)

One topic answers one question. Every written topic follows this arc, about 700–1500 words (concept topics land near 700–950; longer only when the topic needs it):

1. Summary paragraph (becomes the topic summary), then **You need:** links to prerequisites that exist.
2. The question it answers → intuition (plain language, an analogy) → definition and notation → a worked example with small numbers.
3. **Bench** with **Try this** and **What you should notice**.
4. Where it appears in AI → common pitfalls → **Quick check** (3 questions, answers in `<details>`) → **Key terms** (3–6 short definitions) → **Related** links.

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
4. **Topic pages** ✅ (the animation, warp and blobs described here were later replaced, see 9) pressing E on a signpost dives the camera into its orb while the warp tunnel (`transition.js`) rushes in and opens on the article. The article has an animated title, reading bar, sticky scroll-spy table of contents (level 1–3 headings), reveal-on-scroll, parallax clay blobs, related/mentioned-in chips, and previous/next cards. Every topic link inside an article warps; "Back to the road" (or Esc, or the planet breadcrumb) runs the warp in reverse and returns to that topic's signpost.
5. **Polish** ✅ renamed to AI Base, single GitHub link in the header, no "skip to text version" (the list view stays reachable from the galaxy and planet screens); self-hosted fonts (no external requests); favicon and social preview; collision with trees, rocks, gates and signposts; adaptive quality (lighter pixel ratio and shadows on phones, drops to 1× if the first seconds run slowly); boot loader; route announcements and heading focus for screen readers.
6. **Time theme + navigation** ✅ local-time colours and a night mode across UI and all three scenes; a single Back/breadcrumb bar on every screen; fixes: reversing keeps the camera behind the astronaut, ‹ › walk to the previous/next signpost along the road.
7. **Benches (Wave 0)** ✅ `bench` blocks, `benches/kit.js`, the smoke test, and three pilot topics that set the quality bar: Dot Product, Derivatives, Bayes Theorem. The curriculum is being rewritten from scratch in waves (math spine first); the pilot notes replace the earlier stubs.
8. **AI Fundamentals** ✅ the planet is a folder planet (`Fundamentals/<District>/<Topic>.md`, landing note `Fundamentals.md`) with five districts and 24 topics, each with a bench: What Is AI, The Agent, Data and Models, Classic AI, Judging AI. Dates and textbook frameworks were checked against sources. Worked-example numbers in the notes were produced by running the benches' own logic, so change a bench's data or seed only together with its note.
9. **Reading, benches and streets** ✅ articles and text lists became a standard document (no clay, parallax or reveal animations); benches got a roomy two-pane layout and lost their explanatory text; the planet road grew a big arch and plaza per district and a street with a reading lodge per topic, with a door fade replacing the warp tunnel (`transition.js` was removed).
10. **Medium-style reading** ✅ articles gained the serif typography, generated covers, end-of-article cards and the reader (`reader.js`): a floating bar whose **street strip** has a lamp per section and a small walker that moves as you read (click a lamp to jump), time left, settings (size, typeface, light/sepia/dark/auto), an outline drawer, resume where you left off, hover previews for topic links, dotted key-term popovers built from each note's *Key terms* list (the build exposes them as `glossary`), a selection bar (copy quote, copy link to a section via `#/<topic>?at=<heading-id>`). The note's trailing *Related* list is replaced on the page by the cards; the vault note keeps it.
11. **Tech city and weather** ✅ luminous accents (lit roads, windowed houses, smart lamps, lodge terminals), district landmarks, living layers (pulses, maglev pod, drones), knowledge grid beams, read-progress lighting, radar minimap, six weather modes, Full/Lite detail, `?debug` overlay, seeded scenery.
12. **The Math planet** ✅ rebuilt from scratch as 12 districts and 122 topics in learning order, each with a bench: Arithmetic and Number Sense, Algebra and Functions, Geometry and Trigonometry, Sets/Logic and Counting, Linear Algebra, Calculus, Probability, Statistics, Information Theory, Optimization, Numerical Computing, Math in AI. Every topic follows the topic template and lists only earlier topics after **You need:** (the content build warns when a prerequisite comes later on the road). Worked-example numbers were checked by running the same formulas (and, for the overfitting and bias–variance tables, the benches' own `mathkit.js` code), so change a bench's data or seed only together with its note.
13. **Site upgrades** ✅ search, My path (progress, continue, reset), cross-planet prerequisite tags, lazy article bodies, instanced planet streets (fewer draw calls), `test:site`, and the CI workflow `.github/workflows/ci.yml`.
14. **The Machine Learning planet** ✅ a folder planet (`Machine Learning/<District>/<Topic>.md`, landing note `Machine Learning.md`) with ten districts and 52 topics, each with a bench: The Learning Problem, Data and Features, Linear Models, Instance and Probability Methods, Trees and Ensembles, Evaluation, Unsupervised Learning, Bias/Fairness and Failure, Reinforcement Learning Basics, Machine Learning in Practice (ending in a capstone). Worked numbers were produced by running the same code as the benches (`mlkit.js`, `mathkit.js`), so change a bench's data or seed only together with its note. Cross-planet links go backwards only (ML links to Math and Fundamentals, never to later planets except by planet title).

## Verifying changes

There is no test suite. For site work: run `npm test` (must build with no unexpected warnings), serve the site, and check it in a real browser (Playwright with Chromium is available in the cloud environment: launch with `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`). Look at screenshots of the home, galaxy, a planet (day and `?time=22:30`) and an article, run `npm run test:benches`, `npm run test:planet`, `npm run test:reader` and `npm run test:site`, and check the console for errors.
