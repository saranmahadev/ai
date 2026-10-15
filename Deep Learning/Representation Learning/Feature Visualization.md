A trained network is millions of numbers that produced a correct answer — but *which* numbers mattered, and what pattern was each hidden unit actually responding to? **Feature visualization** is the family of techniques for answering that by looking, directly or indirectly, at what drives a unit's activation or a prediction's outcome.

**You need:** [[Filters, Feature Maps and Channels]] and [[The Artificial Neuron and Activation Functions]].

## The question it answers

"The network works — but what did it actually learn to look for?" Several different, complementary ways exist to find out: looking at a filter's own weights directly, finding the input that most excites a given unit, or measuring how sensitive the output is to each input pixel.

## Intuition: three different questions about the same network

**Looking at filter weights directly** works for the very first layer of a CNN — its filters act straight on raw pixels, so their weights can themselves be drawn as little image patches, often resembling edge or colour detectors. **Activation maximization** asks a different question: starting from a blank or random image, nudge it (by gradient ascent, the same optimisation machinery as training, but on the *input* instead of the weights) toward whatever makes a chosen unit fire as strongly as possible. **Saliency** asks yet another question, at the level of one specific prediction: how much would the output change if this particular pixel moved slightly? — directly measurable as the gradient of the output with respect to that input pixel.

## Definitions

```text
saliency(pixel) ≈ ∂(output probability) / ∂(that pixel's value)

estimated numerically:  saliency ≈ [predict(image + ε at that pixel) − predict(image)] / ε
```

A large positive saliency at a pixel means nudging it up would increase the predicted probability; a large negative saliency means the opposite; a saliency near zero means that pixel barely matters to this particular prediction.

## A worked example

Using [[Image Classification End to End|the toy CNN pipeline]]'s "corner" image and its class-0 probability (0.7311), nudge each pixel up slightly and measure the resulting change:

```text
saliency map (class-0 probability's sensitivity to each pixel):

-0.177   0.177   0.177  -0.177
-0.197   0.118   0.196  -0.118
-0.197   0.118   0.196  -0.118
-0.020  -0.059   0.020   0.059
```

The third column's pixels have the strongest *positive* saliency (around 0.18–0.20) — nudging any of them up would most increase the predicted probability — which lines up exactly with that example's convolution kernel, whose rightmost column carries weight `+1`.

## Bench

```bench
id: saliency-map
title: Which pixels matter to this prediction?
fallback: The toy CNN pipeline's prediction on an image, with a saliency map computed pixel by pixel showing how much nudging each one would change the predicted probability.
```

**Try this**

1. Compare the saliency map to the convolution kernel used in the pipeline and see where they line up.
2. Switch to a different toy image and see which pixels become most (and least) influential.
3. Flip a strongly negative-saliency pixel and watch the predicted probability actually move in the direction saliency predicted.

**What you should notice:** saliency is a *local* measure — it describes sensitivity around the current input, not a global statement about what the class "looks like" in general; different images can have very different saliency maps even for the same trained model.

## Where it appears in AI

* **Grad-CAM and similar methods**, not covered in full detail here, extend saliency-style ideas to highlight entire regions of an image rather than individual pixels, often more interpretable for real photographs.
* **Debugging misbehaving models** often starts with a saliency map: if a classifier is attending to background pixels rather than the actual object, that is visible evidence something is wrong.
* **Interpretability research broadly** (see [[Interpretability and Attribution]]) builds on exactly this family of techniques, applied at a larger scale and with more rigor than a single toy example.

## Common pitfalls

* **Treating a saliency map as a complete explanation.** It shows local sensitivity, not the full reasoning behind a prediction, and can sometimes be noisy or misleading on its own.
* **Confusing saliency (about one specific input) with activation maximization (about one unit, independent of any specific real input).** They answer related but different questions.
* **Forgetting saliency depends on the exact input.** The same unit or model can show a very different saliency pattern on a different image.

## Quick check

<details><summary>1. What does a large positive saliency value at a pixel mean?</summary>
Increasing that pixel's value would increase the predicted probability for the class being examined.
</details>

<details><summary>2. How does activation maximization differ from saliency?</summary>
Activation maximization starts from a blank or random image and optimises the image itself to maximise a unit's activation; saliency measures sensitivity around one specific, already-existing input.
</details>

<details><summary>3. In the worked example, why do the third column's pixels have the highest positive saliency?</summary>
The convolution kernel used in the pipeline weights that column by +1, so increasing those pixels most directly increases the class-0 score.
</details>

## Key terms

* **Saliency map:** a per-pixel measure of how sensitive a prediction is to small changes in that pixel.
* **Activation maximization:** optimising an input (rather than weights) to maximise a chosen unit's activation.
* **Filter visualization:** directly viewing a layer's filter weights as image patches, most interpretable at the first layer.

## Related

[[Filters, Feature Maps and Channels]] · [[The Artificial Neuron and Activation Functions]] · [[Image Classification End to End]] · [[Interpretability and Attribution]]
