The compute-optimal split in [[Compute-Optimal Scaling (Chinchilla)]] assumes you can always get as much data as the optimum wants, and that training cost is the only cost that matters. Neither assumption holds once you actually have to deploy the model.

**You need:** [[Compute-Optimal Scaling (Chinchilla)]].

## The question it answers

"What happens when you can't (or don't want to) follow the compute-optimal split?" Two real deviations show up constantly in practice. **Data-constrained** training hits a ceiling on real data before compute runs out — there's often only so much high-quality text available, so extra compute can't buy more of it, only more passes over what exists (with diminishing, eventually negative, returns). **Overtraining** goes the other way deliberately: training a *smaller* model (cheaper to serve at inference time) on *far more* tokens than the compute-optimal split would allocate it, accepting worse training efficiency in exchange for a model that's cheaper to run for the rest of its life.

## Intuition

Data-constrained training is like being told to study a single, short book as deeply as you possibly can — past a point, re-reading it for the tenth time teaches you less than the first five readings did, because you've already extracted most of what's there. Overtraining is a completely different choice: deliberately hiring someone less naturally talented (a smaller model) but giving them vastly more practice than a "balanced" training plan would call for, specifically because they're cheaper to keep employed afterward (cheaper to run inference on) even though their training took more effort per unit of improvement.

## Definition and notation

```text
data-constrained: D fixed at Dmax (limited real data); only N can still grow
  → loss keeps improving as N grows, but with sharply diminishing returns
    once N is no longer well-matched to the fixed, capped D

overtrained: N fixed at a small Nsmall (chosen for cheap inference);
  D grows far past what compute-optimal would allocate at that N
  → loss keeps improving slowly as D grows, well past the point
    compute-optimal scaling would have called D "enough"
```

## A worked example

**Data-constrained**, with D capped at 4×10⁹ tokens while N grows:

```text
N = 1×10⁹:   loss 1.5190
N = 4×10⁹:   loss 1.5126     (compute-optimal match for this D)
N = 1.6×10¹⁰: loss 1.5095    (16× the model, barely better)
N = 6.4×10¹⁰: loss 1.5079    (64× the model, barely better still)
```

**Overtrained**, with N fixed at a small 1×10⁹ while D grows far past what compute-optimal would want:

```text
D = 1×10⁹:    loss 1.5253
D = 1×10¹⁰:   loss 1.5166
D = 1×10¹¹:   loss 1.5139
D = 1×10¹²:   loss 1.5130    (1000× the data, loss barely moved)
```

In both regimes, pushing the free variable far past its "balanced" counterpart buys steadily shrinking improvements — but overtraining is still a *deliberate, worthwhile* trade when the resulting smaller model will be served to enough users that cheaper inference outweighs the diminished training efficiency.

## Bench

```bench
id: data-constrained-scaling
title: When one side of the budget is stuck
fallback: Compare growing model size against a fixed data cap, or growing training tokens against a fixed small model, and watch returns diminish either way.
```

**Try this**

1. In the data-constrained regime, grow model size far past the data cap and watch returns shrink.
2. Switch to the overtrained regime and grow tokens far past what a small model would normally need.
3. Compare how much loss improvement either regime buys for a 10× increase in its free variable.

**What you should notice:** both regimes show the same basic pattern — once one side of the N/D pair is held fixed, pushing the other side yields steadily smaller gains, exactly the diminishing-returns signature of a power-law term that's no longer the bottleneck.

## Where it appears in AI

* **Open-weight models released for wide public use are commonly deliberately overtrained**: a smaller model trained on far more tokens than compute-optimal, because millions of inference requests over its lifetime dwarf the one-time training cost.
* **Data-constrained scaling is an active concern for high-quality, limited-supply domains** (specialized scientific text, certain languages) where [[Synthetic Data for Pretraining|synthetic data]] is sometimes proposed as a (risky) way to extend an otherwise-exhausted supply.
* **Both regimes are departures from, not refutations of, Chinchilla-style scaling** — they're informed choices about which cost (training compute vs. inference cost vs. data availability) actually matters most for a given deployment.

## Common pitfalls

* **Treating compute-optimal as the only "correct" choice.** Real deployments routinely and reasonably deviate from it — overtraining a small model is a deliberate trade favoring cheap inference, not a mistake.
* **Assuming data-constrained training can always be fixed by adding synthetic data.** As [[Synthetic Data for Pretraining|covered elsewhere in this subject]], recursive reliance on model-generated data to beat a real data ceiling carries its own serious risk.
* **Expecting diminishing returns to mean zero returns.** Both worked-example curves keep improving, just by less and less — pushing past the point of good returns isn't pointless, only less efficient.

## Quick check

<details><summary>1. What's the key difference between the data-constrained and overtrained regimes?</summary>
Data-constrained training hits a real ceiling on available data, leaving only model size free to grow; overtraining is a deliberate choice to fix a small model size and train it on far more tokens than compute-optimal would allocate, to make it cheaper to serve later.
</details>

<details><summary>2. In the worked example, what happened to loss improvement as the free variable grew far past its balanced value in either regime?</summary>
Improvement kept happening but shrank sharply — a 64× increase in model size (data-constrained) or a 1000× increase in data (overtrained) each bought only a small further loss reduction.
</details>

<details><summary>3. Why might a lab deliberately choose to overtrain a smaller model, even knowing it's compute-inefficient to do so?</summary>
Because a smaller model is cheaper to run at inference time, and if that model will be served to enough users over its lifetime, the savings in total inference cost can outweigh the extra training compute spent getting it there.
</details>

## Key terms

* **Data-constrained regime:** training where available high-quality data, not compute, is the limiting factor.
* **Overtraining:** deliberately training a smaller model on more tokens than compute-optimal scaling would allocate, to reduce inference cost.
* **Diminishing returns:** steadily shrinking improvement per additional unit of the variable being increased.

## Related

[[Compute-Optimal Scaling (Chinchilla)]] · [[Synthetic Data for Pretraining]] · [[Cost and Latency of LLM APIs]]
