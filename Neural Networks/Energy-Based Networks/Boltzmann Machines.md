A Hopfield network only ever moves downhill, so it can get permanently stuck in a shallow dip that isn't the pattern you wanted. A Boltzmann machine fixes this with one change: let units flip against their own local field sometimes, with a probability controlled by a temperature, so the network can occasionally climb out of a bad dip on its way to a better one.

**You need:** [[Energy Functions and Attractor Dynamics]], [[Content-Addressable Memory and Capacity]].

## The question it answers

"How can an energy-based network avoid getting trapped in a bad local minimum?" By replacing the Hopfield network's deterministic `sign(h_i)` update with a *probabilistic* one: update to `+1` with a probability that favours the direction the local field points, but never with certainty, so there is always some chance of moving the "wrong" way and escaping a shallow dip.

## Intuition

Picture the energy landscape again, but now imagine shaking the whole table gently while the ball rolls. A gentle shake lets the ball hop out of a shallow dip it would otherwise be trapped in, while a deep dip still holds it most of the time. Shake harder (**higher temperature**) and the ball moves almost randomly, ignoring the landscape; shake less (**lower temperature**) and it behaves more and more like the deterministic Hopfield rule. Boltzmann machines usually start hot and cool down — **simulated annealing** — so early exploration gives way to settling into a good, hopefully global, minimum.

## Definition and notation

A Boltzmann machine update replaces the Hopfield sign rule with a stochastic one, using the same local field `h_i = Σⱼ W_ij s_j` and a temperature `T > 0`:

```text
P(s_i = 1) = sigmoid(h_i / T) = 1 / (1 + exp(−h_i / T))
```

As `T → 0`, this sharpens into the deterministic Hopfield rule (`P → 1` when `h_i > 0`, `P → 0` when `h_i < 0`). As `T` grows large, `P → 0.5` regardless of `h_i`: the network ignores the landscape and moves essentially at random. Sampling many units this way, over many steps, is a form of **Gibbs sampling**.

## A worked example

Two units with connection weight `W_01 = −1`, both currently at `s = [1, 1]`. Unit 0's local field is `h_0 = W_01 · s_1 = −1 × 1 = −1` — the connection "wants" unit 0 to be `−1`, but it currently is not. The probability of unit 0 staying at `+1` (moving against its own local field) at three temperatures:

```text
T = 0.2 (cold):  P(s_0 = 1) = sigmoid(−1 / 0.2) = sigmoid(−5)  ≈ 0.007
T = 1   (medium): P(s_0 = 1) = sigmoid(−1 / 1)   = sigmoid(−1)  ≈ 0.269
T = 5   (hot):    P(s_0 = 1) = sigmoid(−1 / 5)   = sigmoid(−0.2) ≈ 0.450
```

At the cold temperature the unit almost certainly flips to agree with its local field, just like a Hopfield network. At the hot temperature it is nearly a coin flip — the network barely notices the landscape. The medium temperature sits in between: biased toward flipping, but genuinely able to stay put roughly 27% of the time, which is exactly the kind of "wrong" move that lets a bigger network wander out of a shallow dip.

## Bench

```bench
id: boltzmann-anneal
title: Temperature, probability and escaping a dip
fallback: Set a temperature and see the probability that a unit stays against its own local field, then watch simulated annealing cool a network from hot to cold over a run.
```

**Try this**

1. Slide the temperature from hot to cold and watch the "stay against the field" probability shrink toward zero.
2. Run the annealing schedule and watch the network accept more uphill moves early, and almost none by the end.
3. Compare a single cold run (prone to getting stuck) against a full hot-to-cold anneal starting from the same state.

**What you should notice:** temperature is the only new ingredient over a Hopfield network — set it to (near) zero and a Boltzmann machine's behaviour collapses back to the deterministic rule from [[Hopfield Networks]].

## Where it appears in AI

* **It generalizes the Hopfield network's settling rule** to one that can escape the spurious, shallow local minima described in [[Content-Addressable Memory and Capacity]].
* **Hidden units turn it into a real learning model**: units not clamped to the visible pattern let the network represent correlations between visible units that a plain Hopfield network cannot — the next two topics, [[Layer-Wise and Unsupervised Pretraining|Contrastive Divergence]] and [[Restricted Boltzmann Machines]], build on exactly this.
* **Simulated annealing** (cooling temperature over time to search for a good, low-energy solution) is a general-purpose optimization technique that outlived Boltzmann machines themselves and is used well beyond neural networks.

## Common pitfalls

* **Treating temperature as a training hyperparameter.** It controls the stochasticity of *inference* (settling), not a learning rate for weights.
* **Expecting annealing to guarantee the global minimum.** It greatly improves the odds of escaping shallow dips, but offers no hard guarantee for a finite cooling schedule.
* **Running a fully-connected Boltzmann machine at scale.** Exact training is intractable for large networks with many hidden units — which is exactly the problem [[Restricted Boltzmann Machines]] exists to solve.

## Quick check

<details><summary>1. What happens to a Boltzmann machine's update rule as temperature approaches zero?</summary>
It becomes the deterministic Hopfield rule — a unit flips to match the sign of its own local field with probability 1.
</details>

<details><summary>2. In the worked example, why does the unit occasionally stay at +1 even though its local field favours −1?</summary>
Because the update is stochastic rather than deterministic — at a finite temperature, there is always some nonzero probability of moving against the local field, and that probability is what lets the network escape shallow dips.
</details>

<details><summary>3. What does simulated annealing mean in this context?</summary>
Starting at a high temperature (very stochastic, able to explore widely) and gradually cooling toward zero (increasingly deterministic), to settle into a good low-energy state rather than the first shallow dip found.
</details>

## Key terms

* **Temperature:** a parameter controlling how stochastic a Boltzmann machine's updates are; low temperature behaves like a Hopfield network, high temperature behaves nearly randomly.
* **Gibbs sampling:** repeatedly sampling each unit's state from its conditional probability given all the others, holding the rest fixed.
* **Simulated annealing:** cooling the temperature over the course of a run to combine early exploration with late-stage settling.

## Related

[[Hopfield Networks]] · [[Content-Addressable Memory and Capacity]] · [[Restricted Boltzmann Machines]]
