Running three independent pieces of a task one after another wastes time that didn't need to be spent sequentially at all — none of the three pieces needed the others to finish first. Running the same question several times and taking the most common answer is a different use of the same basic idea: parallel calls, combined afterward.

**You need:** [[Prompt Chaining]].

## The question it answers

"What are the two different reasons to run several LLM calls at once instead of one?" **Sectioning** splits one task into genuinely independent subtasks and runs them in parallel, finishing in however long the *slowest* piece takes rather than the *sum* of all of them. **Voting** runs the identical prompt several times on the same question and takes the most common answer — a form of the self-consistency sampling already covered in LLMs — trading extra compute for a meaningfully more reliable answer.

## Intuition

Three friends cooking three unrelated dishes for the same dinner finish whenever the slowest dish is done, not by adding up all three cooking times — that's sectioning. Asking the same trivia question to five different people and going with whatever most of them say, rather than trusting the first answer alone, is voting — useful specifically because any one person's mistake is unlikely to be the exact same mistake five people happen to share.

## Definition and notation

```text
sectioning:  total time = max(subtask times), not the sum
voting:      majority_vote_accuracy(N, p) = P(more than N/2 of N independent samples, each correct with probability p, agree)
```

## A worked example

Three independent report sections, timed, and a toy voting scenario at 60% per-sample accuracy:

```text
sectioning:
  sequential (one after another): 1200 + 1500 + 900 = 3600ms
  sectioned (run in parallel):    max(1200, 1500, 900) = 1500ms
  speedup: 2.4×

voting (per-sample accuracy 60%):
  N=1: 60.0%     N=3: 64.8%     N=5: 68.3%     N=9: 73.3%
```

Sectioning cuts the total time to whichever single piece takes longest — a 2.4× speedup here, simply by not waiting on pieces that never depended on each other. Voting's accuracy climbs steadily with more samples, though with real diminishing returns: tripling the samples from 3 to 9 buys less than 9 percentage points of accuracy.

## Bench

```bench
id: sectioning-and-voting
title: Splitting work up, or asking several times
fallback: Compare sequential vs. sectioned (parallel) latency, and watch majority-vote accuracy climb with more samples.
```

**Try this**

1. Compare sequential and sectioned latency for the three report sections.
2. Switch to voting and slide N up, watching accuracy climb with diminishing returns.
3. Imagine a per-sample accuracy of 90% instead of 60% — would voting still be worth the extra compute?

**What you should notice:** sectioning's benefit depends on genuine independence between subtasks (nothing to wait on), while voting's benefit depends on wrong answers being inconsistent with each other — if the same mistake keeps recurring, more votes wouldn't out-vote it.

## Where it appears in AI

* **Voting is exactly [[Self-Consistency and Best-of-N Sampling|self-consistency sampling]], already covered in Generative AI** — this topic is about using it as a parallelization pattern alongside sectioning, not re-deriving the sampling mechanism.
* **[[Orchestrator-Workers]] is the natural extension of sectioning** when the subtasks themselves need to be identified dynamically rather than being fixed in advance.
* **Sectioning's speedup assumes genuinely independent subtasks** — a task whose pieces depend on each other's results can't be sectioned this way at all, which is exactly why [[Plan-and-Execute Agents]] exists for tasks that need ordered steps instead.

## Common pitfalls

* **Sectioning a task whose pieces aren't actually independent.** If one section's result is needed by another, running them in parallel either produces a wrong result or requires one to wait on the other anyway, erasing the speedup.
* **Assuming more voting samples always help proportionally.** The worked example shows accuracy gains shrinking as N grows — tripling samples from 3 to 9 buys a much smaller gain than the first jump from 1 to 3.
* **Using voting when wrong answers consistently agree with each other.** Voting's benefit specifically relies on errors being spread across different wrong answers — if every wrong sample converges on the same mistake, the majority vote would confidently pick that mistake too.

## Quick check

<details><summary>1. Why does sectioning finish in 1500ms rather than 3600ms in the worked example?</summary>
The three report sections don't depend on each other, so they can run at the same time; the total wait is only as long as the slowest individual section, not the sum of all three.
</details>

<details><summary>2. In the worked example, why does voting's accuracy gain from N=5 to N=9 look smaller than the gain from N=1 to N=3?</summary>
Majority-vote accuracy has diminishing returns as sample count grows — each additional sample contributes less to shifting the majority once the vote is already reasonably likely to be correct.
</details>

<details><summary>3. What assumption does voting's accuracy improvement depend on?</summary>
That wrong answers are inconsistent with each other rather than all converging on the same mistake — if every incorrect sample happened to agree, the majority vote would confidently select that shared wrong answer instead of being corrected by it.
</details>

## Key terms

* **Sectioning:** splitting a task into independent subtasks run in parallel, finishing in the time of the slowest piece.
* **Voting:** running the same prompt multiple times and taking the most common answer.
* **Diminishing returns (in voting):** each additional sample improving accuracy by a progressively smaller amount.

## Related

[[Self-Consistency and Best-of-N Sampling]] · [[Orchestrator-Workers]] · [[Plan-and-Execute Agents]]
