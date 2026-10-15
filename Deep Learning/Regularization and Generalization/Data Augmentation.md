**Data augmentation** manufactures new, harmless variations of existing training examples — a flipped image, a rotated one, a sentence with a synonym swapped in — so the network sees more of the input space without collecting a single new label. Done well, every augmented example is still clearly the same class to a human, but is a pixel-for-pixel (or word-for-word) different example to the network.

**You need:** [[Overfitting and Double Descent]] and [[Data and Features]].

## The question it answers

"I only have a limited amount of labelled data — can I make a network behave as if it had seen more?" Yes, for any transformation that changes the input without changing what the correct answer is, you can apply it on the fly and train on the result as if it were a fresh example.

## Intuition: the same cat, from a different angle

A photo of a cat flipped left-to-right is still unmistakably a photo of a cat — nothing about "catness" depends on which way the photo faces. By training on both the original and the flipped version (and crops, rotations, brightness changes, and so on), the network is pushed to recognise what is actually invariant about the class, rather than quietly memorising incidental details — like exactly where the cat's ear happened to be in pixel coordinates — that have nothing to do with the label.

## Definitions

```text
label-preserving transformation T:   T(x) has the same label as x, for the transformations you choose

training uses (x, y) and (T(x), y) — same label, different input
```

What counts as "label-preserving" depends entirely on the task: flipping a photo of a handwritten "6" would turn it into something closer to a "9" — not label-preserving at all — even though flipping a photo of a cat usually is.

## A worked example

A tiny 4×4 toy image, a vertical edge, and two augmentations:

```text
original          horizontal flip      90° rotation
0 0 1 1           1 1 0 0              0 0 0 0
0 0 1 1           1 1 0 0              0 0 0 0
0 0 1 1           1 1 0 0              1 1 1 1
0 0 1 1           1 1 0 0              1 1 1 1
```

All three grids have exactly 8 lit pixels, but every one of the twelve positions that are lit is different between them. Trained as three separate examples with the same label ("has an edge"), the network sees three genuinely different pixel patterns, all pointing to the same answer — exactly the effect augmentation is for.

## Bench

```bench
id: augment-view
title: One image, several augmentations
fallback: A small toy image with flip, rotation and noise augmentations applied live. Toggle each on or off and see the resulting grid, with a count confirming how many pixels changed position.
```

**Try this**

1. Turn on the horizontal flip and compare which pixels moved.
2. Turn on rotation instead, and compare the pattern of change to the flip.
3. Add a little random noise on top and see the image stop being an exact geometric transform of the original.

**What you should notice:** every augmentation here keeps the same number of "on" pixels (the same amount of signal) while moving them to different positions — the network has to learn the shape, not the exact pixel coordinates.

## Where it appears in AI

* **Computer vision** (see [[Convolutional Neural Networks]]) leans on augmentation heavily: flips, crops, rotations, colour jitter and more are close to standard practice.
* **Text:** synonym replacement, back-translation, and random word dropout serve the same purpose for language models.
* **Audio:** time-shifting, pitch-shifting and adding background noise are common augmentations for speech models.

## Common pitfalls

* **Applying a transformation that is not actually label-preserving for the task.** Flipping digit images, or mirroring text, can silently corrupt labels rather than enrich them.
* **Over-augmenting until examples barely resemble real data.** Too aggressive a transform can teach the network patterns that will never occur in genuine inputs.
* **Treating augmentation as a substitute for more or better data**, rather than a way to squeeze more value out of what you already have.

## Quick check

<details><summary>1. What makes a transformation suitable for data augmentation?</summary>
It must be label-preserving: the transformed input should still clearly belong to the same class (or have the same target) as the original.
</details>

<details><summary>2. Why is flipping a photo of a cat usually fine, but flipping a handwritten digit image often isn't?</summary>
A cat's identity doesn't depend on left-right orientation, but some digits (like 6 and 9) can turn into each other under a flip, changing the correct label.
</details>

<details><summary>3. In the worked example, what stayed the same across all three images, and what changed?</summary>
The number of lit pixels (8) stayed the same; their positions in the grid changed completely between the original, the flip, and the rotation.
</details>

## Key terms

* **Data augmentation:** generating new training examples by applying label-preserving transformations to existing ones.
* **Label-preserving transformation:** a change to the input that does not change the correct output.
* **Invariance:** a property of the task (like orientation not mattering for "is this a cat") that augmentation teaches the network to respect.

## Related

[[Overfitting and Double Descent]] · [[Data and Features]] · [[Convolutional Neural Networks]] · [[Dropout]]
