[[KV-Caching for Autoregressive Inference|KV-caching]] fixes redundant recomputation, but the underlying attention computation itself still scales with the square of sequence length. Windowed attention attacks that directly, by simply refusing to compute most of those pairs in the first place — each position only attends to a fixed-size neighbourhood around itself.

**You need:** [[Attention Masks: Padding and Causal Masking]], [[Why Attention Replaced Recurrence]].

## The question it answers

"Does every position really need to attend to every other position, or would a fixed-size local neighbourhood capture most of what matters?" Windowed (local) attention restricts each position to attending only within a fixed radius — not the whole sequence — using exactly the same masking mechanism from [[Attention Masks: Padding and Causal Masking]], just with a banded pattern instead of a triangular or all-ones one. The attention computation's cost drops from scaling with the square of sequence length to scaling only linearly with it.

## Intuition

Most of what a word's meaning depends on tends to come from nearby words — the sentence it's in, maybe the one before or after. Full attention computes every pair regardless, including distant ones that, for many tokens, contribute little. Windowed attention makes that assumption explicit: give every position a fixed-size window of neighbours it's allowed to attend to, and simply never compute anything outside it. The window slides along with the position — position 50's window is centred on position 50, position 51's window shifts along with it.

## Definition and notation

```text
windowed mask: allowed(i, j) = |i − j| ≤ radius

full attention cost:      ≈ n²
windowed attention cost:  ≈ n × (2·radius + 1)       (a fixed band width per position)
```

As `radius` shrinks relative to the sequence length `n`, the windowed cost grows linearly in `n` instead of quadratically — a structural change in how the cost scales, not just a smaller constant factor.

## A worked example

An 8-position sequence with a window radius of 2 (each position sees up to 2 neighbours on either side):

```text
position 0: [1,1,1,0,0,0,0,0]
position 1: [1,1,1,1,0,0,0,0]
position 2: [1,1,1,1,1,0,0,0]
position 3: [0,1,1,1,1,1,0,0]
position 4: [0,0,1,1,1,1,1,0]
position 5: [0,0,0,1,1,1,1,1]
position 6: [0,0,0,0,1,1,1,1]
position 7: [0,0,0,0,0,1,1,1]

allowed pairs: 34 of 64 possible — 53.1%
```

At this small scale the saving is modest. At a realistic scale — `n = 1000`, `radius = 4` — the picture changes completely: full attention computes `1,000,000` pairs; windowed attention computes only `8,980` — a **111× reduction**, purely from refusing to compute pairs the window excludes.

## Bench

```bench
id: windowed-attention
title: A sliding neighbourhood instead of the whole sequence
fallback: Set a sequence length and window radius, and compare the number of attention pairs computed against full attention at the same length.
```

**Try this**

1. Shrink the window radius and watch the allowed-pairs percentage drop.
2. Increase the sequence length at a fixed radius and watch the savings grow dramatically.
3. Set the radius equal to half the sequence length and see the windowed and full costs converge.

**What you should notice:** the savings grow with sequence length even at a fixed radius — windowed attention's advantage over full attention gets *more* dramatic the longer the sequence, exactly because full attention's cost grows quadratically while windowed attention's stays linear.

## Where it appears in AI

* **It is one of several practical answers to attention's quadratic cost**, alongside the different approach taken next in [[Linear Attention Approximations]].
* **It trades some global context for efficiency** — a real cost, since information more than `radius` positions away can only reach a given position indirectly, through multiple layers, rather than in a single attention computation.
* **Stacking several windowed-attention layers lets information still travel further than one window's radius**, the same way stacking convolutions on [[Deep Learning]] expands an effective receptive field beyond a single layer's kernel size.

## Common pitfalls

* **Assuming windowed attention can see nothing beyond its radius, ever.** A single layer can't, but information can still propagate further across multiple stacked layers, each extending the effective reach a little more.
* **Picking a radius without considering the task.** A radius too small can genuinely lose information a task depends on; the right radius is task- and data-dependent, not a universal default.
* **Confusing this with causal masking.** Windowed masking restricts by distance in both directions (unless explicitly combined with a causal mask); causal masking restricts only by direction.

## Quick check

<details><summary>1. What determines whether a position can attend to another position under windowed attention?</summary>
Whether the distance between them is within the fixed window radius — nothing else about the two positions matters to the mask itself.
</details>

<details><summary>2. In the worked example, why did the savings become so much larger at n = 1000 than at n = 8?</summary>
Full attention's cost grows with the square of sequence length while windowed attention's cost grows only linearly (for a fixed radius), so the gap between the two widens dramatically as the sequence gets longer.
</details>

<details><summary>3. How can information travel further than one layer's window radius?</summary>
Across multiple stacked layers — each layer can pass information one window's width further, so depth extends the effective range beyond any single layer's radius.
</details>

## Key terms

* **Window radius:** the fixed distance within which a position may attend to its neighbours under windowed attention.
* **Local attention:** attention restricted to a neighbourhood around each position, instead of the full sequence.
* **Effective receptive field:** how far information can travel across multiple stacked layers, even when each individual layer's range is limited.

## Related

[[Attention Masks: Padding and Causal Masking]] · [[Why Attention Replaced Recurrence]] · [[Linear Attention Approximations]]
