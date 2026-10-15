A trained network rarely needs every single weight it ended up with. **Pruning** removes the ones that matter least — often simply the weights closest to zero — shrinking the model with, ideally, only a small cost to accuracy.

**You need:** [[The Multilayer Feedforward Network]] and [[Overfitting and Double Descent]].

## The question it answers

"A trained network has millions of weights — are they all actually necessary?" Usually not: many end up tiny, contributing almost nothing to the output, and can be removed (set to exactly zero) with little effect on what the network computes.

## Intuition: trimming the dead branches, not the trunk

A weight with a value very close to zero barely changes the output no matter what multiplies it — it's a dead branch on an otherwise healthy tree. **Magnitude pruning** cuts the smallest-magnitude weights first, on the reasoning that they were contributing the least anyway. **Structured pruning** goes further, removing whole units, channels or filters at once (not just individual weights), which — unlike scattered individual-weight pruning — actually speeds up computation on ordinary hardware, since it shrinks the matrices themselves rather than leaving sparse holes in them.

## Definitions

```text
magnitude pruning:   remove the weights with the smallest |w|, setting them to exactly 0
structured pruning:  remove whole units/channels/filters, not just scattered individual weights

sparsity = (number of zeroed weights) / (total weights)
```

## A worked example

A 6-weight layer, `w = (0.9, −0.05, 0.6, 0.02, −0.8, 0.1)`, computing a dot product against an input of all 1s:

```text
full output = 0.9 − 0.05 + 0.6 + 0.02 − 0.8 + 0.1 = 0.77

prune the 3 smallest-magnitude weights (0.02, 0.05, 0.10) → set to 0:
pruned w = (0.9, 0, 0.6, 0, −0.8, 0)

pruned output = 0.9 + 0.6 − 0.8 = 0.70

relative error = |0.77 − 0.70| / |0.77| ≈ 9.1%
```

Removing half the weights (50% sparsity) only shifted the output by about 9% — exactly the trade-off pruning aims for: a large reduction in parameters for a comparatively small change in behaviour.

## Bench

```bench
id: prune-weights
title: Pruning the smallest weights
fallback: A short weight vector and an input. Adjust how much to prune (by magnitude) and watch the sparsity, the output, and the relative error against the unpruned output.
```

**Try this**

1. Increase the pruning amount gradually and watch when the relative error starts climbing sharply.
2. Set one weight to be very large and watch how much sparsity you can apply before it (the largest weight) has to be touched.
3. Compare pruning amounts that remove "obviously small" weights versus amounts that start cutting into meaningfully-sized ones.

**What you should notice:** error tends to stay small while pruning only removes genuinely tiny weights, then rises more sharply once pruning starts removing weights that were actually contributing something.

## Where it appears in AI

* **Deploying models on resource-constrained devices** (see [[Edge and On-Device Deep Learning]]) often combines pruning with [[Quantization]] and [[Knowledge Distillation]] to meet strict size and speed budgets.
* **Iterative pruning and fine-tuning**, not covered in full detail here, alternates pruning a little, retraining to recover accuracy, and pruning further — usually reaching much higher sparsity than a single one-shot cut.
* **The "lottery ticket hypothesis"**, an influential line of research, found that some pruned sub-networks, if retrained from their *original* initial weights, can match the full network's accuracy — suggesting much of a large network's benefit comes from giving training many chances to find a good sparse sub-network, not from needing every weight at inference time.

## Common pitfalls

* **Assuming unstructured pruning (scattered individual weights) speeds up a model on ordinary hardware.** It reduces parameter count and storage, but a sparse matrix with scattered zeros usually needs specialised hardware or software support to actually run faster.
* **Pruning too aggressively in one shot.** Accuracy often degrades sharply past some point; gradual pruning with retraining in between usually reaches much higher sparsity safely.
* **Forgetting pruning changes the model permanently.** Unlike dropout (training-time only), pruned weights are typically gone for good at inference.

## Quick check

<details><summary>1. What does magnitude pruning remove?</summary>
The weights with the smallest absolute value, on the reasoning that they contribute the least to the output.
</details>

<details><summary>2. Why does structured pruning speed up computation on ordinary hardware, while unstructured pruning often doesn't?</summary>
Structured pruning removes whole units or channels, actually shrinking the matrices involved; unstructured pruning leaves scattered zeros inside matrices of the same shape, which ordinary hardware doesn't automatically skip over.
</details>

<details><summary>3. In the worked example, what was the cost (in relative error) of removing half the weights?</summary>
About 9.1% — a comparatively small change in output for a 50% reduction in the number of non-zero weights.
</details>

## Key terms

* **Pruning:** removing weights (or whole units) from a trained network to shrink it.
* **Magnitude pruning:** removing the smallest-magnitude weights specifically.
* **Sparsity:** the fraction of a network's weights that have been pruned (set to zero).

## Related

[[The Multilayer Feedforward Network]] · [[Overfitting and Double Descent]] · [[Quantization]] · [[Knowledge Distillation]]
