"What did the studio behind Movie X's director also produce?" isn't answered by any single document — it's answered by chaining three separate facts together: who directed Movie X, who they work for, and what that studio produced. A knowledge graph makes those facts, and the connections between them, explicit and traversable, rather than hoping one lucky chunk happens to state the whole chain at once.

**You need:** [[Multi-Hop and Iterative Retrieval]].

## The question it answers

"How can retrieval answer a question whose answer is spread across a chain of relationships, rather than sitting in one document?" A **knowledge graph** stores entities (people, movies, studios) and labeled relationships between them (directed_by, works_at, produced) as explicit edges. **Graph-based RAG** answers a question by *traversing* those edges — following directed_by from "Movie X," then works_at from whatever that led to, then produced from there — building the answer one hop at a time, the same chaining idea as [[Multi-Hop and Iterative Retrieval]], but over an explicit graph structure instead of re-running document search at each step.

## Intuition

Answering "who is my coworker's childhood best friend's current employer" by flipping through a company directory (coworker → their profile) and then a social network (childhood friend → their current job) is exactly graph traversal: each step follows a known, labeled connection to the next entity, rather than hoping a single document states the whole multi-step relationship outright.

## Definition and notation

```text
graph = { entities, edges: [(from, relation, to), ...] }
traverse(start, hops) = follow one matching edge per hop, building a path of entities and relations
```

## A worked example

A 3-edge graph, traversed from "Movie X" to answer a chained question:

```text
edges:
  Movie X  --directed_by-->  Director Y
  Director Y  --works_at-->  Studio Z
  Studio Z  --produced-->  Film A

question: "what did the studio behind Movie X's director also produce?"

flat document retrieval: no single document states this full 3-hop chain
graph traversal (3 hops): Movie X --directed_by--> Director Y --works_at--> Studio Z --produced--> Film A
```

Each edge on its own is a simple, directly stated fact — "Movie X was directed by Director Y" is exactly the kind of sentence a single document would contain. The *question*, though, needs all three facts chained together, which graph traversal does explicitly, one labeled hop at a time.

## Bench

```bench
id: graph-rag-traversal
title: A fact built from three separate edges
fallback: Step through a graph traversal that chains three relations no single document states together.
```

**Try this**

1. Step through all three hops and read each labeled edge as it's followed.
2. Notice each individual edge is a simple fact — the complexity is entirely in chaining three of them.
3. Imagine the same question answered by flat document retrieval alone — what would it find?

**What you should notice:** the graph doesn't need to store the final 3-hop fact anywhere explicitly — it only needs the three individual edges, and traversal reconstructs the chain on demand.

## Where it appears in AI

* **This is the same chaining idea as [[Multi-Hop and Iterative Retrieval]]**, made explicit: instead of re-running a text search at each hop, each hop follows a labeled edge already stored in the graph.
* **Building the graph itself (extracting entities and relations from raw documents) is a document-processing problem**, related to but beyond what [[Metadata Extraction and Enrichment]] covers for simpler per-chunk attributes.
* **[[Retrieval over Structured Data]] is a related but different idea**: querying a table or database directly, rather than traversing a graph of entities and relationships.

## Common pitfalls

* **Assuming a knowledge graph can answer any question flat document retrieval couldn't.** It only helps for questions whose answer genuinely decomposes into a chain of stored relationships — a question with no relevant edges in the graph at all gets no benefit from this approach.
* **Underestimating the cost of building and maintaining the graph itself.** Extracting entities and relationships from raw documents accurately enough to traverse reliably is a substantial undertaking on its own, separate from the traversal mechanism.
* **Following the wrong edge when a node has several relations of the same type.** "Director Y" might work at more than one studio over their career — traversal needs some way to pick the right edge, not just any matching one.

## Quick check

<details><summary>1. In the worked example, why can't flat document retrieval answer the full question in one pass?</summary>
The full chain spans three separate facts, each likely stated in a different document — no single document is likely to state "Movie X's director's employer's other production" all at once.
</details>

<details><summary>2. What does each individual edge in the graph represent?</summary>
A single, directly stated fact connecting two entities through a named relationship — simple enough that one document could plausibly state it on its own.
</details>

<details><summary>3. How does graph-based RAG relate to multi-hop retrieval?</summary>
It's the same underlying idea (chaining intermediate facts to reach a final answer), but implemented by following explicit labeled edges in a pre-built graph, rather than re-running a document search at each step.
</details>

## Key terms

* **Knowledge graph:** a structure of entities and labeled relationships (edges) between them.
* **Graph traversal:** following edges from one entity to the next to answer a question spanning multiple relationships.
* **Entity extraction:** identifying entities and relationships from raw documents to build a knowledge graph in the first place.

## Related

[[Multi-Hop and Iterative Retrieval]] · [[Retrieval over Structured Data]] · [[Metadata Extraction and Enrichment]]
