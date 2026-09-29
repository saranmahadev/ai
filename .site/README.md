# AI Knowledge Brain site

A static, claymorphism site generated from the vault's Markdown notes. See `../CLAUDE.md` for architecture and commands, and `../AGENTS.md` for how notes map to planets, districts and topics.

```bash
npm ci && npm run dev   # builds content.json from the vault and serves http://localhost:8000
npm test                # content check: prints warnings for unresolved links / unassigned notes
```
