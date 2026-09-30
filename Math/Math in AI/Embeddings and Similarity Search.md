An **embedding** represents a word, image, song or user as a vector of numbers, learned so that similar things end up close together. Once meaning is a vector, "find things like this" becomes a geometry problem: **similarity search** ranks items by cosine similarity or distance to a query vector.

**You need:** [[Scalars and Vectors]], [[Vector Operations]], [[Cosine Similarity]] and [[Geometry in Many Dimensions]].

## The question it answers

"How can a computer compare meanings?" Words are symbols with no built-in notion of similarity. Embeddings give them coordinates, so `cat` sits near `kitten` and far from `carburettor`.

## Intuition: a map of meaning

Imagine a map where each item is a point and nearby points are related. Real embeddings have hundreds or thousands of dimensions, but the operations are the same as in the plane:

* **Similarity:** cosine similarity between two vectors, or (small) distance.
* **Nearest neighbours:** the items whose vectors are closest to a query.
* **Directions carry meaning:** the arrow from `man` to `woman` can be similar to the arrow from `king` to `queen`, so vector arithmetic captures analogies.

## A toy example

Give each word two coordinates (say "royalty" and "gender"):

```text
man   = (0.1,  0.9)        woman = (0.1, −0.9)
king  = (0.9,  0.9)        queen = (0.9, −0.9)
```

The analogy "king is to man as ? is to woman":

```text
king − man + woman = (0.9 − 0.1 + 0.1,  0.9 − 0.9 − 0.9) = (0.9, −0.9) = queen
```

The result lands exactly on `queen`. Real embeddings do this only approximately, but the effect is real and was a striking early result for word vectors.

## Searching at scale

Brute-force search compares the query with every item: `N` items of dimension `d` cost `N · d` multiplications. For a million items of dimension 768 that is `7.7 × 10⁸` multiplications per query, fine for a single query but slow for many. Practical systems use **approximate nearest-neighbour** indexes (graphs, trees, hashing) that examine a tiny fraction of items. In high dimensions distances concentrate (see [[Geometry in Many Dimensions]]), so cosine similarity on normalised vectors is the usual choice.

## Bench

```bench
id: nearest-neighbour
title: Find the neighbours of a query
fallback: Words are plotted as points on a plane with related words grouped; drag a query point (or use the analogy button) and the bench ranks the words by cosine similarity or distance and lists the top three.
```

**Try this**

1. Drag the query into the animals group and read the top three.
2. Switch between cosine similarity and distance and compare rankings.
3. Press the analogy button to compute king − man + woman.
4. Drag the query far from everything and see how the ranking changes.

**What you should notice:** nearby words rank highest, cosine and distance can disagree when lengths differ, and vector arithmetic lands near the intended word.

## Where it appears in AI

* **Search and retrieval:** finding documents or images similar to a query.
* **Recommendation:** users and items as vectors.
* **Language models** start by embedding each token as a vector (see [[Attention as Dot Products]]).
* **Retrieval-augmented systems** look up relevant passages by embedding similarity.

## Common pitfalls

* **Comparing embeddings from different models.**
* **Using raw distance** when lengths carry no meaning (use cosine).
* **Trusting analogies as exact.**
* **Ignoring bias:** embeddings absorb the associations in their training data.

## Quick check

<details><summary>1. Which is the better similarity when only direction matters?</summary>
Cosine similarity.
</details>

<details><summary>2. Cost of brute-force search over 10⁶ items of dimension 100?</summary>
About 10⁸ multiplications per query.
</details>

<details><summary>3. In the toy example, what is queen − woman + man?</summary>
(0.9, 0.9), which is king.
</details>

## Key terms

* **Embedding:** a learned vector representing an item.
* **Similarity search:** ranking items by closeness to a query vector.
* **Nearest neighbour:** the item whose vector is closest to the query.
* **Approximate nearest neighbour:** fast, slightly inexact search.

## Related

[[Cosine Similarity]] · [[Vector Operations]] · [[Geometry in Many Dimensions]] · [[Attention as Dot Products]] · [[Norms and Distance]]
