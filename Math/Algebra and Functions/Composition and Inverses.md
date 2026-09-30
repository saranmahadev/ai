**Composition** feeds the output of one function into another: `g(f(x))`. An **inverse** undoes a function: `f⁻¹(f(x)) = x`. A neural network is a long composition, and many tricks in machine learning are inverse operations.

**You need:** [[Functions]] and [[Equations and Solving]].

## The question it answers

"What happens if I chain two rules, and can I run a rule backwards?" Every deep network chains layer after layer, and every logarithm undoes an exponential.

## Intuition: two machines in a row

Put machine `f` next to machine `g` and feed the chute of the first into the slot of the second. The combined machine is `g ∘ f`, read "g after f":

```text
(g ∘ f)(x) = g(f(x))
```

**Order matters.** Putting on socks then shoes is not the same as shoes then socks.

An **inverse** is a machine that runs backwards. If `f` doubles and adds 3, the inverse subtracts 3 and halves. It exists only when every output comes from a single input (the function is one-to-one); otherwise going back is ambiguous.

## Finding an inverse

Swap the roles of input and output and solve:

```text
y = 2x + 3
x = 2y + 3       (swap)
y = (x − 3) / 2  (solve for y)     so f⁻¹(x) = (x − 3) / 2
```

The graphs of `f` and `f⁻¹` are mirror images across the line `y = x`.

## A worked example

Let `f(x) = 2x + 3` and `g(x) = x²`.

```text
g(f(2)) = g(7)  = 49
f(g(2)) = f(4)  = 11          different: order matters

f⁻¹(7) = (7 − 3)/2 = 2        and f(2) = 7 ✓
```

`g(x) = x²` has no inverse on all reals (both 3 and −3 give 9), but restricting to `x ≥ 0` gives the inverse `√x`. Exponential and logarithm are inverses: `ln(eˣ) = x` and `e^(ln x) = x`.

## Bench

```bench
id: compose-invert
title: Chain functions and undo them
fallback: Choose two functions f and g, move an input slider to see it flow through f then g, swap the order, and turn on the inverse to see the graph mirrored across y = x.
```

**Try this**

1. Push a value through f then g. Swap the order and compare.
2. Turn on the inverse and check that it returns your input.
3. Try `x²` and see why its inverse needs a restriction.
4. Find an f and g whose order does not matter.

**What you should notice:** composition is not commutative, and the inverse's graph is the original reflected across the diagonal.

## Where it appears in AI

* **A deep network** is `f₃(f₂(f₁(x)))`, layer after layer.
* **The chain rule** differentiates compositions (see [[Chain Rule]]).
* **Log and exp**, and **normalise and un-normalise**, are inverse pairs.

## Common pitfalls

* **Reading `g(f(x))` as `g(x)·f(x)`.** It is application, not multiplication.
* **Assuming order does not matter.**
* **Writing `f⁻¹(x)` as `1/f(x)`.** The inverse is a different function.
* **Ignoring domain restrictions** when inverting.

## Quick check

<details><summary>1. If f(x) = x + 1 and g(x) = 3x, what is g(f(2))?</summary>
g(3) = 9.
</details>

<details><summary>2. What is the inverse of f(x) = 5x?</summary>
f⁻¹(x) = x / 5.
</details>

<details><summary>3. Why does x² lack an inverse on all reals?</summary>
Two inputs (3 and −3) give the same output.
</details>

## Key terms

* **Composition:** applying one function after another, `g(f(x))`.
* **Inverse function:** the function that undoes another.
* **One-to-one:** each output comes from a single input.
* **Reflection across y = x:** how an inverse's graph relates to the original.

## Related

[[Functions]] · [[Exponential and Logarithmic Functions]] · [[Chain Rule]] · [[A Forward Pass by Hand]]
