# Security Policy

AI Base is a static site (a generated Markdown knowledge base, no backend, no accounts, no user data sent to a server — anything stored client-side, like reading progress, stays in the visitor's own browser). The attack surface is small, but we still want to hear about real issues.

## Reporting a vulnerability

If you find a security issue — for example, a way to inject script into a published page, a dependency with a known exploitable vulnerability, or a way to make the build pipeline do something it shouldn't — please report it privately rather than opening a public issue.

- Open a [GitHub security advisory](https://github.com/saranmahadev/ai/security/advisories/new) on this repository, or
- Email the maintainer directly (see the GitHub profile at [github.com/saranmahadev](https://github.com/saranmahadev)) with a description, reproduction steps, and the potential impact.

We'll acknowledge reports within a few days and aim to ship a fix before any public disclosure.

## Out of scope

- Content accuracy issues (wrong fact, outdated date, a broken explanation) — please open a regular issue or PR for those instead; see [CONTRIBUTING.md](CONTRIBUTING.md).
- The site makes no outbound network requests and stores no data server-side, so account takeover, data exfiltration, and similar reports generally don't apply here — but we'd still like to know if you find a way around that.
