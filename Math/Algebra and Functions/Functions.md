A **function** is a rule that takes an input and gives back exactly one output. Everything a model does is a function: an image goes in and a label comes out, or a sentence goes in and the next word comes out.

**You need:** [[Variables and Expressions]].

## The question it answers

"What is a rule from inputs to outputs, and how do I read one?" Functions are the central object of this planet: [[Calculus]] studies how they change, [[Linear Algebra]] studies the simplest ones, and a model is one with adjustable numbers.

## Intuition: a machine with a slot and a chute

Drop a number in the slot; a number comes out the chute. The same input always gives the same output, and the machine never gives two outputs for one input. The rule inside can be an expression, a table or a program.

```text
f(x) = 2x + 1

f(0) = 1      f(3) = 7      f(−2) = −3
```

Read `f(3)` as "f of 3": put 3 in for every `x`. The name is arbitrary; `g`, `h` and `model` work equally well.

## Definition and vocabulary

```text
f : A → B     "f takes inputs from A and gives outputs in B"
domain        the set of allowed inputs
range         the set of outputs that actually occur
```

`f(x) = 1/x` has domain "all numbers except 0", since you cannot divide by zero. `f(x) = √x` has domain `x ≥ 0` (for real outputs) and range `y ≥ 0`.

## The vertical line test

A graph shows a function only if every vertical line crosses it at most once. A circle fails the test (one input, two outputs), so a full circle is not a function of `x`. The top half of a circle passes.

## A worked example

Let `f(x) = x² − 4`.

```text
f(0)  = −4
f(2)  = 0
f(−2) = 0          two inputs can share an output; that is allowed
```

Domain: all real numbers. Range: `y ≥ −4`, since `x²` is never negative. Two inputs may map to the same output (a *many-to-one* function), but one input never maps to two outputs.

A table is also a function: {1 → 10, 2 → 20, 3 → 30} maps each input to one output.

## Bench

```bench
id: function-table
title: Function machine: table and graph
fallback: Choose a function and drag an input slider; the machine shows the output, a growing table of input-output pairs and the graph, with a vertical-line-test overlay.
```

**Try this**

1. Move the input and read the output and the table row.
2. Switch to `1/x` and slide across 0. What happens?
3. Turn on the vertical line and drag it across `x²`, then the circle.
4. Find two inputs with the same output.

**What you should notice:** each input has one output, several inputs can share one, and some inputs are not allowed.

## Where it appears in AI

* **A model** maps features to a prediction: `ŷ = f(x; θ)`.
* **A loss** maps predictions and answers to a single number.
* **Layers** in a neural network are functions chained together (see [[Composition and Inverses]]).

## Common pitfalls

* **Reading f(x) as f times x.** It means "f applied to x".
* **Ignoring the domain.** Division by zero and roots of negatives fall outside.
* **Assuming one-to-one.** Many inputs can share an output.
* **Confusing the function with its formula.** The rule is the function; the formula is one way to write it.

## Quick check

<details><summary>1. If f(x) = 3x − 2, what is f(4)?</summary>
10.
</details>

<details><summary>2. What is the domain of f(x) = 1/(x − 5)?</summary>
All numbers except 5.
</details>

<details><summary>3. Can a function give two outputs for one input?</summary>
No. That is what makes it a function.
</details>

## Key terms

* **Function:** a rule giving exactly one output for each allowed input.
* **Domain:** the allowed inputs.
* **Range:** the outputs that occur.
* **Vertical line test:** a graph is a function if no vertical line crosses it twice.

## Related

[[Graphs and Transformations]] · [[Linear Functions]] · [[Composition and Inverses]] · [[Limits]] · [[Derivatives]]
