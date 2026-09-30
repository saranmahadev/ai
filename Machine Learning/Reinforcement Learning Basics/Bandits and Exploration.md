The simplest reinforcement problem has no states: several slot machines ("arms") with unknown average payouts, and you choose one each time. To earn the most you must both **exploit** what looks best and **explore** the others in case you are wrong. Too little exploration locks you into a mediocre arm; too much wastes pulls.

**You need:** [[Rewards, States and Policies]], [[Law of Large Numbers]] and [[Expectation]].

## The question it answers

"Do I keep doing what has worked, or try something new?" Every learning system that acts (recommenders, ads, experiments, drug trials) faces this trade-off.

## Intuition: the restaurant problem

You have eaten at one restaurant four times and it was fine. Do you go again, or try a new place that might be better or worse? Only by trying it can you find out, but each try costs a good meal if it is bad. Early on, exploring is cheap relative to what you might learn; later, when you are fairly sure, it is expensive.

## Definitions

```text
arm a          an action with unknown average reward μₐ
estimate Qₐ    the average reward seen so far from arm a:  Qₐ ← Qₐ + (reward − Qₐ) / n
ε-greedy       with probability 1 − ε pull the arm with the highest Qₐ (exploit)
               with probability ε pull a random arm (explore)
regret         the reward lost compared with always pulling the best arm
other rules    optimistic starts, upper confidence bounds (UCB), Thompson sampling
```

By the law of large numbers, estimates approach the true averages only for arms you keep pulling. A pure greedy agent (ε = 0) may never revisit an arm that was unlucky early.

## A worked example

A five-armed bandit; each arm's true average is drawn at random from a standard normal, and each pull pays that average plus noise of spread 1. The best arm averages about 1.16 across random draws of the arms. Average reward over 200 runs of 500 pulls:

```text
ε        first 50 pulls    last 100 pulls
0            0.830              0.937
0.01         0.835              1.028
0.1          0.803              1.042
0.3          0.664              0.827
```

Greedy (ε = 0) does as well as any in the first 50 pulls (it has little to lose yet), but it stalls at 0.94 because it often locks onto the wrong arm. A little exploration (0.01 to 0.1) wins by the end: about 1.03–1.04. Too much (0.3) keeps wasting a third of its pulls on random arms and finishes lowest at 0.83. None reaches the ideal 1.16, which needs knowing the best arm in advance.

## Bench

```bench
id: bandit-explore
title: Explore or exploit?
fallback: Average reward over time on a five-armed bandit for four exploration rates, averaged over 200 runs; a slider highlights one rate and the bench shows its early and late average reward next to the best possible.
```

**Try this**

1. Highlight ε = 0 and read the first-50 and last-100 averages.
2. Move through ε = 0.01, 0.1 and 0.3.
3. Find which rate is best early and which is best late.
4. Compare each with the best possible.

**What you should notice:** the greedy agent starts as well as any but stops improving, moderate exploration wins over a long run, and heavy exploration is a constant tax.

## Where it appears in AI

* **A/B and multi-armed tests** in products.
* **Recommenders and ad placement,** which must keep trying new items.
* **Reinforcement learning:** exploration strategies in every agent (see [[Q-Learning]]).
* **Language model training tricks** that sample rather than always taking the top choice.

## Common pitfalls

* **Never exploring,** so early luck decides everything.
* **Exploring at a fixed rate forever,** when exploration should shrink as knowledge grows.
* **Judging arms from very few pulls.**
* **Non-stationary worlds,** where old averages mislead and estimates must keep updating.

## Quick check

<details><summary>1. What does ε-greedy do with probability ε?</summary>
Pulls a random arm (explores).
</details>

<details><summary>2. Why can a purely greedy agent get stuck?</summary>
An arm that was unlucky early may never be tried again, so its true value is never learned.
</details>

<details><summary>3. What is regret?</summary>
The reward lost compared with always choosing the best arm.
</details>

## Key terms

* **Exploration:** trying options to learn about them.
* **Exploitation:** choosing what currently looks best.
* **ε-greedy:** exploring at random with probability ε.
* **Regret:** the cumulative reward lost against the best fixed choice.

## Related

[[Expectation]] · [[Law of Large Numbers]] · [[Rewards, States and Policies]] · [[Q-Learning]] · [[Hypothesis Testing and P-values]]
