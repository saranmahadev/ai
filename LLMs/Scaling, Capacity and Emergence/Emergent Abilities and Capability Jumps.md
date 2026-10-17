Most of what scaling laws describe — loss decreasing smoothly with more compute — is a gradual story. Some capabilities don't follow that story at all: they're absent at smaller scale, and then, within a surprisingly narrow range of scale, they're just there.

**You need:** [[Compute-Optimal Scaling (Chinchilla)]].

## The question it answers

"Does every capability improve smoothly with scale, the way loss does?" Not necessarily. An **emergent ability** is a capability that stays near chance performance across a wide range of smaller scales, and then rises sharply — far faster than the smooth loss curve underneath it — within a relatively narrow band of scale. The underlying loss might be improving steadily the whole time; it's the *task accuracy* built on top of it that can look like a flat line followed by a cliff.

## Intuition

A plant that's been growing underground, invisibly, for weeks can appear to "suddenly" break through the soil in a single day — the growth wasn't actually instantaneous, it was continuous the whole time, but it only became *visible above the surface* once it crossed a threshold. Emergent abilities can look similar: a smoothly improving underlying capability can cross a threshold where it finally becomes reliable enough to show up as correct answers on a task that's all-or-nothing in how it's scored, making the capability look like it switched on abruptly.

## Definition and notation

```text
accuracy(scale) stays near a "chance" floor for scale ≪ threshold
accuracy(scale) rises sharply through a narrow band near the threshold
accuracy(scale) approaches a ceiling for scale ≫ threshold

→ the rise looks like a step function on a linear accuracy axis, even
  though the underlying model's loss may be improving smoothly and
  continuously across the entire range
```

## A worked example

A toy capability curve across a range of model scales (log₁₀ parameters):

```text
10⁸:    20.0% accuracy   (at the chance floor)
10⁹:    20.0% accuracy
10^9.5: 21.3% accuracy
10^9.8: 32.6% accuracy   ← the climb begins
10^10:  57.5% accuracy
10^10.2: 82.4% accuracy  ← most of the jump happened here
10^10.5: 93.7% accuracy
10^11:  95.0% accuracy   (near the ceiling)
10^12:  95.0% accuracy
```

Between `10^9.8` and `10^10.5` — less than one order of magnitude of scale — accuracy went from barely above chance (32.6%) to near its ceiling (93.7%). Below that band, the model looks like it simply can't do the task at all; above it, the model looks like it has mastered it — and the entire transition happened within a narrow window.

## Bench

```bench
id: emergent-ability-curve
title: Flat, then a sudden jump
fallback: Slide through model scale and watch a toy capability stay near chance, then jump sharply across a narrow threshold.
```

**Try this**

1. Move through scales well below the threshold and note accuracy staying flat.
2. Move through the threshold band itself and watch the sharp rise.
3. Move past it and note accuracy flattening again near its ceiling.

**What you should notice:** the curve's *shape* — flat, then a steep climb, then flat again — is what makes a capability "emergent"; a capability that rose gradually across the whole scale range wouldn't be described the same way, even if it reached the same final accuracy.

## Where it appears in AI

* **Published emergent-ability findings (Wei et al. and related work) documented specific tasks** — certain arithmetic, multi-step reasoning tasks — where accuracy was near-random for smaller models and sharply higher for larger ones at the same family's scale steps.
* **A live debate exists over how much of "emergence" is a real discontinuity in the underlying capability versus an artifact of using an all-or-nothing accuracy metric** on top of a smoothly improving underlying probability — a metric that only rewards getting every step exactly right can look like a step function even when the underlying skill is continuous.
* **It directly complicates [[Benchmark Suites (MMLU, HELM, BIG-bench)|benchmark-based model comparison]]**: a benchmark heavy on emergent-style tasks can make two models of similar-but-different scale look far more different in capability than their general competence actually is.

## Common pitfalls

* **Assuming emergence means something mysterious or unpredictable is happening.** The worked example's underlying curve is a perfectly ordinary, smooth sigmoid — what looks sudden is the *accuracy metric's* sensitivity to that curve's steep middle section, not evidence of a qualitatively different mechanism.
* **Expecting every capability to emerge at the same scale.** Different tasks have been observed to show their own thresholds, if they show emergent behavior at all — some capabilities improve gradually the whole way.
* **Treating a flat region below threshold as proof a capability is permanently out of reach.** By definition, an emergent capability is one that's absent below some scale and present above it — the flat region is temporary, not permanent.

## Quick check

<details><summary>1. What makes a capability "emergent," as opposed to just gradually improving with scale?</summary>
Its accuracy stays near a chance-level floor across a wide range of smaller scales, then rises sharply within a comparatively narrow band of scale, rather than improving smoothly and proportionally across the whole range.
</details>

<details><summary>2. In the worked example, over roughly how much scale did most of the capability jump happen?</summary>
Less than one order of magnitude — from about 10^9.8 to 10^10.5 — accuracy went from near-chance (32.6%) to near-ceiling (93.7%).
</details>

<details><summary>3. Why might an all-or-nothing accuracy metric make a smoothly improving underlying skill look like a sudden jump?</summary>
If a task requires getting every step exactly right to count as correct, even a smoothly rising per-step probability can translate into an accuracy curve that looks flat and then jumps sharply, once the per-step probability crosses the point where getting the whole sequence right becomes likely.
</details>

## Key terms

* **Emergent ability:** a capability near chance performance below a scale threshold and markedly higher above it.
* **Capability jump:** the sharp rise in accuracy across a comparatively narrow band of scale.
* **All-or-nothing metric:** a scoring method that only counts a fully correct result, which can sharpen a smooth underlying improvement into an apparently sudden one.

## Related

[[Compute-Optimal Scaling (Chinchilla)]] · [[Grokking and Delayed Generalization]] · [[Benchmark Suites (MMLU, HELM, BIG-bench)]]
