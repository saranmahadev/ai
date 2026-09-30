A **linear function** `y = m·x + b` draws a straight line: `m` is its **slope** (how steeply it rises) and `b` is its **intercept** (where it crosses the vertical axis). It is the simplest model there is, and the building block of nearly every larger one.

**You need:** [[Functions]] and [[Graphs and Transformations]].

## The question it answers

"How does one quantity change with another at a steady rate?" A taxi fare with a base charge and a per-mile rate is linear, and so is the simplest prediction model.

## Intuition: rise over run

Move one step right. The line goes up by the same amount every time; that amount is the slope.

```text
slope m = rise / run = (y₂ − y₁) / (x₂ − x₁)
```

A positive slope goes up to the right, a negative one down, zero is flat, and a bigger size means steeper. The intercept `b` is the value of `y` when `x = 0`.

## Finding a line

Given two points, compute the slope, then find `b`:

```text
points (1, 3) and (4, 9)
m = (9 − 3) / (4 − 1) = 6 / 3 = 2
y = 2x + b  →  3 = 2·1 + b  →  b = 1
line: y = 2x + 1
```

Check with the second point: `2·4 + 1 = 9` ✓.

## A worked example: a linear model

A house-price model says `price = 2.2 × size + 35` (thousand dollars, size in m²). The slope 2.2 means each extra square metre adds 2.2 thousand dollars, and the intercept 35 is the base price at size zero.

```text
size 90  → 2.2 × 90 + 35 = 233
size 100 → 2.2 × 100 + 35 = 255       (10 more m², 22 more thousand)
```

Two lines meet where their outputs are equal. `y = 2x + 1` and `y = −x + 7` meet when `2x + 1 = −x + 7`, so `3x = 6`, `x = 2`, `y = 5`.

Linear means *proportional change*: doubling the input change doubles the output change. Many-input versions, `ŷ = w₁x₁ + w₂x₂ + b`, are the heart of [[Linear Algebra]].

## Bench

```bench
id: line-fitter
title: Fit a line to the points
fallback: Drag two handles or use sliders for slope and intercept to fit a line through a set of points, watching the average miss and a target line to match.
```

**Try this**

1. Change only the slope and watch the tilt.
2. Change only the intercept.
3. Try to get the average miss as low as you can, then reveal the best fit.
4. Drag the points: how does the best line move?

**What you should notice:** slope and intercept are two independent dials, and no straight line passes exactly through noisy data.

## Where it appears in AI

* **Linear regression** fits a line to data (see [[Linear Regression End to End]]).
* **Every neuron** starts with a weighted sum plus a bias, a linear function.
* **Slope as sensitivity:** it tells you how much the output changes per unit of input.

## Common pitfalls

* **Swapping rise and run.** Slope is rise over run.
* **Extrapolating far beyond the data.** A line that fits locally may fail far away.
* **Thinking the intercept is always meaningful.** A house of size zero has no price.
* **Assuming everything is linear.** Curves need other functions.

## Quick check

<details><summary>1. What is the slope through (0, 1) and (2, 5)?</summary>
(5 − 1) / (2 − 0) = 2.
</details>

<details><summary>2. Where does y = −3x + 6 cross the x-axis?</summary>
When −3x + 6 = 0, x = 2.
</details>

<details><summary>3. What does a slope of zero mean?</summary>
A horizontal line: the output does not change.
</details>

## Key terms

* **Linear function:** `y = mx + b`, a straight line.
* **Slope:** the change in output per unit of input.
* **Intercept:** the output when the input is zero.
* **Rise over run:** how slope is computed.

## Related

[[Functions]] · [[Graphs and Transformations]] · [[Solving Linear Systems]] · [[Linear Regression End to End]] · [[Matrices as Transformations]]
