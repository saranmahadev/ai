A **tree** is a connected graph with no cycles: one root, branches, and leaves at the ends. Trees describe hierarchies and chains of decisions, and a balanced tree lets you find something among a million items in about twenty steps.

**You need:** [[Graphs and Networks]] and [[Exponents and Roots]].

## The question it answers

"How do I organise choices or data so that looking something up is fast?" A decision tree asks one question at a time, and each answer narrows the options.

## Intuition: a family tree turned upside down

Start at the **root**. Each node has **children**; a node with no children is a **leaf**. There is exactly one path between any two nodes, so no loops.

```text
a tree with n nodes has exactly n − 1 edges
depth: the number of edges from the root to a node
```

A **binary tree** gives each node at most two children. A full binary tree of depth `d` has `2ᵈ` leaves and `2ᵈ⁺¹ − 1` nodes in total.

## Halving the problem

In a **binary search tree** every step compares with a node and goes left (smaller) or right (larger), discarding half the remaining items. So finding an item among `n` needs about `log₂ n` comparisons (see [[Logarithms]]).

## A worked example

A full binary tree of depth 3:

```text
level 0:  1 node
level 1:  2 nodes
level 2:  4 nodes
level 3:  8 nodes (the leaves)
total: 1 + 2 + 4 + 8 = 15 = 2⁴ − 1 nodes, and 14 edges
```

Searching for a value among 15 items takes at most 4 comparisons (depth 3, plus the root). For a million items (`2²⁰ ≈ 1,048,576`), a balanced tree needs only about 20 comparisons, instead of up to a million for scanning a list.

A **decision tree** for classifying fruit might ask "is it round?", then "is it red?", and end at a label in each leaf.

## Bench

```bench
id: tree-walker
title: Walk down a search tree
fallback: A binary search tree with a chosen depth is drawn; pick a target and step down from the root, seeing the comparison at each node and the number of steps taken.
```

**Try this**

1. Pick a target and step down. At each node, which way do you go and why?
2. Increase the depth. How many more steps does the search need?
3. Compare the node count with the steps taken.
4. Pick the root value, then a leaf.

**What you should notice:** doubling the number of items adds only one step, which is what a logarithm looks like.

## Where it appears in AI

* **Decision trees and random forests** are trees of questions.
* **Search algorithms** explore game trees and planning trees (see [[Search]]).
* **Hierarchical structure** appears in parse trees and in file and taxonomy hierarchies.
* **Fast lookup** in nearest-neighbour indexes uses tree structures.

## Common pitfalls

* **Assuming every tree is balanced.** A lopsided tree can be as slow as a list.
* **Confusing depth with number of nodes.**
* **Allowing cycles.** Then it is not a tree.
* **Forgetting the count n − 1 for edges.**

## Quick check

<details><summary>1. How many edges does a tree with 10 nodes have?</summary>
9.
</details>

<details><summary>2. How many leaves does a full binary tree of depth 4 have?</summary>
2⁴ = 16.
</details>

<details><summary>3. About how many comparisons to search 1,000 sorted items in a balanced tree?</summary>
About 10 (log₂ 1000 ≈ 9.97).
</details>

## Key terms

* **Tree:** a connected graph with no cycles.
* **Root / leaf:** the top node / a node with no children.
* **Depth:** the number of edges from the root.
* **Binary tree:** each node has at most two children.

## Related

[[Graphs and Networks]] · [[Logarithms]] · [[Growth Rates and Big-O]] · [[Search]] · [[Logic and Truth Tables]]
