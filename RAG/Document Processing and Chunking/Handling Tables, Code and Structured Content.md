Flattening a pricing table into one run-on paragraph destroys the one thing that made it useful — knowing which number went with which row. The same chunking advice that works for prose (split by sentence, by topic) actively damages content whose meaning *is* its structure.

**You need:** [[Metadata Extraction and Enrichment]].

## The question it answers

"How should chunking change for content that isn't ordinary prose?" A table's rows, a function's source code, a form's fields all carry meaning in their *structure*, not just their words. Flattening a table into a single paragraph averages its rows together into something that barely resembles any one of them — a query about one specific row ends up matching a vague blur of the whole table instead of the row it's actually asking about.

## Intuition

Reading a spreadsheet aloud as one continuous sentence — "Basic plan nine dollars per month Pro plan forty nine dollars per month Enterprise plan contact sales" — makes it much harder to pick out "how much is the Pro plan" than just pointing at the Pro plan's own row. The information didn't change; the structure that made it easy to use did.

## Definition and notation

```text
flattened:       whole table → one chunk, one embedding, structure lost
row-preserved:    each row (or logical unit) → its own chunk, structure kept
```

## A worked example

A query about one specific row of a pricing table ("what is the price of the Pro plan"), compared against two chunking choices for the same table:

```text
query vector:            [0.90, 0.10, 0.00]
flattened table vector:  [0.30, 0.30, 0.30]   (the whole table averaged into one blob)
row-preserved vector:    [0.88, 0.08, 0.02]   (just "Pro plan: $49/mo" kept as its own chunk)

similarity to flattened table:   0.6376
similarity to row-preserved row: 0.9995
```

Keeping the Pro plan's row as its own chunk scores more than 36 percentage points higher on cosine similarity than the same information buried inside the whole table flattened into prose. The flattened version's embedding sits roughly equidistant from every row's topic, since it's an average of all of them — it's not strongly "about" any one row, including the one the query actually needs.

## Bench

```bench
id: structured-content-similarity
title: A table loses its structure when it's flattened
fallback: Compare a query against a table flattened into prose versus the same table's rows kept separate.
```

**Try this**

1. Check the flattened table's similarity score against the query.
2. Switch to the row-preserved chunk and compare.
3. Imagine a table with 20 rows instead of 3 — would flattening get better or worse as rows are added?

**What you should notice:** a flattened table's embedding dilutes as more unrelated rows get folded into it — the more rows a table has, the worse a flattened chunk's embedding represents any single one of them.

## Where it appears in AI

* **This is a specific instance of the same cost [[Fixed-Size and Recursive Chunking]] and [[Semantic and Structure-Aware Chunking]] cover more generally**: a chunk boundary (or lack of one) that ignores the content's own structure degrades what gets retrieved.
* **[[Retrieval over Structured Data]] goes a step further**, querying a table or database directly instead of retrieving pre-chunked rows at all.
* **Code has the same problem as tables**: a function split mid-body, or flattened together with unrelated functions, loses the structural boundary (a function definition) that should have driven chunking in the first place.

## Common pitfalls

* **Applying prose-chunking rules (sentence boundaries, paragraph breaks) to a table or a code file.** Neither has sentences in the relevant sense — a table's unit is a row; code's unit is a function, class, or block.
* **Flattening structured content "to keep it simple," then being surprised retrieval performs badly on it.** The worked example's gap (0.64 vs. 1.00) shows this isn't a minor quality loss — it can be the difference between retrieving the right row and retrieving nothing useful at all.
* **Preserving structure but losing the surrounding context a row needs to make sense.** A row like "$49/mo" without "Pro plan" and "per month" attached is structurally preserved but semantically incomplete — structure-aware chunking still needs to keep enough context in each chunk to stand alone.

## Quick check

<details><summary>1. In the worked example, why does the flattened table's embedding score so much lower against a row-specific query?</summary>
The flattened table's embedding is effectively an average over every row's content, so it isn't strongly aligned with any single row's topic — including the Pro plan row the query actually needs.
</details>

<details><summary>2. Would flattening a 2-row table cause the same problem as flattening a 20-row table?</summary>
To a lesser degree — averaging over fewer, more similar rows dilutes less than averaging over many varied ones, but the underlying problem (losing which content belongs to which row) is the same regardless of table size.
</details>

<details><summary>3. What's the right chunking unit for source code, by the same logic that applies to table rows?</summary>
A function, class or logical block — the structural unit that code's own syntax already defines, analogous to a table's row.
</details>

## Key terms

* **Structured content:** content whose meaning depends on an explicit structure (tables, code, forms) rather than flowing prose.
* **Flattening:** converting structured content into unstructured prose, discarding the structure in the process.
* **Row-preserved chunking:** keeping each structural unit (a table row, a function) as its own chunk.

## Related

[[Metadata Extraction and Enrichment]] · [[Retrieval over Structured Data]] · [[Fixed-Size and Recursive Chunking]]
