A network trained on one large task has already learned a great deal of generally useful structure — edges and textures for vision, grammar and common phrasing for language. **Transfer learning** reuses that structure for a new, often much smaller task, instead of learning everything again from a random start.

**You need:** [[Autoencoders]] and [[CNN Architectures: From LeNet to ResNet]].

## The question it answers

"I only have a few hundred labelled examples for my task — nowhere near enough to train a deep network from scratch. Is there any way around that?" Yes: start from a network already trained on a large, related dataset, and adapt it — the hard, data-hungry part of learning general-purpose features has already been done for you.

## Intuition: hiring an experienced specialist, not training a new hire from zero

A photographer who has spent years learning to recognise shapes, lighting and composition can pick up a new specific subject (say, identifying a particular species of bird) far faster than someone starting with no photography experience at all — most of the hard-won general skill transfers directly, and only a smaller, specific skill needs to be learned fresh. A pretrained network's early and middle layers play the role of that general skill.

## Definitions

```text
feature extraction:  freeze the pretrained network's weights entirely;
                      train only a new, small output layer on top

fine-tuning:          unfreeze some or all of the pretrained layers too,
                      and keep training them (usually at a much lower learning rate)
                      on the new task's data
```

Feature extraction trains far fewer parameters and risks overfitting much less on a small dataset; fine-tuning can reach higher accuracy when there's enough new data to safely adjust the pretrained features toward the new task, without destroying what they already learned.

## A worked example

A pretrained backbone (however many millions of parameters it has internally) produces a 512-dimensional feature vector per image. Adapting it to a new 3-class task:

```text
feature extraction: train only a new 512 → 3 dense layer
                     parameters trained = 512 × 3 + 3 = 1,539
                     (the backbone's own parameters stay completely frozen)

fine-tuning:         also unfreeze some backbone layers
                     parameters trained = 1,539 + however many backbone parameters are unfrozen
```

With feature extraction, only 1,539 numbers ever get updated by the new, small dataset — however large and data-hungry the original backbone was to train, none of that cost (or data requirement) is paid again.

## Bench

```bench
id: transfer-params
title: How many parameters does adapting a model actually touch?
fallback: A slider for how many of a pretrained backbone's layers are unfrozen. See how the number of trainable parameters grows from "just the new output layer" toward "the whole network," and what that implies about the data needed to train safely.
```

**Try this**

1. Keep everything frozen except the new output layer and note the small trainable parameter count.
2. Unfreeze a few more layers and watch the trainable count grow.
3. Think about how much new labelled data each setting would need before overfitting becomes a serious risk (see [[Overfitting and Double Descent]]).

**What you should notice:** the choice of how much to unfreeze is really a choice about how much you trust your new dataset to safely adjust that many parameters without overfitting.

## Where it appears in AI

* **Computer vision tasks with modest datasets** routinely start from a backbone pretrained on a large, general image dataset (see [[CNN Architectures: From LeNet to ResNet]]), rather than training from random initialization.
* **Language model fine-tuning** follows the identical principle: adapt a model already trained on enormous amounts of text to a narrower task with comparatively little task-specific data.
* **Feature extraction versus fine-tuning is itself a spectrum**, not a binary choice — unfreezing just the last few backbone layers is a common middle ground.

## Common pitfalls

* **Using a learning rate for fine-tuning as large as you'd use training from scratch.** This can quickly destroy the pretrained features' useful structure; fine-tuning typically uses a much smaller learning rate than training fresh.
* **Fine-tuning the whole backbone on a tiny new dataset.** With too few examples relative to how many parameters are unfrozen, overfitting (see [[Overfitting and Double Descent]]) becomes a serious risk.
* **Assuming transfer learning always helps.** If the new task is very different in kind from what the backbone was originally trained on, the transferred features may be far less useful.

## Quick check

<details><summary>1. What is the key difference between feature extraction and fine-tuning?</summary>
Feature extraction freezes the pretrained backbone entirely and trains only a new output layer; fine-tuning also updates some or all of the backbone's own weights.
</details>

<details><summary>2. In the worked example, why does feature extraction train only 1,539 parameters regardless of how large the backbone is?</summary>
The backbone itself is frozen and contributes no trainable parameters; only the new 512-to-3 output layer is updated.
</details>

<details><summary>3. Why is fine-tuning usually done with a smaller learning rate than training from scratch?</summary>
A large learning rate risks quickly overwriting the pretrained weights' already-useful structure before the new task's signal has a chance to adapt it gently.
</details>

## Key terms

* **Transfer learning:** reusing a model trained on one task as the starting point for another.
* **Feature extraction (as a transfer strategy):** freezing a pretrained backbone and training only a new output layer.
* **Fine-tuning:** continuing to train some or all of a pretrained model's own weights on a new task.

## Related

[[Autoencoders]] · [[CNN Architectures: From LeNet to ResNet]] · [[Overfitting and Double Descent]] · [[Self-Supervised Learning]]
