Retrieval sometimes returns two passages that answer the same question differently — an old policy document and a new one, say, each stating a different number for the same thing. Handing both to the generating model unresolved just moves the conflict downstream, where it's far harder to detect than it was at retrieval time, when the two passages' metadata was right there to check.

**You need:** [[Metadata Extraction and Enrichment]], [[Metadata Filtering and Hybrid Indexes]].

## The question it answers

"What should happen when retrieved passages disagree with each other?" The same metadata that lets a system identify a stale chunk (already covered in [[Metadata Extraction and Enrichment]]) can resolve a conflict between two retrieved passages before generation ever sees both of them: keep the most recent one, as judged by its own metadata, and discard the other — rather than leaving the generating model to somehow notice the contradiction and guess which one to trust.

## Intuition

Handing someone two different printed versions of the same policy, with no publication dates visible, and asking them to figure out which one is current puts them in an impossible position — they have no way to tell without additional information. Checking the dates yourself first and handing over only the current one removes the ambiguity before it ever reaches them.

## Definition and notation

```text
resolve(passages) = passage with the most recent date, among those genuinely answering the same question
```

## A worked example

Two retrieved passages giving different numbers for the same policy:

```text
[2022-01-01] "Shipping takes 3-5 days."
[2025-09-01] "Shipping takes 2-3 days."

unresolved: both passages reach generation — the model has to somehow notice and arbitrate the contradiction
resolved by freshness: only [2025-09-01] "Shipping takes 2-3 days." reaches generation
```

Without resolution, the generating model sees two conflicting numbers with no signal pointing to which one is right — it might blend them, pick one arbitrarily, or even mention both as if the policy itself were ambiguous. Resolving by freshness beforehand removes the conflict entirely: generation only ever sees the one passage judged current.

## Bench

```bench
id: conflicting-context-resolve
title: Two passages, two different answers
fallback: Toggle a freshness-based resolution and watch which of two conflicting passages wins.
```

**Try this**

1. Look at the unresolved view and note both conflicting passages are present.
2. Turn on resolution and see only the more recent one remain.
3. Imagine a case where the *older* passage is actually the correct one (a reverted policy change) — would freshness-based resolution get this wrong?

**What you should notice:** resolving by freshness is a specific, sometimes-wrong heuristic — it works when "more recent" really does mean "more correct," which is common but not universal.

## Where it appears in AI

* **This directly reuses [[Metadata Extraction and Enrichment]]'s freshness-filtering mechanism**, applied here to resolve a conflict between retrieved passages rather than to exclude stale ones from the retrieval set in the first place.
* **[[Corrective RAG]] covers a broader version of "something's wrong with what was retrieved"** — conflicting context is one specific, detectable case among the general retrieval-quality problems it addresses.
* **An unresolved conflict that reaches generation is exactly the kind of input that undermines [[Grounded Generation and Faithfulness]]** — a model can't be faithful to context that contradicts itself.

## Common pitfalls

* **Assuming "more recent" always means "more correct."** A policy that was briefly changed and then reverted could leave an older passage as the actually-correct one — freshness-based resolution would get this backwards.
* **Detecting conflicts only by checking dates, missing conflicts that aren't about recency at all.** Two passages from the same date can still disagree for other reasons (one covering a different region, a different product tier) that freshness-based resolution does nothing to address.
* **Resolving a conflict silently, with no trace that one was ever detected.** Losing the fact that a conflict existed at all makes it harder to audit or debug later why one passage was chosen over another.

## Quick check

<details><summary>1. In the worked example, why does resolving by freshness keep the 2025 passage over the 2022 one?</summary>
The resolution rule specifically selects the most recent passage by its date metadata, on the assumption that a more recently published statement is more likely to reflect the current, correct policy.
</details>

<details><summary>2. When would resolving by freshness give the wrong answer?</summary>
When an older passage happens to be the actually-correct one — for instance, if a policy was changed and then reverted, the most recent document about the change might not reflect the policy that's actually back in effect.
</details>

<details><summary>3. What's the cost of leaving a conflict unresolved and passing both passages to generation?</summary>
The generating model has to somehow notice and arbitrate the contradiction on its own, with no guarantee it will — it might blend the two conflicting numbers, pick one arbitrarily, or present the conflict as if the underlying fact were genuinely ambiguous.
</details>

## Key terms

* **Conflicting context:** two or more retrieved passages that answer the same question with different, incompatible information.
* **Freshness-based resolution:** resolving a conflict by keeping the most recently dated passage and discarding the others.
* **Context noise:** retrieved content that is irrelevant, contradictory, or otherwise unhelpful once it reaches generation.

## Related

[[Metadata Extraction and Enrichment]] · [[Corrective RAG]] · [[Grounded Generation and Faithfulness]]
