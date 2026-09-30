**k-means** groups unlabelled points into `k` clusters by repeating two steps: assign every point to its nearest centre, then move each centre to the average of its points. It is the simplest and most used clustering method, and it shows how a model can learn structure with no answers given.

**You need:** [[Kinds of Learning]], [[Norms and Distance]] and [[Scaling and Normalisation]].

## The question it answers

"What natural groups are in this data?" Customers with similar habits, pixels of similar colour, documents on similar topics: no one labelled them, but the data has shape.

## Intuition: centres and their catchment areas

Drop `k` marker flags on the map at random. Every point walks to its nearest flag, forming `k` crowds. Each flag then moves to the middle of its crowd. Points may now be nearer a different flag, so they re-choose, the flags move again, and so on until nothing changes. Each round can only reduce the total squared distance from points to their centres, so the process always settles.

## Definitions

```text
assign   cᵢ = the centre nearest to point xᵢ
update   each centre = the mean of the points assigned to it
inertia  Σ ‖xᵢ − centre of xᵢ's cluster‖²      the quantity k-means reduces
```

Two weaknesses matter in practice. The result depends on the starting centres, and k-means can settle in a poor **local minimum**; the standard fix is smarter seeding (k-means++) and several restarts, keeping the lowest inertia. It also assumes round, similar-sized clusters and uses distance, so features must be scaled.

## A worked example

One-dimensional points `1, 2, 9, 10, 11` and two centres starting at `1` and `2`.

```text
assign:  1 → centre 1;  2 → centre 2 (distance 0);  9, 10, 11 → centre 2
update:  centre 1 = 1;   centre 2 = (2 + 9 + 10 + 11) / 4 = 8
assign:  1 → centre 1;  2 → centre 1 (1 away, against 6);  9, 10, 11 → centre 2
update:  centre 1 = 1.5; centre 2 = 10        → nothing changes next round: settled
inertia  = (0.25 + 0.25) + (1 + 0 + 1) = 2.5
```

On 100 points from four overlapping clouds (bench data), the outcome depends on the start:

```text
random start 2:  settles after 3 iterations at inertia 66.8
random start 3:  settles after 8 iterations at inertia 116.9    ← stuck: two clusters share one cloud
best of several starts: inertia 66.3
```

Start 3 leaves two centres inside one cloud and one centre stretched across two others. It is a stable configuration, just a bad one, and only a different start escapes it.

## Bench

```bench
id: kmeans-steps
title: k-means, one iteration at a time
fallback: Points from four overlapping clusters are coloured by their nearest centre; step through k-means one iteration at a time, watching the centres move and the inertia fall, with a slider for k and a button to restart from a new random start.
```

**Try this**

1. With k = 4, press **One iteration** until it settles.
2. Press **New random start** several times and note the final inertia each time.
3. Find a start that gets stuck in a poor arrangement.
4. Change k to 2 and to 6.

**What you should notice:** inertia falls every step and stops, different starts can settle at different values, and the "right" k is not something the algorithm tells you.

## Where it appears in AI

* **Customer and market segmentation.**
* **Colour quantisation and image compression:** replace colours by their cluster centre.
* **Vector quantisation:** codebooks in search and speech; a step in building visual vocabularies.

## Common pitfalls

* **One run only,** which may hit a bad local minimum.
* **Unscaled features,** which let one column decide the groups.
* **Non-round clusters,** such as crescents or rings, which k-means splits badly.
* **Treating clusters as ground truth:** they are one way to slice the data.

## Quick check

<details><summary>1. What are k-means' two alternating steps?</summary>
Assign each point to its nearest centre; move each centre to the mean of its points.
</details>

<details><summary>2. Why can k-means give different answers on the same data?</summary>
It starts from random centres and can settle in different local minima.
</details>

<details><summary>3. Can inertia go up during k-means?</summary>
No, each step lowers it or leaves it unchanged.
</details>

## Key terms

* **Centroid:** the mean position of a cluster.
* **Inertia:** total squared distance from points to their centres.
* **Local minimum:** a stable arrangement that is not the best possible.
* **k-means++:** a seeding rule that spreads the starting centres out.

## Related

[[Norms and Distance]] · [[Scaling and Normalisation]] · [[Choosing the Number of Clusters]] · [[Gaussian Mixtures and EM]] · [[Kinds of Learning]]
