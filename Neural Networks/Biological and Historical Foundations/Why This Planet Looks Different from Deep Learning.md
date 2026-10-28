Every architecture in [[Deep Learning|the Deep Learning subject]] is trained the same fundamental way: compute an error against a known target, and adjust every weight to reduce it, by [[Backpropagation by Hand|backpropagation]]. Almost nothing in *this* subject is trained that way. This topic is the map: what the alternative training signals ahead actually are, and why none of them need backpropagation at all.

**You need:** [[The McCulloch-Pitts Neuron]] and [[Backpropagation by Hand]].

## The question it answers

"If backpropagation works so well, why does an entire subject exist for networks that don't use it?" Because backpropagation needs something not every situation has: a known, correct target to measure error against. Every topic ahead finds a different way to learn without one — or sidesteps learning from data altogether.

## Intuition: four different sources of a training signal

**Error-driven learning** (backprop, the perceptron, Deep Learning's entire training story) needs a target: compute how wrong the output was, and adjust to reduce that error. **Correlation-driven learning** ([[Hebbian Learning]], and everything built on it ahead) needs no target at all — only how often two neurons are active together. **Energy-driven settling** ([[Hopfield Networks]], [[Boltzmann Machines]]) needs no target either — a network just moves toward lower "energy" states and calls wherever it lands the answer. **No learning at all** ([[The McCulloch-Pitts Neuron]], and later [[Reservoir Computing and Liquid State Machines|reservoir computing]]'s fixed core) hand-sets or randomizes the weights and trains nothing, or almost nothing.

## Definitions

```text
error-driven:     Δw ∝ (target − output) · input        — needs a known target
correlation-driven: Δw ∝ input · output                  — needs no target
energy-driven:      move toward lower energy              — needs no target
fixed/random:       nothing learned, or only a small readout trained
```

## A worked example

The same connection — weight `w = 0.2`, input `x = 0.8`, output `y = w·x = 0.16` — updated two different ways, with a target of `1.0` and learning rate `η = 0.1`:

```text
error-driven (delta rule):  Δw = η(target − y)x = 0.1 × 0.84 × 0.8 = 0.0672
correlation-driven (Hebb):  Δw = η · x · y       = 0.1 × 0.8 × 0.16 = 0.0128
```

The error-driven update is more than five times larger here, and *specifically* pushes the weight toward making `y` closer to `1.0`. The Hebbian update has no idea the target is `1.0` at all — it only reinforces the correlation between `x` and `y` exactly as it already is, whether or not that happens to be moving the output in a useful direction.

## Bench

```bench
id: signal-sources
title: Four ways to get a training signal
fallback: The same connection, updated by each of the four signal sources in turn. See how differently (or not at all) each one changes the weight, and whether a target is used at all.
```

**Try this**

1. Compare the error-driven and correlation-driven updates on the same starting weight and inputs.
2. Set the target equal to the current output and see the error-driven update shrink to zero, while the Hebbian update is unaffected (it never looked at the target).
3. Think about what each of the four approaches assumes is available — and what happens when that assumption doesn't hold.

**What you should notice:** "no target available" is not a dead end — three different, genuinely useful strategies (correlation, energy, or no learning at all) exist for exactly that situation, and the rest of this subject is organised around them.

## Where it appears in AI

* **Correlation-driven and energy-driven learning solve real problems backpropagation can't reach directly**: learning with no labels at all, or building associative memory that recalls a whole pattern from a partial cue.
* **Several of these ideas resurface inside modern deep learning anyway** — layer-wise pretraining (see [[Layer-Wise and Unsupervised Pretraining]]) and the attention-equivalence of modern Hopfield networks (see [[Modern Hopfield Networks and Attention]]) are two direct examples ahead.
* **Choosing among them is itself a real decision** (see [[Choosing Classical vs Modern Approaches]]) that depends on whether labels exist, what kind of answer you need, and what hardware you're targeting.

## Common pitfalls

* **Assuming "classical" means "obsolete."** Several ideas in this subject are in active, practical use — reservoir computing, spiking hardware, and self-organizing maps all solve real problems today.
* **Expecting every topic ahead to be trained the same way.** Even within this subject, the four strategies above are genuinely different, not just variations on backpropagation.
* **Forgetting backpropagation itself needs a target.** It is extremely effective exactly when one exists — the topics ahead matter precisely for the situations where it doesn't.

## Quick check

<details><summary>1. What does error-driven learning require that the other three strategies in this subject do not?</summary>
A known, correct target to compare the output against.
</details>

<details><summary>2. In the worked example, why is the Hebbian update unaffected by what the target is set to?</summary>
Hebb's rule never looks at the target at all — it only depends on the input and the output's own current values.
</details>

<details><summary>3. Name one strategy covered in this subject for learning (or not learning) with no target available.</summary>
Correlation-driven (Hebbian) learning, energy-driven settling, or using fixed/random weights with nothing trained — any one of the three.
</details>

## Key terms

* **Error-driven learning:** adjusting weights to reduce a measured difference from a known target.
* **Correlation-driven learning:** adjusting weights based on how often two neurons are active together, with no target.
* **Energy-driven settling:** a network moving toward lower-energy states instead of following a gradient of error.

## Related

[[The McCulloch-Pitts Neuron]] · [[Backpropagation by Hand]] · [[Hebbian Learning]] · [[Hopfield Networks]]
