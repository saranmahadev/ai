A single output unit in a convolutional network does not "see" the whole input image — it only depends on some region of it, called its **receptive field**. One layer's receptive field is just its filter's size; stacking layers grows it, and anything that downsamples (stride or pooling) makes it grow faster still.

**You need:** [[Padding, Stride and Pooling]] and [[Why Depth Helps]].

## The question it answers

"How much of the image does a unit deep inside the network actually know about?" Exactly as much as the chain of filters feeding into it covers — and that area grows with every layer, fastest wherever the network has downsampled.

## Intuition: looking back through a chain of windows

A single 3×3 filter's output depends on a 3×3 patch of its input. Feed that output through a second 3×3 filter, and each of *its* outputs depends on a 3×3 patch of the first layer's output — which itself depends on a larger patch of the original image. Each extra 3×3, stride-1 layer adds 2 pixels to the receptive field's width and height; a stride-2 layer doesn't just add to it, it *doubles the rate* at which every later layer's receptive field grows, since each of its output pixels already corresponds to a 2×2 patch of input.

## Definitions

```text
RF after layer l = RF after layer (l−1) + (kernel_l − 1) × jump
jump (cumulative stride so far) multiplies by that layer's own stride afterward

RF starts at 1 (a single input pixel, before any layer)
```

## A worked example

Five stacked 3×3, stride-1 convolutions, no pooling:

```text
layer         1   2   3   4   5
RF            3   5   7   9  11
```

Each layer adds exactly 2, since the cumulative stride (`jump`) stays at 1 throughout.

Now insert one 2×2, stride-2 pooling layer after the second convolution, in an otherwise-identical 6-layer stack:

```text
layer     conv1  conv2  pool  conv3  conv4  conv5
RF          3      5      6     10     14     18
```

The pooling layer only grows the receptive field by 1 pixel itself, but it doubles `jump` from 1 to 2 — so every convolution *after* it now adds `2 × jump = 4` to the receptive field instead of 2, which is why the last three layers jump by 4 each instead of 2.

## Bench

```bench
id: receptive-field
title: How far back does this unit see?
fallback: Build a small stack of 3×3 convolution and pooling layers. See the receptive field grow with each layer added, and watch pooling layers make later layers grow it faster.
```

**Try this**

1. Add five plain 3×3 convolution layers and watch the receptive field climb by 2 each time.
2. Insert a pooling layer partway through and compare how much faster later layers now grow the receptive field.
3. Try moving the same pooling layer earlier or later in the stack and compare the final receptive field.

**What you should notice:** the *position* of a downsampling layer matters — the earlier it sits, the more of the remaining stack benefits from its doubled growth rate, and the larger the final receptive field ends up.

## Where it appears in AI

* **Why deep CNNs can recognise large objects despite small filters** — depth (and downsampling) grows the receptive field far past any single filter's size.
* **Object detection and segmentation** (see [[Object Detection and Segmentation]]) specifically need a receptive field large enough to cover the objects being found, which drives how deep (or how aggressively downsampled) a backbone needs to be.
* **Dilated (or "atrous") convolutions**, a further variant not covered in depth here, grow the receptive field without adding layers or downsampling at all, by spacing out a filter's taps.

## Common pitfalls

* **Confusing receptive field with the output feature map's spatial size.** A feature map can be small while its units still have a receptive field covering the whole original image, if enough downsampling happened along the way.
* **Assuming depth alone grows the receptive field fast enough for large images.** Without any downsampling, growth is only additive (2 pixels per 3×3 layer); very large images may need pooling or strides to get a usefully large receptive field without an impractical number of layers.
* **Forgetting that a unit's receptive field is about what it *could* depend on, not necessarily what it uses strongly.** Some pixels within the receptive field may have near-zero actual influence.

## Quick check

<details><summary>1. How much does one 3×3, stride-1 convolution layer add to the receptive field?</summary>
2 pixels (in each spatial dimension), since `(kernel − 1) × jump = (3 − 1) × 1 = 2` when no prior downsampling has occurred.
</details>

<details><summary>2. Why did the pooling layer in the worked example matter more than its own size suggests?</summary>
It doubled the cumulative stride ("jump"), so every convolution placed after it added receptive field twice as fast as it would have before the pooling layer.
</details>

<details><summary>3. Does a smaller output feature map always mean a smaller receptive field?</summary>
No — a smaller feature map from aggressive downsampling usually comes with a *larger* receptive field per unit, not a smaller one.
</details>

## Key terms

* **Receptive field:** the region of the original input that a given unit's output depends on.
* **Jump (cumulative stride):** the product of all strides applied so far, which scales how fast later layers grow the receptive field.
* **Dilated convolution:** a filter variant that grows the receptive field by spacing out its taps, without adding layers or downsampling.

## Related

[[Padding, Stride and Pooling]] · [[Why Depth Helps]] · [[Object Detection and Segmentation]] · [[Residual and Skip Connections]]
