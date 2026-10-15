The **universal approximation theorem** says a feedforward network with just one hidden layer of sigmoid (or similarly-shaped) units can approximate any continuous function on a bounded input, as closely as you like — provided the hidden layer is wide enough. It is a statement about what a network *can* represent, not about whether training will find that representation.

**You need:** [[The Multilayer Feedforward Network]] and [[Continuity]].

## The question it answers

"Is one hidden layer, in principle, ever enough — or do I always need to go deeper?" Depth is not required for raw representational power; one hidden layer can already represent (almost) anything continuous, if it is allowed to be as wide as needed.

## Intuition: build the curve out of soft steps

A sigmoid unit, scaled and shifted, behaves like a soft step: nearly 0, then a smooth rise, then nearly 1. Add enough of these soft steps at different locations and heights, and their sum can trace out almost any smooth curve — much like approximating a curve with enough small, overlapping steps. More hidden units means more steps available, and finer control over the shape.

## Definitions

```text
f̂(x) = Σᵢ wᵢ · σ(k(x − cᵢ)) + b        σ = sigmoid, k = steepness, cᵢ = unit i's centre
```

As the number of units `n → ∞` (with centres spread across the input range), `f̂` can approximate any continuous `f` on a bounded interval to any accuracy `ε > 0`. The theorem guarantees such weights *exist*; it says nothing about how many units are needed in practice, or whether gradient descent will find good weights (see [[Why Depth Helps]] for what width alone can cost).

## A worked example

Target function `f(x) = sin(3x)` on `x ∈ [−1, 1]`. Fit sigmoid-unit networks of different widths by least squares (steepness `k = 8`, centres spread evenly) and measure the mean squared fitting error:

```text
hidden units     1       2        4         8         16        32
MSE           (large)  0.209   0.0027   0.00007   0.00001   0.00001
```

Error falls by roughly two orders of magnitude each time the width doubles from 2 to 8, then levels off near the limits of this fitting method — exactly the "approximate arbitrarily well, given enough units" behaviour the theorem predicts.

## Bench

```bench
id: universal-bumps
title: Approximating a curve with sigmoid bumps
fallback: A target wiggly curve and a fitted sum of sigmoid units. Increase the number of hidden units with a slider and watch the fitted curve converge onto the target, with the fitting error printed out.
```

**Try this**

1. Start at 1 hidden unit and watch how poor the fit is.
2. Increase units a few at a time and watch the fitted curve hug the target more closely.
3. Watch where the fit error stops improving — more units eventually buys very little extra.

**What you should notice:** the fitted curve is a sum of soft steps; with few units, you can see individual steps in the fit, but with many units they blend into a smooth approximation of the target.

## Where it appears in AI

* **Why one-hidden-layer networks are not useless** — they are theoretically universal, which is why early neural-network theory could prove something positive before deep networks became practical.
* **Why depth became the practical choice anyway:** going wide can need exponentially many units for some functions, while going deep needs far fewer (next: [[Why Depth Helps]]).
* **Kernel methods** (see [[Kernel Methods]]) rely on a related idea: enough well-placed basis functions can represent a rich space of functions.

## Common pitfalls

* **Treating the theorem as a training guarantee.** It proves suitable weights exist, not that gradient descent will find them from random initialization.
* **Thinking "one hidden layer is enough" in practice.** Enough can mean an impractically large number of units for some functions; see [[Why Depth Helps]].
* **Forgetting it needs a bounded input.** The guarantee is for inputs confined to some finite region, not the whole real line.

## Quick check

<details><summary>1. What does the universal approximation theorem actually guarantee?</summary>
That for any continuous function on a bounded input and any accuracy target, there exists a one-hidden-layer network wide enough to achieve it — not that training will find it.
</details>

<details><summary>2. In the worked example, what happened to the fitting error as hidden units increased from 2 to 8?</summary>
It fell by roughly three orders of magnitude (0.209 to 0.00007), illustrating the theorem's "wide enough" clause concretely.
</details>

<details><summary>3. Does the theorem explain why modern networks are deep rather than just wide?</summary>
No — it only shows one hidden layer can suffice in principle; it says nothing about efficiency, which is where depth's advantage comes in.
</details>

## Key terms

* **Universal approximation theorem:** a sufficiently wide one-hidden-layer network can approximate any continuous function on a bounded input.
* **Representational power:** what a model family can express, independent of whether training finds it.
* **Soft step:** a scaled, shifted sigmoid used as a building block for approximating curves.

## Related

[[The Multilayer Feedforward Network]] · [[Continuity]] · [[Why Depth Helps]] · [[Kernel Methods]]
