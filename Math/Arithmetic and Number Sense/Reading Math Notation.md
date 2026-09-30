Maths is written in a compact shorthand: Greek letters for quantities, a few symbols for operations and relations, and conventions such as subscripts and hats. This topic is the key to that shorthand, so later pages read as sentences rather than puzzles.

**You need:** [[Order of Operations and Properties]].

## The question it answers

"What does that symbol mean, and how do I read the formula aloud?" A formula is a sentence; once you can say it in words, it stops being intimidating.

## Intuition: symbols are just abbreviations

`Σ` is short for "add up all of these". `≈` is short for "is approximately". Nothing here is new maths, only shorter ways of writing ideas you already know.

## Relations and operations

```text
=    equals                 ≠    is not equal to
≈    is approximately       ∝    is proportional to
<  >  less / greater than   ≤  ≥  at most / at least
∈    is an element of       ∉    is not an element of
⊂    is a subset of         ∪  ∩  union / intersection
→    maps to / gives        ⇒    implies
∞    infinity (not a number, an unbounded limit)
∑    sum of                 ∏    product of
∀    for all                ∃    there exists
```

## Names and conventions

* **Latin letters** `x, y, z` are usually unknown or input values; `a, b, c` are constants; `i, j, k, n` count things.
* **Subscripts** label items: `x₁, x₂, x₃` is a list; `xᵢ` is "the i-th one".
* **Superscripts** are usually powers (`x²`) but sometimes labels (`x⁽²⁾` means the second example).
* **Hats and bars:** `ŷ` ("y-hat") is a *prediction*, `x̄` ("x-bar") is an *average*.
* **Bold or capitals** often mean vectors and matrices: `x` for a vector, `W` for a matrix (see [[Scalars and Vectors]]).
* **Functions** are written `f(x)`, read "f of x".

## Greek letters you will meet

```text
α alpha   step size, significance level     β beta   coefficients
γ gamma   discount factor                   δ delta  a small change
ε epsilon a tiny number, an error           η eta    learning rate
θ theta   the model's parameters, an angle  λ lambda regularisation strength, eigenvalue
μ mu      mean                              σ sigma  standard deviation
π pi      3.14159…                          ρ rho    correlation
Σ sigma   sum (capital)                     Δ delta  a difference (capital)
∇ nabla   gradient                          ∂ partial derivative symbol
```

## A worked example

Read this aloud:

```text
ŷ = Σ wᵢ xᵢ + b        for i from 1 to n
```

"y-hat equals the sum, for i from 1 to n, of w-sub-i times x-sub-i, plus b." Each `xᵢ` is an input, each `wᵢ` is that input's weight, the sum adds the weighted inputs, and `b` is an offset. With `n = 3`, `w = (2, 1, 0.5)`, `x = (4, 3, 2)` and `b = 1`:

```text
ŷ = 2×4 + 1×3 + 0.5×2 + 1 = 8 + 3 + 1 + 1 = 13
```

## Bench

```bench
id: symbol-matcher
title: Sort the symbols
fallback: A sorting exercise: place symbols such as Σ, π, ∈, ≈ and η into groups (operations, names for quantities, relations) and check your answers.
```

**Try this**

1. Sort the symbols you already know first.
2. Guess the rest from the list above.
3. Check, and read each explanation aloud.

**What you should notice:** symbols fall into a few roles, and knowing the role (operation, name, relation) tells you how to read the line.

## Where it appears in AI

Papers, docs and code all use this shorthand. `θ` for parameters, `η` for the learning rate, `ŷ` for predictions and `∇` for the gradient are near-universal in [[Machine Learning]].

## Common pitfalls

* **Assuming a letter always means the same thing.** `σ` can be a standard deviation or a sigmoid; read the definition.
* **Confusing `∝` with `=`.** Proportional means "up to a constant factor".
* **Reading `xᵢ` as x times i.** It is the i-th value of x.
* **Treating ∞ as a number.** It describes unbounded growth.

## Quick check

<details><summary>1. What does ŷ usually stand for?</summary>
A prediction of y.
</details>

<details><summary>2. Read x ∈ ℝ aloud.</summary>
"x is an element of the real numbers."
</details>

<details><summary>3. What is Σ from i = 1 to 3 of i?</summary>
1 + 2 + 3 = 6.
</details>

## Key terms

* **Symbol:** a character standing for a quantity, operation or relation.
* **Subscript:** a small label giving an item's position or name.
* **Hat:** a mark such as ŷ meaning an estimate or prediction.
* **Summation:** the sum written with Σ.

## Related

[[Sums and Products]] · [[Variables and Expressions]] · [[Sets and Operations]] · [[Scalars and Vectors]]
