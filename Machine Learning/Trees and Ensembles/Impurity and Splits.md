How does a tree decide which question to ask? It scores every candidate split by how much **impurity** it removes. A group is pure if all its members share a class and impure if the classes are mixed. The two standard measures, **Gini** and **entropy**, are both zero for a pure group and largest for an even mix.

**You need:** [[Decision Trees]] and [[Entropy]].

## The question it answers

"Which split is best?" Not the one with the most balanced sides, and not the one with the fewest errors right now, but the one after which the two groups are, on average, most one-sided.

## Intuition: sorting a mixed bag

A bag with five red and five blue marbles is maximally mixed. Split it into two bags: if one bag becomes all red and the other mostly blue, you have learned a lot. The **information gain** of a split is the drop in impurity from the parent to the size-weighted average of the children. The best split has the biggest gain.

## Definitions

For a group with class shares `p₀` and `p₁` (two classes):

```text
Gini      G = 1 − p₀² − p₁²  = 2·p₁·(1 − p₁)             pure: 0     even mix: 0.5
entropy   H = −p₀ log₂ p₀ − p₁ log₂ p₁                   pure: 0     even mix: 1 bit
weighted impurity after a split = (n_left/n)·I_left + (n_right/n)·I_right
gain = I_parent − weighted impurity after
```

Gini and entropy usually pick the same split; Gini is a little cheaper to compute. For regression trees the impurity is the variance of the target within each group.

## A worked example

Ten points on a line with labels (by position 1 to 10): `0 0 0 0 1 0 1 1 1 1`. Five are class 1, so the parent is an even mix: Gini `0.5`, entropy `1` bit.

```text
split between 5 and 6:  left = 4 zeros + 1 one, right = 1 zero + 4 ones
    Gini:    each side 2·0.2·0.8 = 0.32        weighted 0.32          gain 0.180
    entropy: each side 0.722 bits              weighted 0.722         gain 0.278

split between 4 and 5:  left = 4 zeros (pure), right = 5 ones + 1 zero (6 points)
    Gini:    left 0,  right 2·(5/6)·(1/6) = 0.278      weighted 0.6 × 0.278 = 0.167     gain 0.333
    entropy: left 0,  right 0.650 bits                weighted 0.390                    gain 0.610
```

The second split wins by both measures, even though it is not balanced (4 points against 6): it makes one side perfectly pure. A tie occurs at the mirror-image split between 6 and 7 (gain 0.333). Splitting between 3 and 4 is weaker (Gini gain 0.214) because its right side is still mixed.

## Bench

```bench
id: impurity-splits
title: Score a split
fallback: Ten labelled points on a line with a slider for the split position; the bench shows the impurity before, on each side and after the split, using Gini or entropy, together with the gain and the best gain possible.
```

**Try this**

1. Move the split across all positions and watch the gain.
2. Find the best split.
3. Switch between Gini and entropy and compare which split wins.
4. Try a split that leaves both sides mixed.

**What you should notice:** the best split is the one that leaves a side pure, Gini and entropy agree on the winner, and a split that leaves both sides mixed gains little.

## Where it appears in AI

* **Tree learners** (CART, ID3, C4.5) use Gini or entropy gain.
* **Boosted trees** use the same idea with loss-based gains.
* **Entropy and information gain** connect trees to [[Information Theory]].

## Common pitfalls

* **Picking splits by accuracy alone,** which is blind to progress that does not yet change the majority.
* **Favouring features with many values** (such as IDs), which can split perfectly by chance; use gain ratio or limit leaf size.
* **Ignoring the weights:** a tiny pure side is worth little.
* **Overtrusting one greedy split:** the best first split is not always part of the best tree.

## Quick check

<details><summary>1. What is the Gini impurity of a group that is 80% one class?</summary>
2 × 0.8 × 0.2 = 0.32.
</details>

<details><summary>2. What is the entropy of a pure group?</summary>
0 bits.
</details>

<details><summary>3. Why weight child impurities by group size?</summary>
A large mixed group matters more than a tiny pure one.
</details>

## Key terms

* **Impurity:** how mixed the classes in a group are.
* **Gini impurity:** 1 minus the sum of squared class shares.
* **Information gain:** the drop in entropy from a split.
* **Split:** a question dividing a group into two.

## Related

[[Decision Trees]] · [[Entropy]] · [[Surprise and Information]] · [[Pruning and Overfitting]] · [[Random Forests]]
