A function is **continuous** at a point when you can draw it through that point without lifting your pen: the limit exists and equals the function's value. Jumps and holes break continuity, and corners break smoothness, which matters because derivatives only make sense where a function is smooth enough.

**You need:** [[Limits]] and [[Functions]].

## The question it answers

"Does this function behave predictably near a point?" Optimisation methods rely on smoothness. A function with jumps offers no useful direction to follow.

## Intuition: no jumps, no holes, no corners

* **Continuous:** the graph is one unbroken curve.
* **Hole:** the limit exists but the value is missing or different (like `(x² − 4)/(x − 2)` at `x = 2`).
* **Jump:** the left and right limits differ (like a step function).
* **Corner:** continuous but with a sharp turn, so the slope changes suddenly (like `|x|` at 0). It has no derivative there.

## Definition

`f` is continuous at `a` when three things hold:

```text
1. f(a) is defined
2. lim (x → a) f(x) exists
3. that limit equals f(a)
```

Polynomials, `eˣ`, `sin` and `cos` are continuous everywhere; `1/x` is continuous everywhere except 0, where it is undefined.

## A worked example

Consider the rounding function `floor(x)` (round down). At `x = 2`:

```text
just below 2 (like 1.99):  floor = 1
at and just above 2:       floor = 2
```

The left limit is 1 and the right limit is 2: a **jump**, so floor is not continuous at integers.

Now ReLU, `max(0, x)`: at 0 the value is 0 and both sides approach 0, so ReLU is **continuous**. But its slope jumps from 0 (left) to 1 (right), a corner. Implementations pick a convention for the slope at exactly 0.

Sigmoid `1/(1 + e⁻ˣ)` is continuous and **smooth** everywhere: a gentle curve with a slope defined at every point.

## Bench

```bench
id: continuity-breaker
title: Smooth, hole, jump or corner?
fallback: Choose a function type (smooth, hole, jump, corner); a slider moves through the special point and the bench reports the left limit, right limit and value there, and whether the function is continuous and differentiable.
```

**Try this**

1. Go through each type and compare the left limit, right limit and value.
2. Find the type with matching limits but a different value.
3. Find the one with a corner: are the limits equal?
4. Look at the slope on either side of the corner.

**What you should notice:** continuity needs three things to agree, and a corner is continuous but has no single slope.

## Where it appears in AI

* **Smooth activations** (sigmoid, tanh, softplus) give clean gradients everywhere.
* **ReLU** has a corner at 0 but works well in practice.
* **Step functions and rounding** have zero or undefined gradients, which is why training uses smooth stand-ins.
* **Quantisation** breaks smoothness, so tricks are needed to train through it.

## Common pitfalls

* **Assuming continuous means differentiable.** `|x|` is continuous but has a corner.
* **Ignoring holes** that come from division by zero.
* **Confusing a jump with a steep slope.**
* **Forgetting that discrete data is not continuous.**

## Quick check

<details><summary>1. Is |x| continuous at 0? Differentiable at 0?</summary>
Continuous yes; differentiable no (a corner).
</details>

<details><summary>2. Is floor(x) continuous at 2.5?</summary>
Yes, it is flat near 2.5; the jumps are at whole numbers.
</details>

<details><summary>3. Where is 1/x not continuous?</summary>
At x = 0, where it is undefined.
</details>

## Key terms

* **Continuous:** no jump or hole at the point.
* **Discontinuity:** a point where continuity fails.
* **Smooth:** having derivatives of all needed orders.
* **Corner:** a point of sudden slope change.

## Related

[[Limits]] · [[Derivatives]] · [[Functions AI Loves]] · [[Gradient Descent]]
