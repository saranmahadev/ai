**Training** is when a model's parameters are adjusted using examples. **Inference** is when the finished, frozen model is used to make predictions on new inputs. The two phases have different costs, and a deployed model does not keep learning unless someone retrains it.

**You need:** [[A Model Is a Function]].

## The question it answers

When does a model learn, and when does it just answer? Mixing the two up is behind many misunderstandings about what AI systems "remember".

## Intuition: studying versus taking the exam

Training is studying: you go through practice problems, compare your answers with the solutions, and adjust your understanding. Inference is the exam: you answer new questions with what you already know. You do not learn anything new mid-exam.

## The training loop

Training repeats a simple cycle:

1. **Predict** on the training examples using the current parameters.
2. **Measure the error**: how far off were the predictions? This number is the **loss**.
3. **Nudge the parameters** a little in the direction that shrinks the error.
4. **Repeat.**

The error usually drops quickly at first and then more slowly, until further nudges bring little improvement. The method of choosing the nudge, following the slope of the loss downhill, is **gradient descent**, made possible by the derivative (see [[Derivatives]] and [[Optimization]]).

## Inference

Once training stops, the parameters are **frozen**. Now the model takes new inputs and produces outputs, over and over, without changing. This is what happens every time you use a deployed system.

|  | Training | Inference |
| --- | --- | --- |
| Purpose | set the parameters | use the parameters |
| Data | many labelled examples | one new input at a time |
| Parameters | change | frozen |
| Cost | heavy, done occasionally | light per use, but repeated constantly |
| Errors it can fix | yes, by adjusting | no |

## A worked example: training a house-price line

Starting with both dials at 0, the model predicts $0 for every house, an average miss of about $249k. After training steps, the average miss falls roughly like this:

| Training steps | Average miss |
| --- | --- |
| 0 | about $249k |
| 1 | about $209k |
| 5 | about $102k |
| 10 | about $50k |
| 20 | about $33k |
| 200 | about $24k |

Most of the improvement comes early, and later steps refine it. Then the model is frozen, and asked about a house it has never seen.

## Bench

```bench
id: train-then-freeze
title: Training, then inference
fallback: A house-price line that starts untrained. Each step nudges its two numbers to reduce the average miss, and a chart shows the error falling. Freezing the model lets you click a new house size and see its prediction.
```

**Try this**

1. Press **Train 1 step** a few times, then press **Play**. Watch the line and the error curve.
2. When does the error stop falling much? Is more training always worth it?
3. Press **Freeze the model** and click different house sizes. Does the line move now?
4. Press **Reset** and freeze after just one step. How good are the answers?

**What you should notice:** learning happens only in training. After freezing, the model can only apply what it has learned, so if the world changes, it must be retrained.

## Where it appears in AI

Every system in [[Machine Learning]] and [[Deep Learning]] follows this split. Training a large [[LLMs]] model takes enormous computing effort, while using it is comparatively cheap per question, though it adds up at scale. A chat that seems to "remember" you is usually keeping earlier messages in its input, not learning from you.

## Common pitfalls

* **Inference is not learning.** A deployed model does not improve from being used unless it is retrained.
* **Lower training error is not always better.** A model can memorise its training examples and fail on new ones (see [[Generalization]]).
* **Training data is fixed at training time.** The model knows nothing that happened afterwards.
* **"Training" and "using" are separate costs.** A system can be expensive to build and cheap to run, or the reverse.

## Quick check

<details><summary>1. What changes during training that does not change during inference?</summary>
The model's parameters.
</details>

<details><summary>2. Why can a deployed model be wrong about new events?</summary>
Its parameters were set from data that stopped at training time, and it does not learn from use.
</details>

<details><summary>3. What are the four steps of the training loop?</summary>
Predict, measure the error, nudge the parameters to reduce it, and repeat.
</details>

## Related

[[A Model Is a Function]] · [[Types of Tasks]] · [[Generalization]] · [[Derivatives]] · [[Optimization]]
