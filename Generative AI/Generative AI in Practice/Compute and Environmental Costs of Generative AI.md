Every stage on this planet, from a single denoising step to a whole product pipeline, costs real computation — and computation costs real energy, drawn from a real power grid. This note puts rough numbers on exactly how much, and on one of generative AI's most consistently misunderstood comparisons.

**You need:** [[Building a Generative Product]].

## The question it answers

"How much energy and carbon does generating text actually cost, and how does that compare to training the model in the first place?" A rough chain of estimates gets there: a given number of **FLOPs** (floating-point operations), run at a GPU's achievable **throughput**, takes a certain amount of **time**; that time, multiplied by the GPU's **power draw**, gives **energy**; energy multiplied by the grid's **carbon intensity** gives an estimated **carbon footprint**. Running the same chain for one inference request versus for an entire training run reveals just how differently sized these two costs really are.

## Intuition

Baking one loaf of bread in an already-hot oven costs a small amount of additional energy; building and running the industrial bakery that makes that oven possible in the first place is a vastly larger, one-time undertaking. Every inference request is like baking one more loaf in an oven that already exists; training a model from scratch is like building the bakery — a cost that happens once, is vastly larger, and then is amortized across every loaf (every request) that oven will ever bake afterward.

## Definition and notation

```text
FLOPs for one forward pass over T tokens, model with P parameters:
  inference FLOPs ≈ 2 · P · T
  training FLOPs ≈ 6 · P · T     (roughly 3× more, for the backward pass)

time = FLOPs / (GPU's achievable FLOPs per second)
energy (kWh) = GPU power draw (kW) × time (hours)
carbon (kg CO₂) = energy (kWh) × grid carbon intensity (kg CO₂ / kWh)
```

## A worked example

A toy 7-billion-parameter model, on a GPU achieving roughly 300 TFLOPs/s at 400W, with a grid carbon intensity of 0.4 kg CO₂/kWh:

```text
one inference request (1,000 tokens):
  1.4 × 10¹³ FLOPs → 0.047 s → 0.0052 Wh → 0.0021 g CO₂

training run (1 trillion tokens, on one such GPU, illustratively):
  4.2 × 10²² FLOPs → 1,620 days → 15,556 kWh → 6,222 kg CO₂

training is about 3 billion times more FLOPs than this one inference request
```

Training this toy model, even on just one GPU for illustration, costs roughly 3 billion times the compute of a single 1,000-token inference request — a staggering ratio that puts "how much does one request cost" and "how much did training cost" on genuinely different scales, even though both numbers are routinely discussed in the same conversations about generative AI's environmental impact.

## Bench

```bench
id: compute-carbon-cost
title: One request vs. the whole training run
fallback: Adjust how many tokens a request generates and compare its energy cost against the energy cost of the model's full training run.
```

**Try this**

1. Raise the token count and watch the per-request energy grow, but stay tiny in absolute terms.
2. Compare that number against the training run's energy figure.
3. Consider how many inference requests it would take to match the training run's total cost.

**What you should notice:** the per-request number barely moves the overall comparison — training dominates by so many orders of magnitude that reasonable changes in request size don't meaningfully close the gap.

## Where it appears in AI

* **Training cost is a one-time (or periodic, for retraining) expense, while inference cost scales with usage** — a model served to millions of users accumulates inference cost that can eventually rival or exceed its training cost in total, even though any single request is minuscule.
* **Real energy estimates for production models are far more involved** than this toy chain — they account for actual measured GPU utilization, cooling overhead, and data-center efficiency (PUE), among other factors this worked example simplifies away.
* **[[Model Pruning|efficiency techniques elsewhere on these planets]] (quantization, pruning, distillation) directly reduce the FLOPs term in this chain**, lowering both cost and environmental impact at the inference stage specifically.

## Common pitfalls

* **Conflating per-request cost with total deployment cost.** A single request's energy cost is genuinely tiny; the environmental conversation that matters is usually about aggregate cost across millions or billions of requests, or about training specifically.
* **Assuming training cost is irrelevant because it's "one-time."** A one-time cost that large still matters — especially as models are retrained or fine-tuned repeatedly over their lifecycle.
* **Treating these estimates as precise.** This worked example's chain uses rough, illustrative figures (achievable FLOPs/s, grid carbon intensity) that vary enormously by hardware, location, and time — the value here is in the *relative* comparison, not exact absolute numbers.

## Quick check

<details><summary>1. What's the rough difference in FLOPs between training and inference, per token, and why?</summary>
Training costs roughly 3× the FLOPs of inference per token (about 6·P versus 2·P for P parameters), because training requires a backward pass (computing gradients) in addition to the forward pass inference alone needs.
</details>

<details><summary>2. In the worked example, by roughly what factor did the training run exceed the single inference request in total compute?</summary>
About 3 billion times — not because each token costs vastly more to train on, but because training involves a vastly larger number of tokens processed overall.
</details>

<details><summary>3. Why might someone easily get the wrong impression comparing "cost of one request" to "cost of training"?</summary>
Because the two numbers operate on wildly different scales (one request versus an entire training run across trillions of tokens) — direct comparison without accounting for that scale difference can make either cost seem misleadingly large or small relative to the other.
</details>

## Key terms

* **FLOPs:** floating-point operations, the basic unit of computational cost used to estimate energy use.
* **Carbon intensity:** how much CO₂ is emitted per unit of energy drawn from a given power grid.
* **Amortization:** spreading a large one-time cost (like training) across all the future uses (like inference requests) that benefit from it.

## Related

[[Building a Generative Product]] · [[Model Pruning]] · [[Capstone: A Tiny Multimodal Generator with Decoding and Guidance]]
