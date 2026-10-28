Every topic in this subject solves a real problem, but almost none of them is anyone's first choice for a brand-new project today. This topic is about when one of them should still be the choice: matching a concrete constraint — no labels, a tiny energy budget, no time to train — to the classical tool actually built for it.

**You need:** [[Why This Planet Looks Different from Deep Learning]], [[Content-Addressable Memory and Capacity]], [[Neuromorphic Hardware]], [[Extreme Learning Machines]].

## The question it answers

"Given a specific constraint, which classical approach in this subject actually beats reaching for a standard, backpropagation-trained network?" Each topic in this subject traded something standard deep learning assumes you have — labels, training time, or a flexible power budget — for a specific advantage. Choosing well means matching the constraint you actually have to the trade that specific method made.

## Intuition

A standard deep network assumes: plenty of labelled data, plenty of time and compute to iterate, and a hardware target that doesn't care much about sparsity. Take any one of those assumptions away, and one of this subject's methods is often built exactly for that gap — [[Hopfield Networks|Hopfield networks]] for memory with no labels at all, [[Extreme Learning Machines|ELMs]] and [[Radial Basis Function Networks|RBF networks]] for a fast, exact fit with no iteration, [[Spiking Neural Networks|spiking networks]] on [[Neuromorphic Hardware]] for an extreme energy budget.

## Definition and notation

Three constraints, matched to the numbers already verified in this subject:

```text
constraint: store and recall patterns, no training data, no labels
  → classical Hopfield network — capacity ≈ 0.138·N, verified in
    Content-Addressable Memory and Capacity

constraint: fit a function quickly, with no time or ability to iterate
  → ELM or RBF network — one linear solve, verified in
    Extreme Learning Machines (MSE 0.300 → ~0.00005 going from 3 to 10
    random hidden units, no gradient descent at all)

constraint: run on a severe, fixed energy budget
  → spiking network on neuromorphic hardware — cost scales with firing
    rate r, not with N·T, verified in Neuromorphic Hardware
    (sparsity advantage = 1/r, a 4× saving at r = 0.25)
```

## A worked example

Three scenarios, matched using only numbers already established earlier in this subject:

```text
scenario A: recall any of 50 stored 400-bit patterns from a partial cue, no labels exist
  0.138 × 400 ≈ 55.2 → 50 patterns sits just under capacity
  → classical Hopfield network is the right fit

scenario B: fit a noisy, wiggly sensor curve, with a deadline measured in milliseconds
  ELM reached MSE ≈ 0.00005 with H=10 random units and one linear solve,
  no epochs at all
  → ELM (or RBF, if a few meaningful centres are known) is the right fit

scenario C: run a simple pattern detector on a coin-cell battery for a year
  sparsity advantage = 1/r; a detector that only needs to fire rarely
  (r ≈ 0.05) gets a 20× reduction in computation on event-driven hardware
  → spiking network on neuromorphic hardware is the right fit
```

In every scenario, the deciding factor was not "which method is more powerful" — a modern deep network would, in principle, also handle all three — but which constraint actually matters most for that specific deployment.

## Bench

```bench
id: choose-classical
title: Match the constraint to the method
fallback: Pick a constraint — no labels, no training time, or a tight energy budget — and see which classical architecture from this subject is built for exactly that trade-off, and why.
```

**Try this**

1. Pick each constraint in turn and read which method it points to and why.
2. Try combining two constraints at once and notice that not every combination has a clean single answer.
3. Consider a case with none of these constraints — plenty of labels, time, and power — and confirm that a standard deep network, not anything in this subject, is then the right default.

**What you should notice:** every method in this subject is the right answer to a specific question, not a generally better or worse alternative to deep learning — the choice is about which constraint you are actually under, not which model is "stronger."

## Where it appears in AI

* **It is the practical payoff of everything this subject covered**: each topic traded something a standard deep network assumes available for a specific, nameable advantage, and this topic is where those trades get weighed against a real constraint.
* **The same reasoning pattern recurs throughout [[Machine Learning]]**: choosing a simpler, more constrained model over a more flexible one specifically because the simpler model's assumptions match the problem's actual constraints.
* **[[Modern Hopfield Networks and Attention]] complicates the picture usefully**: sometimes the "classical" and "modern" choices turn out to be the same underlying computation, which is itself worth knowing before assuming they are strictly alternatives.

## Common pitfalls

* **Assuming classical always means worse.** Each method here solves its matched problem at least as well as a standard deep network would, often with far less training cost.
* **Picking a method because it's interesting rather than because the constraint demands it.** With no unusual constraint at all, a standard, well-supported deep network is still the sensible default.
* **Ignoring combined constraints.** A problem that is simultaneously label-free, energy-constrained, *and* needs instant inference may not have a single clean answer in this subject, and might need a hybrid approach.

## Quick check

<details><summary>1. What should actually decide which classical method, if any, is worth using?</summary>
The specific constraint the problem is under (no labels, no training time, or a tight energy budget, for instance) — not a general judgement of which model is more powerful.
</details>

<details><summary>2. In the worked example, why was a classical Hopfield network a fit for scenario A specifically?</summary>
Fifty 400-bit patterns sit just under the network's roughly 55-pattern capacity (0.138 × 400), and there is no labelled training data available — exactly the situation the method is built for.
</details>

<details><summary>3. Is a classical method in this subject ever simply a worse version of a standard deep network?</summary>
No — each one is matched to a constraint a standard deep network doesn't handle as efficiently (no labels, no iteration time, or an extreme energy budget), not a weaker general-purpose model.
</details>

## Key terms

* **Constraint-matched choice:** selecting a method based on which specific assumption of standard deep learning the problem violates, not on raw model capacity.
* **Capacity (recall):** the pattern-storage limit of a Hopfield network, from [[Content-Addressable Memory and Capacity]].
* **Sparsity advantage:** the computational saving from event-driven hardware, from [[Neuromorphic Hardware]].

## Related

[[Why This Planet Looks Different from Deep Learning]] · [[Content-Addressable Memory and Capacity]] · [[Extreme Learning Machines]] · [[Neuromorphic Hardware]]
