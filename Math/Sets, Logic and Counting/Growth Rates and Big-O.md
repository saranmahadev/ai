**Big-O** notation describes how the cost of an algorithm (time or memory) grows as the input size `n` grows, ignoring constant factors. The difference between `n`, `n²` and `2ⁿ` decides whether a method scales to a million items or gives up at fifty.

**You need:** [[Logarithms]], [[Exponents and Roots]] and [[Areas, Volumes and Scaling]].

## The question it answers

"If I double the data, how much longer will this take?" It is the question behind every claim that a method is "efficient" or "does not scale".

## Intuition: the shape of the growth curve

We care about the *shape* of growth for large `n`, not the exact time. Suppose a step costs 1 unit:

* **O(1)**, constant: looking up an entry in an array by index. Cost does not depend on `n`.
* **O(log n)**: binary search. Doubling `n` adds one step.
* **O(n)**, linear: reading every item once. Doubling `n` doubles the cost.
* **O(n log n)**: sorting well. Slightly worse than linear.
* **O(n²)**, quadratic: comparing every pair. Doubling `n` quadruples the cost.
* **O(2ⁿ)**, exponential: trying every subset. Each extra item doubles the cost.

Big-O keeps only the fastest-growing term: `3n² + 50n + 7` is O(n²), because for large `n` the `n²` term dominates.

## A worked example

Count the steps for `n = 1,000`:

```text
log₂ n      ≈ 10
n           = 1,000
n log₂ n    ≈ 9,966
n²          = 1,000,000
2ⁿ          ≈ 1.07 × 10³⁰¹     (a number with 302 digits)
```

At a billion steps per second, the `n²` method finishes in a millisecond; the `2ⁿ` method would outlast the universe many times over. This is why exhaustive search (see [[Counting Rules]]) is hopeless for large problems, and why heuristics matter (see [[Heuristics and A-star Search]]).

Self-attention in a Transformer compares every token with every other, so its cost is O(n²) in the sequence length: doubling the context quadruples that cost.

## Bench

```bench
id: big-o-race
title: Growth-rate race
fallback: A slider for the input size n draws the curves for log n, n, n log n, n squared and 2 to the n, with a table of their values and an optional logarithmic vertical axis.
```

**Try this**

1. Start with n = 10, and read the values in the table.
2. Increase n and watch which curve escapes first.
3. Turn on the log axis. What do the polynomial curves become?
4. Find the n where n² overtakes 20n.

**What you should notice:** for small `n` the curves are close and constants matter, but for large `n` the order of growth decides everything.

## Where it appears in AI

* **Attention cost** grows quadratically with sequence length.
* **Nearest-neighbour search** over `n` points naively costs O(n) per query.
* **Training cost** scales with data size times model size.
* **Search over combinations** (features, hyperparameters, plans) is exponential.

## Common pitfalls

* **Ignoring constants** for small inputs; O(n²) with a tiny constant can beat O(n) with a huge one at small `n`.
* **Confusing worst case with average case.**
* **Treating O(n log n) as much worse than O(n).** It is close.
* **Forgetting memory.** Big-O applies to space as well as time.

## Quick check

<details><summary>1. What is the Big-O of 5n + 100?</summary>
O(n).
</details>

<details><summary>2. If a method is O(n²) and n triples, the cost multiplies by?</summary>
9.
</details>

<details><summary>3. Which grows faster, n² or 2ⁿ?</summary>
2ⁿ, eventually far faster.
</details>

## Key terms

* **Big-O:** an upper bound on how cost grows with n.
* **Linear / quadratic / exponential:** growth like n, n² and 2ⁿ.
* **Time and space complexity:** cost in steps and in memory.
* **Combinatorial explosion:** exponential growth in the number of options.

## Related

[[Logarithms]] · [[Areas, Volumes and Scaling]] · [[Counting Rules]] · [[Trees and Hierarchies]] · [[Attention as Dot Products]]
