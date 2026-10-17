A GPU evaluates every unit in a layer on every clock cycle, whether or not that unit has anything new to say. A spiking neuron, by construction, has almost nothing to say most of the time — it is silent except for the rare instant it crosses threshold. Neuromorphic hardware is built around that fact: compute and communicate only when a spike actually happens, not on every tick of a global clock.

**You need:** [[Spiking Neural Networks]], [[Rate and Temporal Coding]].

## The question it answers

"If most of a spiking network's neurons are silent at any given moment, why build hardware that still checks in on every neuron, every cycle?" Neuromorphic chips (IBM's TrueNorth, Intel's Loihi, SpiNNaker, and others) answer this with **event-driven computation**: a neuron's circuitry only does work, and only sends a message elsewhere, when it actually spikes. A neuron that never spikes costs essentially nothing, for as long as it stays silent.

## Intuition

Compare two ways of running a large meeting. In a synchronous design, everyone is asked to speak, in turn, every minute, whether or not they have anything to add — most minutes are spent on people saying "nothing new." In an event-driven design, people only speak when they actually have something to say, and everyone else just waits, doing no work in between. For a group where only a few people have anything to say at any moment — exactly the situation [[Rate and Temporal Coding|a spiking neuron's firing rate]] describes — the event-driven meeting gets through far less wasted effort.

## Definition and notation

For a population of `N` neurons simulated for `T` time steps, with each neuron firing at some average rate `r` (spikes per step, as in [[Rate and Temporal Coding]]):

```text
synchronous (clocked) cost:  N · T          (every neuron checked every step, regardless of activity)
event-driven cost:           N · r · T      (work done only on actual spikes)

sparsity advantage = (N · T) / (N · r · T) = 1 / r
```

The advantage depends only on how sparse the firing is — a lower rate `r` means a bigger gap between the two costs, with no change to what the network is actually computing.

## A worked example

Using the firing rate from [[Spiking Neural Networks|the worked example]] two topics back — a LIF neuron with input `0.3`, firing once every 4 steps, `r = 0.25` — for a population of `N = 1000` such neurons run for `T = 1000` steps:

```text
synchronous cost:   N · T = 1,000,000 neuron-checks
event-driven cost:  N · r · T = 1000 × 0.25 × 1000 = 250,000 spike events
sparsity advantage: 1 / 0.25 = 4×
```

A fourfold reduction in work falls directly out of this one neuron's own firing rate — before accounting for any neurons that fire even less often, or not at all, which would widen the gap further still.

## Bench

```bench
id: event-driven-cost
title: Clocked checks vs. spike events
fallback: Set a population size, simulation length and firing rate, and compare the cost of checking every neuron on every clock tick against only processing actual spike events.
```

**Try this**

1. Lower the firing rate and watch the sparsity advantage grow.
2. Set the firing rate to 1 (every neuron spikes every step) and see the advantage disappear entirely.
3. Compare a small, dense population against a large, sparse one with the same total number of spikes.

**What you should notice:** the advantage of event-driven hardware is not a fixed constant — it scales directly with how sparse the spiking actually is, which is why neuromorphic hardware is most compelling for workloads where most neurons are silent most of the time.

## Where it appears in AI

* **It is the hardware motivation behind the whole premise of [[Spiking Neural Networks]]**: the appeal of spikes is not just biological realism, but that sparse, event-driven signals map onto genuinely cheaper hardware.
* **[[Spike-Timing-Dependent Plasticity]] fits naturally onto this hardware**: the learning rule only needs the timing of the two spikes at a single synapse, which is exactly the information already present at the moment a spike event occurs — no separate, globally synchronized training pass is needed.
* **The energy argument connects directly to [[Efficiency and Deployment|efficient deployment]] on [[Deep Learning]]**: both are about doing less work for the same result, though pruning and quantization there target dense weight matrices, while neuromorphic hardware targets the sparsity of spikes themselves.

## Common pitfalls

* **Assuming neuromorphic hardware always wins.** The advantage shrinks to nothing as the firing rate approaches 1 — dense, constantly-active networks get little or no benefit from an event-driven design.
* **Treating "neuromorphic" as a software technique.** It specifically refers to hardware built around spike-driven computation and communication, not a training algorithm that could run equally well on a GPU.
* **Expecting software simulation of spikes to get these savings for free.** Simulating a spiking network on ordinary synchronous hardware still pays the full `N · T` clocked cost — the savings above are specific to hardware designed for event-driven execution.

## Quick check

<details><summary>1. What does "event-driven computation" mean for a neuromorphic chip?</summary>
A neuron's circuitry only performs work, and only communicates, at the moment it actually spikes — a silent neuron costs essentially nothing in between.
</details>

<details><summary>2. In the worked example, where did the factor of 4 sparsity advantage come from?</summary>
Directly from the neuron's firing rate of 0.25 — the advantage is the reciprocal of the firing rate, `1 / 0.25 = 4`.
</details>

<details><summary>3. What happens to the sparsity advantage if every neuron fires on every single time step?</summary>
It disappears — with a firing rate of 1, the event-driven cost equals the synchronous cost, since there is now an event on every step for every neuron.
</details>

## Key terms

* **Event-driven computation:** performing work only in response to an actual event (here, a spike), rather than on every tick of a global clock.
* **Sparsity advantage:** the ratio of synchronous to event-driven computational cost, equal to the reciprocal of the firing rate.
* **Neuromorphic chip:** hardware built to run spiking neurons' event-driven dynamics directly, rather than simulating them step by step on a conventional processor.

## Related

[[Spiking Neural Networks]] · [[Rate and Temporal Coding]] · [[Spike-Timing-Dependent Plasticity]]
