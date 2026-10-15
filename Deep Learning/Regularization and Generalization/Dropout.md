**Dropout** trains a network while randomly switching off a fraction of its units on every single step — a different random subset each time — so no unit can become so important that the network relies on it alone. At test time, every unit is back on, and the training-time randomness has to be undone so the two situations line up.

**You need:** [[Overfitting and Double Descent]] and [[The Multilayer Feedforward Network]].

## The question it answers

"How do I stop a network from leaning too heavily on a handful of 'star' units, at the expense of everything else learning anything useful?" Force it to work even when a random subset of units is simply missing, every step, so it is never allowed to depend on any particular one.

## Intuition: a team that trains with random absences

Imagine a team practising a play where, every single rehearsal, a different random subset of players is told to sit out. The remaining players have to be able to cover for whoever is missing, so the whole team ends up more robust and less reliant on any one star player. Dropout does the same to a hidden layer: each step, a random subset of units contributes nothing, and the rest must still produce a useful signal.

## Definitions

```text
h            the layer's activations before dropout
p            the drop probability (chance each unit is zeroed this step)
mask_i       1 with probability (1 − p), else 0, drawn fresh every step

output_i = h_i · mask_i · 1/(1 − p)      ("inverted dropout": scale survivors up)
```

Scaling survivors by `1 / (1 − p)` keeps the *expected* output equal to `h_i` itself, since `E[mask_i] = 1 − p`, and `h_i · (1 − p) · 1/(1 − p) = h_i`. That is why dropout is simply switched off (every unit kept, no scaling needed) at test time — the training-time scaling was only there to match what test time already looks like on average.

## A worked example

A hidden layer `h = (0.8, 1.2, −0.5, 2.0)`, drop probability `p = 0.5`, and one drawn mask `(1, 0, 1, 0)`:

```text
scale = 1 / (1 − 0.5) = 2

output = (0.8 × 1 × 2,  1.2 × 0 × 2,  −0.5 × 1 × 2,  2.0 × 0 × 2)
        = (1.6, 0, −1.0, 0)
```

This single draw looks nothing like `h`. But average the output over *many* independent draws of the mask, and it converges back to `h` itself — each unit is "on and doubled" half the time and "off" half the time, averaging to its original value.

## Bench

```bench
id: dropout-mask
title: One dropout mask, and the average over many
fallback: An 8-unit hidden layer. Draw a fresh dropout mask, watch which units survive (scaled up) and which are zeroed, and track the running average over many draws as it converges back to the original values.
```

**Try this**

1. Draw a few masks at `p = 0.5` and watch how different each single draw looks from the original layer.
2. Watch the running average column slowly settle back toward the original values as you draw more masks.
3. Raise `p` toward 0.9 and see how much more violent any single draw becomes, even though the long-run average is unaffected.

**What you should notice:** any one draw is a rough, noisy version of the original layer; the average over many draws is not — it is designed to recover the original exactly.

## Where it appears in AI

* **Classic dropout** is applied after dense (and sometimes convolutional) layers in many architectures, typically with `p` between 0.1 and 0.5.
* **DropConnect and other variants** zero individual weights instead of whole units.
* **Dropout is switched off at test time** in essentially every framework by default — it is purely a training-time regulariser.

## Common pitfalls

* **Forgetting to turn dropout off (and un-scale) at test time.** Frameworks handle this automatically via a "training mode" flag, but implementing it by hand is a common source of bugs.
* **Using a very high drop probability on a layer with few units.** It can leave almost nothing active on many steps, destabilising training.
* **Confusing dropout with [[Batch Normalization]].** Both regularise, but dropout works by randomly removing units, while batch normalization works by re-scaling the distribution of activations.

## Quick check

<details><summary>1. Why is the surviving units' output scaled up by 1/(1 − p) during training?</summary>
So the output's expected value matches the original activations — the same expectation the network will see at test time, when nothing is dropped and no scaling is applied.
</details>

<details><summary>2. Is dropout applied at test time?</summary>
No — every unit is active and unscaled at test time; dropout is purely a training-time technique.
</details>

<details><summary>3. What is the main effect dropout is trying to achieve?</summary>
Prevent the network from relying too heavily on any particular unit, by forcing it to work correctly even when a random subset is missing.
</details>

## Key terms

* **Dropout:** randomly zeroing a fraction of a layer's units during training.
* **Drop probability (p):** the chance any given unit is zeroed on a given step.
* **Inverted dropout:** scaling surviving units up by `1/(1 − p)` so the expected activation is unchanged.

## Related

[[Overfitting and Double Descent]] · [[The Multilayer Feedforward Network]] · [[Batch Normalization]] · [[Data Augmentation]]
