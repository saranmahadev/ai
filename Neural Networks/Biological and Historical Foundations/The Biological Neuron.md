A real neuron is a cell: dendrites collect incoming signals from other neurons, the cell body sums them up, and if that sum crosses a threshold, the neuron fires a brief electrical spike down its axon — which then becomes an input to whatever neurons it connects to next. An [[The Artificial Neuron and Activation Functions|artificial neuron]] keeps the shape of this story and throws away almost everything else.

**You need:** [[The Artificial Neuron and Activation Functions]].

## The question it answers

"How much of a real neuron does an artificial one actually model?" Surprisingly little, structurally — but the core idea (sum inputs, react nonlinearly) survives, and one popular artificial activation function turns out to resemble a real neuron's response curve more closely than you might expect.

## Intuition: what survives the simplification, and what doesn't

A real neuron's dendrites don't just add signals — they can perform local, tree-shaped computation of their own before anything reaches the cell body; the cell body's sum-and-threshold behaviour is only a rough summary. A real neuron communicates with discrete, all-or-nothing spikes, timed to the millisecond; an artificial neuron outputs one continuous number, instantly, with no notion of time at all. A real synapse can be excitatory or inhibitory, can strengthen or weaken with use, and sits in a network with dozens of distinct neuron types; an artificial neuron's "synapse" is just a single real-numbered weight, positive or negative, with none of that biology attached. What survives is the shape of the recipe — weighted sum, then a nonlinear reaction — not the mechanism.

## Definitions

```text
biological (very simplified):   fires if (sum of incoming signals) crosses a threshold
                                 firing rate increases with how far above threshold the input is

artificial:   a = f(w · x + b)
```

A neuron's **firing rate** — how many spikes per second it produces — is one simple way biologists summarise what it's doing, trading away the exact timing of each spike for one continuous number per time window (**rate coding**; see [[Rate and Temporal Coding]]).

## A worked example

Approximate a neuron's firing rate as proportional to how far its input is above a firing threshold of `0.3`, and nothing below it:

```text
input          0      0.1     0.3     0.5     1.0
firing rate   0.000   0.000   0.000   0.200   0.700
```

This rule — zero below a threshold, then rising linearly — is *exactly* `ReLU(input − threshold)`, the same activation function that became the default choice for deep network hidden layers (see [[The Artificial Neuron and Activation Functions]]). ReLU wasn't designed to mimic biology, but this is one place the two independently arrived at a similar shape.

## Bench

```bench
id: neuron-compare
title: A real neuron's response, next to ReLU
fallback: Adjust a firing threshold and an input current. See the rate-coded firing-rate approximation plotted against the exact ReLU curve it matches.
```

**Try this**

1. Move the input below the threshold and watch the firing rate stay at exactly zero.
2. Move it above the threshold and watch the firing rate climb linearly.
3. Change the threshold and see the whole curve shift.

**What you should notice:** the two curves — "firing rate above threshold" and "ReLU of input minus threshold" — are the same curve, not just similar ones.

## Where it appears in AI

* **ReLU and its variants** (see [[The Artificial Neuron and Activation Functions]]) remain the default choice for hidden-layer activations in deep networks, for reasons unrelated to biology (training behaviour, mostly) — the resemblance here is a bonus, not the motivation.
* **Spiking neural networks** (see [[Spiking Neural Networks]]) take the discreteness and timing this topic throws away and build them back in.
* **Every topic on the rest of this subject** keeps some piece of biology that mainstream deep learning simplified away — a local learning rule, a settling dynamic, discrete spikes — and asks what you gain or lose by keeping it.

## Common pitfalls

* **Treating "neural network" as a claim about how the brain works.** An artificial neuron is a loose, convenient abstraction, not a model of a real neuron's mechanism.
* **Assuming rate coding is the whole story.** Real neurons' exact spike timing can carry information a firing-rate average throws away (see [[Rate and Temporal Coding]]).
* **Thinking ReLU was designed to resemble a real neuron.** It was adopted because of how it behaves during gradient-based training ([[Vanishing and Exploding Gradients]] in Deep Learning), not out of biological intent.

## Quick check

<details><summary>1. What does an artificial neuron's single weight correspond to in a real neuron?</summary>
Roughly, the strength of one synaptic connection — but without the ability to be independently excitatory or inhibitory in the way real synapses and neuron types are, and without the biology behind how that strength actually changes.
</details>

<details><summary>2. Why is ReLU's shape similar to a simplified firing-rate model?</summary>
Both are zero below a threshold and rise roughly linearly above it — ReLU for training reasons, a real neuron because firing rate increases with how far the input is above threshold.
</details>

<details><summary>3. What does rate coding leave out that a real neuron's spikes carry?</summary>
The exact timing of individual spikes, which can carry information beyond just how many spikes occurred in a time window.
</details>

## Key terms

* **Dendrite, soma, axon, synapse:** the parts of a real neuron that receive, integrate, transmit, and connect to the next neuron.
* **Firing rate:** the number of spikes a neuron produces per unit time, one simplified summary of its activity.
* **Rate coding:** representing information as a firing rate rather than exact spike timing.

## Related

[[The Artificial Neuron and Activation Functions]] · [[Hebbian Learning]] · [[The McCulloch-Pitts Neuron]] · [[Spiking Neural Networks]]
