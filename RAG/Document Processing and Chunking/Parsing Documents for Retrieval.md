A real document isn't just its words. A PDF carries page numbers, headers and footers repeated on every page; a web page carries navigation menus and cookie banners around the actual article. None of that is content a retrieval system should ever match a query against — but it's exactly what a naive "just extract the text" approach drags along for free.

**You need:** [[Anatomy of a RAG Pipeline]].

## The question it answers

"What has to happen before a document is even ready to chunk?" Parsing turns a document's native format (PDF, HTML, a spreadsheet, a scanned image) into clean text, and specifically means stripping boilerplate that repeats across every page or section — page numbers, running headers, confidentiality footers, navigation chrome — none of which answers any real question a user would ask.

## Intuition

Photocopying every page of a report and handing someone the whole stack, headers, footers and page numbers included, buries the one paragraph they actually need in repeated noise. A good parser is the person who goes through first with a highlighter and scissors, keeping only what the report actually says.

## Definition and notation

```text
noise fraction = (raw word count − cleaned word count) / raw word count
```

## A worked example

One raw page from a company policy PDF, before and after stripping repeated boilerplate:

```text
raw page (23 words):
  "Page 7 of 42
   ACME CORP CONFIDENTIAL
   Shipping Policy
   Orders ship within two business days of payment confirmation.
   Footer: acme.com | page 7"

cleaned (11 words):
  "Shipping Policy
   Orders ship within two business days of payment confirmation."

noise fraction: (23 − 11) / 23 = 52.2%
```

Just over half of this raw page's word count was boilerplate repeated on every single page of the document — page numbers, a confidentiality stamp, and a footer. Left in, it would be chunked and embedded right alongside the one sentence that actually answers a question.

## Bench

```bench
id: parsing-noise-vs-signal
title: Half of this page was never content
fallback: Toggle boilerplate stripping and watch how much of a raw page was never real content.
```

**Try this**

1. Look at the raw page and count how much of it repeats the same way on every page of a 42-page document.
2. Toggle stripping on and see exactly which lines get removed.
3. Imagine this boilerplate embedded and chunked across all 42 pages — how much wasted index space does that add up to?

**What you should notice:** the noise isn't a small rounding error — on this page it's over half the word count, and it would repeat identically on every other page of the same document.

## Where it appears in AI

* **Everything downstream assumes parsing already happened**: [[Fixed-Size and Recursive Chunking]] and every later chunking topic operate on text that's assumed to already be boilerplate-free.
* **[[Handling Tables, Code and Structured Content]] is about a parsing decision too** — how to extract structured content without destroying the structure that makes it meaningful.
* **Boilerplate left in a chunk pollutes its embedding** (covered on [[Embeddings and Similarity Search]]), diluting the signal a retrieval system is supposed to match against.

## Common pitfalls

* **Assuming "extracting text" is the whole job.** The worked example shows extraction alone (without cleaning) keeps over half noise — parsing isn't finished until boilerplate is actually removed.
* **Writing one-off cleaning rules per document instead of detecting repeated patterns.** Headers and footers repeat identically or near-identically across pages, which is exactly what makes them detectable and removable systematically.
* **Over-stripping and removing real content that merely looks like boilerplate.** A line like "Section 7: Shipping Policy" can look like a header but is actually the start of real content — cleaning rules need to be specific enough to avoid false positives.

## Quick check

<details><summary>1. In the worked example, why does the noise fraction come out above 50%?</summary>
The raw page has only one real sentence of content (12 words) against 11 words of repeated boilerplate (a page counter, a confidentiality stamp, and a footer), so the boilerplate makes up slightly more than half the total word count.
</details>

<details><summary>2. Why does boilerplate matter more on a long, multi-page document than on a single short one?</summary>
The same boilerplate repeats on every page, so its total footprint across the whole document scales with the page count — a document with more pages wastes proportionally more of its chunked, embedded content on identical repeated text.
</details>

<details><summary>3. What's the risk of being too aggressive about stripping "boilerplate"?</summary>
A cleaning rule written too broadly can remove real content that happens to resemble boilerplate (like a section heading), losing information the chunking and retrieval stages downstream never get a chance to see.
</details>

## Key terms

* **Boilerplate:** text that repeats across a document's pages or sections without carrying page-specific content (headers, footers, page numbers).
* **Parsing:** converting a document's native format into clean text suitable for chunking.
* **Noise fraction:** the share of a raw extraction that turns out to be boilerplate rather than real content.

## Related

[[Anatomy of a RAG Pipeline]] · [[Fixed-Size and Recursive Chunking]] · [[Handling Tables, Code and Structured Content]]
