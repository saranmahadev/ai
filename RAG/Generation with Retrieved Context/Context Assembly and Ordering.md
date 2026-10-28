Retrieval can rank the single most relevant passage first — and assembly can still bury it in the middle of the prompt, right where a model is statistically least likely to actually use it. Where a passage sits in the assembled context matters every bit as much as whether it was retrieved at all.

**You need:** [[Anatomy of a RAG Pipeline]], [[Context Rot and Lost-in-the-Middle Effects]].

## The question it answers

"Does it matter what order retrieved passages are assembled in?" Yes — this reuses the exact [[Context Rot and Lost-in-the-Middle Effects|lost-in-the-middle]] finding already established in LLMs: a model is most likely to actually use information placed near the start or end of its context, and least likely to use information buried in the middle, regardless of how relevant that information actually is. Assembly is the stage that decides this placement, so it directly controls how much of retrieval's hard-won ranking actually survives into the generated answer.

## Intuition

Handing someone a stack of five documents and asking them to answer a question using the third one from the top, specifically, works less reliably than handing them the same document as either the very first or very last thing they read — not because the document changed, but because where it sits in the stack changes how much attention it tends to get.

## Definition and notation

```text
accuracy(position) = lost-in-the-middle curve: high near the edges, low in the middle
```

(exact formula already derived in [[Context Rot and Lost-in-the-Middle Effects]])

## A worked example

The single most relevant retrieved passage, placed at different positions among 5 assembled passages:

```text
position 1 of 5 (at the start):  95.0% chance it's actually used
position 3 of 5 (in the middle): 55.0% chance it's actually used
position 5 of 5 (at the end):    95.0% chance it's actually used
```

Moving the exact same, most-relevant passage from the start of the assembled context to the middle cuts the odds it actually gets used almost in half — from 95% down to 55% — with nothing about the passage itself changing at all.

## Bench

```bench
id: context-position-accuracy
title: First, last, or buried in the middle
fallback: Slide where the most relevant passage sits in the assembled context and watch the odds it actually gets used.
```

**Try this**

1. Start with the most relevant passage at position 1 and note the high accuracy.
2. Slide it toward the middle and watch accuracy drop.
3. Slide it to the last position and watch accuracy recover.

**What you should notice:** the curve is symmetric — the start and the end are equally good positions, and the dip is centered exactly in the middle of the assembled passages, not biased toward either side.

## Where it appears in AI

* **This is a direct, practical application of [[Context Rot and Lost-in-the-Middle Effects]]'s own worked example**, applied specifically to deciding assembly order rather than measuring the general phenomenon.
* **A re-ranker's job ([[Re-Ranking Retrieved Results]]) isn't finished once it scores passages** — the resulting order still needs to be placed into the context in a way that actually benefits from that ranking.
* **[[Context-Window Budgeting for RAG]] decides how many passages fit at all**; this topic decides where, among the ones that do fit, each one should go.

## Common pitfalls

* **Assembling retrieved passages in an arbitrary order (alphabetical, by document ID) instead of by relevance-aware placement.** The worked example shows a 40-percentage-point accuracy swing purely from positioning — an arbitrary order wastes exactly the ranking signal retrieval worked to produce.
* **Assuming the most relevant passage should always go first.** Depending on the specific lost-in-the-middle curve, the last position can be just as strong — some systems deliberately place the top result last, closest to the question itself.
* **Treating assembly order as a one-time decision that doesn't need revisiting.** The right ordering can depend on the specific model being used, since different models can have somewhat different lost-in-the-middle profiles.

## Quick check

<details><summary>1. In the worked example, why does moving the most relevant passage to the middle hurt its odds of being used, when nothing about the passage's content changed?</summary>
The lost-in-the-middle effect is about *position* within the context, not content — a model is statistically less likely to attend to and use information placed in the middle of a long context, regardless of how relevant that information actually is.
</details>

<details><summary>2. Is the start of the context always a better position than the end?</summary>
No — the worked example's curve is symmetric, with both the start and the end scoring equally well (95%); the problem is specifically the middle, not either edge in particular.
</details>

<details><summary>3. What does assembly order control that retrieval ranking alone doesn't?</summary>
Retrieval ranking determines which passages are the most relevant; assembly order determines where those passages physically sit in the prompt, which independently affects how likely the model is to actually use each one.
</details>

## Key terms

* **Context assembly:** arranging retrieved passages into the final prompt sent to the generating model.
* **Lost-in-the-middle effect:** the tendency for information in the middle of a long context to be used less reliably than information at the start or end.
* **Assembly order:** the specific sequence in which retrieved passages are placed within the assembled context.

## Related

[[Context Rot and Lost-in-the-Middle Effects]] · [[Re-Ranking Retrieved Results]] · [[Context-Window Budgeting for RAG]]
