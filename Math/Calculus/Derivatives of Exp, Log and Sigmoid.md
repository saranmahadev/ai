Three families of functions carry most of machine learning: the exponential `eˣ`, the natural logarithm `ln x`, and the sigmoid `σ(x)`. Their derivatives are unusually neat: `eˣ` is its own derivative, `ln x` has slope `1/x`, and the sigmoid's slope is built from its own value.

**You need:** [[Derivative Rules]], [[Chain Rule]] and [[Exponential and Logarithmic Functions]].

## The question it answers

"What are the slopes of the functions I keep meeting in models?" Loss functions use logs, softmax uses exponentials, and activations use sigmoids and tanh, so their derivatives are computed constantly.

## The results

```text
d/dx eˣ         = eˣ
d/dx e^(kx)     = k · e^(kx)                  (chain rule)
d/dx ln x       = 1 / x
d/dx aˣ         = aˣ · ln a
d/dx σ(x)       = σ(x) · (1 − σ(x))           σ(x) = 1 / (1 + e⁻ˣ)
d/dx tanh x     = 1 − tanh² x
```

Why is `eˣ` special? It is the function whose slope at every point equals its height, the natural pattern of "growth proportional to the current size" (see [[Exponential and Logarithmic Functions]]). `ln x` is its inverse, so its slope is the reciprocal: `1/x`, steep near 0 and flattening as `x` grows.

## The sigmoid's slope

Using the chain rule on `σ(x) = (1 + e⁻ˣ)⁻¹` gives the tidy identity `σ′ = σ(1 − σ)`. The slope is largest at `x = 0` (where `σ = 0.5`) and vanishes at both ends.

## A worked example

```text
σ′(0) = 0.5 × 0.5                    = 0.25        the steepest point
σ′(2) = 0.8808 × (1 − 0.8808)        ≈ 0.1050
σ′(6) = 0.99753 × 0.00247            ≈ 0.0025      nearly flat
```

Slope of `ln x` at `x = 2`: `1/2 = 0.5`. At `x = 0.1`: `10`, very steep.

A log-loss example: the loss `−ln p` for a predicted probability `p` has slope `−1/p`. At `p = 0.9` the slope is `−1.11` (gentle); at `p = 0.01` it is `−100` (steep), so the model is pushed hard when it is confidently wrong.

**Vanishing gradients:** stacking many sigmoid layers multiplies slopes each at most 0.25, so after 10 layers the signal may shrink by `0.25¹⁰ ≈ 10⁻⁶`.

## Bench

```bench
id: derivative-twin
title: A function and its derivative
fallback: Choose e to the x, ln x, sigmoid or tanh; the bench draws the function and its derivative together, with a marker that shows the tangent slope at the chosen input.
```

**Try this**

1. On e^x, compare the height and the slope at several points.
2. On the sigmoid, find where the slope is largest.
3. Slide toward the ends of the sigmoid and read the slope.
4. On ln x, slide toward 0 and see the slope grow.

**What you should notice:** e^x has slope equal to its height, the sigmoid is steepest in the middle and flat at the ends, and ln x flattens as it grows.

## Where it appears in AI

* **Softmax and cross-entropy** combine `eˣ` and `ln` (see [[Softmax and Cross-Entropy in Practice]]).
* **Logistic regression** trains through the sigmoid (see [[Logistic Regression and the Sigmoid]]).
* **Vanishing gradients** in deep sigmoid or tanh networks.

## Common pitfalls

* **Differentiating `e^(2x)` as `e^(2x)`.** Remember the factor 2.
* **Writing `d/dx ln x = ln x`** or mixing with `eˣ`.
* **Forgetting `ln` is undefined for zero and negatives.**
* **Overlooking the sigmoid's flat tails** when picking an activation.

## Quick check

<details><summary>1. What is d/dx of e^(3x)?</summary>
3e^(3x).
</details>

<details><summary>2. What is σ′ when σ = 0.9?</summary>
0.9 × 0.1 = 0.09.
</details>

<details><summary>3. What is the slope of ln x at x = 4?</summary>
1/4 = 0.25.
</details>

## Key terms

* **Natural exponential:** `eˣ`, equal to its own derivative.
* **Natural logarithm:** `ln x`, the inverse of `eˣ`.
* **Sigmoid:** `1 / (1 + e⁻ˣ)`, with slope `σ(1 − σ)`.
* **Vanishing gradient:** slopes shrinking toward zero through many layers.

## Related

[[Exponential and Logarithmic Functions]] · [[Functions AI Loves]] · [[Chain Rule]] · [[Logistic Regression and the Sigmoid]] · [[Softmax and Cross-Entropy in Practice]]
