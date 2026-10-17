Every number quoted for a transformer's size — "110 million parameters," "175 billion parameters" — comes from literally adding up the matrices covered earlier on this planet. This topic does that addition explicitly, and checks the result against a real, published model.

**You need:** [[Assembling One Transformer Block]], [[Weight Tying]], [[The Feed-Forward Sublayer]].

## The question it answers

"Where does a transformer's parameter count actually come from, and can it be computed by hand from first principles?" Yes — almost entirely from two things repeated at every layer: the four attention projection matrices (query, key, value, output) and the two feed-forward matrices, plus one embedding table shared (if tied) between input and output. Everything else — normalization scale and shift parameters, biases — is small enough to be a rounding error at any realistic model size.

## Intuition

A transformer's size is mostly just "how many of these matrices, how big." Each layer repeats the identical structure: four `d_model × d_model` attention matrices, two feed-forward matrices sized by `d_model` and `d_ff`. Multiply by the number of layers, add one embedding table, and that single sum accounts for the overwhelming majority of a transformer's parameters — there's no hidden complexity, just arithmetic applied consistently at every layer.

## Definition and notation

```text
per-layer attention parameters: 4 × d_model²                     (Wq, Wk, Wv, Wo)
per-layer feed-forward parameters: 2 × d_model × d_ff
per-layer total: 4·d_model² + 2·d_model·d_ff

with the common convention d_ff = 4·d_model:
  per-layer total = 4·d_model² + 8·d_model² = 12·d_model²

total (non-embedding) parameters ≈ 12 × num_layers × d_model²
plus one embedding table (tied): vocabulary_size × d_model
```

## A worked example

BERT-base's published configuration: `d_model = 768`, `num_layers = 12`, `d_ff = 3072` (exactly `4 × 768`), vocabulary `30,522`:

```text
attention params per layer:  4 × 768² = 2,359,296
feed-forward params per layer: 2 × 768 × 3072 = 4,718,592
total per layer: 7,077,888  — exactly matching 12 × 768² = 7,077,888

total across 12 layers: 7,077,888 × 12 = 84,934,656
embedding table (tied, from Weight Tying): 30,522 × 768 = 23,440,896

grand total: 84,934,656 + 23,440,896 = 108,375,552 ≈ 108.4 million
```

This lands within a few percent of BERT-base's commonly cited **~110 million parameters** — the small remaining gap is normalization scale/shift parameters and biases, each tiny compared to the matrices counted here.

## Bench

```bench
id: param-counter
title: Add up the matrices, layer by layer
fallback: Set a model's width, depth, feed-forward size and vocabulary, and see its total parameter count build up from the attention and feed-forward matrices at each layer.
```

**Try this**

1. Match the worked example's configuration and confirm the total lands near 108 million.
2. Change `d_ff` away from `4 × d_model` and watch the convenient `12·d_model²` shortcut stop applying.
2. Scale up `d_model` and `num_layers` together and watch the total grow much faster than either alone.

**What you should notice:** the total is overwhelmingly dominated by the `num_layers × d_model²` term — doubling the width roughly quadruples the per-layer cost, while doubling the depth only doubles it, a genuinely different kind of scaling.

## Where it appears in AI

* **It is the basis for every "model size" number quoted about a transformer** — not a separate measurement, but this exact arithmetic applied to that model's specific configuration.
* **[[Mixture-of-Experts Transformer Blocks|MoE blocks]] break the simple relationship between total and active parameters** covered here — the formula above still applies to counting *total* capacity, but a separate, smaller count is needed for compute actually spent per token.
* **A rough FLOPs-per-token estimate follows directly from the parameter count**: roughly `2 × parameters` floating-point operations per token for a forward pass, a widely-used approximation in scaling-law analysis.

## Common pitfalls

* **Forgetting the `12·d_model²` shortcut only holds when `d_ff = 4·d_model`.** It's an extremely common convention, but not a law — a different `d_ff` ratio needs the full `4·d_model² + 2·d_model·d_ff` formula.
* **Double-counting the embedding table.** With weight tying (see [[Weight Tying]]), it's one matrix, not two — counting it twice overstates the total noticeably at smaller model sizes.
* **Assuming parameter count alone determines compute cost.** It's closely related but not identical — see [[Mixture-of-Experts Transformer Blocks]] for a case where they genuinely diverge.

## Quick check

<details><summary>1. What two matrix groups, repeated at every layer, account for almost all of a transformer's parameters?</summary>
The four attention projection matrices (query, key, value, output) and the two feed-forward matrices.
</details>

<details><summary>2. In the worked example, why did 12 × d_model² exactly match the sum of the attention and feed-forward terms?</summary>
Because d_ff was exactly 4 × d_model (3072 = 4 × 768), the common convention under which 4·d_model² (attention) + 8·d_model² (feed-forward, since 2 × d_model × 4·d_model = 8·d_model²) simplifies to 12·d_model².
</details>

<details><summary>3. What accounts for the small gap between the worked example's 108.4 million and BERT-base's commonly cited ~110 million?</summary>
Normalization scale/shift parameters and biases, which this worked example's formula omits since they are small compared to the matrices it counts.
</details>

## Key terms

* **d_ff:** the feed-forward sublayer's hidden width, conventionally 4 times d_model.
* **Non-embedding parameters:** a model's parameters excluding the embedding table, often reported separately in scaling-law analysis.
* **FLOPs (floating-point operations):** a measure of computational work, roughly proportional to parameter count for one forward pass through a token.

## Related

[[Assembling One Transformer Block]] · [[Weight Tying]] · [[Mixture-of-Experts Transformer Blocks]] · [[Splitting a Transformer Across Devices]]
