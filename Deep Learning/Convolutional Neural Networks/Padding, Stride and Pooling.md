Three simple knobs control how a convolution's output is sized and how fast a network shrinks an image down: **padding** adds a border so the filter can reach the edges, **stride** sets how far the filter jumps between positions, and **pooling** deliberately shrinks a feature map by summarising small patches of it.

**You need:** [[The Convolution Operation]] and [[Filters, Feature Maps and Channels]].

## The question it answers

"A plain convolution shrinks the image a little every layer, and only ever looks at one position at a time — how do I control that shrinkage, or speed it up on purpose?" Padding stops the shrinkage; stride and pooling make it happen faster, deliberately.

## Intuition: a border, a bigger step, and a summary

**Padding** adds a ring of zeros around the image so the filter can be centred even on what used to be an edge pixel — like adding a blank margin around a page so nothing gets cut off near the border. **Stride** changes how far the filter moves between computations: stride 1 checks every position, stride 2 skips every other one, producing roughly half as many outputs. **Pooling** is a different operation entirely — no learned weights at all — that summarises each small patch of a feature map with one number, usually the patch's maximum (**max pooling**) or average.

## Definitions

```text
output size (one dimension) = ⌊(n + 2·pad − kernel) / stride⌋ + 1

n = 6, kernel = 3, pad = 0, stride = 1  →  output 4   ("valid": shrinks)
n = 6, kernel = 3, pad = 1, stride = 1  →  output 6   ("same": unchanged)
n = 6, kernel = 3, pad = 0, stride = 2  →  output 2   (stride downsamples)

max pooling (window size s, stride s): output[i][j] = max over the s×s block
```

## A worked example

Max-pooling a 4×4 toy edge image with a 2×2 window (and matching stride 2):

```text
image               max-pooled (2×2 blocks)
0 0 1 1                  0  1
0 0 1 1       →           
0 0 1 1                  0  1
0 0 1 1
```

Each 2×2 block becomes one number: the top-left block (all 0s) becomes 0; the top-right block (all 1s) becomes 1. The pooled image is a quarter the size but keeps the same overall pattern — "there's an edge between the left and right halves" survives the downsampling.

## Bench

```bench
id: pad-stride-pool
title: Padding, stride and pooling, side by side
fallback: An image with adjustable padding and stride on a convolution, plus a separate max-pooling view. Watch the output size change as each setting changes.
```

**Try this**

1. Set padding to 0 and compare the output size to padding 1 ("same") on a 3×3 filter.
2. Increase stride from 1 to 2 and watch the output shrink by roughly half.
3. Switch to the pooling view and compare the result to a convolution with the same window size.

**What you should notice:** padding and stride are settings *within* a convolution; pooling is a separate, weight-free operation that shrinks a feature map afterward — both can downsample, but only pooling has no learned parameters at all.

## Where it appears in AI

* **"Same" padding** is the default in many modern architectures, so stacking many convolutional layers doesn't shrink the image away to nothing before the network is deep enough to need it.
* **Strided convolutions** are often used instead of pooling in modern designs, letting the downsampling itself be learned rather than fixed.
* **Max pooling** historically appeared throughout early CNN designs (see [[CNN Architectures: From LeNet to ResNet]]) to shrink feature maps between convolutional blocks.

## Common pitfalls

* **Forgetting padding changes the output size, not the filter's behaviour.** The filter still only sees real pixels (plus zeros) under it; padding just lets it reach positions it otherwise couldn't.
* **Assuming pooling always uses the maximum.** Average pooling is common too, and behaves differently — maxima pick out the strongest activation in a region, averages smooth it.
* **Losing track of how much a stack of strided or pooled layers has shrunk the image overall**, which affects both the final feature map size and the [[Receptive Fields and Depth|receptive field]] of later layers.

## Quick check

<details><summary>1. What padding keeps a convolution's output the same size as its input, for a 3×3 kernel and stride 1?</summary>
Padding of 1 on each side ("same" padding).
</details>

<details><summary>2. How does stride 2 change a convolution's output size compared to stride 1?</summary>
It roughly halves the number of output positions in that dimension, since the filter now jumps two positions at a time instead of one.
</details>

<details><summary>3. Does max pooling have any learned weights?</summary>
No — it simply takes the maximum value in each patch; there is nothing to train in a pooling layer itself.
</details>

## Key terms

* **Padding:** adding a border (usually zeros) around an input so a filter can reach its edges.
* **Stride:** the step size a filter moves between positions.
* **Pooling:** summarising each small patch of a feature map with one number (commonly the maximum or average), with no learned weights.

## Related

[[The Convolution Operation]] · [[Filters, Feature Maps and Channels]] · [[Receptive Fields and Depth]] · [[CNN Architectures: From LeNet to ResNet]]
