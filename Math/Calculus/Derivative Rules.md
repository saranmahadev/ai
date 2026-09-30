You do not compute a derivative from the limit every time. A short list of **rules** covers nearly every function you will meet: the power rule, the constant and sum rules, and the product and quotient rules.

**You need:** [[Derivatives]] and [[Exponents and Roots]].

## The question it answers

"How do I find a derivative quickly?" Each rule is a shortcut that comes from the limit definition, so once you know them, you can differentiate by pattern.

## The rules

```text
constant:          d/dx (c)        = 0
power:             d/dx (xⁿ)       = n · xⁿ⁻¹
constant multiple: d/dx (c · f)    = c · f′
sum:               d/dx (f + g)    = f′ + g′
product:           d/dx (f · g)    = f′ g + f g′
quotient:          d/dx (f / g)    = (f′ g − f g′) / g²
```

The power rule works for any exponent, including negatives and fractions: `d/dx (1/x) = d/dx (x⁻¹) = −x⁻²` and `d/dx (√x) = ½ x^(−1/2)`.

## Intuition for the product rule

A rectangle has sides `f` and `g`, both growing. Its area `f·g` grows because `f` grows (adding a strip of size `f′ · g`) and because `g` grows (adding a strip of size `f · g′`). Add the two strips: `f′g + fg′`.

## A worked example

Differentiate `f(x) = 3x² + 2x + 1`:

```text
d/dx (3x²) = 3 · 2x = 6x       d/dx (2x) = 2       d/dx (1) = 0
f′(x) = 6x + 2
```

At `x = 1`, the slope is `6 + 2 = 8`.

Product rule on `x² · sin x`:

```text
f = x²,  g = sin x    f′ = 2x,  g′ = cos x
derivative = 2x sin x + x² cos x
at x = 1:  2 sin 1 + cos 1 = 1.6829 + 0.5403 = 2.2232
```

Check with a tiny step: `(f(1.001) − f(1)) / 0.001` gives about `2.2247`, close ✓.

## Bench

```bench
id: rule-match
title: Match each function to its derivative
fallback: A sorting exercise: place functions such as x cubed, 5x, a constant, x squared plus x, and 1 over x under their derivatives, then check.
```

**Try this**

1. Match the easiest ones first (the constant and the straight line).
2. Apply the power rule to `x³`.
3. Rewrite `1/x` as `x⁻¹` before differentiating.
4. Check, and read the explanation for each.

**What you should notice:** the power rule lowers the exponent by one and multiplies by the old exponent, and constants disappear.

## Where it appears in AI

* **Hand-derived gradients** for simple losses (`(y − ŷ)²`) use these rules.
* **Automatic differentiation** applies them mechanically to every operation (see [[Automatic Differentiation]]).
* **Checking code:** compare an analytic derivative with a numerical one.

## Common pitfalls

* **Forgetting the constant multiplier** in the power rule.
* **Treating the product rule as `f′ · g′`.** It is not.
* **Differentiating `1/x` as `1/1`.** Rewrite as `x⁻¹` first.
* **Forgetting the chain rule** for nested functions (see [[Chain Rule]]).

## Quick check

<details><summary>1. What is d/dx of 4x³?</summary>
12x².
</details>

<details><summary>2. What is d/dx of 7?</summary>
0.
</details>

<details><summary>3. What is d/dx of x · eˣ?</summary>
eˣ + x eˣ (product rule).
</details>

## Key terms

* **Power rule:** `d/dx xⁿ = n xⁿ⁻¹`.
* **Product rule:** the derivative of a product.
* **Quotient rule:** the derivative of a ratio.
* **Linearity:** derivatives pass through sums and constant multiples.

## Related

[[Derivatives]] · [[Chain Rule]] · [[Derivatives of Exp, Log and Sigmoid]] · [[Automatic Differentiation]]
