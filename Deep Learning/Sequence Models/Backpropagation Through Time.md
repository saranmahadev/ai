Training an RNN means unrolling it across every time step into one long chain — `h₀ → h₁ → h₂ → … → h_T` — and running ordinary [[Backpropagation by Hand|backpropagation]] over that whole chain. Because the *same* weight matrix is reused at every step, this has a name of its own: **backpropagation through time (BPTT)**.

**You need:** [[Recurrent Neural Networks]] and [[Backpropagation by Hand]].

## The question it answers

"The same weights appear at every time step — how does backprop handle training a weight that was used T different times?" By unrolling the recurrence into a plain, deep computational graph and summing up that weight's gradient contribution from every one of its T uses.

## Intuition: one long chain, not T separate networks

Unrolled, an RNN run over `T` steps looks exactly like a `T`-layer feedforward network — except every "layer" uses the identical weight matrix `Wₕ`. Backprop computes a gradient for `Wₕ` at each of those `T` positions separately, as if they were different matrices, then adds all `T` gradients together into one total update for the single real `Wₕ`.

## Definitions

```text
∂L/∂h_t      depends on ∂L/∂h_(t+1) through the same recurrence, chained backward

∂h_t/∂h_(t-1) ≈ Wₕ · tanh'(z_t)        one "per-step factor", same shape as in
                                        Vanishing and Exploding Gradients

gradient reaching h_1 from h_T  ≈  (product of T-1 such per-step factors)
```

Exactly as in a plain deep network, that product of per-step factors can shrink toward zero (vanish) or grow unbounded (explode) as the sequence gets longer — only here, "depth" means sequence length.

## A worked example

Using the hidden states from [[Recurrent Neural Networks|the RNN worked example]] (`h₁ = 0.537`, `h₂ = 0.4851`, `h₃ = 0.7565`, `Wₕ = 0.8`), the per-step factors for carrying a gradient backward:

```text
factor (h₃ → h₂) = Wₕ · (1 − h₃²) = 0.8 × (1 − 0.5723) = 0.8 × 0.4277 ≈ 0.3422
factor (h₂ → h₁) = Wₕ · (1 − h₂²) = 0.8 × (1 − 0.2353) = 0.8 × 0.7647 ≈ 0.6117

gradient reaching h₁ from h₃ ≈ 0.3422 × 0.6117 ≈ 0.2093
```

Even over just two steps, the gradient reaching the earliest hidden state has already shrunk to about a fifth of its starting size. Over a long sequence of hundreds of steps, this same compounding is why plain RNNs struggle to learn dependencies that span a long distance.

## Bench

```bench
id: bptt-chain
title: A gradient's path back through time
fallback: Step backward through an unrolled RNN, multiplying the per-step factor at each hidden state and watching how much of the original gradient has survived by the time it reaches the earliest step.
```

**Try this**

1. Step backward through the default short sequence and watch the surviving gradient shrink at each step.
2. Lengthen the sequence and see how much further it shrinks by the time it reaches the start.
3. Compare what happens when the per-step factor happens to be close to 1 versus well below it.

**What you should notice:** this is the exact same multiplicative compounding behind [[Vanishing and Exploding Gradients|vanishing gradients]] in a deep feedforward network — only here, each "layer" is one time step, and the number of layers is the sequence length.

## Where it appears in AI

* **Gradient clipping** (see [[Gradient Clipping]]) is used almost by default when training RNNs with BPTT, since occasional exploding gradients are common over long sequences.
* **[[Long Short-Term Memory|LSTM]] and [[Gated Recurrent Units|GRU]]** exist specifically to give BPTT a more stable path back through time than a plain RNN's tanh-based recurrence provides.
* **Truncated BPTT**, a practical variant not covered in depth here, only backpropagates a limited number of steps instead of the entire sequence, trading some accuracy for speed and memory.

## Common pitfalls

* **Thinking of the T unrolled copies as separate, independently trainable weights.** They are the same matrix; their gradients are summed, not averaged or kept apart.
* **Forgetting BPTT's compute and memory cost grows with sequence length.** Every unrolled step must be kept around until the backward pass visits it.
* **Expecting a plain RNN to reliably learn very long-range dependencies.** The vanishing-gradient compounding shown here is exactly why it often cannot, without the gating mechanisms in LSTM or GRU.

## Quick check

<details><summary>1. Why is backpropagation through a recurrent network given its own name, "backpropagation through time"?</summary>
Because the network is unrolled across time steps into a deep graph where the same weights are reused at every step, and gradients for those shared weights must be summed across all the steps they appeared in.
</details>

<details><summary>2. In the worked example, why did the gradient reaching h₁ shrink to about a fifth of its size after only two steps?</summary>
Each step multiplies the gradient by a factor around 0.34–0.61 (the recurrent weight times the local tanh derivative), and these factors compound multiplicatively.
</details>

<details><summary>3. What is one practical fix commonly paired with BPTT to handle exploding gradients?</summary>
Gradient clipping, applied to the total gradient before the weight update.
</details>

## Key terms

* **Backpropagation through time (BPTT):** backpropagation applied to an RNN unrolled across its time steps.
* **Unrolling:** representing a recurrence over T steps as an explicit T-layer computational graph.
* **Truncated BPTT:** backpropagating through only a limited number of recent steps instead of the whole sequence.

## Related

[[Recurrent Neural Networks]] · [[Backpropagation by Hand]] · [[Vanishing and Exploding Gradients]] · [[Gradient Clipping]] · [[Long Short-Term Memory]]
