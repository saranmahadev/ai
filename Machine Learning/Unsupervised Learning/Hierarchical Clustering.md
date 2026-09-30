Hierarchical clustering does not fix the number of clusters in advance. It starts with every point alone and repeatedly merges the two closest groups, recording each merge and its distance. The result is a **merge tree** (a dendrogram); cutting it at any height gives a clustering, so one run offers every `k`.

**You need:** [[k-Means Clustering]] and [[Trees and Hierarchies]].

## The question it answers

"How are the points related at every scale?" Small tight groups merge first, looser groups later, and the tree shows the whole structure, not just one flat partition.

## Intuition: build a family tree from the bottom

Begin with each point as its own group. Find the two groups that are closest and join them. Repeat until one group holds everything. Merges among close neighbours happen at small distances; merging genuinely separate clusters needs a big jump. To choose clusters, look for a large gap between successive merge distances and cut there.

## Definitions

```text
linkage   how to measure the distance between two groups
  single    the closest pair of points across the groups      (can chain into long strings)
  complete  the farthest pair                                  (compact groups)
  average   the mean of all cross-group distances              (a common compromise)
  ward      the merge that least increases total variance
cutting   remove the last k−1 merges to leave k clusters
```

Cost grows quickly with the number of points (at least quadratic), so hierarchical clustering suits thousands of points, not millions.

## A worked example

Fifteen points from three tight clouds (five each; bench data), average linkage. The 14 merge distances, earliest first:

```text
0.09  0.13  0.19  0.20  0.31  0.34  0.38  0.48  0.51  0.52  0.60  0.75   1.88   2.65
└──────────── twelve merges inside the three clouds ────────────┘   └ two merges joining clouds
```

The first twelve merges build the three clouds, all below 0.75. Then come two big jumps: 1.88 (joining two clouds) and 2.65 (joining the last). To get **3 clusters** you undo the last two merges (a jump of 2.5× over the previous merge, 1.88 / 0.75); to get 2 you undo only the final one (2.65). Cutting at 4 clusters would undo a merge of 0.75, hardly bigger than its predecessor (0.60), so there is no reason to prefer four. The gap says three.

## Bench

```bench
id: hierarchical-clustering
title: Cut the merge tree
fallback: Fifteen points from three clouds are clustered by average-linkage hierarchical clustering; a slider sets how many clusters remain after cutting the tree, and a bar chart shows the size of every merge with the undone ones highlighted.
```

**Try this**

1. Set the cut to 3 clusters and look at the bar chart.
2. Change to 2, then 4, and note which merge is undone.
3. Find the big jumps in the merge distances.
4. Try cutting into 8 clusters.

**What you should notice:** the natural cut is where merge distances jump, and asking for more clusters than the data has means undoing merges that were nearly free.

## Where it appears in AI

* **Biology:** gene-expression and species trees.
* **Document and image collections** organised by topic at several levels.
* **Exploring embeddings** before choosing a flat clustering.

## Common pitfalls

* **Single linkage chaining** unrelated groups through a bridge of points.
* **Unscaled features,** as with any distance method.
* **Large datasets,** where the method is too slow.
* **Reading the tree's left-right order as meaningful:** only merge heights are.

## Quick check

<details><summary>1. What does the algorithm do at each step?</summary>
Merge the two closest groups.
</details>

<details><summary>2. How do you get 4 clusters from the merge tree?</summary>
Undo the last three merges (cut so that four groups remain).
</details>

<details><summary>3. What signals a natural number of clusters?</summary>
A large jump in successive merge distances.
</details>

## Key terms

* **Dendrogram:** the tree of merges.
* **Linkage:** the rule for the distance between groups.
* **Agglomerative:** building up by merging.
* **Cut:** choosing a height on the tree to define the clusters.

## Related

[[k-Means Clustering]] · [[Choosing the Number of Clusters]] · [[Trees and Hierarchies]] · [[Norms and Distance]] · [[Graphs and Networks]]
