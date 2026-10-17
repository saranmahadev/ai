A spike itself carries almost no information — it is the same all-or-nothing event every time. Whatever a spiking neuron is "saying" has to live somewhere else: in how *often* it spikes, or in *exactly when* it spikes. These are the two standard ways to read a spike train, and they are genuinely different codes, not two names for the same thing.

**You need:** [[Spiking Neural Networks]].

## The question it answers

"If a spike itself carries no information beyond 'now,' how can a train of spikes represent a continuous quantity like stimulus strength?" Two ways, both compatible with the exact same underlying neuron: **rate coding** reads the *number* of spikes in a time window, while **temporal coding** reads the *precise timing* of spikes — most simply, how long the first spike takes to arrive after the stimulus starts.

## Intuition

Imagine turning up the brightness of a light shone on a sensor neuron. Under rate coding, a brighter light makes the neuron fire more spikes per second — count spikes over a window, and you recover roughly how bright the light was. Under temporal coding, the same brighter light instead makes the neuron fire its *first* spike sooner after the light switches on — measure the delay to that first spike, and you again recover roughly how bright the light was. Both are valid ways to decode the same stimulus; biological neurons appear to use both, depending on the circuit.

## Definition and notation

```text
rate code:     r ≈ (spike count in window T) / T
temporal code: latency ≈ time to first spike after stimulus onset
```

Rate coding is more robust to the exact timing of any individual spike (only the count matters) but needs a long-enough window to be reliable. Temporal (latency) coding can in principle convey information from a single spike, but is more sensitive to any noise that shifts spike timing.

## A worked example

Three LIF neurons (same as [[Spiking Neural Networks]], `leak = 0.1`, `threshold = 1`), each given a different constant input for 16 time steps:

```text
input 0.3:  spikes at t = 4, 8, 12, 16   → rate = 4/16 = 0.25   first-spike latency = 4
input 0.5:  spikes at t = 3, 6, 9, 12, 15 → rate = 5/16 ≈ 0.31  first-spike latency = 3
input 0.8:  spikes at t = 2, 4, 6, 8, 10, 12, 14, 16 → rate = 8/16 = 0.50  first-spike latency = 2
```

Both codes move in the same direction as the input strength increases — the rate goes up, and the latency goes down — but they are measuring different things from the same spike trains: one counts events over the whole window, the other looks only at when the very first event happened.

## Bench

```bench
id: spike-codes
title: Reading the same spikes two ways
fallback: Set an input strength for a LIF neuron and see both its firing rate and its first-spike latency over a fixed time window, side by side.
```

**Try this**

1. Increase the input and watch the rate rise while the latency falls.
2. Find an input weak enough that no spike occurs in the window at all — both codes become undefined.
3. Compare how quickly each code becomes readable: the latency is known after one spike, while the rate needs the whole window to finish.

**What you should notice:** temporal coding can in principle deliver information faster (after just one spike) than rate coding (which needs to wait out the whole counting window) — a real advantage in circuits where speed matters.

## Where it appears in AI

* **It is the foundation for training signals in spiking networks**: some training methods for spiking neural networks explicitly target either spike rates or spike timing, and the choice shapes what the network can learn efficiently.
* **[[Spike-Timing-Dependent Plasticity|the next topic's]] learning rule depends on exact spike timing**, which only makes sense once temporal coding is on the table — a purely rate-based view would miss it entirely.
* **Neuromorphic hardware (see [[Neuromorphic Hardware]]) is often designed around one coding scheme or the other**, since the two put very different demands on how precisely spike times need to be preserved by the hardware.

## Common pitfalls

* **Assuming rate coding is "the" code and temporal coding is a minor variant.** Both are standard, well-studied coding schemes; different biological circuits appear to favour one or the other.
* **Confusing latency coding with rate coding at low rates.** A low firing rate and a long first-spike latency often correlate, but they are still conceptually distinct measurements of the same spike train.
* **Forgetting both codes need the input to be strong enough to spike at all.** Below the firing threshold established in [[Spiking Neural Networks]], neither code carries any information — there is nothing to count or time.

## Quick check

<details><summary>1. What does rate coding measure, and what does temporal (latency) coding measure?</summary>
Rate coding measures the number of spikes in a time window; temporal coding measures the precise timing of spikes, most simply the delay to the first one.
</details>

<details><summary>2. In the worked example, which code could in principle report a result sooner?</summary>
Temporal (latency) coding — it only needs the first spike, while rate coding needs the entire counting window to finish.
</details>

<details><summary>3. What happens to both codes if the input is too weak to reach the firing threshold?</summary>
Neither is defined — with no spikes, there is nothing to count (for rate) and no first spike to time (for latency).
</details>

## Key terms

* **Rate coding:** representing a signal's strength by how many spikes occur in a fixed time window.
* **Temporal (latency) coding:** representing a signal's strength by the precise timing of spikes, often the delay to the first one.
* **Firing rate:** the spike count in a window divided by the window's length.

## Related

[[Spiking Neural Networks]] · [[Spike-Timing-Dependent Plasticity]] · [[Neuromorphic Hardware]]
