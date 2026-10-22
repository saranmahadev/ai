# Contributing to AI Base

Thanks for considering a contribution. This repository has two very different kinds of content, and they're reviewed differently.

## 1. The vault (the Markdown notes)

The `*.md` notes at the repo root and inside each subject's folder (`Math/`, `Deep Learning/`, `Agents/`, …) are the actual knowledge base — the single source of truth the site is generated from.

- Read `AGENTS.md` first. It covers the vault's rules: one concept per note, wiki-link related notes (`[[Like This]]`), never invent a citation or fact, and how a note maps onto the published site (planet / district / topic).
- Read `CLAUDE.md`'s "Topic template" section for the shape a well-published note follows (summary, prerequisites, worked example, bench, pitfalls, quick check, key terms, related).
- Open an issue or a PR describing the note you want to add or fix. Small corrections (typos, broken links, a clearer worked example) are easy to review; a new topic or subject is easier to discuss first in an issue.
- Any worked numbers in a note (a probability, a gradient, a parameter count) should be reproducible — ideally by running the same code the note's interactive bench uses.

## 2. The site (`.site/`)

The generator, front end, and interactive benches that turn the vault into [ai.saranmahadev.in](https://ai.saranmahadev.in).

- Read `CLAUDE.md` in full — it's the technical guide: architecture, commands, the branching flow, and how to verify a change.
- **Never put knowledge in `.site/`.** If a page is wrong because a *fact* is wrong, fix the note, not the template.
- Follow the branching flow in `CLAUDE.md`'s "Branching and release flow" section: branch from `dev` as `feature/<name>`, develop there, merge into `dev` once ready (this is where the full local test suite runs via the pre-push hook), then open a PR from `dev` into `main`.
- Before opening a PR, run the checks `CLAUDE.md`'s "Verifying changes" section describes (`npm test`, the `test:*` scripts, a look in a real browser). A clean push already means these passed, since the pre-push hook runs them.

## Ground rules

- Be specific in PR descriptions: what changed and why, not just what.
- Keep PRs focused — a note fix and a site refactor are two separate PRs.
- Be kind in review. This is a learning resource; assume good faith from everyone contributing to it.

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for how we expect people to treat each other here, and [SECURITY.md](SECURITY.md) if you've found a security issue rather than a content issue.
