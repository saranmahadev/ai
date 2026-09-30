Clustering algorithms need you to say how many clusters there are, but the data rarely says. Two common hints are the **elbow** in the inertia curve (where adding clusters stops paying off) and the **silhouette score** (how well each point fits its own cluster compared with the nearest other one). Both are guides, not verdicts.

**You need:** [[k-Means Clustering]] and [[Describing Data]].

## The question it answers

"How many groups should I look for?" More clusters always reduce inertia (with `n` clusters it is zero), so inertia alone cannot decide.

## Intuition: when do extra clusters stop helping?

Splitting a genuine cluster in two gives a small gain; merging two genuine clusters costs a lot. So as `k` rises past the true number, the inertia stops dropping sharply and the curve bends: the elbow. The silhouette asks a different question of each point: am I much closer to my own cluster-mates than to the next cluster? A value near 1 means well placed, near 0 means on a border, negative means probably in the wrong cluster.

## Definitions

```text
inertia(k)   total squared distance to centres, using the best of several runs
elbow        the k after which inertia falls only slowly
a(i)         average distance from point i to others in its cluster
b(i)         average distance from point i to the nearest other cluster
silhouette   s(i) = (b − a) / max(a, b);  the score is the average over points  (−1 … 1)
```

Silhouette is not defined for `k = 1`. Other guides include the gap statistic and, for mixture models, information criteria (BIC). Often the most useful check is whether the clusters mean something you can act on.

## A worked example

One hundred points from four overlapping clouds (bench data), best of six starts for each `k`:

```text
k          1      2      3      4      5      6      7
inertia   434.2  225.5  144.1   68.5   58.5   49.9   42.4
silhouette  –    0.412  0.425  0.539  0.468  0.484  0.452
```

Inertia falls by 209 from `k = 1` to 2, by 81 to 3, and by 76 to 4, then only by 10 to 5: the elbow is at `k = 4`. The silhouette agrees, peaking at 0.539 for `k = 4`. Notice how gentle the bend is: the 3 → 4 drop (76) is real but the curve keeps sliding afterwards. With cleaner separation the elbow is sharper, with messier data it may not exist at all, which is why you also look at the clusters themselves.

## Bench

```bench
id: choose-k
title: How many clusters?
fallback: A scatter of points is clustered by k-means for a chosen k, beside curves of inertia and silhouette score against k with the current k marked.
```

**Try this**

1. Set k = 4 and look at the curves.
2. Step through k = 1 to 7 and watch the clusters.
3. Find the elbow in the inertia curve.
4. Compare the k the silhouette prefers with the elbow.

**What you should notice:** inertia falls forever, its bend near the true k is gentle, and the silhouette gives a second opinion that can peak at the same k or a different one.

## Where it appears in AI

* **Segmentation and topic discovery** where the number of groups is unknown.
* **Compression:** k trades quality for size.
* **Model selection generally:** more flexibility always fits better, so a penalty or a separate criterion is needed.

## Common pitfalls

* **Picking the k with the lowest inertia** (always the largest).
* **Expecting a crisp elbow.**
* **Ignoring cluster meaning and stability:** do the clusters persist on new samples?
* **Comparing silhouettes across different scalings** of the same data.

## Quick check

<details><summary>1. Why does inertia always decrease as k increases?</summary>
More centres can only bring points closer to a centre.
</details>

<details><summary>2. What does a silhouette near 0 mean for a point?</summary>
It lies on the border between two clusters.
</details>

<details><summary>3. Why run k-means several times for each k?</summary>
To avoid bad local minima; keep the run with the lowest inertia.
</details>

## Key terms

* **Elbow method:** picking the k where inertia's decline flattens.
* **Silhouette score:** how much closer points are to their own cluster than to the next.
* **Stability:** whether clusters reappear on resampled data.
* **Model selection:** choosing model complexity, here the number of clusters.

## Related

[[k-Means Clustering]] · [[Hierarchical Clustering]] · [[Describing Data]] · [[Hyperparameter Tuning]] · [[Overfitting in Statistics]]
