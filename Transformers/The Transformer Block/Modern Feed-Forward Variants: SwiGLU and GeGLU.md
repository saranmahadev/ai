[[The Feed-Forward Sublayer|The plain feed-forward sublayer]] expands, activates, and projects back down with one activation function applied directly. Most modern large transformers use a small but consistent twist instead: two parallel projections, where one *gates* the other through an activation, before the result is projected back down.

**You need:** [[The Feed-Forward Sublayer]].

## The question it answers

"Is applying an activation function directly to one projection the only way to introduce nonlinearity into the feed-forward sublayer?" No — a **gated** feed-forward sublayer computes two separate projections of the input instead of one, passes one of them through an activation function, and multiplies the two together element by element before projecting back down. SwiGLU (using the SiLU activation) and GeGLU (using GELU) are the two most common instances of this pattern.

## Intuition

The plain feed-forward sublayer decides how much each hidden unit fires using only its own linear combination of the input, run through an activation. A gated version splits that job in two: one projection (the **gate**) decides, through an activation, "how open is this channel?" while a second, purely linear projection (the **up** projection) carries "what value would flow through if it were fully open?" Multiplying the two together lets the network learn a much more flexible, input-dependent filter than a single activation function can express on its own.

## Definition and notation

```text
plain FFN:   out = W_down · activation(W · x)
gated FFN:   gate = activation(W_gate · x)
             up   = W_up · x
             out  = W_down · (gate ⊙ up)        (⊙ is elementwise multiplication)
```

SwiGLU uses `activation = SiLU` (`x · sigmoid(x)`); GeGLU uses `activation = GELU`. Both drop the bias terms common in a plain feed-forward sublayer, matching standard practice. Because there are now *three* weight matrices (`W_gate`, `W_up`, `W_down`) instead of two, `d_ff` is usually shrunk somewhat to keep the total parameter count close to a plain feed-forward sublayer's.

## A worked example

The same input as [[The Feed-Forward Sublayer|the previous topic's example]], `x = [0.5, -0.3, 0.8, 0.1]`, through a SwiGLU sublayer with `d_ff = 6`:

```text
gate (after SiLU):     [0.048, -0.077, 0.046, 0.010, -0.086, 0.133]
up (linear, no activation): [0.127, -0.371, -0.221, 0.218, 0.592, -0.220]
gated (elementwise product): [0.006, 0.029, -0.010, 0.002, -0.051, -0.029]

output: [0.0032, -0.0338, -0.0029, 0.0310]
```

Notice the gated values are much smaller in magnitude than either the gate or the up projection alone — the elementwise product squeezes down wherever either side is small, giving the sublayer a genuinely different shape of nonlinearity than a single activation applied directly.

Parameter count: a SwiGLU sublayer at this size needs `3 × (6 × 4) = 72` weights (three same-shaped matrices, no biases); a plain feed-forward sublayer at `d_ff = 6` needs `2 × (6 × 4) + 6 + 4 = 58` (two matrices plus biases) — the gated version costs more per hidden unit, which is exactly why `d_ff` is usually reduced to compensate when switching to a gated design.

## Bench

```bench
id: gated-ffn
title: Two projections, one gating the other
fallback: Push a vector through a SwiGLU-style gated feed-forward sublayer and compare the gate, the up projection and their product against a plain feed-forward sublayer's output.
```

**Try this**

1. Compare the gate and up projections side by side, then look at their elementwise product.
2. Switch the gating activation between SiLU and GELU and see how the gated values shift.
3. Compare the parameter count of a gated sublayer against a plain one at the same `d_ff`.

**What you should notice:** the gated output is shaped by *two* learned projections working together, not one activation applied to a single projection — giving the sublayer more expressive power per hidden unit, at the cost of an extra weight matrix.

## Where it appears in AI

* **SwiGLU and its relatives are the standard feed-forward design in most modern large transformers** — a direct, practical successor to the plain ReLU feed-forward sublayer from the original transformer paper.
* **The gating idea itself predates transformers**, echoing the gating mechanisms inside [[Long Short-Term Memory|LSTMs]] on [[Deep Learning]], where a learned gate also controls how much of a signal passes through.
* **[[Assembling One Transformer Block|the next topic]] can use either a plain or a gated feed-forward sublayer** — the rest of the block's structure (attention, residuals, normalization) doesn't change either way.

## Common pitfalls

* **Assuming gating doubles the parameter count for free performance.** It genuinely costs more parameters per hidden unit — real models compensate by shrinking `d_ff`, not by ignoring the cost.
* **Confusing the gate and the up projection's roles.** Only the gate passes through an activation function; the up projection stays purely linear, and swapping which one is which changes the computation.
* **Treating SwiGLU and GeGLU as fundamentally different mechanisms.** They are the identical gated structure, differing only in which activation function (SiLU vs. GELU) is used for the gate.

## Quick check

<details><summary>1. What are the two projections in a gated feed-forward sublayer, and which one passes through an activation function?</summary>
The gate projection and the up projection; only the gate passes through an activation function (SiLU for SwiGLU, GELU for GeGLU) — the up projection stays linear.
</details>

<details><summary>2. How do SwiGLU and GeGLU differ from each other?</summary>
Only in which activation function gates the output — SiLU for SwiGLU, GELU for GeGLU; the overall gated structure is identical.
</details>

<details><summary>3. Why is d_ff typically reduced when switching from a plain feed-forward sublayer to a gated one?</summary>
A gated sublayer needs three weight matrices instead of two, costing more parameters per hidden unit — shrinking d_ff keeps the total parameter count comparable to a plain feed-forward sublayer.
</details>

## Key terms

* **Gate:** a projection passed through an activation function, controlling how much of a parallel projection's value passes through.
* **SwiGLU / GeGLU:** gated feed-forward designs using SiLU or GELU, respectively, as the gating activation.
* **Elementwise multiplication (⊙):** multiplying two vectors position by position, combining the gate and up projections.

## Related

[[The Feed-Forward Sublayer]] · [[Long Short-Term Memory]] · [[Assembling One Transformer Block]]
