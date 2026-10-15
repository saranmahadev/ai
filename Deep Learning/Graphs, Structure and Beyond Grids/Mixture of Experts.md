A plain dense layer runs every input through the exact same weights. A **mixture of experts (MoE)** layer instead keeps several separate sub-networks ("experts") and a small **router** that decides, per input, which handful of experts to actually run — getting the capacity of many experts' worth of parameters while only paying the compute cost of the few that are actually used.

**You need:** [[The Multilayer Feedforward Network]] and [[Softmax and Cross-Entropy in Practice]].

## The question it answers

"More parameters usually means more compute per input — is there a way to have a much bigger model without a proportionally bigger cost for every single input?" Yes, if most of that extra size is split into many specialist experts and a lightweight router sends each input to only a handful of them, rather than running the whole thing every time.

## Intuition: routing a question to a specialist, not asking everyone

A large hospital doesn't make every patient see every single specialist — a triage step routes each patient to the one or two specialists most relevant to their case. An MoE layer works the same way: a small router network looks at the input and decides which experts (out of possibly dozens) are most relevant, and only those few actually process it. The rest of the experts — and their parameters — sit idle for that particular input, contributing nothing to its compute cost.

## Definitions

```text
router:  logits = router(x);   probs = softmax(logits)     (one score per expert)
top-k selection:  keep only the k highest-scoring experts; renormalise their probabilities to sum to 1

output = Σ (renormalised weight_i) · expert_i(x),   summed only over the selected top-k experts
```

Every expert is a full sub-network in its own right (often the same size as what a plain dense layer would have been); the total parameter count across all experts can be enormous, while the compute for any single input only involves the `k` selected ones.

## A worked example

A router scores 4 experts for one input: logits `(1.2, 0.3, 2.5, −0.5)`. Keeping only the top 2 (experts at index 2 and 0):

```text
full softmax over all 4:   (0.1902, 0.0773, 0.6978, 0.0347)

top-2 experts: index 2 (score 0.6978) and index 0 (score 0.1902)
renormalised among just these two:  (0.7858, 0.2142)

expert 2's output = 5,  expert 0's output = 3

combined output = 0.7858 × 5 + 0.2142 × 3 ≈ 4.5717
```

Experts 1 and 3 (indices 1 and 3) contribute nothing at all to this particular input's output or compute — their parameters exist, and may matter a great deal for a *different* input the router routes to them, but are entirely irrelevant here.

## Bench

```bench
id: moe-routing
title: Routing an input to its top experts
fallback: Four experts with adjustable router scores and outputs. See the full softmax, which experts the top-k selection keeps, their renormalised weights, and the resulting combined output.
```

**Try this**

1. Adjust one expert's router score higher and watch it dominate the combined output more.
2. Change `k` (how many experts are kept) and see how the combined output shifts as more or fewer experts contribute.
3. Set two experts' router scores very close together and watch the combined output become a near-even blend of both.

**What you should notice:** an expert that isn't selected contributes exactly zero to this input's output, however large or carefully trained its own parameters are — the routing decision is all-or-nothing per input, not a soft blend across every expert.

## Where it appears in AI

* **Very large language models** increasingly use mixture-of-experts layers to scale total parameter count far beyond what would be affordable if every parameter had to be used on every input.
* **Load balancing across experts** is an active practical concern: if the router consistently favours a small subset of experts, the rest go undertrained, which specialised auxiliary losses are often added to discourage.
* **The router itself is trained end to end** along with the experts, typically learning to specialise experts for different kinds of input without being told explicitly what that specialisation should be.

## Common pitfalls

* **Assuming MoE layers always reduce total compute.** They reduce compute *per input* relative to the total parameter count, but running many experts across a large batch of varied inputs still requires real computation — the saving is in not running *every* expert for *every* input.
* **Forgetting the renormalisation step.** Without it, the selected experts' weights wouldn't sum to 1, and the combined output's overall scale would drift depending on how many experts happened to be selected.
* **Expecting experts to specialise in humanly interpretable ways.** Any specialisation that emerges is a trained, emergent property of the router and experts jointly, not something designed in by hand.

## Quick check

<details><summary>1. What does the router in a mixture-of-experts layer decide?</summary>
Which (typically a small number, k, of) experts should process a given input.
</details>

<details><summary>2. Why are the selected experts' weights renormalised after top-k selection?</summary>
So they sum to exactly 1 among just the selected experts, keeping the combined output's scale consistent regardless of which experts were chosen.
</details>

<details><summary>3. In the worked example, do experts 1 and 3 affect this input's output at all?</summary>
No — they were not among the top-2 selected experts, so they contribute nothing to this particular input's combined output or compute.
</details>

## Key terms

* **Expert:** one of several separate sub-networks in a mixture-of-experts layer.
* **Router (gating network):** the small network that scores and selects which experts handle a given input.
* **Top-k selection:** keeping only the k highest-scoring experts and renormalising their weights.

## Related

[[The Multilayer Feedforward Network]] · [[Softmax and Cross-Entropy in Practice]] · [[Graph Neural Networks]] · [[Scaling Laws and Model Capacity]]
