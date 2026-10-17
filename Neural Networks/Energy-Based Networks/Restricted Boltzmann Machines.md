A general Boltzmann machine connects every unit to every other unit, which makes exact training intractable past a handful of units. A restricted Boltzmann machine (RBM) removes exactly the connections that cause the trouble — visible-to-visible and hidden-to-hidden — leaving only visible-to-hidden connections, which makes an efficient approximate training rule possible.

**You need:** [[Boltzmann Machines]].

## The question it answers

"How can a Boltzmann machine be trained efficiently, given that exact learning requires computing an intractable sum over every possible state?" By restricting the connectivity to a bipartite structure — visible units and hidden units, with connections only between the two groups — so that all visible units become conditionally independent of each other given the hidden units (and vice versa), making sampling fast and a practical training rule, **contrastive divergence**, possible.

## Intuition

In a general Boltzmann machine, updating one unit means reasoning about every other unit at once, which gets expensive fast. In an RBM, knowing all the hidden units tells you everything you need about any one visible unit — the other visible units are irrelevant once the hidden layer is fixed. That means you can update the *entire* visible layer in one parallel step from the hidden layer, then the entire hidden layer in one parallel step from the visible layer, bouncing back and forth quickly. This back-and-forth is exactly what the training rule uses.

## Definition and notation

An RBM has visible units `v` and hidden units `h`, connected only by weights `W` (no `v`-`v` or `h`-`h` connections). Because of this bipartite structure:

```text
P(h_j = 1 | v) = sigmoid(Σᵢ W_ij vᵢ)
P(vᵢ = 1 | h) = sigmoid(Σⱼ W_ij hⱼ)
```

**Contrastive divergence (CD-1)**, the standard approximate training rule, runs one short back-and-forth from real data `v⁰`:

```text
1. Sample h⁰ from v⁰ (visible → hidden)
2. Sample v¹ from h⁰ (hidden → visible, the model's "reconstruction")
3. Compute h¹'s probabilities from v¹ (no further sampling needed)
4. ΔW = η · (v⁰ h⁰ᵗ − v¹ h¹ᵗ)
```

The first term pushes weights toward correlations seen in the real data; the second term pushes them away from correlations in the model's own reconstruction. When the two agree, the update is zero — the model has nothing left to learn from this example.

## A worked example

Two visible units, two hidden units, weights `W = [[0.8, −0.6], [−0.4, 0.7]]`, starting from data `v⁰ = [1, 1]`:

```text
hidden probabilities from v⁰:   P(h) = sigmoid([0.4, 0.1]) = [0.599, 0.525]
sampled h⁰ = [0, 1]

visible probabilities from h⁰:  P(v) = sigmoid([−0.6, 0.7]) = [0.354, 0.668]
sampled v¹ = [0, 0]   (the reconstruction — note it does not match v⁰)

hidden probabilities from v¹:   P(h | v¹) = sigmoid([0, 0]) = [0.5, 0.5]

ΔW (learning rate 0.1):
row 0: 0.1 × (1×0.599 − 0×0.5, 1×0.525 − 0×0.5) = [0.0599, 0.0525]
row 1: 0.1 × (1×0.599 − 0×0.5, 1×0.525 − 0×0.5) = [0.0599, 0.0525]
```

Because the reconstruction `v¹` came back as `[0, 0]` instead of the real `[1, 1]`, the negative term vanishes entirely and the full update pushes the weights to make the hidden units respond more strongly to this data — exactly the direction that would make `v⁰` more likely under the model.

## Bench

```bench
id: rbm-cd
title: One step of contrastive divergence
fallback: Step through one contrastive-divergence update on a small RBM: sample the hidden layer from the data, reconstruct a visible guess, resample the hidden layer, and see the resulting weight change.
```

**Try this**

1. Run the four-step CD-1 cycle on the default weights and data and watch the weight change.
2. Compare a run where the reconstruction happens to match the original data exactly — the update should shrink toward zero.
3. Change the starting weights and see how the first-step hidden probabilities shift.

**What you should notice:** the weight update depends entirely on whether the model's own reconstruction matches the real data — it never needs a label, only the gap between data-driven and reconstruction-driven correlations.

## Where it appears in AI

* **It made the 2006 revival of deep learning practical**, by giving a way to train one RBM layer at a time before fine-tuning the whole stack — see [[Layer-Wise and Unsupervised Pretraining]] next.
* **It is a genuinely different unsupervised learning signal** from anything on [[Machine Learning]]: no labels, no reconstructed-input loss computed by backpropagation, just the gap between two sampled correlations.
* **Restricting connectivity to make inference tractable** is a pattern that recurs elsewhere in probabilistic modelling, wherever a fully general dependency structure is too expensive to work with directly.

## Common pitfalls

* **Assuming contrastive divergence computes an exact gradient.** It is a biased approximation — the "one step back and forth" is a deliberate shortcut, not the true (intractable) training rule.
* **Forgetting the bipartite restriction is what makes the fast sampling possible.** Removing the visible-visible and hidden-hidden connections is not a minor simplification — it is the entire reason RBMs are trainable where general Boltzmann machines are not.
* **Expecting one CD-1 step to fully train the model.** In practice this update is applied repeatedly over many data examples, the same as any other gradient-based training loop.

## Quick check

<details><summary>1. What structural restriction distinguishes an RBM from a general Boltzmann machine?</summary>
No visible-to-visible or hidden-to-hidden connections — only connections between the visible and hidden layers.
</details>

<details><summary>2. In the worked example, why did the update not include any negative contribution to row 0?</summary>
Because the reconstruction `v¹` came back as `[0, 0]`, and the negative term is multiplied by `v¹` — with `v¹ = 0`, that whole term vanishes.
</details>

<details><summary>3. What historical role did RBMs and contrastive divergence play in deep learning?</summary>
They enabled layer-wise pretraining of deep networks in 2006, before end-to-end backpropagation of very deep networks was practical — see [[Layer-Wise and Unsupervised Pretraining]].
</details>

## Key terms

* **Bipartite connectivity:** connections only between two groups of units (visible and hidden), none within either group.
* **Contrastive divergence:** an approximate training rule comparing data-driven correlations against the model's own short reconstruction.
* **Reconstruction:** the visible-layer sample produced by running the hidden layer's sample back through the model.

## Related

[[Boltzmann Machines]] · [[Layer-Wise and Unsupervised Pretraining]] · [[Content-Addressable Memory and Capacity]]
