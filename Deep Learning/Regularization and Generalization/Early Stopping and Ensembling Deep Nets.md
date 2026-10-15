Training loss can keep falling long after a network has stopped getting better on data it hasn't seen. **Early stopping** watches validation loss during training and keeps the checkpoint from the point where it was lowest, rather than training's final weights. **Ensembling** takes a different, complementary route to the same goal: train several networks and average their predictions, so each one's individual mistakes partly cancel out.

**You need:** [[Overfitting and Double Descent]] and [[Cross-Validation]].

## The question it answers

"Training loss is still improving — does that mean I should keep training?" Not necessarily: once validation loss starts rising while training loss keeps falling, the network has moved from learning the task to memorising the training set's noise.

## Intuition: stop at the fork, or ask several opinions

Early stopping is like checking in on a hike every so often: as long as each check-in is closer to the destination than the last, keep going; the moment a check-in moves further away, go back to the best one you had. Ensembling takes a different approach entirely: instead of trying to pick the single best-trained network, train several and let their mistakes average out — much like asking five people to each guess a jar's contents and averaging their guesses, which tends to beat any one guesser's bias.

## Definitions

```text
early stopping:  track val_loss(epoch); keep the checkpoint at argmin(val_loss), even if training continues past it

ensembling:      ŷ = (1/K) Σ fₖ(x)      — the average prediction over K independently trained models
```

## A worked example

**Early stopping.** A training loss that keeps decaying and a validation loss with an overfitting term that eventually turns it back up:

```text
epoch        0       5      10      13      15      20      25      30
train       2.100   0.836   0.371   0.249   0.200   0.137   0.114   0.105
val         2.100   0.861   0.471   0.418   0.425   0.537   0.739   1.005
```

Validation loss is lowest at epoch 13 (0.418); training loss keeps falling all the way to epoch 30 and beyond. Early stopping keeps the epoch-13 checkpoint, even though a model trained for the full 30 epochs would show a far better *training* loss.

**Ensembling.** Five independently trained networks' predictions on one test point, true value `0.65`:

```text
predictions:  0.62   0.71   0.55   0.68   0.59
average:      0.63

individual squared errors: 0.0009  0.0036  0.0100  0.0009  0.0036   → average 0.0038
ensemble (average) squared error: (0.63 − 0.65)² = 0.0004
```

The ensemble's error (0.0004) is roughly ten times smaller than the *average* individual network's error (0.0038) — the networks' mistakes point in different directions and partly cancel when averaged.

## Bench

```bench
id: early-stop-ensemble
title: Stopping at the best epoch, and averaging several models
fallback: Two linked views. One steps through training epochs, tracking training and validation loss and marking the best checkpoint so far. The other shows several models' predictions on one point and compares each one's error to the ensemble average's error.
```

**Try this**

1. Step through the training-curve view epoch by epoch and watch when the "best so far" marker stops moving.
2. Keep stepping well past that point and compare how training loss and validation loss diverge.
3. Switch to the ensembling view and add models one at a time, watching the ensemble's error shrink as more (independent) predictions are averaged in.

**What you should notice:** early stopping is about *when* to stop one model; ensembling is about combining *several* models — and they are not mutually exclusive, since each member of an ensemble can itself use early stopping.

## Where it appears in AI

* **Nearly every deep learning training run uses some form of early stopping**, even just "keep the checkpoint with the best validation score."
* **Ensembling is expensive at inference time** (every member model must run), so it is more common in settings where accuracy matters more than latency, or compressed afterward (see [[Knowledge Distillation]]).
* **Both are safety nets for exactly the overfitting behaviour described in [[Overfitting and Double Descent]]** — stopping on time, and averaging away idiosyncratic mistakes.

## Common pitfalls

* **Stopping too early, on a single noisy validation fluctuation.** Early stopping is usually combined with "patience" — waiting several epochs without improvement before actually stopping — to avoid reacting to noise.
* **Ensembling models that are not actually independent.** Five copies of the same network with the same initialization and data order will mostly make the same mistakes, and averaging them gains little.
* **Forgetting ensembling costs compute at inference, not just training.** Every member model must be run on every prediction.

## Quick check

<details><summary>1. In the worked early-stopping example, why does early stopping keep the epoch-13 checkpoint rather than epoch 30's?</summary>
Validation loss is lowest at epoch 13; by epoch 30, training loss has kept falling but validation loss has risen far above its epoch-13 value, a sign of overfitting.
</details>

<details><summary>2. Why did averaging five predictions produce a smaller error than any typical individual prediction?</summary>
The individual models' errors point in different directions around the true value, so averaging cancels out much of that scatter rather than compounding it.
</details>

<details><summary>3. What do early stopping and ensembling have in common?</summary>
Both are ways to counter overfitting without changing the model's architecture — one by controlling training duration, the other by combining multiple trained models.
</details>

## Key terms

* **Early stopping:** halting training (or keeping an earlier checkpoint) once validation performance stops improving.
* **Patience:** the number of epochs without improvement tolerated before actually stopping.
* **Ensembling:** averaging the predictions of several independently trained models.

## Related

[[Overfitting and Double Descent]] · [[Cross-Validation]] · [[Dropout]] · [[Knowledge Distillation]]
