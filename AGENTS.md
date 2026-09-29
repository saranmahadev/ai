# AI Knowledge Brain

This directory is an Obsidian vault for building an AI knowledge brain. Knowledge is represented as Markdown notes connected through Obsidian wiki links (for example, `[[Machine Learning]]`). Treat the vault as a knowledge graph, not a software project.

## Change Guardrail

- Do not create, edit, rename, move, or delete any file without the user's explicit approval in the current conversation.
- Do not modify `.obsidian/` settings, plugins, themes, or workspace files without explicit approval.
- Do not treat a previous approval, a similar task, or an implied goal as approval for a new change.
- Before requesting approval, state the exact files to change and a concise description of each change. Wait for a clear confirmation before applying it.
- Never use destructive operations or bulk rewrites unless the user explicitly approves the scope and method.

## Git and Change Workflow

- Before proposing any file changes, check `git status` to verify everything already in the repo is committed and the working tree is clean. If dirty, report it and stop before making changes unless the user approves handling of uncommitted work.
- Propose a plan: state the exact files to change and a concise description of each change. Wait for clear confirmation before applying it.
- After approval, make the changes, inspect with `git status` and `git diff`, stage only intended files, and commit them. Never commit secrets.
- If the directory is not yet a git repo, initialize with `git init` and commit existing files first before proceeding to planned changes.

## Safe Work Without Approval

- Read, search, inspect, and summarize vault content.
- Answer questions, suggest note structures, and propose links without writing them.
- Research the web when the user asks for current, external, or source-backed information. Clearly distinguish sourced facts from suggestions.

## Knowledge Graph Conventions

- When an approved task creates knowledge, give each distinct, reusable concept its own note rather than burying it in an unrelated note.
- Link related concepts with Obsidian wiki links and prefer existing note titles over duplicates.
- Preserve existing note names, links, structure, and writing style unless the approved task says otherwise.
- Avoid orphan notes: connect a new note to relevant existing notes where the relationship is accurate.
- Do not invent citations, sources, links, or facts. Flag uncertainty and ask the user when it affects the requested content.

## Site Publishing

The vault is the single source of truth for a public site in `.site/` (deployed to `ai.saranmahadev.in`). The site is a generated, read-only view of the notes: **knowledge is written in the vault, never in `.site/`**. Site architecture and commands live in `CLAUDE.md`.

### How knowledge maps to the site

| Vault | Site |
| --- | --- |
| A top-level domain, configured in `.site/planets.json` (for example `Math/`) | A **planet** |
| A sub-folder of a planet's folder (for example `Math/Calculus/`) | A **district**: one stretch of that planet's road |
| A note | A **topic**: a signpost on the road, opened as an article page |
| A `[[wiki link]]` | A connection: "Related topics", "Mentioned in", and fast travel |
| An empty note | An *outlined* topic, shown as "still empty" |
| A domain with no notes yet, listed as `planned` in `.site/planets.json` | An *undiscovered* planet |

- The note filename is the topic title. A district's landing note has the same name as its folder (`Calculus/Calculus.md`); the planet's landing note sits next to the folder (`Math.md`). Their link order sets the order of districts and topics.
- A note with no folder or planet assignment is reported by the site build as a warning; assign it in `.site/planets.json`.
- `AGENTS.md`, `CLAUDE.md`, `README.md`, `.obsidian/`, `.agents/`, `.github/` and `.site/` are never published.

### Writing notes so they publish well

- Start with a short plain-language paragraph: it becomes the topic summary. Optional frontmatter (`title`, `summary`, `status`) overrides the derived values.
- Use standard Markdown plus wiki links (`[[Note]]`, `[[Note|alias]]`, `[[Note#Heading]]`). Use `##`/`###` headings, since they build the page's table of contents. Tables, code fences and `> [!note]` callouts are supported.
- Link only to notes that exist, or to a planned planet by its title. Unresolved links are reported by the site build.
- Do not embed Obsidian files (`![[...]]`); they are dropped. Use ordinary image links instead.

### Changing the vault or the site

- Note changes and site changes are separate tasks and separate commits. A note change never requires a site change, and site work must not edit notes.
- After an approved note change, run the site content check (see `CLAUDE.md`) and report any warnings it prints.
- All guardrails above apply to `.site/`, `.github/`, and `CLAUDE.md` as well.

## Scope

- This is a Markdown knowledge vault. Its only build is the site content pipeline described in `CLAUDE.md`; there are no other build, test, or deployment commands.
- `AGENTS.md` is operational documentation for agents and is excluded from the Obsidian file explorer.
