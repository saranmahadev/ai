A training run that looks "broken" is usually not a mystery — most failures leave a recognisable signature in the loss curve or the gradient statistics, and reading that signature correctly points straight at the likely cause.

**You need:** [[Vanishing and Exploding Gradients]] and [[Learning Rate Schedules and Warmup]].

## The question it answers

"The loss isn't behaving — where do I even start looking?" Start with the shape of the loss curve (and the gradient norm, if available) — a handful of recognisable patterns cover most real training failures.

## Intuition: a doctor reading symptoms, not guessing blindly

A flat loss that never moves, a loss that suddenly shoots to infinity, a loss that looks great on training data but terrible on validation data — each of these is a distinct "symptom" with a short list of usual causes, the same way a doctor narrows down a diagnosis from a specific set of symptoms rather than guessing at random.

## Definitions

```text
symptom                          likely cause(s)
loss never moves                 learning rate far too small; a bug stopping gradients from flowing;
                                  bad initialization (see Weight Initialization)
loss explodes to NaN/Infinity    learning rate far too large; exploding gradients (see
                                  Vanishing and Exploding Gradients); missing gradient clipping
train loss great, val loss bad   overfitting; see Overfitting and Double Descent
train loss suspiciously perfect, immediately   data leakage: the model can "see" the answer
                                  somewhere it shouldn't (see Pipelines and Leakage)
loss oscillates noisily          learning rate too high; batch size too small (see
                                  Batch Size and Training Dynamics)
```

## A worked example

Gradient norms logged at six consecutive training steps:

```text
step        1     2     3      4       5       6
grad norm  1.2   1.5   1.8   15.3    890.2    NaN
```

Steps 1–3 look healthy (small, slowly changing norms). Step 4's jump to 15.3 (an order of magnitude larger) is the first clear warning sign — exactly the kind of spike [[Gradient Clipping]] exists to cap. By step 5 the norm has exploded further (890.2), and by step 6 it has become `NaN` — a training run that has, numerically, already failed. Catching this at step 4, before it cascades, is exactly what gradient-norm monitoring and clipping are for.

## Bench

```bench
id: loss-symptoms
title: Reading a loss curve's symptoms
fallback: Pick a common failure pattern (flat loss, exploding loss, overfitting gap, noisy oscillation) and see an example curve alongside the likely causes to check first.
```

**Try this**

1. Step through each failure pattern and compare its curve shape to the others.
2. For "exploding loss," find the step the gradient norm first crosses a danger threshold.
3. For "overfitting gap," compare how early the train and validation curves start to diverge.

**What you should notice:** each failure pattern has a visually distinct shape — flat, diverging-to-infinity, train-vs-val-gap, or noisy-but-not-diverging — and that shape alone narrows down the likely cause well before any deeper investigation.

## Where it appears in AI

* **Monitoring gradient norms (not just the loss) during training** is standard practice precisely because it can catch an impending explosion before the loss itself turns to `NaN`.
* **A suspiciously perfect early training loss is one of the most common signs of a labelling or data-leakage bug** (see [[Pipelines and Leakage]]), worth checking before assuming the model is simply very good.
* **Logging and visualization tooling** (TensorBoard and similar) exist largely to make exactly these symptom patterns easy to spot quickly during a long training run.

## Common pitfalls

* **Assuming a flat loss always means "wrong learning rate."** It is the most common cause, but a bug that silently stops gradients from flowing to some part of the network produces the identical symptom.
* **Not checking validation performance until training is "done."** Catching an overfitting gap early can save a great deal of wasted training time.
* **Treating a single `NaN` step as unrecoverable without investigation.** Sometimes resuming from the last good [[Checkpointing and Reproducibility|checkpoint]] with a lower learning rate (or with gradient clipping newly enabled) is enough to continue successfully.

## Quick check

<details><summary>1. What are two possible causes of a training loss that never moves at all?</summary>
A learning rate far too small to make visible progress, or a bug preventing gradients from actually flowing to the weights being updated.
</details>

<details><summary>2. In the worked example, at which step does the gradient norm first show a clear warning sign, and what tool exists specifically to handle it?</summary>
Step 4 (norm 15.3, an order of magnitude larger than the previous steps); gradient clipping exists specifically to cap spikes like this before they cascade.
</details>

<details><summary>3. What does a suspiciously perfect training loss, appearing immediately, often indicate?</summary>
A data leakage bug — the model has access, somewhere in the pipeline, to information it shouldn't have, such as the true label leaking into the input features.
</details>

## Key terms

* **Gradient norm:** the size (magnitude) of the overall gradient vector at a given training step, often monitored to catch instability early.
* **Data leakage:** information about the target leaking into the training inputs in a way that inflates apparent performance unrealistically.
* **Loss curve:** the plot of training (and validation) loss over time, the first and most informative diagnostic tool for a training run.

## Related

[[Vanishing and Exploding Gradients]] · [[Learning Rate Schedules and Warmup]] · [[Gradient Clipping]] · [[Checkpointing and Reproducibility]]
