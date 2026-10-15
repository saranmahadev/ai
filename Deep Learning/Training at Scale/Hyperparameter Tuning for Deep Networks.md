[[Hyperparameter Tuning]] already covered searching over settings like regularization strength for classic models. Deep networks raise the stakes: more hyperparameters (learning rate, batch size, warmup length, architecture choices, and more), and each trial can cost hours or days to train — making naive exhaustive search often simply too expensive to run at all.

**You need:** [[Hyperparameter Tuning]] and [[Learning Rate Schedules and Warmup]].

## The question it answers

"Grid search over every combination of hyperparameters is already expensive for small models — how is it supposed to work when a single trial takes a day to train?" Mostly, it doesn't, at that scale — which is why cheaper search strategies, and especially ones that **stop bad trials early**, are the practical default for tuning deep networks.

## Intuition: cutting your losses early, not training every candidate to the finish line

Training every candidate configuration all the way to completion before comparing them wastes enormous compute on configurations that were obviously going to lose, long before they finished. **Successive halving** fixes this: start many candidates, train them all for a short while, throw out the worse half based on that partial result, and give the survivors more training — repeating until only the best few remain, each having earned their way to more compute by outperforming at every checkpoint along the way.

## Definitions

```text
naive search:        train every candidate configuration to completion, then compare
successive halving:   train all candidates for a short budget; keep the top half;
                       give survivors more budget; repeat until few candidates remain
```

## A worked example

8 candidate configurations, each potentially trained for up to 100 epochs. Comparing naive search (train every candidate the full 100 epochs) against successive halving:

```text
naive:                8 candidates × 100 epochs           = 800 epoch-units

successive halving:
  round 1:  8 candidates × 25 epochs                      = 200 epoch-units
  round 2:  keep top 4, each trains 25 more (total 50)    = 100 epoch-units
  round 3:  keep top 2, each trains 50 more (total 100)   = 100 epoch-units
  total:                                                     400 epoch-units

savings:  (800 − 400) / 800 = 50%
```

Successive halving reaches the same final training depth (100 epochs) for the eventual best candidates, while spending half the total compute — because it stops investing further training time in the 6 configurations that were already looking worse after just 25 epochs.

## Bench

```bench
id: successive-halving
title: Stopping weak candidates early
fallback: A number of candidates and a halving schedule. See the total compute budget used by successive halving compared to training every candidate to completion.
```

**Try this**

1. Increase the starting number of candidates and watch the naive cost grow linearly while halving's cost grows more slowly.
2. Change how aggressively the pool is halved (keep a smaller or larger fraction each round) and see the effect on total cost.
3. Think about the risk: what happens to a genuinely good configuration that happens to look weak early on, purely by chance?

**What you should notice:** the compute savings from early stopping are substantial, but they come with a real risk — a configuration that would have turned out well but looked unpromising in its first short budget gets eliminated before it had the chance to prove itself.

## Where it appears in AI

* **Hyperband**, a well-known practical algorithm, runs several successive-halving schedules with different aggressiveness settings in parallel, to hedge against exactly the early-elimination risk above.
* **Random search over grid search** remains a sensible default even without early stopping, since for most hyperparameter spaces, a few dimensions matter far more than others, and random sampling tends to explore the important ones more efficiently than an exhaustive grid.
* **Population-based training**, a related but distinct strategy not covered in depth here, lets surviving candidates also inherit and mutate each other's hyperparameters mid-training, rather than keeping each candidate's settings fixed throughout.

## Common pitfalls

* **Setting the first-round budget too short.** If early performance is too noisy to be informative, successive halving can eliminate genuinely good configurations purely due to that early noise.
* **Assuming hyperparameter tuning for deep networks is the same problem as for classic models, just bigger.** The per-trial cost changes which search strategies are even feasible to run at all.
* **Forgetting that successive halving's savings depend on early performance being predictive of final performance.** For some tasks or metrics, that assumption holds poorly, and the savings come at a real cost in search quality.

## Quick check

<details><summary>1. What makes exhaustive grid search often infeasible for deep network hyperparameters?</summary>
Each trial can take hours or days to train, so evaluating every combination in a large grid becomes prohibitively expensive, unlike cheaper classical models.
</details>

<details><summary>2. How does successive halving save compute compared to training every candidate fully?</summary>
It trains all candidates only briefly at first, eliminates the weaker half based on that partial result, and only gives further training budget to survivors — spending little compute on candidates that were already looking worse.
</details>

<details><summary>3. What is the main risk of successive halving?</summary>
A configuration that would have performed well with more training, but looked unpromising within the short first-round budget, can be eliminated before it has a chance to prove itself.
</details>

## Key terms

* **Successive halving:** a search strategy that eliminates the weaker half of candidates at each checkpoint, giving only survivors further training budget.
* **Hyperband:** a practical algorithm running several successive-halving schedules in parallel to hedge against early elimination risk.
* **Epoch-units:** a simple measure of total training compute used, summed across every candidate and training round.

## Related

[[Hyperparameter Tuning]] · [[Learning Rate Schedules and Warmup]] · [[Debugging a Training Run]] · [[Scaling Laws and Model Capacity]]
