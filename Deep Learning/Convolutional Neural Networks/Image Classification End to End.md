Every idea in this section — convolution, channels, padding and pooling, depth, residual connections, receptive fields — exists to serve one standard pipeline: **convolve, pool, repeat, flatten, classify.** This topic runs that whole pipeline by hand on one tiny image.

**You need:** [[CNN Architectures: From LeNet to ResNet]] and [[Padding, Stride and Pooling]].

## The question it answers

"I understand each piece — convolution, pooling, depth — separately. How do they actually combine into one working classifier?" By chaining them in a fixed order, then flattening whatever feature map is left into a vector a plain [[The Multilayer Feedforward Network|dense layer]] can classify.

## Intuition: from a grid of pixels to a grid of probabilities

A classification CNN is a funnel: it starts wide and flat (a 2D image) and gradually turns into a short list of numbers (one score per class). Convolutional and pooling layers do the "seeing" — finding and summarising patterns while the data is still shaped like an image. Once the spatial structure has done its job, **flattening** reshapes whatever is left into a plain vector, and an ordinary dense layer turns that vector into class scores.

## Definitions

```text
pipeline:   image → conv → activation → pool → (repeat) → flatten → dense → softmax

flatten:    reshape a feature map (height × width × channels) into one long vector,
            with no computation — purely bookkeeping
```

## A worked example

A 4×4 toy "corner" image, through one convolution, a ReLU, flattening, and a 2-class output layer:

```text
image                     kernel [-1, 0, 1]     conv (valid, 2×2)
0 0 0 0                   (per row)              1  1
0 0 0 0                                          2  2
0 0 1 1
0 0 1 1
```

ReLU leaves this unchanged (already all positive): flattened to `(1, 1, 2, 2)`.

```text
dense layer:  W = [[0.5, −0.3, 0.2, 0.1], [−0.4, 0.6, 0.1, −0.2]]    b = (0.1, −0.1)

logits = (0.5·1 − 0.3·1 + 0.2·2 + 0.1·2 + 0.1,  −0.4·1 + 0.6·1 + 0.1·2 − 0.2·2 − 0.1)
       = (0.9, −0.1)

softmax(0.9, −0.1) ≈ (0.731, 0.269)
```

The network ends up about 73% confident in the first class — a single convolution, a ReLU, and a dense layer were all it took to turn a grid of pixels into a probability for each class.

## Bench

```bench
id: cnn-pipeline
title: One tiny image, all the way to a prediction
fallback: Step through convolution, ReLU, flattening and the final dense-plus-softmax layer on a toy image, watching the data's shape and values change at every stage.
```

**Try this**

1. Step through all four stages in order and watch the shape change: 4×4 grid → 2×2 grid → length-4 vector → 2 class probabilities.
2. Switch to a different toy image and see how the final probabilities change while the pipeline's shape stays identical.
3. Edit the dense layer's weights and see how much they can shift the final prediction, even with the same convolution output.

**What you should notice:** every stage either extracts features from spatial structure (convolution) or discards structure on purpose (flattening) — nothing in between does both at once.

## Where it appears in AI

* **Real image classifiers** are this exact pipeline, just with many more convolutional layers, larger images, far more classes, and architectures from [[CNN Architectures: From LeNet to ResNet]] handling the "convolve, pool, repeat" part.
* **Transfer learning** (see [[Transfer Learning and Fine-Tuning]]) usually reuses everything up to flattening from a pretrained network, retraining only the final dense layer for a new task.
* **The same funnel shape** — spatial processing, then flatten, then dense — appears in object detection and segmentation too, just with different output layers in place of plain classification.

## Common pitfalls

* **Forgetting flattening discards spatial information.** Once flattened, the dense layer has no notion of "this value was top-left" versus "this value was bottom-right" — only its position in the vector.
* **Mismatched shapes between the last convolutional layer and the dense layer.** The flattened vector's length must exactly match the dense layer's expected input size — a frequent source of implementation errors.
* **Assuming the pipeline must end in softmax.** Binary classification often uses a single sigmoid output instead; the "convolve, pool, flatten" part is unaffected either way.

## Quick check

<details><summary>1. What does "flattening" actually compute?</summary>
Nothing — it is pure reshaping, turning a multi-dimensional feature map into a single vector with no arithmetic involved.
</details>

<details><summary>2. In the worked example, what shape is the data right before the dense layer?</summary>
A length-4 vector (1, 1, 2, 2), flattened from the 2×2 feature map that followed the convolution and ReLU.
</details>

<details><summary>3. Why might a classifier use softmax at the end rather than stopping at the raw logits?</summary>
Softmax turns arbitrary real-valued logits into a probability distribution — positive numbers that sum to 1 — which is both easier to interpret and what cross-entropy loss expects during training.
</details>

## Key terms

* **Flatten:** reshaping a feature map into a single vector, with no computation.
* **Pipeline (convolve, pool, repeat, flatten, classify):** the standard structure of a CNN image classifier.
* **Logits:** the raw, pre-softmax scores produced by the final dense layer.

## Related

[[CNN Architectures: From LeNet to ResNet]] · [[Padding, Stride and Pooling]] · [[Transfer Learning and Fine-Tuning]] · [[Softmax and Cross-Entropy in Practice]]
