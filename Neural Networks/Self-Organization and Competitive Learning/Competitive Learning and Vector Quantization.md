[[Self-Organizing Maps|The previous topic's]] update rule has two parts: find the winner, then update the winner *and its neighbours*. Strip away the neighbours entirely — update only the single winning unit — and what's left is plain competitive learning, which is exactly the online learning rule behind vector quantization and a close cousin of k-means clustering.

**You need:** [[Self-Organizing Maps]].

## The question it answers

"What does self-organization reduce to without any neighbourhood structure at all?" Competitive learning: for each input, find the single closest codebook vector (the winner) and move only that vector toward the input. Nothing else updates. The result is a small set of **codebook vectors** (also called prototypes), each one responsible for a region of the input space — the same idea as [[Self-Organizing Maps]], minus the grid.

## Intuition

Imagine a handful of "representative" points scattered in the data space, each trying to claim the inputs nearest to it. Every time a new input arrives, exactly one representative — whichever is currently closest — gets to update: it nudges itself slightly toward that input, making it an even better match for similar future inputs. Over many inputs, each representative ends up sitting near the centre of whichever cluster of data keeps winning it.

## Definition and notation

For codebook vectors `w₁, …, wₖ` and an input `x`:

```text
winner = argmin_i ‖wᵢ − x‖
w_winner ← w_winner + η · (x − w_winner)
all other wᵢ: unchanged
```

This is literally [[Self-Organizing Maps|the SOM update rule]] with the neighbourhood function reduced to "1 for the winner, 0 for everyone else." Representing data this way — replacing each point with its nearest codebook vector's index — is called **vector quantization**: a form of lossy compression where only the codebook, and which entry each point was closest to, needs to be stored.

## A worked example

The same four codebook vectors and input as [[Self-Organizing Maps|the previous topic]], `w₀=[0.1,0.1], w₁=[0.4,0.6], w₂=[0.8,0.2], w₃=[0.9,0.9]`, input `x=[0.5,0.5]`, `η=0.5`:

```text
winner = unit 1 (closest, same as before)
w₁ ← [0.4,0.6] + 0.5 × ([0.5,0.5] − [0.4,0.6]) = [0.450, 0.550]
w₀, w₂, w₃: unchanged
```

Compare this to the SOM update on the same input: there, units 0 and 2 also moved a little because they were within the neighbourhood radius. Here, with no neighbourhood at all, they stay exactly where they were.

Running two codebook vectors, started close together at `[0.5,0.5]` and `[0.51,0.49]`, through 200 points drawn from two well-separated clusters (centred near `[0.2,0.2]` and `[0.8,0.8]`), one competitive-learning update per point:

```text
codebook after one pass ≈ [0.197, 0.188]  and  [0.788, 0.808]
```

The two codebook vectors split apart and settled almost exactly on the two cluster centres — competitive learning found the clusters using only local, one-winner-at-a-time updates, with no notion of "cluster" ever computed explicitly.

## Bench

```bench
id: vq-codebook
title: Codebook vectors claim their clusters
fallback: Feed a small codebook of vectors a stream of points from two clusters, one at a time, and watch each codebook vector settle on the cluster it keeps winning.
```

**Try this**

1. Step through single updates and see which codebook vector wins each point.
2. Run a full pass over the data and watch both codebook vectors converge to the two cluster centres.
3. Compare starting the codebook vectors far apart against starting them close together, as in the worked example.

**What you should notice:** convergence does not require knowing in advance how many clusters there are to be "right" about — it requires having at least as many codebook vectors as real clusters, and each one ends up representing whichever region of data it keeps winning.

## Where it appears in AI

* **It is an online, one-point-at-a-time version of [[K-Means Clustering|k-means]]** on [[Machine Learning]]: k-means updates each centroid using the *average* of all its currently assigned points in a batch step, while competitive learning nudges one codebook vector a little with every single point.
* **Vector quantization compresses data** by storing only codebook indices instead of full vectors — used historically in signal and image compression, and the same underlying idea behind representing data with a fixed, learned set of prototypes.
* **It is the mechanism self-organizing maps build on**, adding only the neighbourhood term covered in [[Self-Organizing Maps]].

## Common pitfalls

* **Expecting every codebook vector to end up used.** With too many codebook vectors, or a poor initialization, some can end up "dead" — never winning any input, and never moving from their starting position.
* **Confusing this with k-means's batch update.** Competitive learning updates immediately after each single point; k-means recomputes each centroid as the mean of its assigned points only after a full pass (or large batch).
* **Assuming the winner is always the "right" cluster.** Early in training, before the codebook vectors have separated, the winner for a given point can be essentially arbitrary — this is why convergence needs many points, not just one.

## Quick check

<details><summary>1. How does competitive learning's update differ from the self-organizing map's update on the same input?</summary>
Only the single winning unit updates; a SOM also updates the winner's grid neighbours by a smaller amount.
</details>

<details><summary>2. What is vector quantization, in terms of codebook vectors?</summary>
Representing each data point by the index of its nearest codebook vector, instead of the point's full coordinates — a form of lossy compression.
</details>

<details><summary>3. How does competitive learning's update timing differ from k-means?</summary>
It updates one codebook vector immediately after each single input; k-means instead recomputes each centroid as the average of all its currently assigned points, in a separate batch step.
</details>

## Key terms

* **Codebook vector (prototype):** one of a fixed set of representative vectors, each claiming the inputs nearest to it.
* **Winner-take-all:** an update rule where only the single best-matching unit changes on each input.
* **Vector quantization:** representing data by the index of its nearest codebook vector.

## Related

[[Self-Organizing Maps]] · [[K-Means Clustering]] · [[Norms and Distance]]
