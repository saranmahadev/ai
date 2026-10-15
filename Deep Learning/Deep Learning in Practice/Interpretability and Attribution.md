[[Feature Visualization|Saliency maps]] are a first, useful attempt at attribution — but a single gradient at a single point can be noisy and can miss the bigger picture. **Integrated gradients** and **Grad-CAM** are two more deliberately-designed attribution methods, built specifically for deep networks, that address different weaknesses in that simple approach.

**You need:** [[Feature Visualization]] and [[Interpreting Models]].

## The question it answers

"A plain saliency map is a start, but can attribution be made more reliable, or more human-readable?" Yes, in two different directions: **integrated gradients** make attribution mathematically more principled (summing attributions recovers the exact change in output), and **Grad-CAM** makes it visually more readable by operating on coarser, more meaningful regions instead of individual pixels.

## Intuition: averaging the whole journey, not just the last step

A single-point gradient (plain saliency) only reports the slope exactly where the input currently sits — if the function's slope changes sharply nearby, that one snapshot can be misleading. **Integrated gradients** instead walks a straight path from a neutral **baseline** input (often all zeros) to the actual input, averaging the gradient *along the whole journey*, not just at the destination. This single change buys a precise mathematical guarantee: the sum of all the attributions exactly equals the difference between the model's output at the real input and at the baseline — nothing is left unaccounted for.

## Definitions

```text
integrated gradients (1D, for intuition):

IG(x) = (x − x₀) · ∫₀¹ f'(x₀ + t(x − x₀)) dt        (x₀ = baseline, x = actual input)

completeness property:  IG(x) = f(x) − f(x₀)          exactly, for the true integral
```

Grad-CAM instead weights a late convolutional layer's feature-map channels by how much each one's average gradient contributed to the prediction, then combines those weighted channels into one coarse heatmap over the image — coarser than per-pixel saliency, but usually far more interpretable to a human.

## A worked example

A toy "model" `f(x) = x²`, baseline `x₀ = 0`, actual input `x = 2`:

```text
exact integrated-gradients attribution:  (2 − 0) · ∫₀¹ f'(2t) dt = (2 − 0) · ∫₀¹ 4t dt = 2 × 2 = 4

check against completeness:  f(2) − f(0) = 4 − 0 = 4      ✓ exact match

approximated with a Riemann sum of m steps (how it's actually computed for real models, where no closed form exists):
m=1:   8.000     m=5:   4.800     m=10:  4.400     m=50:  4.080
```

The approximation converges toward the exact value of 4 as the number of steps grows — with only one step, the approximation is noticeably off (matching the "single gradient snapshot" weakness integrated gradients is built to fix); by fifty steps, it is already quite close.

## Bench

```bench
id: integrated-gradients
title: Walking the path from a baseline to the input
fallback: A toy function, a baseline and an input. See the integrated-gradients attribution approximated with more or fewer path steps, converging toward the exact change in output.
```

**Try this**

1. Set the number of path steps to 1 and compare the (poor) approximation to the exact value.
2. Increase the number of steps and watch the approximation converge.
3. Change the baseline and see how the attribution (and the exact completeness check) changes.

**What you should notice:** more steps along the path always get closer to the exact value — the same way a Riemann sum converges to a true integral — which is why real implementations use enough steps (often 20–300) to approximate the integral well.

## Where it appears in AI

* **Debugging a model's predictions**, beyond just visualizing what it generally looks for, often uses exactly these attribution methods to explain one specific decision.
* **Grad-CAM-style heatmaps** are common in medical imaging and other high-stakes vision applications, where a human needs to check *where* a model focused, not just what it predicted.
* **Regulatory and trust requirements** in some domains increasingly expect some form of attribution or explanation alongside a model's prediction, not the prediction alone.

## Common pitfalls

* **Choosing a baseline that isn't actually neutral for the task.** An all-zero baseline may not represent "no information" for every kind of input, and a poorly chosen baseline can produce misleading attributions.
* **Using too few path steps in integrated gradients.** As the worked example shows, very few steps can produce an attribution noticeably different from the true value.
* **Treating any attribution method's output as a complete causal explanation.** These methods describe sensitivity and contribution under specific mathematical definitions, not necessarily the full story of "why" a model decided what it did.

## Quick check

<details><summary>1. What mathematical guarantee does integrated gradients provide that a plain saliency map does not?</summary>
Completeness: the sum of all attributions exactly equals the difference between the model's output at the actual input and at the baseline.
</details>

<details><summary>2. In the worked example, why did using only 1 path step give such a poor approximation?</summary>
A single step only evaluates the gradient at one point along the path (at t=1, the far end), missing how the gradient changes elsewhere along the journey from the baseline.
</details>

<details><summary>3. How does Grad-CAM differ from per-pixel saliency, in what it highlights?</summary>
It operates on a late convolutional layer's coarser feature-map regions rather than individual pixels, typically producing a more human-readable heatmap at the cost of spatial precision.
</details>

## Key terms

* **Integrated gradients:** an attribution method that averages the gradient along a path from a baseline input to the actual input.
* **Baseline:** the neutral reference input (often all zeros) integrated gradients measures attribution relative to.
* **Completeness:** the property that attributions sum exactly to the change in output between the input and the baseline.

## Related

[[Feature Visualization]] · [[Interpreting Models]] · [[Adversarial Examples and Robustness]] · [[Ethics and Safety of Deep Systems]]
