Depth, width, kernel sizes, how layers connect — every architecture in [[CNN Architectures: From LeNet to ResNet|the CNN lineage]] was designed by hand, by researchers trying ideas and comparing results. **Neural architecture search (NAS)** automates that process: search over a space of possible architectures, score each candidate, and let the search itself find a good trade-off between accuracy and cost.

**You need:** [[CNN Architectures: From LeNet to ResNet]] and [[Hyperparameter Tuning]].

## The question it answers

"Must a good architecture always come from human intuition and trial and error?" Not entirely — if you can define a space of possible architectures and a way to score any candidate from that space, search methods (grid search, random search, evolutionary search, reinforcement learning, gradient-based relaxations) can explore it automatically.

## Intuition: treating the architecture itself as something to tune

[[Hyperparameter Tuning]] already searches over settings like learning rate or batch size; NAS just widens what counts as a "setting" to include the architecture itself — number of layers, layer widths, which operations to use where. The score for any candidate typically balances accuracy against cost (compute, memory, latency), since the "best" architecture is rarely just the biggest one.

## Definitions

```text
search space:   the set of architecture choices considered (depth, width, kernel sizes, …)
search strategy: how candidates are proposed (grid, random, evolutionary, RL-based, gradient-based)
score(candidate):  typically accuracy on a validation set, minus some penalty for cost
```

## A worked example

A tiny, deliberately simple grid search over depth `d ∈ {2, 3, 4}` and width `w ∈ {8, 16, 32}`, scoring each with a toy accuracy-proxy (saturating with more capacity) minus a cost penalty (growing quadratically with capacity):

```text
accuracy proxy(d, w) = 1 − 1/(1 + 0.1·d·w)
cost penalty(d, w)   = 0.0005·(d·w)²
score = accuracy proxy − cost penalty

d=2, w=8:   accuracy 0.6154,  cost 0.1280,  score  0.4874   ← best
d=2, w=16:  accuracy 0.7619,  cost 0.5120,  score  0.2499
d=2, w=32:  accuracy 0.8649,  cost 2.0480,  score −1.1831
d=4, w=32:  accuracy 0.9275,  cost 8.1920,  score −7.2645
```

The architecture with the *highest raw accuracy proxy* (`d=4, w=32`) has by far the *worst* overall score, because its cost penalty overwhelms the accuracy gain — the grid search correctly picks the small `d=2, w=8` architecture instead, exactly the kind of trade-off NAS is meant to automate.

## Bench

```bench
id: nas-grid
title: Searching a small architecture grid
fallback: A grid of depth and width choices, each with an accuracy proxy and a cost penalty. See every candidate's score and which one the search picks as best, and adjust the cost penalty's weight to see the choice shift.
```

**Try this**

1. Look at the full grid of scores and find which candidate wins.
2. Increase the cost penalty's weight and watch the winning candidate shrink toward smaller architectures.
3. Decrease the cost penalty's weight toward zero and watch the largest architecture start to win instead.

**What you should notice:** the "best" architecture is entirely a function of how accuracy and cost are weighed against each other — there's no universal winner, only a winner relative to a chosen trade-off.

## Where it appears in AI

* **Mobile and embedded models** (see [[Edge and On-Device Deep Learning]]) are a common target for NAS, since cost (latency, memory, power) matters as much as raw accuracy for these deployments.
* **Real NAS search spaces and strategies are vastly larger and more sophisticated** than this toy grid — reinforcement learning and gradient-based methods (like DARTS) can search spaces far too large to enumerate exhaustively.
* **NAS itself can be extremely expensive to run**, since naive versions require training (or at least evaluating) many candidate architectures — a real engineering trade-off search methods are specifically designed to reduce.

## Common pitfalls

* **Treating NAS as free.** Searching over architectures, especially by training each candidate from scratch, can cost more compute than training one well-chosen architecture by hand.
* **Forgetting the score function's design drives everything.** Changing how accuracy and cost are weighed (or what "cost" even measures — latency? memory? energy?) can completely change which architecture the search prefers.
* **Assuming a found architecture generalises to a very different deployment target.** An architecture optimised for one hardware/cost trade-off may be a poor choice for a very different one.

## Quick check

<details><summary>1. What does neural architecture search widen "hyperparameter tuning" to include?</summary>
The architecture itself — depth, width, kernel sizes and connection patterns — not just training settings like learning rate.
</details>

<details><summary>2. In the worked example, why does the architecture with the highest accuracy proxy score worst overall?</summary>
Its cost penalty grows quadratically with capacity and ends up far outweighing its accuracy advantage.
</details>

<details><summary>3. Is there a single "best" architecture independent of how the score function is defined?</summary>
No — the winning candidate depends entirely on how accuracy and cost are weighed against each other in the score.
</details>

## Key terms

* **Search space:** the set of architecture choices a NAS method considers.
* **Search strategy:** the method used to propose and evaluate candidate architectures.
* **Accuracy-cost trade-off:** balancing a candidate's performance against its compute, memory or latency cost.

## Related

[[CNN Architectures: From LeNet to ResNet]] · [[Hyperparameter Tuning]] · [[Edge and On-Device Deep Learning]] · [[Choosing an Architecture for a Problem]]
