"How many orders were placed in 2024?" has an exact answer sitting in a table of order records — but no chunk of retrieved text, however well-chosen, can ever compute that count. Retrieval returns passages; counting, summing and filtering across many rows is what a structured query actually does.

**You need:** [[Handling Tables, Code and Structured Content]].

## The question it answers

"What happens when a question needs a computed answer over structured data, not a retrieved passage?" Chunk-based retrieval, even with structure preserved ([[Handling Tables, Code and Structured Content]]), still returns *passages* — individual rows or table fragments. A question asking for an aggregate (a count, a sum, an average) across many rows needs a structured query translated from the question, run directly against the table or database, producing an exact computed answer no retrieved chunk could contain on its own.

## Intuition

Asking a librarian "how many books in this library were published after 2020" isn't answered by handing over the single most relevant book — it's answered by actually counting, which requires checking every book's publication year, not retrieving one representative example of one.

## Definition and notation

```text
nl_to_query(question) = {filter, operation}      -- translate the question into a structured query
run(data, query)      = execute filter/aggregate directly against the full table
```

## A worked example

A small orders table, queried for "how many orders were placed in 2024":

```text
orders:
  id 1, year 2023, $50
  id 2, year 2024, $80
  id 3, year 2024, $120
  id 4, year 2024, $60
  id 5, year 2023, $90

structured query: filter year = 2024, count rows
→ result: 3 orders

chunk retrieval over a flattened table: could at best return the whole table's text as one chunk —
  no retrieved passage computes "3" directly; counting still has to happen separately
```

The structured query runs a filter across all five rows and returns an exact count — 3. Retrieval, even if it returned the entire table as a single chunk, would only hand back raw rows; counting how many satisfy the condition is a computation retrieval itself never performs.

## Bench

```bench
id: structured-query-vs-chunks
title: Counting rows is a query, not a passage
fallback: Run an aggregate question as a structured query over a table and compare against what chunk retrieval alone could ever return.
```

**Try this**

1. Slide the year filter and watch the count update exactly.
2. Consider what a chunk-retrieval system would have returned instead for the same question.
3. Think of another question over this table (total revenue in a year, the largest single order) that would need the same kind of structured computation.

**What you should notice:** the count isn't being *found* anywhere in the data — it's being *computed* by checking every row against the filter, which is exactly what a structured query engine does and retrieval alone cannot.

## Where it appears in AI

* **This is the sharper version of the problem [[Handling Tables, Code and Structured Content]] introduced**: even perfectly preserved row-level chunks can't answer an aggregate question across many rows.
* **The "translate the question into a query" step is itself a generation task**, related to [[Structured Output and Tool-Calling APIs]] in LLMs — producing a correctly structured query is a constrained-generation problem.
* **A production RAG system often routes a question to either retrieval or a structured query engine** depending on what kind of question it is — part of the decision [[Production RAG Pipeline Architecture]] has to make.

## Common pitfalls

* **Trying to answer an aggregate question through retrieval alone, however the table is chunked.** No chunking strategy fixes this — the problem isn't how the data is split, it's that computing an aggregate requires checking every row, which retrieving a handful of chunks never does.
* **Assuming every question over structured data needs a structured query.** A question asking about one specific row ("what's in the Pro plan") is answered fine by retrieving that row as a chunk — structured queries matter specifically for aggregates and multi-row computations.
* **Trusting an automatically generated structured query without validating it.** A mistranslated filter (the wrong year, an off-by-one condition) produces a confidently wrong exact number, which can look more trustworthy than a vague retrieved passage precisely because it's a precise-looking number.

## Quick check

<details><summary>1. Why can't chunk retrieval answer "how many orders were placed in 2024," even if every row is preserved as its own chunk?</summary>
Retrieval returns a set of passages; it doesn't perform a computation across them — counting how many returned rows satisfy a condition is a separate step that retrieval itself never does.
</details>

<details><summary>2. What has to happen before a natural-language question can be answered as a structured query?</summary>
The question needs to be translated into a structured form — identifying the filter condition (year = 2024) and the operation (count) — before it can be run directly against the table.
</details>

<details><summary>3. Does every question over a table need to become a structured query?</summary>
No — a question asking about one specific row can be answered by retrieving that row as a chunk; structured queries matter specifically for questions requiring computation across many rows.
</details>

## Key terms

* **Structured query:** a precise, executable filter or aggregate operation run directly against structured data.
* **Aggregate:** a computed value (count, sum, average) across multiple rows, as opposed to a single retrieved record.
* **NL-to-query translation:** converting a natural-language question into a structured query's filter and operation.

## Related

[[Handling Tables, Code and Structured Content]] · [[Graph-Based RAG]] · [[Production RAG Pipeline Architecture]]
