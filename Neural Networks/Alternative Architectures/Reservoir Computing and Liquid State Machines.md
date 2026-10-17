[[Radial Basis Function Networks|The previous topic]] fixed the hidden layer's *placement* and solved for the output. Reservoir computing goes a step further for sequences: fix an entire recurrent network's weights at random — never train them at all — and train only a linear readout on top of whatever rich, time-mixing dynamics the fixed network produces.

**You need:** [[Radial Basis Function Networks]], [[Recurrent Neural Networks]].

## The question it answers

"Must a recurrent network's weights be trained to make it usefully encode a sequence's history?" No — a large, fixed, randomly-wired recurrent network (the **reservoir**) already mixes an input sequence's recent history into a rich, high-dimensional, nonlinear snapshot at every time step. Training only a simple linear readout on top of that snapshot is often enough, because the hard part — nonlinearly combining several recent inputs — was already done by the untrained reservoir's own dynamics.

## Intuition

Drop a stone into a pond and watch the ripples. The pond's surface at any moment reflects not just the stone that just landed, but an echo of every recent splash, all mixed together by the water's own physics — no training involved, just physical dynamics with memory. A reservoir is the same idea computationally: feed a sequence in, let a fixed, recurrent network "slosh" that input through its untrained connections, and read the current ripple pattern as a rich summary of recent history. The name **liquid state machine** makes this metaphor explicit, usually built from spiking neurons; **echo state network** is the equivalent built from more ordinary continuous units.

## Definition and notation

```text
h(t) = tanh( W_in · u(t) + W_rec · h(t−1) )      — fixed, never trained
y(t) = W_out · h(t)                               — the only part that is trained, by least squares
```

`W_rec`'s scale is kept below a stability threshold (its largest eigenvalue magnitude, the **spectral radius**, below roughly 1) so the reservoir's "ripples" fade rather than explode over time. Because `y(t)` is linear in `W_out`, fitting it to target outputs is the same kind of least-squares problem as [[Radial Basis Function Networks|the previous topic's]] output layer — just reading off a snapshot of the reservoir's state at each time step instead of a Gaussian bump's response.

## A worked example

An 8-unit random reservoir (spectral radius `0.9`), driven by a random binary sequence `u(t) ∈ {0, 1}`, trained to predict the **temporal XOR** `y(t) = u(t−1) XOR u(t−2)` — a target that needs both a two-step memory and a nonlinear combination of what it remembers:

```text
reservoir + linear readout:     85% accuracy on 290 test points
linear readout on raw [u(t−1), u(t−2)] directly (no reservoir at all): 33% accuracy
```

The raw-input baseline fails for exactly the reason [[The Perceptron|a single linear unit]] fails on ordinary XOR — the target isn't linearly separable in those two delayed inputs. The reservoir's own nonlinear, recurrent mixing turns those same two bits of history into a higher-dimensional representation where a linear readout finally works well — with not a single one of the reservoir's own weights ever trained.

## Bench

```bench
id: reservoir-xor
title: A fixed, random reservoir solves temporal XOR
fallback: Feed a random binary sequence through a fixed random reservoir, train only a linear readout to predict the XOR of the two previous inputs, and compare its accuracy against a linear readout on the raw delayed inputs alone.
```

**Try this**

1. Compare the reservoir readout's accuracy against the raw-input baseline on the same sequence.
2. Change the reservoir's spectral radius and see accuracy change as the dynamics become more or less stable.
3. Shrink the reservoir to 2–3 units and see how much accuracy depends on reservoir size.

**What you should notice:** none of the reservoir's own connections were ever adjusted to solve this specific task — the same fixed, random dynamics that make it good at temporal XOR were in place before training started.

## Where it appears in AI

* **It is a genuinely different route to handling sequences** than training a [[Recurrent Neural Networks|recurrent network]] end to end with backpropagation through time — all of the "remembering" happens for free, in untrained dynamics.
* **Liquid state machines connect this directly to [[Spiking Neural Networks]]**: a reservoir of spiking neurons gives the same idea a biologically-motivated substrate, with the same untrained-core, trained-readout structure.
* **It is a practical choice when training the recurrent core is expensive or unnecessary** — a fast linear readout is far cheaper than backpropagation through time, and sometimes performs nearly as well on tasks with modest memory demands.

## Common pitfalls

* **Setting the spectral radius above 1.** The reservoir's internal dynamics can grow unbounded instead of settling into a stable, input-driven pattern, destroying the "echo" property the whole method depends on.
* **Expecting a reservoir to outperform a fully-trained recurrent network on every task.** It trades some task-specific performance for near-zero training cost; harder tasks often still benefit from training the recurrent weights.
* **Confusing "untrained" with "doesn't matter."** The reservoir's size, connectivity, and spectral radius are still hyperparameters that strongly affect how well the fixed dynamics suit a given task.

## Quick check

<details><summary>1. Which part of a reservoir computing model is trained, and which part is fixed?</summary>
Only the final linear readout is trained; the recurrent reservoir's own weights are fixed at random and never adjusted.
</details>

<details><summary>2. In the worked example, why did the linear readout on raw delayed inputs perform so much worse than the reservoir readout?</summary>
Temporal XOR is not linearly separable in the raw `[u(t−1), u(t−2)]` inputs, the same reason ordinary XOR defeats a single linear unit; the reservoir's nonlinear recurrent mixing created a representation where a linear readout could finally separate the classes.
</details>

<details><summary>3. What does the spectral radius control, and why does it need to stay below roughly 1?</summary>
It controls how strongly the reservoir's own state feeds back into itself; keeping it below about 1 keeps the dynamics stable so recent inputs fade out smoothly instead of the state growing without bound.
</details>

## Key terms

* **Reservoir:** a large, fixed, randomly-wired recurrent network whose dynamics are never trained.
* **Readout:** the trained linear layer mapping the reservoir's current state to the desired output.
* **Spectral radius:** the largest eigenvalue magnitude of the reservoir's recurrent weight matrix, kept below roughly 1 for stable dynamics.

## Related

[[Radial Basis Function Networks]] · [[Recurrent Neural Networks]] · [[Extreme Learning Machines]] · [[Spiking Neural Networks]]
