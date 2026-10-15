Convolutional architectures did not arrive all at once. **LeNet** (1998) showed a few convolution-and-pooling layers could read handwritten digits; **AlexNet** (2012) showed the same idea, made much deeper and trained on a GPU, could beat every prior approach on natural images by a wide margin; **VGGNet** (2014) showed you could go deeper still by stacking many small, uniform filters; **ResNet** (2015) showed how to keep going past the point where adding more layers had started making things worse.

**You need:** [[Padding, Stride and Pooling]] and [[Filters, Feature Maps and Channels]].

## The question it answers

"How did convolutional networks go from reading digits to recognising a thousand kinds of real-world object?" Mostly by getting deeper — and by each generation solving the specific problem that stopped the previous one from getting deeper still.

## Intuition: four generations, four lessons

* **LeNet** (Yann LeCun, 1998): a handful of convolution and pooling layers, proving the basic recipe — convolve, pool, repeat, then classify — works at all.
* **AlexNet** (Krizhevsky, Sutskever and Hinton, 2012): the same recipe, much deeper, trained on GPUs, using ReLU instead of saturating activations and dropout for regularisation — and it beat the previous best approach on ImageNet by a wide margin, igniting the deep learning boom in computer vision.
* **VGGNet** (Simonyan and Zisserman, 2014): replaced AlexNet's larger filters with a uniform stack of small 3×3 filters, going deeper (16–19 layers) while keeping the design simple and regular.
* **ResNet** (He et al., 2015): discovered that simply stacking more layers eventually made networks *worse*, not better — and fixed it with the idea in [[Residual and Skip Connections]], reaching over a hundred layers.

## Definitions

```text
LeNet    (1998)   a few conv+pool layers, for digit recognition
AlexNet  (2012)   deeper, ReLU, dropout, GPU-trained; ImageNet breakthrough
VGGNet   (2014)   16-19 layers, uniform small (3×3) filters throughout
ResNet   (2015)   adds skip connections; scales past 100 layers
```

## A worked example

VGG's "small filters, more layers" idea, counted in weights: a single 5×5 filter versus two stacked 3×3 filters, both covering the same 5×5 patch of the input (per input–output channel pair):

```text
one 5×5 filter:       5 × 5 = 25 weights
two stacked 3×3s:      9 + 9 = 18 weights, plus a non-linearity between them
```

Two small filters cover exactly the same input area (stacking two 3×3 convolutions grows the receptive field by `(3−1)+(3−1) = 4`, matching a single 5×5's reach) using *fewer* weights, and add an extra non-linear kink in between — strictly more expressive for less cost, which is exactly the trade VGG made throughout its design.

## Bench

```bench
id: architecture-timeline
title: Four generations of CNN design
fallback: A timeline of LeNet, AlexNet, VGGNet and ResNet. Pick one to see its year, rough depth, and the one design idea it introduced, and compare the weight cost of a 5×5 filter against two stacked 3×3 filters.
```

**Try this**

1. Step through the four architectures in order and read what each one added over the last.
2. Compare AlexNet's depth to VGGNet's — both solved different bottlenecks of their time.
3. Toggle the filter-size comparison and see the weight-count difference for yourself.

**What you should notice:** each generation's one headline idea exists to remove whatever was stopping the previous generation from going deeper or wider.

## Where it appears in AI

* **"Backbones" built on these ideas** (or ResNet directly) remain common starting points for vision tasks even now, often reused via [[Transfer Learning and Fine-Tuning]] rather than retrained from scratch.
* **ImageNet**, the benchmark these architectures competed on, was itself a major driver of the deep learning boom in computer vision.
* **VGG's "small filters, more layers" principle** generalised well beyond VGG itself and influenced most architectures that followed.

## Common pitfalls

* **Assuming newer always means strictly better for every use case.** VGGNet is simple and still used as a feature extractor; ResNet's extra machinery (skip connections) is only needed once depth is large enough for degradation to bite.
* **Forgetting AlexNet's breakthrough was partly about engineering, not only architecture** — GPU training made training a network of that depth practical at all.
* **Treating these as the only four CNN designs that matter.** They are the four that marked a clear jump in what became possible; many refinements followed each one.

## Quick check

<details><summary>1. What was LeNet's main contribution?</summary>
It demonstrated the basic convolution-and-pooling recipe could successfully read handwritten digits, establishing the pattern later architectures built on.
</details>

<details><summary>2. What two choices, beyond depth, did AlexNet make that are now near-universal in deep networks?</summary>
Using ReLU instead of saturating activations, and using dropout for regularisation.
</details>

<details><summary>3. Why does VGGNet's "two 3×3 filters instead of one 5×5" trade make sense, by the numbers?</summary>
Both cover the same receptive field, but two 3×3 filters use fewer total weights (18 versus 25) and add an extra non-linearity in between.
</details>

## Key terms

* **LeNet, AlexNet, VGGNet, ResNet:** four landmark CNN architectures, each solving a bottleneck of the one before it.
* **ImageNet:** the large-scale image classification benchmark these architectures competed on.
* **Backbone:** a pretrained architecture (often one of these) reused as the starting point for another vision task.

## Related

[[Padding, Stride and Pooling]] · [[Filters, Feature Maps and Channels]] · [[Residual and Skip Connections]] · [[Transfer Learning and Fine-Tuning]]
