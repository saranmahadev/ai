As models get more capable, the safety work expected to accompany their release scales up too — a model barely useful for anything dangerous needs far less scrutiny than one capable of meaningfully assisting with serious harm. A responsible scaling policy ties the required safety commitments directly to measured capability, rather than treating every release the same way.

**You need:** [[Model Cards and Responsible Release]], [[Licensing and Model Governance]].

## The question it answers

"How do labs decide how much safety work a given model release needs?" A responsible scaling policy (RSP) sets capability thresholds, each mapping to a safety tier with its own required commitments (more rigorous evaluation, stronger deployment safeguards, tighter access controls); crossing a threshold is what triggers the next tier's requirements, not calendar time or a fixed release schedule.

## Intuition

It's like staged clearance for a new chemical compound: a compound with low toxicity needs minimal paperwork, one with moderate toxicity needs controlled handling procedures, and one that's genuinely hazardous needs restricted access and a dedicated containment plan. Nobody applies the hazardous-compound procedure to every substance, and nobody skips it just because a substance happens to be new — the required tier tracks the measured property, not the calendar.

## Definition and notation

```text
tier 1: capability < 0.30   → baseline safety practices
tier 2: 0.30 ≤ capability < 0.60   → enhanced evaluation
tier 3: 0.60 ≤ capability < 0.85   → strong deployment safeguards
tier 4: capability ≥ 0.85   → the strictest controls (restricted access, dedicated oversight)
```

(The specific thresholds above are illustrative; real policies define their own capability measures and cutoffs.)

## A worked example

Four models with different measured capability scores, checked against the threshold ladder:

```text
capability 0.10  → tier 1 (baseline practices)
capability 0.40  → tier 2 (enhanced evaluation)
capability 0.70  → tier 3 (strong deployment safeguards)
capability 0.90  → tier 4 (strictest controls)
```

A model's required tier is a step function of its measured capability: moving from 0.10 to 0.40 crosses one threshold and jumps straight from tier 1 to tier 2's requirements, with nothing gradual in between.

## Bench

```bench
id: rsp-capability-tier
title: More capable, more required
fallback: Slide a model's measured capability and see which safety tier's commitments it requires.
```

**Try this**

1. Slide capability from 0.10 up past 0.30 and watch the required tier jump from 1 to 2.
2. Keep sliding past 0.60 and 0.85 and watch the tier jump twice more.
3. Notice the tier only changes exactly at a threshold crossing, not gradually.

**What you should notice:** required safety commitments are a step function of measured capability, not a smooth scale — crossing a threshold, however slightly, changes what's required.

## Where it appears in AI

* **Open-weight release ([[Open-Weight vs. Closed Models]]) of a tier-4-level model is a one-way decision under an RSP** — once weights are public, no later safety fix reaches every downloaded copy, which is why the highest tiers often restrict release mode itself.
* **A model card's known-biases and limitations sections ([[Model Cards and Responsible Release]]) are part of what an RSP's evaluation requirements at higher tiers call for.**
* **Benchmark-based capability evaluation (covered on the Evaluating LLMs stretch of this road) is exactly what feeds the capability score an RSP's thresholds are checked against.**

## Common pitfalls

* **Assuming higher-tier requirements apply gradually as capability rises.** The worked example's step function shows requirements jump exactly at each threshold, with no partial tier in between.
* **Treating an RSP's thresholds as universal across labs.** Different organizations define capability differently and set different cutoffs; the worked example's specific numbers are illustrative, not a shared standard.
* **Assuming a lower-capability model needs no safety work at all.** Tier 1 still requires baseline safety practices — the tiers scale required rigor, they don't turn it off entirely at the low end.

## Quick check

<details><summary>1. In the worked example, why does a model moving from capability 0.29 to 0.31 face a much bigger change in required commitments than one moving from 0.31 to 0.59?</summary>
0.29 to 0.31 crosses the tier-1/tier-2 threshold, jumping to a new, stricter set of requirements; 0.31 to 0.59 stays within tier 2 the whole way, so the required commitments don't change at all despite the larger capability gap.
</details>

<details><summary>2. Why might an RSP restrict open-weight release specifically at the highest capability tiers?</summary>
Because open-weight release is irreversible — once published, a safety issue discovered later can't be patched in copies already downloaded and run elsewhere, unlike a closed, API-served model the provider can update or restrict.
</details>

<details><summary>3. Does a responsible scaling policy replace the need for a model card?</summary>
No — they serve different purposes: a model card documents what's known about a specific model's behavior and limitations, while an RSP sets the safety process and commitments required before and during a release, scaled to measured capability.
</details>

## Key terms

* **Responsible scaling policy (RSP):** a framework tying required safety commitments to a model's measured capability via defined thresholds.
* **Capability threshold:** the specific measured-capability value at which a model's required safety tier changes.
* **Safety tier:** a bundle of required commitments (evaluation rigor, deployment safeguards, access controls) that applies once a capability threshold is crossed.

## Related

[[Model Cards and Responsible Release]] · [[Licensing and Model Governance]] · [[Open-Weight vs. Closed Models]]
