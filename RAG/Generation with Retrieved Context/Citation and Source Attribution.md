An answer that cites its sources lets a reader check it; an answer that doesn't asks for blind trust. Attribution means tracing each specific claim in a generated answer back to the retrieved passage that actually supports it — and noticing when a claim has no such passage at all.

**You need:** [[Dense Retrieval]].

## The question it answers

"How do you know which retrieved passage actually backs up a specific sentence in the generated answer?" For each claim in an answer, attribution finds the retrieved passage whose embedding is most similar to that claim — the passage it's most likely paraphrasing or drawing from — and cites that passage, as long as the similarity clears a minimum threshold. A claim whose best match falls below that threshold isn't cited at all, because nothing retrieved actually supports it closely enough.

## Intuition

Checking a student's essay against the sources they claim to have used means matching each specific sentence back to the source passage that actually contains that information — and flagging any sentence that doesn't match any source closely, because it was either invented or drawn from somewhere not actually cited.

## Definition and notation

```text
best_support(claim) = passage with highest cosine similarity to the claim
cite(claim) = best_support(claim)   if similarity ≥ threshold
            = unsupported            otherwise
```

## A worked example

Three claims in a generated answer, checked against two retrieved passages (one about refunds, one about shipping), at a 0.8 similarity threshold:

```text
"Refunds are issued within 5 business days."  → best match p1 (refunds), similarity 1.000 → cited
"Shipping takes 3-5 days."                     → best match p2 (shipping), similarity 1.000 → cited
"The company was founded in 1998."             → best match p1 (refunds), similarity 0.781 → unsupported
```

The first two claims closely match a retrieved passage and get cited to it directly. The third claim — a fact never actually in either retrieved passage — only reaches a 0.781 similarity to its *closest* match, below the 0.8 threshold, so it's correctly flagged as unsupported rather than falsely attributed to an unrelated passage.

## Bench

```bench
id: citation-attribution
title: Can every claim point back to a source?
fallback: Trace each claim in a generated answer back to its best-supporting passage, flagging anything too weakly supported to cite.
```

**Try this**

1. Look at which claims get cited at the default threshold.
2. Lower the threshold and watch the third claim start getting (falsely) cited too.
3. Raise the threshold and see if either of the first two claims eventually loses its citation.

**What you should notice:** the threshold is doing real work — set it too low, and an unsupported claim gets a false citation that looks just as credible as a real one; set it too high, and genuinely supported claims might lose their citations too.

## Where it appears in AI

* **This reuses the same cosine-similarity mechanism as [[Dense Retrieval]]**, applied after generation rather than before it — attribution is retrieval's comparison operation, run one more time.
* **[[Grounded Generation and Faithfulness]] aggregates exactly this per-claim check into a single score for the whole answer** — attribution is the per-claim mechanism; faithfulness is the summary statistic.
* **A claim that fails attribution is a strong, concrete signal of the kind of problem [[Common RAG Failure Modes]] catalogs as hallucinated content slipping past retrieval's own grounding.**

## Common pitfalls

* **Setting the citation threshold too low.** The worked example shows a genuinely unsupported claim scoring 0.781 — a threshold below that would falsely cite it to an unrelated passage, which looks more credible than no citation at all, and is arguably worse.
* **Assuming a passed citation check guarantees the claim is true.** Attribution checks that a claim is *similar* to a retrieved passage, not that the passage (or the claim drawn from it) is actually accurate.
* **Running attribution only after the full answer is generated, with no way to revise.** A claim that fails attribution has already been written and shown — attribution alone doesn't prevent an unsupported claim from reaching the user, only detects it.

## Quick check

<details><summary>1. In the worked example, why does the third claim fail to get cited even though it finds a "best match" among the retrieved passages?</summary>
Every claim has some best match by construction (whichever passage is relatively closest), but that best match's similarity (0.781) falls below the citation threshold (0.8), signaling that even the closest passage isn't actually close enough to count as real support.
</details>

<details><summary>2. What's the risk of setting the citation threshold too low?</summary>
An unsupported or fabricated claim can end up cited to an unrelated passage just because it happens to be the closest match among a weak field — a false citation that looks just as trustworthy as a real one.
</details>

<details><summary>3. Does passing the citation check guarantee a claim is factually correct?</summary>
No — it only confirms the claim is similar to a retrieved passage, which could itself be inaccurate, outdated, or simply misread by the generating model in a way that still happens to resemble its source.
</details>

## Key terms

* **Citation:** linking a specific claim in a generated answer to the retrieved passage that supports it.
* **Source attribution:** the broader practice of tracing generated content back to its retrieved origins.
* **Citation threshold:** the minimum similarity a claim's best-matching passage must reach to be cited rather than flagged unsupported.

## Related

[[Dense Retrieval]] · [[Grounded Generation and Faithfulness]] · [[Common RAG Failure Modes]]
