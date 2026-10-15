A [[Convolutional Neural Networks|convolution]] aggregates each pixel's fixed, grid-shaped neighbourhood. A **graph neural network (GNN)** generalises that same idea to data that isn't a grid at all — a social network, a molecule, a road network — where each node aggregates information from whichever other nodes it happens to be connected to, however many that is.

**You need:** [[Why Depth Helps]] and [[Graphs and Networks]].

## The question it answers

"Convolution relies on every pixel having the same fixed-shape neighbourhood — what do you do when your data's connections are irregular, with every node having a different number of neighbours?" Replace "the fixed 3×3 window" with "whatever nodes this one happens to be connected to," and aggregate over that instead.

## Intuition: updating your opinion from your actual friends, not your neighbours on a grid

On a grid, "who's nearby" means fixed, identical positions relative to you. In a social network, "who's nearby" means your actual friends — a different number for everyone, with no fixed layout at all. A GNN layer updates each node's representation by combining its own current value with some aggregate (commonly a sum or average) of its neighbours' current values — exactly the way you might update an opinion partly from your own view and partly from averaging what people you're actually connected to think.

## Definitions

```text
one GNN layer, for node v:

h_v' = combine( h_v,  aggregate({ h_u : u is a neighbour of v }) )

aggregate is often mean or sum;  combine is often a small dense layer (weights + activation)
```

Stacking `k` GNN layers lets information reach up to `k` hops away — a direct graph analogue of how stacking convolutional layers grows a [[Receptive Fields and Depth|receptive field]].

## A worked example

A 4-node graph — `A—B`, `B—C`, `B—D` (B is the hub) — with initial scalar features `A=1, B=2, C=3, D=4`, updated by averaging each node with the mean of its neighbours:

```text
A's only neighbour is B:          mean = 2;      A' = (1 + 2) / 2   = 1.500
B's neighbours are A, C, D:       mean = 2.667;  B' = (2 + 2.667)/2 = 2.333
C's only neighbour is B:          mean = 2;      C' = (3 + 2) / 2   = 2.500
D's only neighbour is B:          mean = 2;      D' = (4 + 2) / 2   = 3.000
```

Notice `B`, with three neighbours, pulls in information from all of `A`, `C` and `D` in a single layer; `A`, `C` and `D`, each with only `B` as a neighbour, only see `B`'s value directly — they'd need a second layer to be influenced by each other, since right now they only connect through `B`.

## Bench

```bench
id: gnn-aggregate
title: Updating a node from its graph neighbours
fallback: A small graph with editable node features. See one mean-aggregation GNN layer update every node's value from its own neighbours, and step through a second layer to watch information reach further.
```

**Try this**

1. Change one node's feature and see which other nodes' updated values shift after one layer.
2. Add a second layer and see values that were two hops away start to influence each other.
3. Compare a node with many neighbours to one with only a single neighbour, and see how differently their updates behave.

**What you should notice:** a node with many neighbours blends in information from all of them at once; a node with few neighbours changes more slowly, and needs more layers before distant parts of the graph can influence it at all.

## Where it appears in AI

* **Molecules, social networks, recommendation systems and road networks** are all naturally graphs, and GNNs are a standard tool for prediction tasks over this kind of data.
* **Message passing** is the general name for the "aggregate from neighbours, then update" pattern this topic describes; many GNN variants differ mainly in how they aggregate and combine.
* **Graph structure can also appear inside otherwise grid- or sequence-shaped data** — for instance, treating distant words connected by a dependency parse as graph neighbours, rather than only immediate sequence neighbours.

## Common pitfalls

* **Forgetting a node only directly sees its immediate neighbours in one layer.** Information from further away needs more layers to arrive, exactly as in the worked example.
* **Using sum aggregation on graphs where node degree varies wildly.** A node with a hundred neighbours and a node with two can end up with very differently-scaled aggregated values unless this is accounted for (mean aggregation, as used here, is one common fix).
* **Treating a GNN as interchangeable with a plain dense network over a flattened adjacency matrix.** The whole point of message passing is that it respects the graph's actual, irregular structure rather than imposing an arbitrary fixed ordering.

## Quick check

<details><summary>1. What does a GNN layer do differently from a plain convolution's fixed window?</summary>
It aggregates over whatever nodes happen to be graph-neighbours of a given node, however many there are, instead of a fixed-size, fixed-shape neighbourhood.
</details>

<details><summary>2. In the worked example, why does node A's updated value only reflect node B, not nodes C or D?</summary>
A's only direct neighbour is B; C and D are two hops away through B, which a single GNN layer cannot reach.
</details>

<details><summary>3. How many GNN layers would it take for node C's value to start influencing node D?</summary>
Two layers — the first layer lets B's value absorb information from C, and the second layer lets D (B's neighbour) pick up that updated value from B.
</details>

## Key terms

* **Graph neural network (GNN):** a network whose layers aggregate information from each node's actual graph neighbours.
* **Message passing:** the aggregate-then-update pattern a GNN layer performs.
* **Hop:** one edge's worth of distance in a graph; a GNN with k layers can reach information up to k hops away.

## Related

[[Why Depth Helps]] · [[Graphs and Networks]] · [[Receptive Fields and Depth]] · [[Mixture of Experts]]
