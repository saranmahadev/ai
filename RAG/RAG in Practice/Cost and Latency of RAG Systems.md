A plain LLM call already has its own cost and latency math, already covered in LLMs. RAG adds a handful of extra stages in front of that call — and the question this topic actually answers is how much those extra stages cost on top of a plain generation request, not how generation itself is priced.

**You need:** [[Cost and Latency of LLM APIs]], [[Production RAG Pipeline Architecture]].

## The question it answers

"How much overhead does retrieval actually add to a plain LLM request?" [[Cost and Latency of LLM APIs|Generation's own cost and latency]] is unchanged by RAG — a RAG system still makes the same kind of LLM call at the end. What RAG adds is everything *before* that call: embedding the query, searching the index, and (optionally) re-ranking a shortlist. The real question for a production system is whether that added overhead is large enough to matter next to generation's own cost.

## Intuition

Adding a quick stop at the reference desk before checking out a library book adds some time to the trip — but if checking out the book itself already takes the bulk of the visit, the reference-desk stop is a small addition to an already-dominant cost, not a comparable expense.

## Definition and notation

```text
RAG latency = embed_query + vector_search + rerank + generate   (same generate cost as a plain call)
RAG overhead = RAG latency − plain_LLM_latency
```

## A worked example

A plain LLM call compared against the same call wrapped in a RAG pipeline:

```text
plain LLM call:    2,500ms
RAG pipeline:      2,620ms  (embed 15ms + search 20ms + re-rank 80ms + assemble 5ms + generate 2,500ms)

RAG overhead: 120ms (4.8% more than the plain call)
```

With re-ranking included, RAG adds about 5% to the total latency of an otherwise-identical request. Toggling re-ranking off entirely removes 80 of those 120 added milliseconds — re-ranking is, by a wide margin, the biggest single contributor to RAG's own added latency, even though the whole addition stays modest next to generation's dominant cost.

## Bench

```bench
id: rag-vs-plain-llm-latency
title: Retrieval's overhead, next to the generation it feeds
fallback: Compare a plain LLM call's latency against the full RAG pipeline's, and see where the overhead actually sits.
```

**Try this**

1. Compare the plain call and the RAG pipeline's total latency.
2. Toggle re-ranking off and watch the overhead shrink.
3. Imagine a system where generation itself only took 200ms instead of 2,500ms — would RAG's overhead still look small by comparison?

**What you should notice:** RAG's overhead is a fixed, roughly-constant cost regardless of how expensive generation itself is — a system with faster generation would find RAG's overhead a much larger *relative* share of the total, even though the absolute added milliseconds don't change.

## Where it appears in AI

* **This reuses [[Cost and Latency of LLM APIs]]'s generation cost and latency model directly**, adding only the retrieval-specific stages on top of it.
* **[[Production RAG Pipeline Architecture]]'s own stage-by-stage breakdown is exactly where this overhead comes from** — this topic isolates it specifically as "what RAG adds" relative to a plain call.
* **A cheaper, faster model with lower generation latency ([[Choosing a Model for a Task]]) would make RAG's overhead proportionally more significant**, even though the added milliseconds themselves stay the same.

## Common pitfalls

* **Assuming RAG always adds dramatic latency.** The worked example shows a modest 4.8% overhead on top of a slow generation call — the overhead becomes proportionally more noticeable only when the generation call itself gets much faster.
* **Ignoring re-ranking's outsized share of RAG's own added latency.** The worked example shows re-ranking accounts for two-thirds of RAG's total overhead — it's the first place to look when retrieval-side latency needs trimming.
* **Comparing RAG's total latency only to a plain call, without asking whether the plain call could even answer the question correctly.** RAG's overhead is only meaningful relative to what it buys — an answer a plain call couldn't have given correctly at all.

## Quick check

<details><summary>1. In the worked example, why does RAG add only about 5% to the total latency despite running four extra stages?</summary>
Each of those extra stages (embedding, searching, re-ranking, assembling) is individually fast compared to the generation call, which dominates the total — their combined cost (120ms) is small next to generation's 2,500ms.
</details>

<details><summary>2. Which stage contributes the most to RAG's added latency in the worked example?</summary>
Re-ranking, at 80ms out of the total 120ms of added overhead — removing it cuts RAG's overhead by two-thirds.
</details>

<details><summary>3. Would RAG's absolute overhead change if the generating model were replaced with a much faster one?</summary>
Not necessarily — the retrieval-side stages' costs (embedding, searching, re-ranking) are largely independent of which generating model is used, so the absolute overhead could stay similar even as generation's own latency drops, making RAG's overhead a larger relative share of the total.
</details>

## Key terms

* **RAG overhead:** the added latency a RAG pipeline introduces on top of a plain generation call.
* **Retrieval-side latency:** the time spent on embedding, searching, and re-ranking, as opposed to generation itself.
* **Relative overhead:** added latency expressed as a percentage of the baseline (plain call) latency, which shifts as the baseline itself changes.

## Related

[[Cost and Latency of LLM APIs]] · [[Production RAG Pipeline Architecture]] · [[Choosing a Model for a Task]]
