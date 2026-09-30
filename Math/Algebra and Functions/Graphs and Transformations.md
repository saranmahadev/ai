A **graph** draws a function as a curve: input along the bottom, output up the side. **Transformations** shift, stretch and flip that curve, and one short formula, `a · f(x − h) + k`, describes them all.

**You need:** [[Functions]].

## The question it answers

"What does this function look like, and how does changing a number in the formula move the picture?" Reading graphs quickly is the everyday skill behind loss curves, activation functions and probability densities.

## Intuition: sliding and stretching a rubber sheet

Draw `y = f(x)`. Now imagine the sheet it is drawn on.

* **Shift up or down** by `k`: `f(x) + k`. Every output rises by `k`.
* **Shift right or left** by `h`: `f(x − h)`. Note the minus: to move the curve *right*, each input must be `h` bigger to produce the same output, so subtract.
* **Stretch vertically** by `a`: `a · f(x)`. Outputs are multiplied. If `a` is negative the curve also **flips** upside down.
* **Stretch horizontally** by `b`: `f(x / b)` stretches; `f(bx)` squashes.

## The combined form

```text
g(x) = a · f(x − h) + k
        a: stretch / flip   h: shift right   k: shift up
```

For `f(x) = x²`, the point that used to be the tip at (0, 0) moves to `(h, k)`.

## A worked example

Start with `f(x) = x²`, whose tip is (0, 0). Build `g(x) = 2(x − 3)² + 1`:

```text
h = 3  →  slide right 3
a = 2  →  stretch vertically by 2
k = 1  →  lift up 1
```

The tip is now at (3, 1). Check with numbers: `g(3) = 2·0 + 1 = 1` ✓ and `g(4) = 2·1 + 1 = 3` ✓.

Reading a graph: where it crosses the x-axis are the **roots**; where it crosses the y-axis is `f(0)`; where it rises, `f` is increasing; a tip or valley is a maximum or minimum.

## Bench

```bench
id: graph-transform
title: Shift, stretch and flip
fallback: Pick a base function (x squared, absolute value, square root or sine) and move sliders for a, h and k to see g(x) = a·f(x − h) + k drawn over the original curve.
```

**Try this**

1. Move only `h`. Which way does the curve go for positive `h`?
2. Move only `k`, then only `a`.
3. Make `a` negative.
4. Combine all three on the absolute-value function and predict its tip.

**What you should notice:** `k` and `a` act on the *outputs* the way you would expect, while `h` acts on the *inputs* and so moves the curve the opposite way to the sign inside the bracket.

## Where it appears in AI

* **Activation functions** are shifted and scaled (a bias shifts, a weight stretches).
* **Loss curves** are read for plateaus and spikes.
* **Normalisation** shifts and rescales data: `(x − μ) / σ` is a shift then a stretch.

## Common pitfalls

* **Getting the horizontal direction backwards.** `f(x − 3)` moves right.
* **Applying the order wrongly.** Stretch before shift: `2(x − 3)² + 1` differs from `2((x − 3)² + 1)`.
* **Forgetting a negative `a` also flips.**
* **Reading a curve beyond the plotted window.**

## Quick check

<details><summary>1. Where is the tip of y = (x + 2)² − 5?</summary>
At (−2, −5).
</details>

<details><summary>2. What does a = −1 do?</summary>
Flips the curve upside down.
</details>

<details><summary>3. What is g(x) = f(x) + 4 doing to the graph?</summary>
Moving it up by 4.
</details>

## Key terms

* **Graph:** the picture of a function's inputs and outputs.
* **Transformation:** a shift, stretch or flip of a graph.
* **Root:** an input where the output is zero.
* **Vertex:** the tip or turning point of a curve.

## Related

[[Functions]] · [[Linear Functions]] · [[Polynomials and Quadratics]] · [[Functions AI Loves]]
