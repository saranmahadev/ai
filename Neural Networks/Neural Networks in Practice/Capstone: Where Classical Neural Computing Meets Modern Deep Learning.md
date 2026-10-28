This capstone builds one small memory-recall pipeline and runs it two ways — the classical, discrete way from early in this subject, and the continuous, attention-equivalent way from [[Modern Hopfield Networks and Attention]] — to see, in one concrete example, how directly they agree.

**You need:** [[Hopfield Networks]], [[Modern Hopfield Networks and Attention]], [[Neuromorphic Hardware]].

## The question it answers

"Do the classical and modern versions of associative memory actually agree on a concrete example, or is their mathematical equivalence only a large-scale, asymptotic fact?" They agree closely even on a tiny, hand-checkable example — and the classical network's discrete, one-bit-at-a-time answer turns out to be exactly what the continuous version converges to as its temperature parameter sharpens.

## Intuition

Store a handful of patterns once. Ask the memory to recall one from a partial, corrupted cue two different ways: the classical way, flipping one binary unit at a time until nothing changes; and the continuous way, taking one softmax-weighted average over all the stored patterns at once. If this subject's central claim holds — that these are, underneath, the same computation — the two answers should land in the same place, with the continuous version's answer sharpening toward the classical one as its temperature parameter is turned down.

## Worked walkthrough

Three stored patterns of length 6, including the dimension used throughout [[Hopfield Networks]] and [[Content-Addressable Memory and Capacity]]:

```text
p₁ = [ 1,  1,  1, −1, −1, −1]
p₂ = [ 1, −1,  1, −1,  1, −1]
p₃ = [−1, −1,  1,  1,  1, −1]
```

A cue with one bit corrupted from `p₁` (position 3 flipped): `cue = [1, 1, −1, −1, −1, −1]`.

**Classical, discrete recall** (asynchronous updates, as in [[Hopfield Networks]]):

```text
settles to: [1, 1, 1, −1, −1, −1]  — exactly p₁, recovered in one update
hamming distance to p₁, p₂, p₃ after settling: 0, 2, 4
```

**Continuous, modern recall** (the softmax-weighted update from [[Modern Hopfield Networks and Attention]]) on the exact same cue:

```text
β = 1:  weights on (p₁, p₂, p₃) = (0.982, 0.018, 0.0003)
β = 6:  weights on (p₁, p₂, p₃) = (1.000, 0.000, 0.000)
```

Even at a modest temperature (`β = 1`), the continuous version already puts 98% of its weight on `p₁` — the same answer the classical network committed to exactly. Sharpen the temperature to `β = 6` and the continuous weighting converges to the same one-hot answer the classical network gave, bit for bit.

## Where this would go next

If this memory lookup needed to run continuously on a battery-powered device, [[Neuromorphic Hardware|the sparsity-advantage formula]] from earlier in this subject gives a concrete way to estimate the saving: a lookup queried only occasionally — say a duty cycle of `r = 0.1` — would cost roughly `1 / 0.1 = 10×` less on event-driven hardware than on hardware that re-evaluates the whole memory every clock cycle, for exactly the same reason a sparsely-firing spiking network does.

## Bench

```bench
id: nn-capstone
title: Classical and modern recall, side by side
fallback: Store a few patterns, corrupt a cue, and compare the classical network's exact, discrete recall against the continuous version's softmax weighting at a chosen temperature.
```

**Try this**

1. Run the classical settle and the continuous update on the same cue and compare their answers.
2. Lower the continuous version's temperature and watch its weighting spread out away from the one-hot answer.
3. Try a cue roughly equidistant between two stored patterns and see both versions become less certain in the same way.

**What you should notice:** the two versions are not just "similar in spirit" — on the same input, the continuous version's answer visibly converges to the classical version's answer as temperature increases, which is exactly what the equivalence in [[Modern Hopfield Networks and Attention]] predicts.

## Where it appears in AI

* **It closes the loop this subject opened** in [[Why This Planet Looks Different from Deep Learning]]: a training signal with no target at all (energy-driven settling) turns out, decades later, to be mathematically inside one of the most important mechanisms in modern deep learning.
* **It is a template for reading research claims critically**: rather than taking "these are equivalent" on faith, this capstone checked it directly on numbers small enough to verify by hand.
* **The deployment framing connects back to [[Efficiency and Deployment]] in [[Deep Learning]]**: the same instinct — measure the actual cost of a specific deployment constraint — applies whether the constraint is memory, latency, or (as here) power.

## Common pitfalls

* **Treating a small worked example as a full proof.** This walkthrough checks the equivalence on one tiny, hand-verifiable case; [[Modern Hopfield Networks and Attention]]'s general result is what actually establishes it for all patterns and temperatures.
* **Assuming the continuous version always needs a high temperature to be useful.** Even the modest `β = 1` setting here already gave a confident, nearly one-hot answer — the right temperature depends on how separated the stored patterns are.
* **Forgetting the energy estimate is conditional.** The `10×` saving assumes an event-driven hardware target and a specific duty cycle; it is not a universal number for every deployment of this memory.

## Quick check

<details><summary>1. What did the worked walkthrough directly check, rather than taking on faith?</summary>
Whether the classical, discrete Hopfield recall and the continuous, softmax-weighted recall actually agree on the same concrete cue — not just that they are claimed to be mathematically equivalent.
</details>

<details><summary>2. What happened to the continuous version's weighting as its temperature parameter increased?</summary>
It sharpened from already favouring the correct pattern at β = 1 (98% weight) to an essentially exact one-hot match with the classical answer at β = 6.
</details>

<details><summary>3. What would determine the actual energy saving of deploying this memory lookup on neuromorphic hardware?</summary>
How often the lookup is actually queried (its duty cycle or firing rate) — the saving is the reciprocal of that rate, not a fixed number independent of how the system is used.
</details>

## Key terms

* **Worked walkthrough:** checking a general claim on one small, fully-verifiable example, rather than relying on the general argument alone.
* **Duty cycle:** how often a system is actually active, used here as a stand-in for a spiking network's firing rate.
* **Temperature convergence:** the continuous Hopfield update's weighting approaching the classical network's discrete answer as its inverse-temperature parameter β grows.

## Related

[[Hopfield Networks]] · [[Modern Hopfield Networks and Attention]] · [[Neuromorphic Hardware]] · [[Why This Planet Looks Different from Deep Learning]]
