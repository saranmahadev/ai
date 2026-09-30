Instead of learning values and reading off a policy, **policy gradient** methods learn the policy directly: a probability for each action, adjusted after every reward so that actions which paid become more likely. A **baseline** (such as the average reward) makes the updates far steadier, because only better-than-usual actions are reinforced.

**You need:** [[Q-Learning]], [[Gradient Descent]] and [[Softmax and Cross-Entropy in Practice]].

## The question it answers

"Can I improve a policy without estimating values first?" Yes, by nudging its parameters in the direction that raises expected reward, using rewards from actions actually taken. It also handles continuous actions and stochastic policies naturally, which tables of Q-values do not.

## Intuition: raise the odds of what paid

A policy is a set of probabilities, say from a softmax over three preferences. After taking an action and seeing a reward, increase the probability of that action if the reward was good, decrease it if bad. "Good" must mean *better than usual*: if every reward is around 5, then every action gets reinforced, the probabilities wander, and the signal is buried in noise. Subtracting the average reward (the baseline) turns "5" into "slightly above average" or "below average", so only actions that really beat the norm gain probability.

## Definitions

```text
policy      π(a) = softmax(θ)                       the probability of each action
update      θⱼ ← θⱼ + η · (r − b) · ( 1[j = a] − π(j) )
            η learning rate;  b baseline;  (r − b) is the advantage
REINFORCE   the algorithm that applies this update after each episode or action
actor–critic  learn a value function as the baseline and a policy to act
```

The update follows the gradient of expected reward. A baseline `b` does not change the average direction of the update, but it can greatly reduce its variance.

## A worked example

Three actions with true average rewards 4.2, 4.6 and 5.0 (noise 0.5). The best action is only slightly better than the others, and all rewards are large and positive. After 300 actions, probability given to the best action, over 10 runs from different seeds:

```text
learning rate 0.1, with baseline:      mean 0.94  (runs between 0.92 and 0.97)
learning rate 0.1, without baseline:   mean 0.50  (runs between 0.00 and 0.99)
```

With the baseline every run ends up settled on the best action. Without it, the runs are wildly inconsistent: some lock onto the worst action (probability of the best near 0) because all rewards are positive, so whichever action happens to be tried early is reinforced regardless of how good it is. A small learning rate (0.02) with the baseline is safe but slow (mean 0.61 after 300 actions).

## Bench

```bench
id: policy-gradient
title: Nudge the probabilities toward what paid
fallback: A softmax policy over three actions with average rewards 4.2, 4.6 and 5.0 is updated after every action; step or play, choose the learning rate, switch the baseline on or off, and watch the action probabilities over time, with a button to start a new run.
```

**Try this**

1. With the baseline on, play a run and watch the probabilities.
2. Press **Start a new run** several times.
3. Turn the baseline off and repeat.
4. Lower the learning rate to 0.02 and compare speed.

**What you should notice:** with a baseline the best action wins reliably, without it some runs lock onto a bad action, and the learning rate trades speed against jitter.

## Where it appears in AI

* **Fine-tuning language models with human feedback:** PPO and related methods are policy-gradient algorithms.
* **Robotics and games** with continuous or stochastic actions.
* **Actor–critic methods,** which combine a policy with a learned value baseline.

## Common pitfalls

* **No baseline,** giving noisy, unreliable learning.
* **Too large a step,** collapsing the policy onto one action too early.
* **Rewards that are not comparable across episodes.**
* **Sample hunger:** policy gradients often need many episodes.

## Quick check

<details><summary>1. What does a positive advantage (r − b) do?</summary>
It raises the probability of the action taken.
</details>

<details><summary>2. Why subtract a baseline?</summary>
To reduce the variance of the updates, so only better-than-usual actions are reinforced.
</details>

<details><summary>3. How does a policy gradient differ from Q-learning?</summary>
It adjusts the policy's probabilities directly, instead of learning action values and acting greedily.
</details>

## Key terms

* **Policy gradient:** adjusting policy parameters to increase expected reward.
* **Advantage:** how much better a reward was than the baseline.
* **Baseline:** a reference value subtracted to reduce variance.
* **Actor–critic:** a policy (actor) trained with a learned value function (critic).

## Related

[[Q-Learning]] · [[Gradient Descent]] · [[Softmax and Cross-Entropy in Practice]] · [[Bandits and Exploration]] · [[Stochastic Gradient Descent]]
