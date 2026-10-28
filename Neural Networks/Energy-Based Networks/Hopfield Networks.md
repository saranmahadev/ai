A Hopfield network stores a set of patterns not as a lookup table but as the *stable points* of a dynamical system: give it a noisy or partial version of a pattern, let every unit repeatedly update itself from its neighbours, and it settles into the clean pattern it was trained on. This topic is the simplest working model of content-addressable memory in the whole subject.

**You need:** [[The McCulloch-Pitts Neuron]] and [[Matrix Multiplication]].

## The question it answers

"How can a network recall a whole stored pattern from a corrupted or partial piece of it, with no forward pass and no target to train against?" A Hopfield network answers this by wiring every unit to every other unit so that the stored patterns themselves are the network's resting points, then letting simple local updates find the nearest one.

## Intuition

Picture each unit as a tiny ball on a landscape with several dips. Each dip corresponds to one stored pattern. Drop the ball anywhere nearby — a corrupted version of a pattern — and gravity (the network's own update rule) rolls it down into the nearest dip, which is the clean, stored pattern. No teacher ever says "closer" or "further"; each unit just looks at its neighbours and asks "given everyone else right now, which state would *I* rather be in?"

## Definition and notation

Units hold states `s_i ∈ {−1, +1}`. Connections are symmetric weights `W_ij = W_ji`, with `W_ii = 0` (no self-connection). To store a set of patterns `p¹, …, pᴷ`, set weights by the Hebbian outer-product rule:

```text
W_ij = (1/K) · Σ_k p_i^k · p_j^k      (i ≠ j)
```

To recall, update one unit at a time (asynchronous update):

```text
s_i ← sign( Σ_j W_ij · s_j )
```

Repeating this for every unit, in any order, either changes some `s_i` or leaves the whole state unchanged. A state that no update changes is a **stable point** — see [[Energy Functions and Attractor Dynamics]] for why this process is guaranteed to stop.

## A worked example

Store one pattern, `p = [1, 1, −1, −1]`, with `K = 1`:

```text
W = [[ 0,  1, −1, −1],
     [ 1,  0, −1, −1],
     [−1, −1,  0,  1],
     [−1, −1,  1,  0]]
```

Start from a corrupted cue with one bit flipped, `s = [1, −1, −1, −1]` (Hamming distance 1 from `p`). Update unit 1:

```text
Σ_j W_1j s_j = (1)(1) + (0)(−1) + (−1)(−1) + (−1)(−1) = 1 + 0 + 1 + 1 = 3
sign(3) = 1
```

Unit 1 flips from `−1` to `1`, giving `s = [1, 1, −1, −1]` — exactly the stored pattern, recovered in a single update. No other unit needs to change: the network has settled.

## Bench

```bench
id: hopfield-settle
title: Store a pattern, corrupt it, watch it settle
fallback: Store a small pattern in a Hopfield network, corrupt a chosen number of bits, and step through asynchronous updates one unit at a time until the network settles back to the stored pattern (or somewhere else).
```

**Try this**

1. Store the default pattern, corrupt 1 bit, and step through the update until it settles.
2. Corrupt 2 bits instead, and see whether it still recovers the exact original pattern.
3. Store a second, dissimilar pattern and corrupt a cue — notice the network can settle into either stored pattern depending on which one the cue is closer to.

**What you should notice:** recall is not instant — it takes however many single-unit updates are needed to stop changing, and a cue that is roughly equidistant from two stored patterns can settle into either one.

## Where it appears in AI

* **Associative memory and error correction**: recovering a complete, clean pattern from a noisy or partial cue, with no training signal beyond the patterns themselves.
* **The ancestor of modern attention**: [[Modern Hopfield Networks and Attention]] shows that a continuous generalization of this exact update rule is mathematically equivalent to the attention operation used throughout [[Deep Learning]].
* **A concrete illustration of settling dynamics**: the next topic, [[Energy Functions and Attractor Dynamics]], makes precise why this process always stops.

## Common pitfalls

* **Expecting it to generalize.** A Hopfield network only recalls patterns it was explicitly given during storage — it is memory, not a learned function of new inputs.
* **Storing too many patterns.** Past a capacity limit the stored patterns start to interfere with each other; see [[Content-Addressable Memory and Capacity]].
* **Confusing synchronous and asynchronous updates.** Updating every unit at once can cycle forever between two states instead of settling; the classical guarantee of convergence is for asynchronous (one unit at a time) updates.

## Quick check

<details><summary>1. What makes a state "stable" in a Hopfield network?</summary>
No single unit's update rule changes its state — every unit already agrees with what its neighbours say it should be.
</details>

<details><summary>2. In the worked example, why did only unit 1 need to update?</summary>
Only unit 1's state differed from the stored pattern; every other unit already matched it, so updating them would not change anything.
</details>

<details><summary>3. Does a Hopfield network need labelled training data?</summary>
No — it only needs the patterns themselves, stored once by the Hebbian outer-product rule; there is no target or error signal involved.
</details>

## Key terms

* **Asynchronous update:** updating one unit at a time, using the current states of all the others.
* **Stable point (attractor):** a state the update rule leaves unchanged; a stored pattern is designed to be one.
* **Content-addressable memory:** retrieving a stored item by giving part or a noisy version of it, rather than an index.

## Related

[[The McCulloch-Pitts Neuron]] · [[Energy Functions and Attractor Dynamics]] · [[Content-Addressable Memory and Capacity]] · [[Modern Hopfield Networks and Attention]]
