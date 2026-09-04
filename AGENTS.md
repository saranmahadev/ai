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

## Scope

- This is a Markdown knowledge vault; there are no build, test, or deployment commands.
- `AGENTS.md` is operational documentation for agents and is excluded from the Obsidian file explorer.
