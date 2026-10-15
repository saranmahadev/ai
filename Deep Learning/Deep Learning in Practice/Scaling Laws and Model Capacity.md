[[Overfitting and Double Descent|Double descent]] showed overparameterized models often generalise well. **Scaling laws** go further: empirical research has repeatedly found that, across many orders of magnitude, a model's loss falls in a smooth, predictable **power-law** relationship as parameters, data, or compute grow — with sharply diminishing returns the bigger the model gets.

**You need:** [[Overfitting and Double Descent]] and [[Why Depth Helps]].

## The question it answers

"Does making a model bigger always help proportionally, or does the benefit taper off?" It tapers off — in a very specific, mathematically regular way: loss tends to fall roughly as a power of the scale (parameters, data, or compute), meaning each further order-of-magnitude increase buys a shrinking, predictable improvement, not a constant one.

## Intuition: diminishing returns, but *predictably* diminishing

Going from 1 to 10 employees might double a small business's output; going from 10,000 to 10,010 employees would barely move it at all — the *relative* gain from adding more shrinks as scale grows. A power-law scaling relationship is a precise, quantifiable version of exactly that intuition: multiplying the scale by a fixed factor (say, 10×) always reduces the loss by roughly the same *relative* amount, however big the model already is — which is a much more specific and useful statement than just "bigger is better, with diminishing returns."

## Definitions

```text
loss(N) ≈ a · N^(−α) + c           (N = scale — parameters, data, or compute; α, a, c are fitted constants)

on a log-log plot of (loss − c) against N, this relationship is a straight line of slope −α
```

## A worked example

An illustrative power-law curve, `loss(N) = 10 · N^(−0.3) + 1.5`, evaluated at five scales spanning four orders of magnitude:

```text
N (parameters)    10⁶       10⁷       10⁸       10⁹       10¹⁰
loss             1.6585    1.5794    1.5398    1.5200    1.5100
```

Going from `10⁶` to `10¹⁰` parameters — ten thousand times more parameters — only reduces loss from about 1.66 to about 1.51, a modest improvement despite the enormous increase in scale. Plotting `log₁₀(loss − 1.5)` against `log₁₀(N)` gives exactly a straight line with slope `−0.3`, the defining signature of a true power-law relationship.

## Bench

```bench
id: scaling-law
title: Diminishing returns on a log-log scale
fallback: A power-law loss curve with an adjustable exponent. See the loss values at several scales, and the same relationship plotted on a log-log axis as a straight line.
```

**Try this**

1. Compare the loss at two scales ten times apart and note how small the improvement is at large scale.
2. Switch to the log-log view and confirm the curve is a straight line.
3. Change the exponent and see how it changes the line's steepness — a larger exponent means scale helps more per order of magnitude.

**What you should notice:** the ordinary (linear-scale) plot makes improvements at large scale look negligible; the log-log plot reveals that the same relationship is perfectly regular and predictable throughout — it's the display, not the underlying law, that makes large-scale gains look small.

## Where it appears in AI

* **Research on scaling large language models** found that loss follows this kind of power-law behaviour remarkably consistently across many orders of magnitude of parameters, data and compute, which has directly informed decisions about how large to train new models.
* **The exact exponents and constants are specific to a given model family, dataset and training setup** — the power-law *shape* generalises well; the specific numbers do not transfer automatically between very different setups.
* **Scaling laws inform compute allocation**: given a fixed training budget, research in this area has studied how to split it between more parameters versus more data for the best resulting loss.

## Common pitfalls

* **Assuming a power law continues forever.** Real relationships eventually deviate from the idealised power-law fit at extreme scales, for all kinds of practical reasons (data quality limits, architecture limits, and others).
* **Confusing "diminishing returns" with "no returns."** The relative improvement shrinks, but a true power law keeps improving, just more slowly — it never becomes exactly flat.
* **Reading a linear-scale plot and concluding scale "stopped mattering."** The same relationship looks dramatically different depending on whether the axes are linear or logarithmic; the log-log view is what reveals the underlying regularity.

## Quick check

<details><summary>1. What is the defining visual signature of a true power-law relationship?</summary>
A straight line when plotted with both axes on a logarithmic scale.
</details>

<details><summary>2. In the worked example, why does a ten-thousand-fold increase in parameters only modestly reduce loss?</summary>
The relationship follows a power law with a fairly small exponent (0.3 here), so each order-of-magnitude increase in scale buys a shrinking, though still real, relative improvement.
</details>

<details><summary>3. Do the specific exponent and constants from one model's scaling study transfer directly to a very different model or dataset?</summary>
Not necessarily — the power-law *shape* tends to generalise, but the specific fitted numbers are usually particular to that model family, dataset and training setup.
</details>

## Key terms

* **Power law:** a relationship where one quantity scales as a fixed power of another, appearing as a straight line on a log-log plot.
* **Scaling law (in deep learning):** an empirical power-law relationship between a model's loss and its scale (parameters, data, or compute).
* **Diminishing returns:** a shrinking relative improvement from each further increase in scale.

## Related

[[Overfitting and Double Descent]] · [[Why Depth Helps]] · [[Mixture of Experts]] · [[Deep Learning Across Modalities]]
