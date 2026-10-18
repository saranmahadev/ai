Chain-of-thought commits to one reasoning path and follows it to the end. But just like [[Greedy and Beam Search Decoding|greedy decoding can miss the best token sequence]], committing to one reasoning path greedily can miss the best *reasoning* path — for exactly the same underlying reason.

**You need:** [[Chain-of-Thought Prompting]], [[Greedy and Beam Search Decoding]].

## The question it answers

"Can exploring multiple reasoning paths, rather than committing to one, find correct answers more reliably?" **Tree-of-thought** reasoning treats each step in a chain as a branching point with several candidate continuations, rather than one fixed next step — and keeps several of the most promising branches alive at once, the same beam-search idea from token-level decoding, applied one level up at the level of entire reasoning steps instead of individual tokens.

## Intuition

A single hiker committing to whichever trail looks steepest at every fork can get stuck on a lower peak, exactly as in the greedy-decoding case covered earlier — but sending a few scouts down the best few trails at each fork, and discarding the ones falling behind, recovers the true summit far more reliably. Tree-of-thought reasoning sends scouts down several candidate *next reasoning steps* instead of several candidate *next tokens* — the beam-search idea is identical; only the unit being branched on has changed, from a token to a whole reasoning step.

## Definition and notation

```text
at each reasoning step, there are several candidate continuations,
  each with some probability of being the "correct" branch to follow

beam of width k: keep the k most promising candidate branches alive;
  a reasoning path survives a step only if its branch is among
  the top k most-probable candidates at that step
```

## A worked example

A toy 3-step reasoning problem where each step offers 3 candidate continuations with probabilities `[0.5, 0.3, 0.2]` of being the actually-correct branch, simulated across 5,000 trials at different beam widths:

```text
beam width 1 (greedy, single path):  success rate 11.3%
beam width 2 (keep top 2 candidates): success rate 51.1%
beam width 3 (keep all candidates):   success rate 100.0%
```

A single greedy path succeeds only about 11% of the time — matching roughly `0.5³ ≈ 12.5%`, since it must correctly guess the right branch at every one of 3 steps. Keeping just one more candidate alive at each step more than quadruples the success rate, to 51.1%; keeping all three candidates (equivalent to exhaustive search in this tiny toy problem) guarantees success, since the correct branch can never be excluded.

## Bench

```bench
id: tree-of-thought-search
title: Keeping more than one reasoning branch alive
fallback: Adjust the beam width used to explore a toy multi-step reasoning tree and watch success rate rise sharply.
```

**Try this**

1. Set beam width to 1 and note the low success rate.
2. Raise it to 2 and watch the jump.
3. Push it to 3 (every candidate kept) and confirm success becomes certain in this small example.

**What you should notice:** the improvement from width 1 to width 2 is dramatic here — more than a 4× increase — because the correct branch, when excluded by a width-1 beam, is simply gone for good; a wider beam gives it more chances to survive.

## Where it appears in AI

* **Tree-of-thought reasoning has shown measurable gains on tasks with multiple plausible solution approaches** (certain puzzles, planning problems), where committing early to one approach can dead-end in ways a single additional branch could have avoided.
* **It costs proportionally more inference compute than a single chain**, exactly like beam search costs more than greedy decoding at the token level — exploring k branches costs roughly k times the computation of exploring one.
* **[[Test-Time Compute Scaling|more broadly, spending more inference-time compute on exploring possibilities]] — whether via tree search, more samples, or a longer chain — is one of the main levers behind modern reasoning-focused models.**

## Common pitfalls

* **Confusing this with token-level beam search.** It's the same underlying idea, but applied to whole reasoning steps rather than individual tokens — a "branch" here can represent many tokens' worth of an entire intermediate conclusion.
* **Assuming a wider beam always helps proportionally.** As with token-level beam search, returns can diminish or even reverse past a point, especially if the method used to judge which branches look "most promising" is itself unreliable.
* **Forgetting this is a real cost trade-off, not a free improvement.** Keeping k branches alive costs roughly k times the computation of a single chain — worthwhile when the accuracy gain justifies it, wasteful when it doesn't.

## Quick check

<details><summary>1. What's the key similarity between tree-of-thought reasoning and token-level beam search?</summary>
Both keep several of the most promising candidates alive at each step rather than committing to a single one — tree-of-thought just applies this to whole reasoning steps instead of individual tokens.
</details>

<details><summary>2. In the worked example, why did a beam width of 3 guarantee success?</summary>
With only 3 candidates at each step and a beam wide enough to keep all of them, the correct branch could never be excluded at any step — it was always among the kept candidates by construction.
</details>

<details><summary>3. What's the real cost of exploring more reasoning branches with a wider beam?</summary>
Roughly proportional additional inference compute — keeping k branches alive costs about k times what following a single chain would cost.
</details>

## Key terms

* **Tree-of-thought reasoning:** exploring multiple candidate reasoning paths rather than committing to a single chain.
* **Branch:** one candidate continuation at a given reasoning step.
* **Beam width:** how many candidate branches are kept alive at each step of the search.

## Related

[[Chain-of-Thought Prompting]] · [[Greedy and Beam Search Decoding]] · [[Test-Time Compute Scaling]]
