A **graph** is a set of **nodes** joined by **edges**. It is the natural way to describe anything connected: friends, roads, web pages, atoms, and the computation inside a neural network.

**You need:** [[Sets and Operations]] and [[Counting Rules]].

## The question it answers

"How are these things connected, and how do I reach one from another?" Recommendation systems, route finding, knowledge bases and social analysis all start from a graph.

## Intuition: dots and lines

Draw a dot for each thing and a line for each connection. An edge may be **undirected** (friendship goes both ways) or **directed** (a link from page A to page B). Edges can carry **weights**, such as a road's length.

## Vocabulary

```text
degree         the number of edges at a node
path           a sequence of edges joining two nodes
connected      every node can reach every other
cycle          a path that returns to its start
adjacency matrix   A[i][j] = 1 if there is an edge between i and j
```

A useful check: adding up all the degrees counts every edge twice, so `Σ degree = 2 × (number of edges)`.

## A worked example

Four nodes A, B, C, D, with edges A–B, A–C, B–C and C–D:

```text
degrees:   A 2   B 2   C 3   D 1        sum = 8 = 2 × 4 edges ✓
shortest path A → D:  A – C – D   (2 edges)
contains a cycle: A – B – C – A
```

Adjacency matrix (rows and columns A, B, C, D):

```text
A: 0 1 1 0
B: 1 0 1 0
C: 1 1 0 1
D: 0 0 1 0
```

**Breadth-first search** finds shortest paths in an unweighted graph by visiting neighbours in rings: first everything one step away, then two steps, and so on (see [[Search]]).

## Bench

```bench
id: graph-builder
title: Build a graph
fallback: Add or remove edges between labelled nodes using selectors; the bench shows each node's degree, the number of edges, whether the graph is connected, and the shortest path between two chosen nodes.
```

**Try this**

1. Connect A–B, A–C, B–C, C–D and check the degrees.
2. Verify that the degrees add up to twice the edges.
3. Remove an edge and see whether the graph becomes disconnected.
4. Pick two nodes and read the shortest path.

**What you should notice:** degrees always sum to twice the number of edges, and one missing edge can split a graph in two.

## Where it appears in AI

* **Computational graphs** describe a network's operations (see [[Automatic Differentiation]]).
* **Knowledge graphs** store facts as nodes and relations.
* **Graph neural networks** learn from connected data.
* **Search and planning** move through graphs of states (see [[Search]]).

## Common pitfalls

* **Confusing directed and undirected edges.**
* **Forgetting that adjacency matrices grow with n².**
* **Assuming connected means complete.** Not every pair is linked directly.
* **Counting edges twice** in an undirected graph.

## Quick check

<details><summary>1. A graph has degrees 3, 2, 2, 1. How many edges?</summary>
(3 + 2 + 2 + 1) / 2 = 4.
</details>

<details><summary>2. What is the shortest path from A to D in A–B, B–C, C–D, A–C?</summary>
A – C – D (2 edges).
</details>

<details><summary>3. Is a graph with two separate pieces connected?</summary>
No.
</details>

## Key terms

* **Graph:** nodes joined by edges.
* **Degree:** the number of edges at a node.
* **Path:** a route along edges.
* **Adjacency matrix:** a table showing which nodes are joined.

## Related

[[Sets and Operations]] · [[Trees and Hierarchies]] · [[Search]] · [[Automatic Differentiation]] · [[Matrices as Transformations]]
