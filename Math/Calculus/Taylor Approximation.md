A **Taylor approximation** replaces a complicated function near a point by a simple polynomial built from its derivatives there. A line uses the first derivative, a parabola adds the second, and each extra term makes the copy hug the original more closely.

**You need:** [[Higher Derivatives and Curvature]], [[Polynomials and Quadratics]] and [[Sequences and Series]].

## The question it answers

"Can I stand in for a hard function with an easy one, near where I am?" Nearly every optimisation method works by approximating the loss with a simple shape and stepping to that shape's best point.

## Intuition: match more and more about the curve

At a point `a`, a good copy should match:

1. the **value** `f(a)` (a flat line through the point),
2. the **slope** `f′(a)` (the tangent line),
3. the **curvature** `f″(a)` (a parabola that bends the same way),
4. and so on with higher derivatives.

```text
f(x) ≈ f(a) + f′(a)(x − a) + f″(a)/2 · (x − a)² + f‴(a)/6 · (x − a)³ + …
```

The dropped terms are the **error**; the further you go from `a`, the bigger it gets.

## Famous expansions around 0

```text
eˣ        ≈ 1 + x + x²/2 + x³/6 + …
sin x     ≈ x − x³/6 + x⁵/120 − …
ln(1 + x) ≈ x − x²/2 + x³/3 − …
1/(1 − x) ≈ 1 + x + x² + x³ + …      (for |x| < 1)
```

## A worked example

Approximate `eˣ` at `x = 1` with more and more terms (the true value is `e = 2.71828`):

```text
1 term:   1                     error 1.718
2 terms:  1 + 1                 = 2.0         error 0.718
3 terms:  1 + 1 + 0.5           = 2.5         error 0.218
4 terms:  1 + 1 + 0.5 + 0.1667  = 2.6667      error 0.052
```

For `sin x` at `x = 0.5`: `x − x³/6 = 0.5 − 0.020833 = 0.479167`, against the true `0.479426`, an error of only `0.00026`.

The first-order version, `f(x) ≈ f(a) + f′(a)(x − a)`, is the tangent line, the basis of gradient descent. The second-order version gives Newton's method (see [[Hessian]]).

## Bench

```bench
id: taylor-adder
title: Add Taylor terms
fallback: Choose a function and use a slider to increase the number of Taylor terms around zero; the bench draws the function and its approximation and shows the error at a chosen point.
```

**Try this**

1. Start with order 0 and add one term at a time on e^x.
2. Look at how far from zero the approximation still works.
3. Try sin x and watch the curve gain wiggles.
4. Try 1/(1 − x) near 1, where the series breaks down.

**What you should notice:** every added term improves the fit close to the centre, but far from it the polynomial wanders off.

## Where it appears in AI

* **Gradient descent** uses the first-order (linear) approximation of the loss.
* **Newton-type optimisers** use the second-order approximation.
* **Analysing small changes:** how a function responds to tiny nudges.
* **Numerical routines** compute functions like `exp` and `sin` from series.

## Common pitfalls

* **Using the approximation far from the centre.**
* **Forgetting the factorials** in the denominators.
* **Assuming more terms always help** where the series does not converge.
* **Mixing up the centre `a`** with the evaluation point `x`.

## Quick check

<details><summary>1. What is the first-order approximation of eˣ near 0?</summary>
1 + x.
</details>

<details><summary>2. Use 1 + x + x²/2 to estimate e^0.1.</summary>
1 + 0.1 + 0.005 = 1.105 (true 1.10517).
</details>

<details><summary>3. What does the second-order term capture?</summary>
The curvature of the function.
</details>

## Key terms

* **Taylor series:** a polynomial built from a function's derivatives at a point.
* **Order:** the highest power kept.
* **Remainder (error):** what the approximation leaves out.
* **Linearisation:** the first-order approximation.

## Related

[[Higher Derivatives and Curvature]] · [[Polynomials and Quadratics]] · [[Hessian]] · [[Gradient Descent]] · [[Sequences and Series]]
