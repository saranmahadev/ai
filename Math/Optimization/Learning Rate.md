The **learning rate** `η` sets how big each gradient-descent step is. Too small and training crawls; too large and it overshoots, bounces around, or blows up. Choosing it well is one of the most important practical decisions in training a model.

**You need:** [[Gradient Descent]] and [[Higher Derivatives and Curvature]].

## The question it answers

"How far should I step each time?" The gradient gives a direction and a local slope, but says nothing about how far the slope stays valid.

## Intuition: a walker on a curved bowl

On `f(w) = w²` the update is `w ← w − η · 2w = (1 − 2η) w`. Each step multiplies `w` by the factor `1 − 2η`. What happens depends on that factor:

```text
η = 0.1:   factor 0.8    steady approach to 0
η = 0.5:   factor 0      lands on the minimum in one step
η = 0.9:   factor −0.8   jumps across the minimum, but still shrinks
η = 1.0:   factor −1     bounces between +w and −w forever
η = 1.1:   factor −1.2   bounces and grows: diverges
```

So the safe range is `0 < η < 1` here. In general, for curvature `λ` (the second derivative), stability needs `η < 2/λ`.

## Curved and stretched landscapes

Real losses curve differently in different directions. For `f(x, y) = x² + 10y²`, the `y` direction has curvature `20` and the `x` direction `2`. Stability requires `η < 2/20 = 0.1`, set by the *steepest* curvature. But then progress along the flat `x` direction is slow: its factor is `1 − 2η ≥ 0.8`. This tug-of-war is why plain gradient descent zig-zags in narrow valleys, and why schedules and smarter optimisers exist (see [[Momentum and Adam]]).

## A worked example

Start at `w = 4` on `f(w) = w²` and run 5 steps:

```text
η = 0.1:  4 → 3.2 → 2.56 → 2.05 → 1.64 → 1.31      slow but steady
η = 0.5:  4 → 0                                    perfect in one step
η = 1.1:  4 → −4.8 → 5.76 → −6.91 → 8.29 → −9.95    diverging
```

Common practice is to start with a moderate rate and **decay** it, taking large steps early and small careful steps near the minimum.

## Bench

```bench
id: lr-race
title: Too small, just right, too big
fallback: A slider sets the learning rate for gradient descent on a parabola; the bench plots the path of the parameter over 20 steps and reports whether it converges, oscillates or diverges.
```

**Try this**

1. Start at 0.1 and count steps until w is near zero.
2. Try 0.5, then 0.9, then 1.0.
3. Push above 1 and watch it diverge.
4. Use the bowl with two curvatures and find the largest safe rate.

**What you should notice:** there is a sweet spot, a stable range above which steps overshoot more than they correct, and a limit set by the steepest direction.

## Where it appears in AI

* **Hyperparameter tuning** almost always includes the learning rate.
* **Schedules** such as warm-up and decay change it during training.
* **Loss spikes and NaNs** often mean the rate is too high.

## Common pitfalls

* **Using one rate for everything** without checking the curve of the loss.
* **A rate so small** that training seems stuck.
* **Ignoring divergence signs:** a rapidly growing loss.
* **Comparing rates across different scales** of features or loss.

## Quick check

<details><summary>1. On f = w², what is the update factor for η = 0.25?</summary>
1 − 0.5 = 0.5.
</details>

<details><summary>2. For which η does gradient descent on w² diverge?</summary>
η > 1.
</details>

<details><summary>3. Why does the steepest direction limit the rate?</summary>
Stability requires η < 2 divided by the largest curvature.
</details>

## Key terms

* **Learning rate:** the step-size multiplier η.
* **Divergence:** the loss growing instead of shrinking.
* **Oscillation:** bouncing across a minimum.
* **Learning-rate schedule:** changing η over training.

## Related

[[Gradient Descent]] · [[Higher Derivatives and Curvature]] · [[Hessian]] · [[Momentum and Adam]] · [[Sequences and Series]]
