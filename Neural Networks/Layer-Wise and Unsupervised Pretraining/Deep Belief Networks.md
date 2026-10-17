A single RBM learns one layer of structure in data. A deep belief network (DBN) learns several layers, by training one RBM at a time and feeding each one's output forward as the next one's input — the training trick that, in 2006, reopened deep networks as a practical idea.

**You need:** [[Contrastive Divergence]].

## The question it answers

"How can a deep, many-layer network be trained before backpropagation of very deep nets was practical?" By training it one layer at a time: train an RBM on the raw data with contrastive divergence, freeze it, then treat its hidden-layer activations as "data" for a second RBM, train that one, freeze it, and repeat. Each layer is trained **greedily** — only looking at the layer below it, never adjusting earlier layers once they're frozen.

## Intuition

Think of it like learning a language by first mastering individual letters, then — once that's solid and no longer touched — learning how letters combine into words, then — once *that's* solid — how words combine into sentences. Each stage builds a more abstract representation of the one below it, and each stage is trained completely independently, with no instruction yet about what the final task will be (there are no labels anywhere in this process).

## Definition and notation

```text
1. Train RBM₁ on raw data v, via contrastive divergence. Freeze W₁.
2. Compute h₁ = P(hidden | v, W₁) for every data point — this is layer 2's "data".
3. Train RBM₂ on {h₁}, via contrastive divergence. Freeze W₂.
4. Repeat: compute h₂ from h₁ via W₂, train RBM₃ on {h₂}, and so on.
```

The resulting stack of weights `W₁, W₂, …` can then optionally be fine-tuned end to end with a small amount of labelled data and backpropagation — but the bulk of the representation is already in place before a single label is used.

## A worked example

Four small binary patterns, `[1,1,0,0], [1,0,1,0], [0,0,1,1], [0,1,0,1]`, with no labels attached. Train a 4-visible, 3-hidden RBM₁ on them with contrastive divergence; freeze it. Compute the hidden-layer representation of the first pattern, `v = [1, 1, 0, 0]`:

```text
h₁ = P(hidden | v, W₁) ≈ [0.004, 0.002, 1.000]
```

Now use all four patterns' `h₁` representations as the "data" for a second RBM, 3-visible (matching `h₁`'s size), 2-hidden. Train it independently with contrastive divergence; freeze it. Pushing the same pattern's `h₁` through this second layer:

```text
h₂ = P(hidden | h₁, W₂) ≈ [0.979, 0.286]
```

Four raw input dimensions became a 3-number code, which became a 2-number code — and at no point in either training stage did the network see a label, or get told anything about the other layer being trained before or after it.

## Bench

```bench
id: dbn-stack
title: Stacking RBMs, one frozen layer at a time
fallback: Train a small RBM on raw data, freeze it, then train a second RBM on the first one's hidden activations, and watch a chosen pattern's representation change at each layer.
```

**Try this**

1. Train the first layer and watch its hidden representation of each pattern settle.
2. Train the second layer on those representations and watch its own hidden representation settle.
3. Compare the raw pattern, the layer-1 code, and the layer-2 code for the same input.

**What you should notice:** each layer is trained to completion before the next layer ever sees any data, and once a layer is frozen nothing afterwards changes its weights — this is what "greedy, layer-wise" means in practice.

## Where it appears in AI

* **It was the breakthrough that made training deep networks feasible in 2006**, at a time when backpropagating through many layers from a random start tended to fail (see [[Vanishing and Exploding Gradients]] on [[Deep Learning]]) — layer-wise pretraining gave each layer a reasonable starting point before any end-to-end fine-tuning.
* **[[Stacked Autoencoders Before End-to-End Training|Stacked autoencoders]], covered next, apply the exact same greedy idea** with a different building block.
* **Modern deep networks no longer need this trick** — better initialization, normalization and optimizers (covered throughout [[Deep Learning]]) made direct end-to-end training practical, which is why DBNs are now of mostly historical and conceptual interest; see [[Choosing Classical vs Modern Approaches]].

## Common pitfalls

* **Assuming "deep belief network" means any deep network.** It specifically means one built this way — by stacking RBMs trained greedily, layer by layer.
* **Expecting fine-tuning to be required.** It is optional; the greedily-trained stack already produces usable representations on its own, with fine-tuning as an optional final improvement.
* **Forgetting earlier layers are frozen.** Training layer 2 never adjusts layer 1's weights — if it did, this would just be ordinary joint training, not the greedy procedure that gave DBNs their name.

## Quick check

<details><summary>1. What does "greedy" mean in the context of training a deep belief network?</summary>
Each layer is trained to completion, using only the layer below it as data, before the next layer is trained at all — earlier layers are frozen once trained.
</details>

<details><summary>2. In the worked example, what was used as the "data" for training the second RBM?</summary>
The hidden-layer activations (h₁) that the first, already-trained RBM produced for each original data pattern — not the raw patterns themselves.
</details>

<details><summary>3. Why are deep belief networks mostly of historical interest today?</summary>
Better weight initialization, normalization and optimizers made direct end-to-end backpropagation of deep networks practical, removing the main reason layer-wise pretraining was needed.
</details>

## Key terms

* **Greedy layer-wise training:** training one layer fully before introducing the next, never revisiting earlier layers.
* **Deep belief network:** a stack of RBMs trained this way, each one's hidden layer feeding the next as data.
* **Fine-tuning:** an optional final stage adjusting the whole, already-pretrained stack together, typically with labelled data and backpropagation.

## Related

[[Contrastive Divergence]] · [[Restricted Boltzmann Machines]] · [[Stacked Autoencoders Before End-to-End Training]]
