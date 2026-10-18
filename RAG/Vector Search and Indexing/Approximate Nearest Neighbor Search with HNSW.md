Instead of checking every vector in a collection, HNSW (Hierarchical Navigable Small World) searches a graph where each vector is linked to a handful of its nearest neighbors, plus a few longer-range shortcuts. Starting somewhere and repeatedly hopping to whichever linked neighbor is closer to the query reaches a good answer after checking only a small fraction of the graph.

**You need:** [[Exact Nearest Neighbor Search]].

## The question it answers

"How can a search avoid checking every vector while still usually finding the right one?" A graph where every node links to its nearest neighbors lets a **greedy search** start anywhere, repeatedly move to whichever unvisited linked neighbor is closest to the query, and stop once no neighbor is any closer. Most of the graph never gets touched — only the handful of nodes actually visited along the path. A few long-range links (the "small world" part) are what let the search jump between distant regions of the graph quickly, instead of only crawling locally.

## Intuition

Finding a specific house in an unfamiliar city by asking a local for directions, then asking someone closer each time you get nearer, reaches the destination without ever having to check every house in the city — a handful of well-chosen conversations get you there, as long as each conversation points you reliably closer.

## Definition and notation

```text
greedy_search(query, start):
  current = start
  loop:
    look at current's unvisited linked neighbors
    move to whichever one is closest to the query
    stop once no neighbor is closer than where you already are
```

## A worked example

A graph of 15 points, searched for the one closest to a query at [0.95, 0.90]:

```text
brute-force (exact): checks all 15 points → finds the true nearest, "N", at distance 0

greedy graph search, starting from a distant node "A":
  path: A → H → N
  comparisons made: 8 (vs. 15 for brute force)
  found: "N", distance 0 — the exact same answer, for roughly half the comparisons
```

The greedy search follows two hops along pre-built links — one short link within its starting neighborhood, then a long-range shortcut straight toward the query's region — and lands on the true nearest neighbor after only 8 comparisons instead of checking all 15 points.

## Bench

```bench
id: hnsw-greedy-search
title: A shortcut path instead of checking everyone
fallback: Step a greedy graph search toward a query and compare its comparison count against brute force.
```

**Try this**

1. Step through the search path and watch the distance to the query shrink at each hop.
2. Compare the final comparison count against the number of points in the graph.
3. Imagine this same graph with a million points instead of 15 — would the greedy search's path length grow the same way brute force's cost does?

**What you should notice:** the search doesn't need to get lucky to reach the right answer here — the long-range shortcut link is exactly what lets it cross most of the way to the query's region in a single hop, instead of crawling node by node.

## Where it appears in AI

* **This directly trades [[Exact Nearest Neighbor Search]]'s guarantee for speed** — greedy graph search is not guaranteed to always find the true nearest neighbor; without a well-placed long-range link, it can get stuck in the wrong neighborhood entirely.
* **[[Approximate Nearest Neighbor Search with IVF and Product Quantization]] solves the same problem with a different data structure** (partitioning into clusters instead of a navigable graph) — both trade exactness for speed, differently.
* **[[Vector Databases and Index Management]] typically offers HNSW as one of several index types to choose from**, alongside IVF and others, depending on the collection's size and update patterns.

## Common pitfalls

* **Assuming greedy graph search always finds the true nearest neighbor.** It's an *approximate* method — a graph without enough long-range links can leave the search stranded in the wrong region, finding a decent-but-not-optimal answer, or occasionally a poor one.
* **Building a graph with only short-range links, expecting it to work like this worked example's shortcut-equipped one.** The long-range links are what make the "small world" property work; a purely local graph degenerates toward the kind of local-optimum trap exact search doesn't have to worry about.
* **Treating "fewer comparisons" as automatically "faster in wall-clock time."** Graph traversal has its own overhead (following pointers, maintaining a visited set) that a simple, cache-friendly linear scan doesn't — the comparison-count savings has to be large enough to outweigh that overhead.

## Quick check

<details><summary>1. In the worked example, what specifically let the greedy search reach the correct answer in only 8 comparisons?</summary>
A long-range shortcut link connecting node "A" (in a distant region of the graph) directly toward node "H" and then "N" (near the query), letting the search cross most of the distance in two hops instead of crawling through every intermediate node.
</details>

<details><summary>2. Is greedy graph search guaranteed to find the true nearest neighbor on every query?</summary>
No — it's an approximate method; without the right long-range links positioned well relative to a given query, it can get stuck in the wrong local neighborhood and settle on a worse answer.
</details>

<details><summary>3. What's the "small world" idea that makes HNSW's long-range links useful?</summary>
A small number of well-placed long-range connections let a search jump between distant regions of the graph quickly, dramatically shortening the path between any two points compared to a graph with only local, nearest-neighbor links.
</details>

## Key terms

* **HNSW (Hierarchical Navigable Small World):** an approximate nearest-neighbor method based on greedy search over a graph of linked vectors.
* **Greedy search:** repeatedly moving to whichever linked neighbor is closest to the query, stopping once no neighbor improves on the current position.
* **Long-range link:** a graph edge connecting distant regions, letting a search cross large distances in a single hop.

## Related

[[Exact Nearest Neighbor Search]] · [[Approximate Nearest Neighbor Search with IVF and Product Quantization]] · [[Vector Databases and Index Management]]
