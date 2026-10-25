<p align="center">
  <img src="https://ai.saranmahadev.in/og.png" alt="AI Base — a free, structured knowledge base for learning AI" width="100%">
</p>

<h1 align="center">AI Base</h1>

<p align="center">
  A free, structured knowledge base for learning AI — from arithmetic up through transformers, LLMs, RAG and autonomous agents.<br>
  Every topic ships with a worked example and a live interactive demo, not just prose.
</p>

<p align="center">
  <a href="https://ai.saranmahadev.in"><img alt="Live Site" src="https://img.shields.io/badge/live%20site-ai.saranmahadev.in-7db7ff"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-b39cf5"></a>
  <a href="CONTRIBUTING.md"><img alt="Contributions welcome" src="https://img.shields.io/badge/contributions-welcome-7fd48a"></a>
  <a href="#repository-layout"><img alt="No dependencies, self-hosted" src="https://img.shields.io/badge/runtime%20deps-zero-ffc46b"></a>
</p>

<p align="center">
  <a href="https://ai.saranmahadev.in"><strong>ai.saranmahadev.in →</strong></a>
</p>

---

Every subject follows the same arc: a plain-language explanation, a worked example with real numbers, an interactive bench you can play with in the browser, common pitfalls, a quick check, and links to what to read next. There's also an optional 3D **Explorer Mode**, if you'd rather fly a rocket between subjects and walk a planet's streets than click through a list — same content either way, nothing locked behind it.

## Why this is different

- **Worked examples are actually verified.** Every number in a note was produced by running the same code as that topic's bench — not typed by hand and hoped to be right. Change a bench's data and the note's numbers have to change with it; that coupling is enforced by review, not by convention.
- **624 topics, every one with a live demo.** Not screenshots of a demo — 521 running interactive benches you can drag, step through, and break, built with vanilla canvas/SVG and no dependencies.
- **A real prerequisite graph, not a flat list.** Topics link backward to exactly what you need and nowhere else; cross-subject links only ever point to something earlier, so following "You need:" never leads in circles.
- **Free, open, and it doesn't watch you.** No ads, no account, no analytics, no tracking script, no third-party request of any kind — fonts and a 3D engine are vendored in. Reading progress lives in your own browser's `localStorage` and nowhere else.

## What's inside

| Subject | What it covers |
| --- | --- |
| **AI Fundamentals** | What AI is, and how an intelligent system perceives, decides and acts |
| **Math** | The language of models: arithmetic, linear algebra, calculus, probability, statistics, information theory |
| **Machine Learning** | Learning patterns from data: datasets, models, evaluation, the classic algorithms |
| **Deep Learning** | Multi-layer neural networks that learn their own representations |
| **Neural Networks** | Beyond backpropagation: energy-based memory, biological inspiration, architectures time passed by |
| **Transformers** | How attention becomes a full block, scales, and specializes |
| **Generative AI** | Text, image, audio, video and code generation: decoding, conditioning, evaluation, risk |
| **LLMs** | Pretraining, instruction-tuning, reasoning, evaluation, and the landscape around them |
| **RAG** | Grounding a model in real documents: chunking, embeddings, retrieval, generation |
| **Agents** | Planning, tool use, memory, multi-agent coordination, evaluation, safety |

10 subjects · 624 topics · 521 interactive benches — read as plain documents by default, or explored as a galaxy in 3D.

## Quick start

```bash
git clone https://github.com/saranmahadev/ai.git
cd ai/.site
npm ci
npm run dev   # builds content.json from the vault and serves http://localhost:8000
```

## Repository layout

```
AGENTS.md, CLAUDE.md     the vault's rules and the site's technical guide
<Subject>/<Topic>.md     the vault: the actual knowledge, in Markdown
.site/                   the static site generator and front end that publishes the vault
```

The Markdown notes are the single source of truth. The site in `.site/` is a generated, read-only view of them — see [`AGENTS.md`](AGENTS.md) for exactly how a note becomes a page, and [`CLAUDE.md`](CLAUDE.md) for the site's architecture and build commands.

## Contributing

Contributions to the notes (fixing an explanation, adding a missing topic) or to the site are both welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and ground rules, and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for how we expect people to treat each other here.

## License

Code is released under the [MIT License](LICENSE). The written notes are knowledge content, not software; reuse with attribution.
