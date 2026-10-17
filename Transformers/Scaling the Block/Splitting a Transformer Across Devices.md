[[Counting a Transformer's Parameters and FLOPs|A large transformer's matrices]] can be far too big to fit on one device at all. Tensor parallelism splits a *single* weight matrix across several devices, so no one device ever needs to hold the whole thing — a genuinely different problem from the data-parallel training covered on [[Deep Learning]], which copies the *entire* model onto every device instead.

**You need:** [[Counting a Transformer's Parameters and FLOPs]], [[Distributed and Data-Parallel Training]].

## The question it answers

"When even one transformer block's weight matrices are too large for a single device's memory, how is the computation itself split up?" Tensor parallelism splits the matrices directly: part of each weight matrix lives on each device, each device computes its own partial result from the piece it holds, and the partial results are combined — summed, in the standard pattern — to reconstruct the exact same answer a single device would have produced.

## Intuition

[[Distributed and Data-Parallel Training|Data parallelism]] puts a full copy of the model on every device and splits the *data* across them. Tensor parallelism does the opposite: every device sees the same input, but only holds a *slice* of the model's own weights. For the feed-forward sublayer specifically, the standard split is: cut the first matrix's output dimension into chunks (each device computes a different slice of the hidden layer), then cut the second matrix's input dimension to match (each device computes a partial contribution to the final output), and sum the partial outputs together — a single communication step, instead of needing every device to hold the whole matrix.

## Definition and notation

```text
split d_ff across D devices, chunk size = d_ff / D

device d computes:
  hidden_d = activation(W1_d · x)            — W1_d: a chunk of W1's rows
  partial_d = W2_d · hidden_d                — W2_d: the matching chunk of W2's columns

combine (all-reduce, i.e. sum):
  output = Σ_d partial_d
```

Each device only ever stores `1/D` of `W1` and `1/D` of `W2` — the full matrices never need to exist on any single device at once.

## A worked example

A feed-forward sublayer (`d_model = 4`, `d_ff = 8`, 64 total weights) split across 2 devices, on input `x = [0.5, -0.3, 0.8, 0.1]`:

```text
single-device output:        [0.29676, 0.03862, -0.00036, -0.07130]
2-device (tensor-parallel) output:  [0.29676, 0.03862, -0.00036, -0.07130]

match: exact

device A's weight parameters: 32 (half of 64)
device B's weight parameters: 32 (half of 64)
```

Splitting the computation across two devices produces an output identical to the single-device computation — and each device only ever needs to store exactly half the weights, confirming neither device needed the full matrices to participate.

## Bench

```bench
id: tensor-parallel-ffn
title: Split the matrix, sum the results
fallback: Split a feed-forward sublayer's weights across a chosen number of devices and confirm the combined output matches the single-device result, while each device's memory footprint shrinks accordingly.
```

**Try this**

1. Confirm the split-and-summed output matches the single-device result exactly.
2. Increase the number of devices and watch each device's share of the weights shrink proportionally.
3. Consider what has to be communicated between devices (and when) for this scheme to work.

**What you should notice:** the result is identical regardless of how many devices the computation is split across — tensor parallelism changes where the computation happens, never what it computes.

## Where it appears in AI

* **It's what makes training and running models far larger than any single device's memory possible at all** — a genuinely different scaling axis from [[Distributed and Data-Parallel Training|data parallelism]], and the two are routinely combined in practice.
* **The same splitting idea applies to the attention sublayer's matrices too** (not just the feed-forward sublayer shown here), typically splitting across attention heads so each device handles a subset of heads end to end.
* **[[Mixture-of-Experts Transformer Blocks|MoE blocks]] add a natural, related option**: placing different experts on different devices, since each token only ever needs a few of them at once.

## Common pitfalls

* **Assuming tensor parallelism and data parallelism solve the same problem.** Data parallelism needs every device to hold the *whole* model; tensor parallelism exists specifically because the whole model doesn't fit on one device at all.
* **Forgetting the combination step requires communication.** The sum across devices (an all-reduce) is a real, non-free step — splitting a matrix doesn't eliminate the need for devices to exchange their partial results.
* **Splitting a matrix the wrong way.** The worked example's column-then-row pattern is specifically chosen so only one communication step (summing the final outputs) is needed — a careless split can require far more cross-device communication.

## Quick check

<details><summary>1. What is split across devices in tensor parallelism, as opposed to data parallelism?</summary>
The model's own weight matrices are split, with every device seeing the same input; data parallelism instead copies the whole model and splits the input data across devices.
</details>

<details><summary>2. In the worked example, how was the single-device output exactly reproduced by two devices?</summary>
By splitting the first matrix's rows (output dimension) and the second matrix's matching columns across the two devices, then summing their two partial outputs together.
</details>

<details><summary>3. What real cost does splitting a matrix across devices introduce that a single device never pays?</summary>
Communication — the partial results computed on each device have to be combined (summed, in this pattern), which requires devices to exchange data.
</details>

## Key terms

* **Tensor parallelism:** splitting a single weight matrix's rows or columns across multiple devices.
* **All-reduce:** combining (here, summing) partial results computed on different devices into one final result.
* **Chunk:** the portion of a split weight matrix stored and computed on one device.

## Related

[[Counting a Transformer's Parameters and FLOPs]] · [[Distributed and Data-Parallel Training]] · [[Mixture-of-Experts Transformer Blocks]]
