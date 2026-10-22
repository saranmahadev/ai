# AI Base

AI Base is an open, structured knowledge base for learning artificial intelligence — from arithmetic and linear algebra up through transformers, LLMs, retrieval-augmented generation and autonomous agents. It's written as a connected set of Markdown notes and published as a free site at **[ai.saranmahadev.in](https://ai.saranmahadev.in)**.

Every subject follows the same arc: a plain-language explanation, a worked example with real numbers, an interactive bench you can play with in the browser, common pitfalls, a quick check, and links to what to read next. There's also an optional 3D "Explorer Mode" if you'd rather fly a rocket between subjects and walk a planet's streets than click through a list — same content either way.

## Repository layout

```
AGENTS.md, CLAUDE.md     the vault's rules and the site's technical guide
<Subject>/<Topic>.md     the vault: the actual knowledge, in Markdown
.site/                   the static site generator and front end that publishes the vault
```

The Markdown notes are the single source of truth. The site in `.site/` is a generated, read-only view of them — see `AGENTS.md` for exactly how a note becomes a page, and `CLAUDE.md` for the site's architecture and build commands.

## Running the site locally

```bash
cd .site
npm ci
npm run dev   # builds content.json from the vault and serves http://localhost:8000
```

## Contributing

Contributions to the notes (fixing an explanation, adding a missing topic) or to the site are both welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and ground rules.

## License

Code is released under the [MIT License](LICENSE). The written notes are knowledge content, not software; reuse with attribution.
