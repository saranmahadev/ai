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
  main.js                  hash router (#/, #/galaxy, #/<planet>, #/<planet>/<topic>) + text views
  scenes/                  three.js scenes: home.js (rocket + launch); galaxy/planet scenes as they are built
  models/                  procedural clay models (rocket; astronaut later)
  vendor/                  three.js, vendored (no CDN for 3D)
```

- **Style:** claymorphism. Pastel palette, matte clay materials (`scenes/clay.js`), soft shadows, no bloom. Everything is procedural: no downloaded models or textures.
- **Routing:** hash-based so it works on static hosting. Topic ids are `<planet>/<slug-of-note-title>`; the overview note is `ai`.
- **Text views** (`main.js`) render the galaxy, planets and articles as accessible HTML. They are the permanent fallback for no-WebGL and reduced-motion users, and the article renderer the 3D flow opens.
- **`reduce` motion:** every scene must honour `prefers-reduced-motion` and skip long animations.

## Content pipeline rules

- Planets are configured in `.site/planets.json`; adding a domain means adding an entry there (a folder planet needs `folder` and `index`; a single-note planet lists `notes`). The build warns about notes not assigned to any planet.
- Topic status is derived: empty → `outlined`, link-list only → `index`, otherwise `written` (frontmatter `status` overrides).
- Wiki links resolve by note title, case-insensitively; links to a planned planet's title resolve to that planet.
- Do not put knowledge in `.site/`. If the site needs different content, change the notes (with approval) or the pipeline.

## Migration status

Delivered in order, one PR each:

1. **Foundation** ✅ content pipeline, `AGENTS.md`/`CLAUDE.md`, minimal home with the rocket and lift-off, text explorer (galaxy, planet, article).
2. **Galaxy** ☐ rocket flight into a solar system of planets; landing on a chosen planet.
3. **Planet** ☐ walk an astronaut along the road of topics (keyboard, touch joystick, click-to-move); signposts open topics.
4. **Topic pages** ☐ warp/zoom transition into the article, table of contents, related-topic fast travel, return to the same spot on the road.
5. **Polish** ☐ mobile controls, performance, accessibility, social preview.

## Verifying changes

There is no test suite. For site work: run `npm test` (must build with no unexpected warnings), serve the site, and check it in a real browser (Playwright with Chromium is available in the cloud environment: launch with `--use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`). Look at screenshots of the home, galaxy, a planet and an article, and check the console for errors.
