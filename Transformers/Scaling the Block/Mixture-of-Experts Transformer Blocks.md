[[The Feed-Forward Sublayer|The feed-forward sublayer]] runs the same, single network on every position. A mixture-of-experts (MoE) transformer block replaces that one network with several parallel "expert" networks and a small router that decides, per token, which handful of experts actually get to run.

**You need:** [[The Feed-Forward Sublayer]], [[Mixture of Experts]].

## The question it answers

"Can a transformer block have far more total parameters without every token paying the full compute cost of all of them?" Yes — swap the single feed-forward sublayer for several parallel copies (experts) of the same shape, add a small **router** that scores every expert for a given token and selects only the top few, and run *only* those selected experts for that token. Total capacity scales with the number of experts; the actual compute any one token pays for stays small and fixed.

## Intuition

Imagine a large team of specialists instead of one generalist handling every request. A small dispatcher (the router) looks at each incoming request and sends it to just the two or three specialists best suited to it — not the entire team. Most of the team's combined expertise exists and keeps growing as more specialists are added, but any single request still only ever gets handled by a small, fixed number of them. This is exactly how [[Mixture of Experts|the generic mixture-of-experts idea]] from [[Deep Learning]] gets applied specifically inside a transformer block: it replaces the feed-forward sublayer, nothing else in the block changes.

## Definition and notation

```text
router(x) = softmax(W_router · x)              — a probability per expert
top-k selection: run only the k experts with the highest router probability

block output = Σ (over the k selected experts) router_prob_i × expert_i(x)
```

Everywhere else — attention, residual connections, normalization — stays exactly as described earlier in [[The Transformer Block]]; only the feed-forward sublayer is replaced by this routed structure.

## A worked example

Eight experts (each a small feed-forward sublayer with 76 parameters, as in [[The Feed-Forward Sublayer|the earlier worked example]]), routing a single token `x = [0.5, -0.3, 0.8, 0.1]` with top-2 selection:

```text
router probabilities: [0.166, 0.206, 0.120, 0.091, 0.131, 0.086, 0.086, 0.114]
top-2 selected: expert 1 (p=0.206), expert 0 (p=0.166)

total parameters (all 8 experts):      8 × 76 = 608
active parameters for this token:      2 × 76 = 152   (25.0% of the total)
```

The block holds `608` feed-forward parameters in total — far more than a single plain feed-forward sublayer of the same size — but this particular token's forward pass only actually runs `152` of them, a quarter of the full capacity.

## Bench

```bench
id: moe-router
title: A router choosing which experts run
fallback: Route a chosen input through a mixture of experts, see which ones the router selects, and compare the active parameter count against the full total.
```

**Try this**

1. Change the input vector and watch which experts the router selects change.
2. Increase the number of experts selected (top-k) and watch the active-parameter percentage grow.
3. Increase the total number of experts while keeping top-k fixed, and watch the active percentage shrink.

**What you should notice:** the total parameter count and the active (per-token) parameter count move independently — adding more experts grows total capacity without growing the compute any single token actually pays for, as long as top-k stays fixed.

## Where it appears in AI

* **It is how several very large modern models scale total parameter count far beyond what running every parameter on every token would allow** — Mixtral and Switch Transformer are well-known examples of MoE applied specifically to the feed-forward sublayer.
* **[[Counting a Transformer's Parameters and FLOPs|the next topic]] has to count MoE blocks differently from plain ones** — total parameters and active (compute-relevant) parameters genuinely diverge here, unlike every other block structure covered so far.
* **The routing decision is itself trained**, alongside the experts' own weights — which experts specialize in what is learned, not hand-assigned.

## Common pitfalls

* **Confusing total parameters with compute cost.** A model built from many experts can have an enormous total parameter count while running cheaply per token — the two numbers are genuinely different things for an MoE block.
* **Assuming every expert gets equal use.** Router behaviour is learned and can become imbalanced, with some experts selected far more often than others — a real training challenge MoE models have to manage.
* **Forgetting the router itself adds a (small) extra cost.** It's a small additional computation on top of whichever experts are actually selected.

## Quick check

<details><summary>1. What does the router in a mixture-of-experts block decide?</summary>
Which small number (top-k) of expert feed-forward sublayers actually process a given token, out of the full set of available experts.
</details>

<details><summary>2. In the worked example, why was only 25% of the total feed-forward parameters active for the given token?</summary>
Only 2 of the 8 experts (top-2 out of 8) were selected by the router, and 2/8 = 25% of the total parameter count.
</details>

<details><summary>3. What stays unchanged in a transformer block when its feed-forward sublayer is replaced with a mixture of experts?</summary>
Everything else — the attention sublayer, residual connections, and normalization all work exactly as in a plain transformer block; only the feed-forward sublayer's internal structure changes.
</details>

## Key terms

* **Router:** a small learned network that scores each expert for a given input and selects the top few.
* **Expert:** one of several parallel feed-forward sublayers in a mixture-of-experts block.
* **Active parameters:** the subset of a model's total parameters actually used to process a given input — can be far smaller than the total in an MoE model.

## Related

[[The Feed-Forward Sublayer]] · [[Mixture of Experts]] · [[Counting a Transformer's Parameters and FLOPs]]
