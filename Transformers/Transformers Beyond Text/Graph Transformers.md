[[Graph Neural Networks|A graph neural network]] restricts every node to messages from its direct neighbours, layer after layer. A graph transformer removes that restriction entirely — every node attends to every other node, exactly like a text transformer — and puts the graph's actual structure back in through a bias on the attention scores instead of through the mask.

**You need:** [[Graph Neural Networks]], [[ALiBi and Length Extrapolation]].

## The question it answers

"If a transformer can attend across an entire sequence, why not apply the same thing to a graph's nodes, instead of restricting attention to direct neighbours?" A graph transformer does exactly that: full, unrestricted attention among every node, with no adjacency mask at all. But a graph's structure still has to influence the result somehow, or the model would be blind to the topology entirely — the standard fix borrows [[ALiBi and Length Extrapolation|ALiBi's]] trick, adding a bias to each attention score based on the shortest-path distance between two nodes in the graph, instead of position distance in a sequence.

## Intuition

A message-passing GNN is structurally conservative: information only ever reaches a node from its immediate neighbours, and reaching a distant node takes as many layers as the shortest path between them. A graph transformer takes the opposite stance: let any node attend to any other node directly, in a single layer — but bias that attention so nearby nodes (by graph distance) are naturally favoured over distant ones, the same way ALiBi biases sequence attention by sequence distance. The structure isn't enforced through a hard mask anymore; it's a soft nudge built into the score itself.

## Definition and notation

```text
GNN-style (message passing): allowed(i, j) = adjacency(i, j)     — hard restriction to direct neighbours
graph transformer:            allowed(i, j) = true, for all i, j  — full attention
                               bias(i, j) = −slope × shortest_path_distance(i, j)
```

The shortest-path distance is computed once from the graph's actual edges (via breadth-first search), the same role sequence position plays for ALiBi — except here, "distance" means hops along the graph, not position in a line.

## A worked example

A 5-node cycle graph (edges `0-1, 1-2, 2-3, 3-4, 0-4`), compared two ways:

```text
GNN-style adjacency mask (self + direct neighbours only):
  node 0: [1,1,0,0,1]   — sees nodes 0, 1, 4
  node 2: [0,1,1,1,0]   — sees nodes 1, 2, 3

shortest-path distances (all pairs):
       0  1  2  3  4
  0 [  0  1  2  2  1 ]
  2 [  2  1  0  1  2 ]

graph transformer bias (slope 0.5, −0.5 × distance), full attention:
  node 0 → node 1 (distance 1): bias −0.50
  node 0 → node 2 (distance 2): bias −1.00
```

Node 0's attention is never *blocked* from node 2, the way the GNN-style mask would block it — but the bias still pushes the attention weight toward closer nodes, with the exact amount of push determined by actual graph distance.

## Bench

```bench
id: graph-transformer-bias
title: Full attention, with the graph's shape as a bias
fallback: Compare a GNN-style adjacency mask against a graph transformer's full attention with a distance-based bias, on a small graph.
```

**Try this**

1. Compare which nodes a given node can see under GNN-style masking versus graph-transformer attention.
2. Change the bias slope and watch how strongly distant nodes get penalized without ever being fully blocked.
3. Try a different graph shape and see how the shortest-path distances, and so the bias pattern, change.

**What you should notice:** a graph transformer can still, in principle, let information flow between any two nodes in a single layer — something a message-passing GNN genuinely cannot do, however many layers it stacks, without literally adding the edges.

## Where it appears in AI

* **It is a genuinely different architecture family from [[Graph Neural Networks]]**, not a variant — full attention with a structural bias, rather than restricted message passing.
* **It directly reuses the bias-based trick from [[ALiBi and Length Extrapolation]]**, just computed from graph distance instead of sequence position — a concrete example of an idea from one modality transferring cleanly to another.
* **It trades [[Graph Neural Networks|GNN's]] cheaper, locally-restricted computation for full-attention's quadratic cost** (in the number of nodes) — a genuine trade-off, not a strict improvement.

## Common pitfalls

* **Assuming a graph transformer ignores the graph's structure.** It doesn't restrict attention, but the distance-based bias still makes the structure matter — a far cry from treating the graph as an unordered set of nodes.
* **Forgetting full attention over nodes is quadratic in the number of nodes.** For very large graphs, this cost can make graph transformers less practical than a sparser message-passing GNN.
* **Confusing graph distance with any notion of sequence position.** There's no inherent ordering to a graph's nodes — distance here specifically means shortest-path hops along actual edges.

## Quick check

<details><summary>1. What's the key structural difference between a GNN and a graph transformer?</summary>
A GNN restricts each node to messages from its direct neighbours (hard masking by adjacency); a graph transformer allows full attention among all nodes, injecting structure through a bias instead.
</details>

<details><summary>2. In the worked example, why was node 0's attention to node 2 not blocked, unlike under the GNN-style mask?</summary>
A graph transformer applies no adjacency mask at all — every node can attend to every other node; the graph distance only biases the attention score, it never fully blocks a pair.
</details>

<details><summary>3. What can a graph transformer do in a single layer that a message-passing GNN fundamentally cannot?</summary>
Let any two nodes directly influence each other's attention, regardless of distance — a GNN needs as many layers as the shortest path between two nodes for information to travel that far.
</details>

## Key terms

* **Shortest-path distance:** the minimum number of edges connecting two nodes in a graph, computed via breadth-first search.
* **Structural bias:** an attention-score adjustment based on graph structure, used in place of a hard adjacency mask.
* **Message passing:** a GNN's mechanism for propagating information only between directly connected nodes.

## Related

[[Graph Neural Networks]] · [[ALiBi and Length Extrapolation]] · [[Multimodal Transformers as an Architecture Pattern]]
