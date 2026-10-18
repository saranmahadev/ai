A model that has reached 100% accuracy on its training data looks, by every usual signal, finished. Keep training it anyway, far past that point, and sometimes something strange happens on the test set — nothing for a long while, and then, abruptly, everything.

**You need:** [[Emergent Abilities and Capability Jumps]].

## The question it answers

"Can a model memorize its training data completely and still go on to generalize much later?" **Grokking** is exactly that: training accuracy saturates near 100% early, while test accuracy stays near chance for a long stretch of additional training — then, well after training accuracy has flatlined, test accuracy suddenly rises sharply, as if the model had been quietly working toward a genuine, generalizing solution the entire time it appeared to be "just" memorizing.

## Intuition

A student who crams and can recite every answer from a specific practice test perfectly, but can't yet solve a new, differently-worded version of the same kind of problem, looks "done" by one measure (perfect recall) and clearly unfinished by another (no real understanding). Grokking is the strange case where that student, kept studying far past the point of perfect recall, eventually and abruptly starts solving the new versions too — not because they memorized more examples, but because something about continuing to train pushed them from a memorizing solution toward a genuinely generalizing one.

## Definition and notation

```text
train accuracy(epoch): rises quickly, saturates near 100% early
test accuracy(epoch):  stays near chance for a long stretch,
                        then rises sharply much later

the gap between "train accuracy saturates" and "test accuracy rises"
  can span many times more training than it took to saturate train
  accuracy in the first place
```

## A worked example

A toy training run's train and test accuracy, tracked across several checkpoints:

```text
epoch   10:  train  48.7%   test  10.1%
epoch   50:  train  96.4%   test  10.1%
epoch  100:  train  99.9%   test  10.1%   ← train has essentially saturated
epoch  300:  train 100.0%   test  10.6%
epoch  600:  train 100.0%   test  16.4%
epoch 1000:  train 100.0%   test  69.3%   ← generalization beginning
epoch 1500:  train 100.0%   test  94.4%
epoch 2000:  train 100.0%   test  95.0%   ← fully "grokked"
```

Train accuracy reached essentially 100% by epoch 100 and never moved again. Test accuracy sat at chance (around 10%) for the next *five hundred epochs* — five times as much training as it took to memorize the training set — before finally climbing, in a comparatively short span, to 95%.

## Bench

```bench
id: grokking-curves
title: Memorized long before it generalizes
fallback: Step through training epochs and watch test accuracy stay flat long after training accuracy has saturated, then suddenly catch up.
```

**Try this**

1. Step forward until train accuracy saturates and note where test accuracy sits.
2. Keep stepping through the long flat stretch where nothing on the test set seems to change.
3. Watch test accuracy's sudden rise, and note how much training happened before it started.

**What you should notice:** nothing about the training-accuracy curve gives any hint that test accuracy is about to move — the two curves tell completely different stories for most of the run.

## Where it appears in AI

* **Grokking was first clearly documented on small, highly structured tasks** (like modular arithmetic) where it's unusually easy to tell "memorized the specific examples" apart from "learned the actual rule," making the delayed jump to generalization directly observable.
* **It's a striking counterexample to the instinct that training past 100% training accuracy is pure overfitting with nothing left to gain** — in these cases, continuing to train is exactly what eventually produces generalization, not just additional memorization.
* **It's related to, but distinct from, [[Emergent Abilities and Capability Jumps|emergent abilities]]**: emergence is a capability appearing suddenly as *model scale* grows; grokking is a capability appearing suddenly as *training time* grows, for one fixed model.

## Common pitfalls

* **Stopping training as soon as training accuracy saturates, assuming nothing more is happening.** The worked example shows the most interesting part of the whole run — the delayed jump to generalization — happens well after that point.
* **Assuming grokking happens in every training setup.** It's been reliably observed on specific, usually small and highly structured tasks; it isn't a guaranteed outcome of training any model longer.
* **Confusing a long flat stretch with a sign of a training failure.** In a setup where grokking is possible, that flat stretch can be the necessary precursor to the eventual jump, not evidence something is broken.

## Quick check

<details><summary>1. What does "grokking" describe, in terms of the training and test accuracy curves?</summary>
Training accuracy saturates near 100% early and stays there; test accuracy remains near chance for a long stretch afterward, then suddenly rises sharply, well after training accuracy stopped changing.
</details>

<details><summary>2. In the worked example, roughly how much additional training happened between train accuracy saturating and test accuracy beginning to rise?</summary>
About five times as much — train accuracy saturated by epoch 100, but test accuracy didn't start climbing meaningfully until around epoch 1000.
</details>

<details><summary>3. How does grokking differ from emergent abilities, even though both involve a sudden-looking jump?</summary>
Grokking's jump happens as a function of training time for one fixed-size model; emergent abilities' jump happens as a function of model scale, typically compared across differently-sized models at similar amounts of training.
</details>

## Key terms

* **Grokking:** training accuracy saturating early while test accuracy stays flat, then suddenly rising much later in training.
* **Delayed generalization:** the gap between memorizing training data and developing a solution that generalizes to new examples.
* **Memorization vs. generalization:** perfectly reproducing seen examples versus correctly handling genuinely new ones.

## Related

[[Emergent Abilities and Capability Jumps]] · [[The Bitter Lesson: Scale vs. Hand-Engineering]] · [[Memorization and Training Data Leakage]]
