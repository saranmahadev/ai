An **artificial neuron** is a dot product plus a bias, passed through a non-linear **activation function**: `a = f(w · x + b)`. The dot product and bias are exactly the score a [[The Perceptron|perceptron]] or [[Logistic Regression and the Sigmoid|logistic regression]] computes; what varies across architectures is the choice of `f`. That choice decides how easily a deep stack of these neurons trains at all.

**You need:** [[From Linear Models to Neural Networks]] and [[Dot Product]].

## The question it answers

"Given the score `z = w · x + b`, what should the neuron actually output?" [[Logistic Regression and the Sigmoid|Sigmoid]] squashes `z` into a probability-like `(0, 1)` value, but it is only one of several choices, and the choice has large, practical consequences once neurons are stacked many layers deep.

## Intuition: a kink, and how sharp it is

Every activation function does the same job — add a kink so stacking is not pointless — but the kinks look very different. Sigmoid and tanh squash every input into a narrow band and go almost flat away from zero. ReLU (`max(0, z)`) is flat on one side and a perfect, unchanging slope of 1 on the other — it never squashes the positive side at all. Leaky ReLU and GELU are small fixes to ReLU's two weaknesses: a completely dead negative side, and a sharp corner at zero.

## Definitions

```text
sigmoid(z)      = 1 / (1 + e^-z)                      range (0, 1)
tanh(z)         = (e^z − e^-z) / (e^z + e^-z)          range (−1, 1)
ReLU(z)         = max(0, z)                            range [0, ∞)
leaky ReLU(z)   = z if z > 0 else 0.01·z                range (−∞, ∞)
GELU(z)         ≈ z · Φ(z)   (a smoothed ReLU using the normal CDF Φ)
```

A unit is **saturated** at an input where its slope is close to zero — sigmoid and tanh saturate for any `z` far from 0; ReLU saturates (exactly to zero slope) for every negative `z`, but never for positive `z`.

## A worked example

Compare sigmoid and ReLU at several inputs, with the slope `f'(z)` measured numerically:

```text
z       sigmoid(z)   sigmoid'(z)    ReLU(z)   ReLU'(z)
-4      0.0180       0.0177         0.0000    0.0000
-1      0.2689       0.1966         0.0000    0.0000
 0      0.5000       0.2500         0.0000    0.5000 (undefined point, taken as 0.5)
 1      0.7311       0.1966         1.0000    1.0000
 2      0.8808       0.1050         2.0000    1.0000
 4      0.9820       0.0177         4.0000    1.0000
```

At `z = 4`, sigmoid's slope has fallen to 0.0177 — training signal flowing back through this unit is multiplied by that tiny number — while ReLU's slope is still a full 1.0000. Stack many sigmoid units in a row and that shrinkage compounds; this is the seed of [[Vanishing and Exploding Gradients]], and one reason ReLU became the default for deep networks.

## Bench

```bench
id: activation-zoo
title: Activation functions and their slopes
fallback: Pick an activation function and an input z; see its curve, the tangent line at z (the slope used when training), and the function and slope values printed out.
```

**Try this**

1. Set `z` to a large positive value under sigmoid and watch the tangent line flatten.
2. Switch to ReLU at the same `z` and compare the slope.
3. Move `z` negative under ReLU, then under leaky ReLU, and compare what happens to the slope.
4. Try GELU near `z = 0` and compare its corner to ReLU's.

**What you should notice:** sigmoid and tanh's slopes shrink toward zero the further `z` is from 0 in either direction; ReLU's slope is either exactly 0 or exactly 1, with a sharp corner at `z = 0` that leaky ReLU and GELU both soften.

## Where it appears in AI

* **ReLU and its variants** are the default hidden-layer activation in almost every modern deep network.
* **Sigmoid** survives at output layers for binary probabilities, and inside gates (see [[Long Short-Term Memory]]).
* **GELU** is the default in many transformer-based architectures.
* **tanh** appears inside vanilla [[Recurrent Neural Networks]] and LSTM candidate values, where a zero-centred output helps.

## Common pitfalls

* **"Dead" ReLU units.** A unit whose input is always negative outputs zero forever and never gets a training signal; leaky ReLU and GELU exist partly to avoid this.
* **Using sigmoid or tanh throughout a deep network.** Both saturate easily, which is exactly the mechanism behind vanishing gradients.
* **Forgetting the kink is the whole point.** An activation function that is itself linear (like `f(z) = 2z`) gives none of the benefit described in [[From Linear Models to Neural Networks]].

## Quick check

<details><summary>1. Why does a sigmoid unit stop learning when its input is very large or very negative?</summary>
Its slope approaches zero far from 0, so the gradient flowing back through it is multiplied by almost nothing.
</details>

<details><summary>2. What is a "dead" ReLU unit?</summary>
A unit whose input is always negative, so it always outputs zero and its slope is always zero — it never updates.
</details>

<details><summary>3. What problem does leaky ReLU fix that plain ReLU has?</summary>
It gives a small, non-zero slope on the negative side, so a unit that is currently negative can still receive a (small) training signal.
</details>

## Key terms

* **Activation function:** the non-linear function applied to a neuron's weighted sum.
* **Saturation:** a region of an activation function where its slope is close to zero.
* **ReLU:** `max(0, z)`, the most common hidden-layer activation in deep networks.
* **Dead unit:** a ReLU unit whose input is always negative, so it never activates or updates.

## Related

[[From Linear Models to Neural Networks]] · [[Logistic Regression and the Sigmoid]] · [[Vanishing and Exploding Gradients]] · [[The Multilayer Feedforward Network]]
