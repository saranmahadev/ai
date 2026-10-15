A **convolution** slides a small grid of numbers — a **filter** or **kernel** — across an image, computing one weighted sum per position. Unlike a [[The Multilayer Feedforward Network|fully connected layer]], which has a separate weight for every input pixel, a convolution reuses the *same* small filter everywhere, which is exactly what lets it recognise a pattern no matter where in the image it appears.

**You need:** [[From Linear Models to Neural Networks]] and [[Matrix Multiplication]].

## The question it answers

"An image can have millions of pixels — must a dense layer really connect every one of them to every hidden unit?" No: if the thing you're looking for (an edge, a corner, a texture) is small and local, a small filter that slides over the whole image can find it anywhere, with far fewer weights than a dense layer would need.

## Intuition: a stencil, slid across a surface

Picture a small, patterned stencil moved one step at a time across a larger sheet. At every position, you note how well the patch of sheet under the stencil matches the stencil's own pattern — a high weighted sum where it matches well, a low one where it doesn't. A convolution is exactly this, done with numbers: multiply the filter's weights against the pixels currently underneath it, sum the products, and that sum is the output at that position.

## Definitions

```text
image (one channel)    a 2D grid of numbers
kernel                 a small 2D grid of weights, e.g. 3×3
output[y][x] = Σ_ky Σ_kx  image[y + ky][x + kx] · kernel[ky][kx]
```

This is **"valid" convolution** (no padding): the kernel never hangs off the edge of the image, so the output is slightly smaller than the input — see [[Padding, Stride and Pooling]] for how to control that.

## A worked example

A 6×6 toy image with a vertical edge down the middle, convolved with a 1×2 horizontal-difference kernel `[1, −1]`:

```text
image                          kernel [1, -1]         output
0 0 0 1 1 1                                           0 0 -1 0 0
0 0 0 1 1 1    (one row shown; all 6 rows identical)  0 0 -1 0 0
  ...                                                     ...
```

At each row, the output is `image[x] − image[x+1]`. Everywhere both neighbouring pixels are equal (0 and 0, or 1 and 1), the output is 0. Exactly at the edge (`x = 2`: pixel 0, next pixel 1), the output is `0 − 1 = −1` — the filter has located the edge, and only the edge.

## Bench

```bench
id: conv-slide
title: Sliding a filter across an image
fallback: A small image and an adjustable filter. Step the filter across every position and watch the output value computed at each one, with the current window highlighted on the image.
```

**Try this**

1. Step through the whole image with the edge-detecting filter `[1, −1]` and watch where the output is non-zero.
2. Switch to a different toy image (a corner, a blob) and see where the same filter responds.
3. Change the filter's weights and see what kind of pattern it responds to instead.

**What you should notice:** the filter's output is near zero wherever the image is locally uniform, and spikes exactly where the local pattern matches (or contrasts with) what the filter is built to detect — and this happens identically wherever that pattern occurs in the image.

## Where it appears in AI

* **Edge, corner and texture detectors** are exactly this operation with hand-designed filters; a convolutional network instead *learns* what filters to use.
* **Audio and time-series models** also use 1D convolutions, sliding a filter along time instead of across two spatial dimensions.
* **Every layer of a CNN** (see [[CNN Architectures: From LeNet to ResNet]]) is built from convolutions like this one, stacked and interspersed with non-linearities.

## Common pitfalls

* **Confusing convolution with correlation.** True mathematical convolution flips the kernel before sliding it; the operation used in deep learning (as described here) does not, and is sometimes called cross-correlation for that reason, though "convolution" is the universal name in practice.
* **Forgetting the output shrinks without padding.** A 6×6 image with a 1×2 kernel in "valid" mode produces a 6×5 output, not 6×6.
* **Thinking a filter only detects one exact pattern.** It responds by degree — strongly where the match is good, weakly or negatively where it is poor — not as a binary yes/no.

## Quick check

<details><summary>1. Why does convolution need far fewer weights than a dense layer over the same image?</summary>
The same small filter is reused at every position, instead of learning a separate weight for every pixel at every output location.
</details>

<details><summary>2. In the worked example, why is the output exactly 0 away from the edge?</summary>
Both pixels under the filter are equal there (both 0 or both 1), so their difference, and hence the filter's output, is 0.
</details>

<details><summary>3. What happens to the output's size if you slide a 1×2 filter over a 6-pixel-wide row with no padding?</summary>
It produces 5 output values, one fewer than the input width, since the filter cannot be centred at the last position without hanging off the edge.
</details>

## Key terms

* **Convolution:** sliding a small filter over an image (or signal) and computing a weighted sum at each position.
* **Kernel (filter):** the small grid of learned (or hand-designed) weights being slid across the input.
* **Valid convolution:** convolution with no padding, producing a smaller output than the input.

## Related

[[From Linear Models to Neural Networks]] · [[Matrix Multiplication]] · [[Filters, Feature Maps and Channels]] · [[Padding, Stride and Pooling]]
