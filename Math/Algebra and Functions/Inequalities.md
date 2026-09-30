An **inequality** compares two expressions with `<`, `>`, `≤` or `≥`, and its answer is usually a whole **range** of numbers rather than one. Solving works like an equation, with one important exception: multiplying or dividing by a negative number flips the direction.

**You need:** [[Equations and Solving]].

## The question it answers

"Which values are allowed?" A budget, a safety margin or a confidence threshold does not pin down a single number; it marks a boundary.

## Intuition: a region on the number line

`x > 3` means "any number larger than 3". Shade the number line to the right of 3, with an open circle at 3 because 3 itself is not included. `x ≥ 3` includes 3 (a filled circle).

## Solving

Add or subtract the same amount on both sides: nothing changes. Multiply or divide by a **positive** number: nothing changes. Multiply or divide by a **negative** number: **flip the sign**.

```text
2x + 1 < 9
2x < 8
x < 4

−2x + 3 < 9
−2x < 6
x > −3          (divided by −2, so < became >)
```

Why the flip? On the number line, negation mirrors positions: 2 < 5, but −2 > −5.

## Combining and absolute values

* **Both at once:** `1 ≤ x < 5` means x is at least 1 and less than 5.
* **Absolute value:** `|x| < 3` means the distance from zero is less than 3, so `−3 < x < 3`. And `|x| > 3` means `x < −3` or `x > 3`.
* **Tolerance:** `|prediction − truth| ≤ 0.5` says the error must stay within 0.5.

## A worked example

A model must respond in under 200 ms. A request spends 45 ms on setup and 12 ms per item. How many items can it process?

```text
45 + 12n < 200
12n < 155
n < 12.92
```

Since items are whole numbers, the largest allowed is `n = 12`. Check: `45 + 144 = 189 < 200` ✓, and 13 items give `45 + 156 = 201` ✗.

## Bench

```bench
id: inequality-shader
title: Shade the solution region
fallback: Sliders for a, b and c in a·x + b < c shade the solutions on a number line and show the solved inequality, flipping direction when a is negative.
```

**Try this**

1. Make a positive. Where is the shaded region?
2. Make a negative. What changes, and why?
3. Change the comparison to ≤ and watch the endpoint change from open to filled.
4. Set a to zero. What happens?

**What you should notice:** the boundary is where the two sides are equal, and the shaded side flips when you divide by a negative.

## Where it appears in AI

* **Constraints** such as "weights sum to at most 1" or "probability is at least 0".
* **Thresholds:** classify as positive if the score is above 0.5.
* **Margins and tolerances** in convergence checks: stop when `|change| < ε`.

## Common pitfalls

* **Forgetting to flip** when dividing by a negative.
* **Treating < and ≤ the same.** The endpoint is in or out.
* **Reading `|x| > 3` as one range.** It is two ranges.
* **Ignoring whole-number limits** on counts.

## Quick check

<details><summary>1. Solve 3x − 2 ≥ 7.</summary>
3x ≥ 9, so x ≥ 3.
</details>

<details><summary>2. Solve −x < 4.</summary>
x > −4 (flipped).
</details>

<details><summary>3. What does |x − 2| ≤ 1 mean?</summary>
x lies between 1 and 3, inclusive.
</details>

## Key terms

* **Inequality:** a comparison using <, >, ≤ or ≥.
* **Solution set:** all values that satisfy it.
* **Open / closed endpoint:** excluded (<, >) or included (≤, ≥).
* **Tolerance:** the allowed size of a difference.

## Related

[[Equations and Solving]] · [[Rounding, Absolute Value and Modulo]] · [[Linear Functions]] · [[Constraints and Lagrange Multipliers]]
