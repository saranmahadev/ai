Every stage this planet covered separately — retrieving by similarity, re-ranking for accuracy, assembling context sensibly, generating with citations — is usually described one at a time, with its own worked example. This capstone follows one real question through all four stages in order, reusing the exact same functions each earlier topic already verified, so the whole pipeline's numbers connect end to end.

**You need:** [[Dense Retrieval]], [[Re-Ranking Retrieved Results]], [[Context Assembly and Ordering]], [[Grounded Generation and Faithfulness]].

## The question it answers

"What does a question actually go through, in order, from arriving as text to becoming a grounded, cited answer?" Four stages, each one this road already covered in depth: embedding the query and retrieving the closest documents by similarity; re-ranking that shortlist with a more careful, joint relevance score; assembling the kept passages into context, aware of where each one lands; and generating an answer whose claims are checked against — and cited to — what was actually retrieved.

## Intuition

A research assistant handling one question does roughly these same four things in order: skims the shelf for the books that look most relevant, reads the few that seem promising more carefully to judge which is actually best, lays out notes from the best ones in a sensible order, and then writes an answer that cites exactly which note supports each claim — rather than writing from memory and hoping it happens to line up with what was actually read.

## Definition and notation

```text
stage 1: embed + retrieve   — cosine similarity against the whole collection, keep the top few
stage 2: re-rank            — a more careful joint score over just the kept shortlist
stage 3: assemble           — place the kept passages into context, aware of position effects
stage 4: generate + cite    — answer, then check each claim against what was retrieved
```

## A worked example

The question "how long do refunds take," traced through all four stages using the exact numbers already verified earlier on this planet:

```text
stage 1 (embed + retrieve): query vs. 4 documents by cosine similarity
  top 2: "refund timeline" (0.998), "returns policy" (0.998)

stage 2 (re-rank): a joint relevance score re-orders the shortlist
  "refund timeline" (0.97) now clearly ahead of "returns policy" (0.80)

stage 3 (assemble): with only 2 passages to place, both sit at context edges —
  neither falls into a lost-in-the-middle position

stage 4 (generate + cite): "Refunds take 5 business days."
  cited to "refund timeline" (similarity 0.9997) — fully grounded
```

Retrieval alone couldn't have told you "refund timeline" was more reliable than "returns policy" — that's what re-ranking's joint score adds. Assembly mattered less here only because there were just two passages to place; with more, their positions would have mattered the way [[Context Assembly and Ordering]] already showed. The final claim's citation confirms the answer didn't drift from what was actually retrieved.

## Bench

```bench
id: rag-capstone
title: One question, every stage of this road
fallback: Step one question through retrieval, re-ranking, assembly and grounded generation, reusing this planet's own verified functions at each stage.
```

**Try this**

1. Step through all four stages and read each one's own number.
2. Compare the retrieval ranking (stage 1) against the re-ranked order (stage 2) — notice the shortlist's membership didn't change, only its order.
3. Reset and imagine skipping stage 4's citation check — would you be able to tell, just from reading the answer, whether it was actually grounded?

**What you should notice:** each stage's number was independently verified earlier on this planet's own road — this capstone doesn't introduce new mechanics, it chains the same four mechanisms together in the order they actually happen.

## Where it appears in AI

* **Stage 1 reuses [[Dense Retrieval]] exactly**, stage 2 reuses [[Re-Ranking Retrieved Results]]'s own worked example, stage 3 reuses [[Context Assembly and Ordering]]'s reasoning, and stage 4 reuses [[Grounded Generation and Faithfulness]]'s citation mechanism — nothing here is new mechanics, only the ordering.
* **[[Common RAG Failure Modes]] names a specific failure for each of these stages** — this capstone is what the pipeline looks like when every stage works as intended, the reference case those failure modes deviate from.
* **[[Production RAG Pipeline Architecture]] is this same four-stage shape, with the operational concerns (latency, cost, caching) layered on top.**

## Common pitfalls

* **Treating these four stages as interchangeable or reorderable.** Each stage assumes the previous one already happened — re-ranking assumes a shortlist retrieval already produced; generation assumes context assembly already placed the passages it's meant to cite.
* **Expecting retrieval's similarity scores to directly predict re-ranking's verdict.** The worked example's stage 1 and stage 2 scores aren't on the same scale and aren't meant to be compared directly — re-ranking's whole purpose is to look more carefully than retrieval's cheap first pass could.
* **Assuming a fully grounded final answer means the pipeline is working perfectly everywhere.** This worked example traces a case where every stage succeeds — a real system also needs the failure-mode handling ([[Corrective RAG]], permission filtering, conflict resolution) covered elsewhere on this road for when a stage doesn't go this cleanly.

## Quick check

<details><summary>1. Why does stage 2's re-ranking matter here if stage 1 already retrieved the same two documents?</summary>
Retrieval's cosine similarity scores for the two documents are nearly identical (0.998 vs. 0.998), barely distinguishing them; re-ranking's joint score reveals a much clearer gap (0.97 vs. 0.80), correctly identifying which of the two is actually the stronger source.
</details>

<details><summary>2. Why does context assembly (stage 3) matter less in this specific worked example than it generally would?</summary>
With only two passages to place, both necessarily sit at the edges of the context rather than in a lost-in-the-middle position — assembly order would matter more with a longer list of passages, as [[Context Assembly and Ordering]]'s own worked example shows.
</details>

<details><summary>3. What would it mean if stage 4's citation check had found no supporting passage for the generated claim?</summary>
It would mean the generated answer drew on something other than what was actually retrieved — exactly the ungrounded-claim problem [[Grounded Generation and Faithfulness]] measures, and a signal that the answer shouldn't be trusted as retrieval-backed.
</details>

## Key terms

* **End-to-end trace:** following one request through every stage of a pipeline in order, rather than examining each stage in isolation.
* **Shortlist:** the reduced set of candidates retrieval passes on to re-ranking.
* **Grounded answer:** a generated answer whose claims are verifiably supported by retrieved context.

## Related

[[Dense Retrieval]] · [[Re-Ranking Retrieved Results]] · [[Grounded Generation and Faithfulness]]
