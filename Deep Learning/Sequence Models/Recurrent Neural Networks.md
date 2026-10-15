A **recurrent neural network (RNN)** reads a sequence one element at a time, carrying a **hidden state** forward from each step to the next — a running summary of everything seen so far. The same weights are reused at every single step, exactly the way a convolution reuses the same filter at every position in an image.

**You need:** [[The Multilayer Feedforward Network]] and [[Vanishing and Exploding Gradients]].

## The question it answers

"A dense network expects a fixed-size input — how does a network handle a sentence, or a sensor stream, whose length varies and whose order matters?" Process it one step at a time, keeping a hidden state that carries forward whatever is relevant from everything already seen.

## Intuition: reading one word at a time, remembering as you go

Reading a sentence, you don't see the whole thing at once — you read one word, update your understanding, read the next word in light of that understanding, and so on. An RNN does exactly this: at each time step it combines the current input with its own previous hidden state to produce a new hidden state, which then becomes "what it remembers" going into the next step.

## Definitions

```text
hₜ = tanh(Wₓ xₜ + Wₕ hₜ₋₁ + b)

xₜ       the input at time step t
hₜ       the hidden state after step t (hₒ is usually all zeros)
Wₓ, Wₕ, b   the same weights, reused at every time step
```

A sequence of length `T` run through an RNN is, for training purposes, exactly as "deep" as `T` layers — the same hidden-to-hidden weight matrix is applied `T` times in a row.

## A worked example

A tiny RNN with one input and one hidden unit, `Wₓ = 0.5`, `Wₕ = 0.8`, `b = 0.1`, `h₀ = 0`, reading the sequence `(1, 0, 1)`:

```text
h₁ = tanh(0.5·1 + 0.8·0   + 0.1) = tanh(0.600) = 0.5370
h₂ = tanh(0.5·0 + 0.8·0.5370 + 0.1) = tanh(0.530) = 0.4851
h₃ = tanh(0.5·1 + 0.8·0.4851 + 0.1) = tanh(0.988) = 0.7565
```

Even though the second input is a repeat of neither of the others, `h₂` still reflects `h₁`'s influence; `h₃` reflects both `h₁` and `h₂`'s influence through `h₂` — every hidden state carries a trace of everything before it, fading as it gets older.

## Bench

```bench
id: rnn-unroll
title: Reading a sequence, one step at a time
fallback: Step an RNN through a short input sequence, watching the hidden state update at each step from the current input and the previous hidden state.
```

**Try this**

1. Step through the default sequence and check the hidden state values against the worked example.
2. Change one early input and watch how much (or how little) it still affects the hidden state several steps later.
3. Feed in a long run of the same repeated input and watch the hidden state settle toward a fixed point.

**What you should notice:** the hidden state after many steps is some blend of every input seen, but the influence of an input fades rather than persisting exactly — set up to see just how much a change several steps ago still matters this far along.

## Where it appears in AI

* **Before attention-based architectures took over** (see [[Attention and the Road to Transformers]]), RNNs were the default for language, speech and any other sequential data.
* **[[Long Short-Term Memory|LSTM]] and [[Gated Recurrent Units|GRU]]** are more elaborate recurrent cells designed to fix the vanishing-gradient weakness plain RNNs like this one have over long sequences.
* **Time-series forecasting and sensor data** still use plain or gated RNNs in settings where sequence lengths and compute budgets favour them over attention-based models.

## Common pitfalls

* **Expecting a plain RNN to remember things from far in the past reliably.** Its hidden state blends everything together, and older information fades — see [[Backpropagation Through Time]] for why training struggles with this over long sequences.
* **Forgetting the same weights are reused at every step.** It is not a separate layer per time step; it is one small layer, applied repeatedly.
* **Assuming a bigger hidden state always helps.** A larger hidden state gives more capacity to remember, but also more capacity to overfit and more compute per step.

## Quick check

<details><summary>1. What does an RNN carry forward from one time step to the next?</summary>
Its hidden state — a vector summarising everything relevant it has seen in the sequence so far.
</details>

<details><summary>2. Are the weights Wₓ, Wₕ, b different at every time step?</summary>
No — the exact same weights are reused at every single step of the sequence.
</details>

<details><summary>3. Why is a sequence of length T, for training purposes, "as deep as T layers"?</summary>
The same recurrence is applied T times in a row to produce the final hidden state, so gradients must flow back through all T applications, just as they would through T stacked layers.
</details>

## Key terms

* **Hidden state:** the vector an RNN carries from one time step to the next, summarising everything seen so far.
* **Recurrence:** reusing the same weights at every time step of a sequence.
* **Weight sharing across time:** the same principle as a convolution's weight sharing across space, applied to sequence position instead.

## Related

[[The Multilayer Feedforward Network]] · [[Vanishing and Exploding Gradients]] · [[Backpropagation Through Time]] · [[Long Short-Term Memory]]
