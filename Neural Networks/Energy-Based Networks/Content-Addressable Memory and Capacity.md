A Hopfield network's memory is not free: pack in too many patterns and recall starts failing, often all at once rather than gradually. This topic puts a number on "too many" and shows what recall failure actually looks like.

**You need:** [[Hopfield Networks]], [[Energy Functions and Attractor Dynamics]].

## The question it answers

"How many patterns can one Hopfield network reliably store, and what happens when you exceed that?" Classical analysis gives a rule of thumb — roughly `0.138 N` random patterns for `N` units — and the failure past that point is not a soft decline but a fairly sharp breakdown where even the stored patterns themselves stop being stable.

## Intuition

Every stored pattern carves a dip into the energy landscape from [[Energy Functions and Attractor Dynamics]]. With only a few patterns, the dips are far apart and clean. Pack in more, and the dips start to overlap and distort each other — "spurious" shallow dips appear between real patterns, and eventually some of the intended dips disappear entirely, swallowed by interference from all the others sharing the same weight matrix.

## Definition and notation

For `N` units storing `K` random `±1` patterns via the Hebbian outer-product rule, the classical capacity result (Amit, Gutfreund & Sompolinsky, 1985) is:

```text
K_max ≈ 0.138 · N
```

Below this ratio, nearly every stored pattern is recovered from a moderately corrupted cue. Above it, recall degrades sharply — not gradually — because interference between patterns starts corrupting the very patterns the network is supposed to remember.

## A worked example

Fifty random `±1` patterns of length `N = 50`, each with 10% of its bits flipped before recall, settled with asynchronous updates:

```text
K     K/N     recall success rate
 6    0.12    100%
 7    0.14     86%
 8    0.16     50%
10    0.20     20%
20    0.40      0%
```

`0.138 × 50 ≈ 6.9` — and the measured breakdown sits exactly where the formula predicts: full recall through `K = 6`, a sharp drop starting at `K = 7`–`8`, and almost total failure well past it. Below capacity, corruption is recoverable; above it, the stored patterns themselves are no longer stable attractors.

## Bench

```bench
id: hopfield-capacity
title: How many patterns fit before recall breaks down
fallback: Store a chosen number of random patterns in a Hopfield network of fixed size, corrupt each one by the same amount, and see what fraction settle back to the exact original pattern.
```

**Try this**

1. Start with a small number of stored patterns and confirm recall succeeds every time.
2. Increase the pattern count past the `0.138 N` line and watch the success rate drop.
3. Push well past capacity and notice the drop is not gradual — it happens over a narrow range of pattern counts.

**What you should notice:** the breakdown is a genuine phase transition, not a smooth curve — a network just under capacity recalls almost perfectly, and one not far over it recalls almost nothing.

## Where it appears in AI

* **It is the first hard limit on this planet's memory model**: unlike a hash table, a Hopfield network's capacity is a fixed fraction of its unit count, not something you can trade off against retrieval time.
* **It motivates [[Boltzmann Machines|hidden units]]**: adding units not used to store the pattern directly, trading raw capacity for the ability to represent correlations between visible units.
* **[[Modern Hopfield Networks and Attention]] fixes exactly this limitation**: a continuous generalization of the energy function pushes capacity from linear in `N` to exponential in `N`, which is part of why it resembles the attention mechanism used in [[Deep Learning]].

## Common pitfalls

* **Expecting a gentle decline near capacity.** The transition is sharp; being "a little over" capacity can already mean most patterns fail to recall.
* **Forgetting capacity depends on pattern correlation.** The `0.138 N` figure assumes random, roughly uncorrelated patterns; correlated patterns can interfere more and lower the effective capacity further.
* **Treating capacity as a hard training limit rather than a recall limit.** The weights can still be computed for any number of patterns — what fails above capacity is reliably recalling them, not storing them in the first place.

## Quick check

<details><summary>1. What is the classical rule-of-thumb capacity for a Hopfield network of N units storing random patterns?</summary>
Roughly `0.138 N` patterns.
</details>

<details><summary>2. Does recall degrade gradually or sharply as the pattern count crosses this threshold?</summary>
Sharply — the worked example's success rate falls from 100% to 50% between `K=6` and `K=8` for `N=50`, close to the predicted `K_max ≈ 6.9`.
</details>

<details><summary>3. What eventually fixes this capacity limitation within the Hopfield family?</summary>
The continuous, modern Hopfield network used in [[Modern Hopfield Networks and Attention]], whose capacity scales exponentially rather than linearly in `N`.
</details>

## Key terms

* **Capacity:** the largest number of patterns a memory network can store while still reliably recalling each one.
* **Spurious state:** a stable point of the energy landscape that is not one of the intended stored patterns, often created by interference between several.
* **Phase transition:** a sharp, not gradual, change in behaviour as a parameter (here, patterns per unit) crosses a threshold.

## Related

[[Hopfield Networks]] · [[Energy Functions and Attractor Dynamics]] · [[Boltzmann Machines]] · [[Modern Hopfield Networks and Attention]]
