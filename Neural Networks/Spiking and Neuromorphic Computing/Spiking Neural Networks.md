Every network so far in this subject, and every one in [[Deep Learning]], communicates with continuous numbers — an activation, a probability, a weight. A real neuron communicates with something much simpler: it stays quiet, accumulating input, and then fires a single, brief, identical spike. A spiking neural network takes that literally.

**You need:** [[The Biological Neuron]].

## The question it answers

"What does a neuron model look like if it only ever outputs a spike or nothing, never a continuous value?" The **leaky integrate-and-fire (LIF)** neuron is the simplest standard answer: it integrates (accumulates) incoming input into a membrane potential, leaks a fraction of that potential away each time step, and fires a spike — then resets to zero — the instant the potential crosses a threshold.

## Intuition

Picture a leaky bucket being filled by a hose. Input current is the water flowing in; the leak is a small hole letting some drain out continuously. If the inflow is steady and bigger than the leak, the water level rises — a little slower each step, since a higher level also means more pressure pushing water out the leak. Once the water reaches the rim, the bucket "spikes": it empties instantly (resets to zero) and starts filling again. A steady inflow produces spikes at a steady rate; this is the entire mechanism — no weights are learned yet, just one neuron's response to input.

## Definition and notation

```text
v(t+1) = v(t) + dt · (−leak · v(t) + input)
if v(t+1) ≥ threshold:  spike, then v(t+1) ← reset
else:                    no spike, v(t+1) stands
```

`leak` controls how much of the current potential drains away each step; `threshold` is the firing point; `reset` is almost always `0`. Unlike [[The Artificial Neuron and Activation Functions|an ordinary artificial neuron]] on [[Deep Learning]], there is no activation function turning a weighted sum into a single number in one shot — the potential accumulates *over time*, and the only output at any instant is "spike" or "no spike."

## A worked example

A LIF neuron with `leak = 0.1`, `threshold = 1`, `reset = 0`, receiving a constant input of `0.3` every time step, starting at `v = 0`:

```text
t=1: v = 0.000 → 0.300          t=5: v = 0.000 → 0.300
t=2: v = 0.300 → 0.570          t=6: v = 0.300 → 0.570
t=3: v = 0.570 → 0.813          t=7: v = 0.570 → 0.813
t=4: v = 0.813 → SPIKE, reset   t=8: v = 0.813 → SPIKE, reset
```

With this constant input, the neuron spikes exactly every 4 time steps, forever: three steps of rising potential, then a spike and reset, on repeat. A steady input produces a steady, periodic train of spikes — the rate of that train is itself a signal, covered next in [[Rate and Temporal Coding]].

## Bench

```bench
id: lif-spike
title: A leaky bucket that fires when it's full
fallback: Set a constant input current for a leaky integrate-and-fire neuron and watch its membrane potential rise, spike, and reset, over and over.
```

**Try this**

1. Set a small input and watch the neuron spike slowly, or not at all if the input is too weak to ever reach threshold.
2. Increase the input and watch the spike rate increase.
3. Increase the leak and see how much stronger an input needs to be to produce the same spike rate.

**What you should notice:** below some input strength the leak always wins and the neuron never spikes at all — there is a genuine threshold effect, not just a slow fade into firing.

## Where it appears in AI

* **It is the standard building block for spiking neural networks**, used in neuroscience modelling and in neuromorphic hardware (see [[Neuromorphic Hardware]]) built to run exactly this kind of unit efficiently.
* **It trades continuous activations for discrete, sparse events** — a neuron that never spikes consumes essentially no energy, which is the whole appeal for low-power hardware.
* **Training a spiking network is a genuinely different problem** from training the networks on [[Deep Learning]], precisely because a spike is not a differentiable function of the input — specialised training methods exist, but are outside the scope of this topic.

## Common pitfalls

* **Expecting a spiking neuron's output to be a number like an activation.** At any instant, the only output is binary — spiked or not — not a continuous value.
* **Forgetting the leak term.** Without it, any positive input eventually causes a spike no matter how small; the leak is what creates a genuine minimum-input threshold for firing at all.
* **Assuming spike timing is irrelevant.** Exactly when spikes occur, not just how many, carries information and drives learning — see [[Rate and Temporal Coding]] and [[Spike-Timing-Dependent Plasticity]].

## Quick check

<details><summary>1. What are the two things that happen to a LIF neuron's membrane potential every time step?</summary>
It is reduced slightly by the leak term, and increased by whatever input it is receiving.
</details>

<details><summary>2. In the worked example, why does the neuron spike every 4 steps rather than, say, every 3 or every 5?</summary>
With leak 0.1, threshold 1 and input 0.3, it takes exactly 3 steps of accumulation to cross the threshold on the 4th; this specific period comes directly from those three numbers.
</details>

<details><summary>3. What happens to a weak, constant input that never reaches threshold?</summary>
The potential rises until the leak exactly balances the input and then stays below threshold forever — the neuron never spikes.
</details>

## Key terms

* **Membrane potential:** the accumulated value a spiking neuron tracks over time, analogous to a real neuron's voltage.
* **Leaky integrate-and-fire (LIF):** a spiking neuron model that accumulates input, leaks a fraction away each step, and fires when a threshold is crossed.
* **Spike:** a discrete, all-or-nothing firing event, followed by a reset of the membrane potential.

## Related

[[The Biological Neuron]] · [[Rate and Temporal Coding]] · [[Neuromorphic Hardware]]
