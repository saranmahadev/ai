A training run that takes days can fail for all kinds of reasons that have nothing to do with the model — a machine reboots, a job gets pre-empted, a bug crashes the process. **Checkpointing** periodically saves everything needed to resume exactly where training left off; **reproducibility** is the related, separate goal of being able to get the *same* result twice, given the same starting conditions.

**You need:** [[Random Numbers and Seeds]] and [[Debugging a Training Run]].

## The question it answers

"If a multi-day training run fails three-quarters of the way through, do I really have to start over from scratch?" Not if you've been checkpointing — saving the model weights, optimizer state and step count regularly lets a run resume from the last save instead of from zero.

## Intuition: a save point in a long, interruption-prone game

A checkpoint is exactly a video game's save point: if something goes wrong, you reload from the last save instead of replaying the entire game from the beginning. Checkpointing too rarely risks losing a lot of progress if something fails right before the next save; checkpointing too often wastes time on the saving itself — there's a real trade-off, not an obviously "more is better" answer.

## Definitions

```text
checkpoint:   a saved snapshot of the model's weights, the optimizer's internal state,
              the current step number, and (for true reproducibility) the random-number
              generator's state

checkpoint interval C:  how many steps between saves
expected cost(C) ≈ C/2  (expected wasted progress if a failure happens, on average, mid-interval)
                  + S·T/C   (total time spent saving, S = cost per save, T = total training steps)
```

**Reproducibility** needs more than a saved checkpoint: fixing every source of randomness (data shuffling order, weight initialization, dropout masks) to the same seed, and sometimes disabling certain parallel floating-point operations whose exact rounding order can otherwise vary run to run even with identical seeds.

## A worked example

A training run of `T = 10,000` steps, where saving a checkpoint costs the equivalent of `S = 10` steps, compared across different checkpoint intervals `C`:

```text
C = 100:    expected cost ≈ 100/2  + 10×10000/100  = 50 + 1000  = 1050
C = 300:    expected cost ≈ 300/2  + 10×10000/300  = 150 + 333  = 483
C = 447:    expected cost ≈ 447/2  + 10×10000/447  = 224 + 224  = 447    ← minimum
C = 1000:   expected cost ≈ 1000/2 + 10×10000/1000 = 500 + 100  = 600
```

The cost at the extremes (checkpointing too rarely, at `C=100`, or too often relative to run length, at `C=1000`) is noticeably higher than at the balanced point near `C ≈ 447`, where the two costs — wasted progress on failure, and time spent saving — are almost exactly equal.

## Bench

```bench
id: checkpoint-interval
title: Finding a good checkpoint interval
fallback: Sliders for total training steps and the cost of one save. See the expected total cost (wasted progress plus saving overhead) across a range of checkpoint intervals, and find the minimum.
```

**Try this**

1. Move the checkpoint-interval slider and watch the two cost components trade off against each other.
2. Increase the cost of a single save and watch the optimal interval shift longer.
3. Increase total training steps and see how the optimal interval changes.

**What you should notice:** the optimal interval balances two opposing costs almost exactly at the minimum — too frequent saving wastes time on the saves themselves, too infrequent saving risks losing too much progress on failure.

## Where it appears in AI

* **Large, long-running training jobs checkpoint routinely**, often every few minutes to every few hours depending on run length and save cost, precisely to avoid catastrophic loss from an interruption.
* **True bit-for-bit reproducibility across different hardware or software versions is notoriously hard to guarantee**, even with every seed fixed, because of exactly the floating-point rounding-order sensitivity mentioned above.
* **Checkpoints are also used for purposes beyond crash recovery**: evaluating the model's performance at intermediate points, or rolling back to an earlier checkpoint if a later one turns out to have diverged (see [[Debugging a Training Run]]).

## Common pitfalls

* **Checkpointing only the weights, not the optimizer's state.** Resuming without the optimizer's internal statistics (such as Adam's running averages) can behave noticeably differently from an uninterrupted run.
* **Assuming a fixed random seed guarantees identical results across different hardware or software versions.** It greatly improves reproducibility but doesn't always guarantee it exactly, due to non-deterministic parallel floating-point operations.
* **Picking a checkpoint interval based on intuition alone.** As the worked example shows, there's a genuine, calculable trade-off, not just "more checkpoints are always safer."

## Quick check

<details><summary>1. What does a checkpoint need to include, beyond just the model's weights, to let training resume properly?</summary>
The optimizer's internal state and the current step number at minimum; for exact reproducibility, the random-number generator's state too.
</details>

<details><summary>2. Why isn't checkpointing as frequently as possible always the best choice?</summary>
Each checkpoint has its own time cost; checkpointing extremely often wastes a large fraction of total training time on saving rather than training.
</details>

<details><summary>3. Does fixing all random seeds guarantee bit-for-bit identical results across two different training runs?</summary>
Not always — some parallel floating-point operations can have a non-deterministic rounding order even with identical seeds, which can cause small differences despite careful seeding.
</details>

## Key terms

* **Checkpoint:** a saved snapshot of a model's weights, optimizer state and training progress.
* **Checkpoint interval:** how many training steps elapse between saved checkpoints.
* **Reproducibility:** the ability to obtain the same training result given the same starting conditions.

## Related

[[Random Numbers and Seeds]] · [[Debugging a Training Run]] · [[Distributed and Data-Parallel Training]] · [[Hyperparameter Tuning for Deep Networks]]
