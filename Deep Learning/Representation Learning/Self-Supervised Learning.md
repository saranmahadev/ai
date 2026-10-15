[[Autoencoders]] showed one way to train without human labels: reconstruct the input itself. **Self-supervised learning** generalises that idea into a whole family of techniques, each inventing a **pretext task** — some question whose correct answer can be generated automatically from the raw data, with no human annotation at all — chosen specifically because solving it well requires learning genuinely useful representations.

**You need:** [[Autoencoders]] and [[What Deep Networks Learn]].

## The question it answers

"Labelled data is expensive and limited — can a network still learn useful representations from the enormous amount of *unlabelled* data available?" Yes, by manufacturing its own training signal: hide or alter part of the data, and train the network to recover or predict what was hidden, using nothing but the rest of the data as the "label."

## Intuition: fill-in-the-blank, invented automatically

Think of a fill-in-the-blank exercise: cover up a word in a sentence, and ask someone to guess it from context. No human had to write a special answer key — the blanked-out word *is* the answer, already present in the original uncut sentence. A model trained on millions of auto-generated fill-in-the-blank exercises like this has to learn a great deal about language structure just to get good at a task that required zero manual labelling.

## Definitions

```text
pretext task:   any task whose "label" comes directly from the unlabelled data itself

examples:       masked prediction  — hide part of the input, predict it from the rest
                next-step prediction — predict what comes next in a sequence
                context prediction — predict nearby words (see word2vec, [[Word Embeddings]])
                rotation/jigsaw tasks (vision) — predict an applied transformation, or reassemble shuffled patches
```

The representations learned solving a pretext task are usually not the end goal — they are reused afterward via [[Transfer Learning and Fine-Tuning]] for the task you actually care about, which may have far less labelled data available.

## A worked example

A toy "fill in the masked pixel" pretext task on a 4×4 image, predicting a hidden pixel as the average of its up/down/left/right neighbours:

```text
image (true values)
0 0 0 0
0 0 0 0
0 0 1 1
0 0 1 1

mask position (1,1), true value 0:    neighbours (0,0,0,0)  →  predicted 0.000   (correct)
mask position (2,2), true value 1:    neighbours (0,1,0,1)  →  predicted 0.500   (wrong, but informative)
```

The simple "average the neighbours" rule gets the easy, uniform region exactly right, but is clearly wrong right at the shape's actual edge — exactly where more context and a cleverer model would be needed, which is the whole point: a model that got *better* at this pretext task would necessarily have learned something real about where edges are.

## Bench

```bench
id: masked-pixel
title: Guessing a masked pixel from its neighbours
fallback: A toy image with one pixel hidden. See the simple neighbour-average prediction, compare it to the true value, and try different mask positions to see where the simple rule does well or poorly.
```

**Try this**

1. Mask a pixel in a flat, uniform region and see the prediction land exactly right.
2. Mask a pixel right at an edge and see the prediction land roughly halfway between the two regions — neither fully right nor fully wrong.
3. Switch to a different toy shape and find the hardest position to predict.

**What you should notice:** the pretext task's prediction error is itself informative — it is highest exactly where the "interesting" structure (an edge, in this case) is, which is exactly the kind of signal that pushes a real model toward learning to detect that structure.

## Where it appears in AI

* **Masked language modelling** (predicting masked-out words from context) underlies the pretraining of many modern language models.
* **Contrastive methods** (see [[Contrastive Learning]]) are a related but distinct self-supervised family, learning from *which views belong together* rather than from filling in missing content.
* **Self-supervised pretraining followed by [[Transfer Learning and Fine-Tuning|fine-tuning]] on a small labelled dataset** is now the dominant recipe across vision and language, precisely because unlabelled data is so much more abundant than labelled data.

## Common pitfalls

* **Assuming any pretext task works equally well.** A poorly chosen pretext task (too easy, or solvable with a trivial shortcut) teaches the network little that transfers usefully.
* **Confusing self-supervised with unsupervised learning.** Self-supervised learning still trains with a clear, computable target (the hidden content); it just generates that target automatically rather than having it hand-labelled.
* **Forgetting the pretext task itself is rarely the end goal.** Its real value is the representation learned while solving it, reused for a different downstream task.

## Quick check

<details><summary>1. What makes a task "self-supervised" rather than needing human-labelled data?</summary>
The training target is generated automatically from the raw, unlabelled data itself (for example, a masked-out piece of the input), with no human annotation required.
</details>

<details><summary>2. In the worked example, why was the prediction wrong at the shape's edge but correct in the flat region?</summary>
The simple "average the neighbours" rule works well where nearby pixels agree, but breaks down exactly where they don't — right at the boundary between the shape's two regions.
</details>

<details><summary>3. What is typically done with the representations learned by solving a pretext task?</summary>
They are reused, via transfer learning, as a starting point for a different downstream task that may have much less labelled data available.
</details>

## Key terms

* **Self-supervised learning:** training with targets generated automatically from unlabelled data, rather than from human annotation.
* **Pretext task:** the specific, auto-labelled task a self-supervised model is trained to solve.
* **Downstream task:** the real task of interest, which reuses representations learned via a pretext task.

## Related

[[Autoencoders]] · [[What Deep Networks Learn]] · [[Transfer Learning and Fine-Tuning]] · [[Contrastive Learning]]
