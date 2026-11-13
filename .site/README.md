# AI Base site

A static site generated from the vault's Markdown notes: a curriculum of courses, chapters and lessons. See `../CLAUDE.md` for architecture and commands, and `../AGENTS.md` for how notes map to courses, chapters and lessons.

```bash
npm ci && npm run dev   # builds content.json from the vault and serves http://localhost:8000
npm test                # content check: prints warnings for unresolved links / unassigned notes
```
