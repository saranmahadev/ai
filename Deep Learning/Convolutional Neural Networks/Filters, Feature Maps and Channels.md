A convolutional layer rarely uses just one filter. Each filter produces its own **feature map** — the grid of outputs from sliding that one filter over the whole input — and running several filters side by side produces several feature maps stacked together, called **channels**.

**You need:** [[The Convolution Operation]] and [[Dot Product]].

## The question it answers

"One filter finds one kind of pattern — how does a network look for several kinds at once?" Run several filters over the same input in parallel; each one's output is a separate channel, and together they describe the input from several angles at once.

## Intuition: several stencils, several reports

If one stencil reports where vertical edges are, a second reports where horizontal edges are, and a third reports where a particular texture is, laying their three reports side by side gives you a far richer description of the image than any single one alone. A layer with 32 filters produces 32 such reports — 32 channels — each specialising (after training) in some pattern the network found useful.

## Definitions

```text
one filter          → one feature map (a 2D grid of outputs)
F filters            → F feature maps, stacked into F channels

a later layer's filters must match the number of input channels:
  a filter over a C-channel input is itself C grids of weights, one per input channel, summed together
```

So a layer's filter is not really 2D — it is 2D-per-channel, with one small grid for every channel in its input, and all of those channel-wise sums are added together to produce one output value (before moving to the next filter).

## A worked example

A 5×5 toy "corner" image, run through two different 2×1 filters:

```text
image                     vertical-edge filter [1,-1]      horizontal-edge filter [1; -1]
0 0 0 0 0                 0  0  0  0                        0  0  0  0  0
0 0 0 0 0                 0  0  0  0                        0  0 -1 -1 -1
0 0 1 1 1                 0 -1  0  0                        0  0  0  0  0
0 0 1 1 1                 0 -1  0  0                        0  0  0  0  0
0 0 1 1 1                 0 -1  0  0
```

The first filter's feature map lights up along the corner's *vertical* edge; the second's lights up along its *horizontal* edge — two channels, each reporting a different aspect of the same image.

## Bench

```bench
id: channel-stack
title: Two filters, two feature maps
fallback: A toy image with two adjustable 2-weight filters. See both resulting feature maps side by side, and watch how changing either filter's weights changes only its own channel.
```

**Try this**

1. Keep the default edge filters and compare which parts of each feature map light up.
2. Change one filter's weights to something that responds to flat (constant) regions instead of edges, and see its feature map change completely while the other channel is unaffected.
3. Switch to a different toy image and see both feature maps update for the new shape.

**What you should notice:** each feature map only ever depends on its own filter's weights — changing one filter never changes the other channel's output.

## Where it appears in AI

* **Early CNN layers** tend to learn low-level filters (edges, colour blobs); later layers' channels respond to increasingly complex combinations (see [[What Deep Networks Learn]]).
* **Channel counts grow with depth** in most CNN designs: early layers might have 32–64 channels, later ones several hundred, even as the spatial size (height × width) shrinks.
* **Colour images start with 3 channels** (red, green, blue) rather than 1 — the very first convolutional layer's filters are already 3D for exactly this reason.

## Common pitfalls

* **Thinking of a filter as purely 2D once a layer has multiple input channels.** It has one 2D grid per input channel; the outputs across channels are summed, not kept separate.
* **Confusing "feature map" with "channel."** A feature map is the specific output grid from one filter; "channel" is how that output (or an input like RGB) is indexed when stacked with others.
* **Assuming more filters is always better.** Every additional filter adds parameters and compute; width here, as elsewhere (see [[Why Depth Helps]]), is a trade-off, not a free upgrade.

## Quick check

<details><summary>1. If a convolutional layer has 16 filters, how many channels does its output have?</summary>
16 — one channel (feature map) per filter.
</details>

<details><summary>2. If a layer's input has 3 channels, is each of its filters still a single 2D grid?</summary>
No — each filter has one 2D grid per input channel (3, here), and the three channel-wise results are summed into one output value.
</details>

<details><summary>3. In the worked example, why does changing the horizontal-edge filter's weights not affect the vertical-edge filter's feature map?</summary>
Each filter and its feature map are entirely independent; they only share the same input image, not any weights.
</details>

## Key terms

* **Feature map:** the 2D grid of outputs produced by sliding one filter over an input.
* **Channel:** one "layer" of a stack of feature maps (or of an input like RGB).
* **Filter depth:** the number of 2D grids making up one filter, equal to its input's channel count.

## Related

[[The Convolution Operation]] · [[Dot Product]] · [[Padding, Stride and Pooling]] · [[What Deep Networks Learn]]
