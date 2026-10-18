An agent with 40 tools available for one task has exactly one that's actually correct. Shown all 40 at once with no other signal to go on, picking it by chance alone succeeds 2.5% of the time. Pre-filter to the 3 tools most similar to the task by embedding search — and if the correct one survives that cut — the same blind guess now succeeds a third of the time, simply because there are fewer wrong options left to confuse it with.

**You need:** [[Retrieval Metrics: Precision, Recall, MRR and NDCG]].

## The question it answers

"Does showing an agent more tools make it more capable, or does it make tool selection harder?" Every tool description added to a prompt is one more plausible-looking option the model has to rule out before picking the right one. **Tool retrieval** addresses this the same way retrieval addresses it for documents on the RAG planet: rank the available tools by relevance to the task, keep only the top K, and let the model choose among that smaller set — trading the risk of filtering the right tool out entirely (if K is too small) against the cost of drowning it in distractors (if K is too large).

## Intuition

Handed one knife out of a block of 40 and asked to pick the one meant for bread, you'd have to inspect all 40 to be sure. Handed just the 3 that are clearly bread-adjacent — a bread knife, a serrated utility knife, a cake knife — picking correctly is far easier, precisely because there are fewer plausible wrong answers left standing between you and the right one.

## Definition and notation

```text
recall@K       = 1 if the correct tool is among the top K candidates shown, else 0   (one relevant item)
worst-case accuracy@K = recall@K × 1/K     (a uniform guess among whatever's actually shown)
```

## A worked example

40 available tools; embedding similarity to the task ranks the genuinely correct one 3rd:

```text
K = 1:  correct tool filtered out (rank 3 > K)  → recall = 0   → worst-case accuracy = 0.0%
K = 3:  correct tool survives (rank 3 ≤ K)      → recall = 1   → worst-case accuracy = 33.3%
K = 10: correct tool survives                   → recall = 1   → worst-case accuracy = 10.0%
K = 40: correct tool survives (nothing filtered) → recall = 1  → worst-case accuracy = 2.5%
```

K = 1 is too aggressive — it filters out the very tool the agent needed, guaranteeing failure regardless of how good the final selection step is. K = 40 (showing everything) never risks that, but dilutes the choice so much that a selection with no other signal succeeds barely more than 1 time in 40. K = 3, the smallest K that still keeps the correct tool in view, gets the best of both worlds here.

## Bench

```bench
id: tool-selection-filtering
title: How many candidates to show the model
fallback: Slide the number of pre-filtered candidates and watch recall and worst-case selection accuracy trade off.
```

**Try this**

1. Start at K = 1 and watch the correct tool get filtered out entirely.
2. Slide up to K = 3, the smallest K that keeps it in view, and note the accuracy jump.
3. Keep sliding to K = 40 and watch accuracy keep falling even though recall stays at 100%.

**What you should notice:** recall and worst-case accuracy pull in opposite directions as K grows — recall only ever improves or stays the same, while accuracy keeps shrinking, because every additional candidate shown is one more thing to rule out.

## Where it appears in AI

* **This is tool retrieval, the direct analogue of [[Retrieval Metrics: Precision, Recall, MRR and NDCG|retrieval metrics]] already covered on the RAG planet** — a tool library behaves exactly like a document collection once there are more candidates than fit comfortably in one prompt.
* **[[Routing Between Specialized Prompts]], from the previous district, routes among a handful of whole prompts**; tool selection is the same problem scaled up to dozens or hundreds of fine-grained candidates, which is exactly why a retrieval step becomes necessary here and wasn't for routing.
* **[[Designing Tools for Agent Reliability]], later in this district, addresses a different cause of selection error**: tools that are genuinely similar in description, which pre-filtering alone can't fix.

## Common pitfalls

* **Shrinking K without checking whether the correct tool actually survives.** The worked example's K = 1 shows the failure mode directly — an overly aggressive filter can guarantee failure before selection even begins.
* **Assuming showing every available tool is the "safest" choice.** It maximizes recall, but the worked example shows it comes at real cost: worst-case accuracy here drops to 2.5%, the lowest of any K tested.
* **Treating recall and accuracy as the same metric.** They measure different things — recall asks whether the right tool made it into view at all; accuracy asks whether, given what's in view, the model actually picks it.

## Quick check

<details><summary>1. In the worked example, why does K = 1 guarantee the agent can't pick the right tool at all?</summary>
The genuinely correct tool ranks 3rd by similarity, so a cutoff at K = 1 only keeps the top-ranked tool — the correct one never makes it into the candidate set the model actually sees.
</details>

<details><summary>2. Why does worst-case accuracy keep dropping from K = 3 to K = 40 even though recall stays at 100% the whole time?</summary>
Recall only tracks whether the correct tool is present among the candidates; it says nothing about how many other candidates are also present to be confused with it. A uniform guess among 40 candidates succeeds far less often than a uniform guess among 3, even when the right answer is in both sets.
</details>

<details><summary>3. What determines the best choice of K in general?</summary>
It depends on how reliably the correct tool ranks near the top for the task at hand — if relevance ranking is accurate, a small K both preserves recall and keeps the candidate set focused; if ranking is unreliable, a small K risks filtering out the correct tool before selection even starts.
</details>

## Key terms

* **Tool retrieval:** ranking available tools by relevance to a task and keeping only the top K as candidates for selection.
* **Recall@K:** whether the correct item survives being limited to the top K candidates.
* **Worst-case accuracy:** the success rate of a selection that has no signal beyond the candidate set itself.

## Related

[[Retrieval Metrics: Precision, Recall, MRR and NDCG]] · [[Routing Between Specialized Prompts]] · [[Designing Tools for Agent Reliability]]
