[[Universal Approximation]] showed one wide hidden layer can represent almost anything. **Depth helps anyway** because, for some functions, a shallow network needs exponentially more units than a deep one to represent the same function — stacking layers lets you *compose* a small building block instead of laying out an enormous number of them side by side.

**You need:** [[Universal Approximation]] and [[The Multilayer Feedforward Network]].

## The question it answers

"If width alone can approximate anything, why bother going deep?" Because *how many* units width needs can explode, while depth can solve the same problem with far fewer units, by reusing a small piece of computation again and again.

## Intuition: folding a strip of paper

Take the **tent function**: it rises in a straight line from `(0, 0)` to `(0.5, 1)`, then falls in a straight line to `(1, 0)` — one fold, two linear pieces. Feed its own output back into another copy of itself (`tent(tent(x))`), and you get *two* folds worth of oscillation: four linear pieces. Compose it `k` times and you get `2ᵏ` linear pieces — each additional layer **doubles** the number of pieces, because it folds the *whole* previous shape, not just adds one more wiggle next to it.

## Definitions

```text
tent(x) = 2x        for x ≤ 0.5
        = 2 − 2x     for x > 0.5

composed k times:  tentᵏ(x) = tent(tent(⋯tent(x)⋯))   has 2ᵏ − 1 breakpoints (2ᵏ linear pieces)
```

`tent` itself is exactly two ReLU units: `tent(x) = 2·ReLU(x) − 4·ReLU(x − 0.5)`. A single hidden layer of `m` ReLU units feeding one linear output can have **at most `m` breakpoints** — one per unit — no matter how the weights are chosen. So matching `tentᵏ`'s `2ᵏ − 1` breakpoints with one hidden layer needs on the order of `2ᵏ` units.

## A worked example

Compose `tent` with itself and count breakpoints directly:

```text
k (depth)        1    2    3    4    5     6
breakpoints      1    3    7   15   31    63     (= 2ᵏ − 1, exactly)
depth units     2k    2    4    6    8   10     12   (two ReLU units per composition)
```

At `k = 6`: a **deep** network needs only 12 hidden units (two per layer, six layers) to produce 63 breakpoints. A **single hidden layer** matching the same 63 breakpoints needs roughly 63 units — about five times as many, and the gap doubles with every extra layer of depth.

## Bench

```bench
id: depth-vs-width
title: Folding a tent function k times
fallback: The composed tent function, with a depth slider k from 1 to 8. The curve's oscillation count doubles with every extra layer, and a side-by-side count compares hidden units needed by a deep construction versus a single wide layer matching the same number of breakpoints.
```

**Try this**

1. Move `k` from 1 up to 8 and watch the number of oscillations double each step.
2. Compare the two unit counts at `k = 8`: depth's `2k = 16` versus width's `2⁸ − 1 = 255`.
3. Notice the curve itself never gets more complicated to describe — it is the same small fold, repeated.

**What you should notice:** the shape at depth `k` looks identical in structure at every scale (a fold of folds of folds); the unit count needed to reproduce it with only one hidden layer grows far faster than the depth needed to build it by composition.

## Where it appears in AI

* **Why practical networks are deep, not just wide:** many functions useful in vision and language have this kind of repeated, compositional structure (edges → shapes → objects), which depth captures efficiently.
* **Convolutional networks** (see [[Convolutional Neural Networks]]) reuse the same small filter at every position and compound those reuses across layers — width-efficiency and depth-efficiency together.
* **The folding argument** is one formal reason (among several) that deep learning favours depth over width when a fixed number of parameters is available.

## Common pitfalls

* **Concluding "deeper is always better."** The advantage is function-dependent: some functions are genuinely easier for width, and very deep networks bring their own training difficulties (see [[Vanishing and Exploding Gradients]]).
* **Confusing this with universal approximation.** Universal approximation is about whether a representation exists at all; this is about how *many units* it costs.
* **Assuming the folding argument applies exactly to every real model.** It is a clean, worst-case illustration of why depth can be exponentially cheaper — real networks learn messier functions, but the same principle (reuse via composition) is the mechanism.

## Quick check

<details><summary>1. Why does composing the tent function k times double the number of linear pieces each time?</summary>
Each application folds the entire previous output back through the same two-piece shape, so every existing piece gets split into two.
</details>

<details><summary>2. Why can't a single hidden layer of ReLU units match that cheaply?</summary>
A linear output over `m` ReLU units can have at most `m` breakpoints, so matching `2ᵏ − 1` breakpoints needs on the order of `2ᵏ` units — no shortcut from composition is available in one layer.
</details>

<details><summary>3. Does this mean wider single-layer networks are never a good choice?</summary>
No — it is one function family where depth is exponentially cheaper; other functions may not have this compositional structure, and width still has its uses.
</details>

## Key terms

* **Breakpoint:** a point where a piecewise-linear function's slope changes.
* **Composition:** applying a function to its own output, the mechanism depth exploits.
* **Exponential separation:** when one architecture needs exponentially more units than another to represent the same function.

## Related

[[Universal Approximation]] · [[The Multilayer Feedforward Network]] · [[Convolutional Neural Networks]] · [[Vanishing and Exploding Gradients]]
