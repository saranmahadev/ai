"Cells that fire together wire together." **Hebbian learning** strengthens the connection between two neurons in direct proportion to how often they're active at the same time — no error signal, no label, no teacher telling it what the right answer should have been. It is the oldest learning rule in this field, and the ancestor of every unsupervised rule in this subject.

**You need:** [[The Biological Neuron]] and [[Vector Operations]].

## The question it answers

"Every learning rule so far in these subjects corrects a *mistake* — what would a rule that has no notion of 'mistake' at all even look like?" One that simply strengthens connections between neurons that tend to activate together, and weakens nothing on its own — correlation, not correction, as the entire basis for learning.

## Intuition: wiring follows coincidence

If neuron A reliably fires whenever neuron B does, Hebb's rule says: make the connection from A to B a little stronger, every single time. There's no concept of "right" or "wrong" here, no target output to compare against — just raw co-occurrence, strengthened a little more each time it happens. Over many repetitions, connections between neurons that are frequently active together grow large; connections between neurons whose activity is unrelated stay small.

## Definitions

```text
Δw_ij = η · x_i · y_j

x_i    presynaptic neuron's activation (the "input" side)
y_j    postsynaptic neuron's activation (the "output" side)
η      learning rate
```

Unlike the [[The Perceptron|perceptron's]] mistake-driven update, Hebb's rule needs no label `y` to compare against — only the two neurons' own activations, making it entirely **unsupervised**.

## A worked example

Two neurons, activations `x = 0.8` and `y = 0.6`, starting weight `w = 0.2`, learning rate `η = 0.1`, updated every time they co-activate:

```text
step        1       2       3       4       5
Δw        0.048   0.048   0.048   0.048   0.048
w         0.248   0.296   0.344   0.392   0.440
```

The weight grows by the same fixed amount every step, as long as the two neurons keep co-activating the same way — and nothing in the plain rule ever stops it. Five repetitions already moved the weight by more than its entire starting value; left unchecked, it keeps growing without bound.

## Bench

```bench
id: hebb-update
title: Strengthening a connection by co-activation
fallback: Two adjustable neuron activations and a learning rate. Step through repeated Hebbian updates and watch the weight grow, unbounded, as long as the two neurons keep firing together.
```

**Try this**

1. Step through several updates with both activations held fixed and watch the weight climb steadily.
2. Lower one activation to near zero and watch the weight stop changing almost entirely.
3. Notice there is no mechanism in the plain rule to ever make the weight shrink.

**What you should notice:** plain Hebbian learning has no ceiling — nothing in the rule itself prevents a weight from growing forever, which is exactly the instability later variants (not covered in depth here) add normalization specifically to fix.

## Where it appears in AI

* **Every other unsupervised rule in this subject traces back to this idea**: [[Self-Organizing Maps|self-organizing maps]], [[Competitive Learning and Vector Quantization|competitive learning]], and [[Spike-Timing-Dependent Plasticity|spike-timing-dependent plasticity]] are all, at heart, correlation-driven updates in Hebb's spirit.
* **Modern self-supervised learning** (see [[Self-Supervised Learning]] in Deep Learning) is a very different, much more engineered answer to the same underlying question: how do you learn something useful with no labels?
* **Hebb's original 1949 proposal predates the perceptron by nearly a decade**, making it one of the earliest concrete theories of how learning might work in a nervous system.

## Common pitfalls

* **Expecting Hebbian learning to solve a classification problem on its own.** It has no notion of a target output to get right or wrong — it is a mechanism for strengthening correlations, not minimizing an error.
* **Assuming the weight update eventually settles.** Without an added normalization or saturation term, repeated co-activation keeps growing the weight indefinitely.
* **Confusing "unsupervised" with "no structure in the data."** Hebbian learning still needs the input activations themselves to carry real, exploitable correlations — it finds structure, it doesn't invent it.

## Quick check

<details><summary>1. What information does Hebb's rule need that the perceptron's update does not?</summary>
Trick question — it needs less: only the two neurons' own activations, with no target label at all, unlike the perceptron's mistake-driven update.
</details>

<details><summary>2. In the worked example, why does the weight keep growing by exactly the same amount each step?</summary>
Both neurons' activations are held fixed, so the update `η·x·y` is the same constant value every step.
</details>

<details><summary>3. What problem does plain Hebbian learning have that later variants fix?</summary>
Weights can grow without bound, since nothing in the basic rule caps or normalizes them.
</details>

## Key terms

* **Hebbian learning:** strengthening a connection in proportion to how often the two neurons it connects are active together.
* **Presynaptic / postsynaptic:** the input-side and output-side neuron of a connection.
* **Unsupervised rule:** a learning rule needing no labelled target to compare against.

## Related

[[The Biological Neuron]] · [[Vector Operations]] · [[The McCulloch-Pitts Neuron]] · [[Self-Organizing Maps]]
