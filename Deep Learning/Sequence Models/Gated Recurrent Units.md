A **GRU** (gated recurrent unit) keeps [[Long Short-Term Memory|LSTM]]'s core idea — gates deciding what to keep and what to update — but drops the separate cell state and merges LSTM's forget and input gates into a single **update gate**. Fewer moving parts, fewer parameters, and in practice often similar performance to LSTM.

**You need:** [[Long Short-Term Memory]] and [[The Artificial Neuron and Activation Functions]].

## The question it answers

"LSTM's three gates and separate cell state work well — is all of that machinery necessary?" Often not: a GRU gets most of the same benefit with one fewer gate and no separate cell state, at a lower parameter cost per unit.

## Intuition: one knob instead of two

LSTM uses a forget gate and an input gate as two independent decisions — "how much of the old to keep" and "how much of the new to add" are allowed to disagree. A GRU ties them together into one **update gate** `z`: it directly trades old for new along a single dial — `(1 − z)` weight on the new candidate, `z` weight on the old hidden state, always summing to exactly 1. A separate **reset gate** `r` additionally controls how much of the previous hidden state is even allowed to influence the new candidate in the first place.

## Definitions

```text
r = σ(Wᵣ·[x, h] + bᵣ)              reset gate
z = σ(W_z·[x, h] + b_z)            update gate
n = tanh(W_n·[x, r ⊙ h] + b_n)     candidate hidden state, using the reset-gated h

h' = (1 − z) ⊙ n + z ⊙ h           new hidden state: a direct blend of candidate and old state
```

Unlike LSTM, there is no separate cell state `c` — the hidden state `h` plays both roles at once.

## A worked example

One input, one hidden unit, reading `(1, 1, 0)` from `h₀ = 0`:

```text
step 1 (x=1):  r=0.6225  z=0.6225
               n = tanh(0.8·1 + 0.5·(0.6225·0)) = tanh(0.8) = 0.6640
               h₁ = (1 − 0.6225)·0.6640 + 0.6225·0 = 0.2507

step 2 (x=1):  r=0.6400  z=0.6457
               n = tanh(0.8·1 + 0.5·(0.6400·0.2507)) = tanh(0.880) = 0.7065
               h₂ = (1 − 0.6457)·0.7065 + 0.6457·0.2507 = 0.4122

step 3 (x=0):  r=0.5309  z=0.5658
               n = tanh(0.5·(0.5309·0.4122)) = tanh(0.1095) ≈ 0.1090
               h₃ = (1 − 0.5658)·0.1090 + 0.5658·0.4122 = 0.2805
```

Notice `h'` is always a weighted average of exactly two things — the new candidate and the previous hidden state — with weights `(1 − z)` and `z` that always add to 1, unlike LSTM's independently-gated forget and input contributions.

## Bench

```bench
id: gru-gates
title: A GRU's update gate, blending old and new
fallback: Step a GRU through an input sequence, watching the reset and update gates and how the hidden state blends the previous state with the new candidate at each step.
```

**Try this**

1. Step through the sequence and watch how close the update gate `z` stays to 0.5 — roughly an even blend of old and new.
2. Push the update gate's weights so `z` stays close to 1, and watch the hidden state barely change step to step.
3. Push it the other way, close to 0, and watch the hidden state track the new candidate almost exactly, ignoring history.

**What you should notice:** the update gate alone decides the whole old-versus-new trade-off; there is no way, unlike in LSTM, for "how much to forget" and "how much to add" to be set independently of each other.

## Where it appears in AI

* **GRUs are a common lighter-weight alternative to LSTM** when memory or compute is tighter and the extra flexibility of a separate cell state isn't needed.
* **Both GRU and LSTM have been largely displaced by attention-based architectures** (see [[Attention and the Road to Transformers]]) for large-scale language tasks, but remain common for smaller-scale or resource-constrained sequence problems.
* **The reset gate's role** — letting the network effectively start a "fresh" candidate uninfluenced by the recent past — is useful when a sequence has clear boundaries (like sentences) within it.

## Common pitfalls

* **Assuming GRU is strictly simpler and therefore always preferable.** It has less flexibility than LSTM (only one trade-off dial instead of two independent gates), which occasionally matters for the task at hand.
* **Forgetting GRU has no separate cell state.** Anything referring to "the GRU's memory" means its hidden state `h` — there is nothing else to point to.
* **Mixing up the reset gate and the update gate's roles.** The reset gate affects the *candidate computation*; the update gate affects the *final blend* between candidate and old state.

## Quick check

<details><summary>1. What single gate does a GRU use in place of LSTM's separate forget and input gates?</summary>
The update gate `z`, which directly trades old hidden state for new candidate content, with weights that always sum to 1.
</details>

<details><summary>2. Does a GRU have a separate cell state like LSTM?</summary>
No — a GRU has only a hidden state, which plays the role LSTM splits between a cell state and a hidden state.
</details>

<details><summary>3. What does the reset gate control?</summary>
How much of the previous hidden state is allowed to influence the new candidate hidden state's computation.
</details>

## Key terms

* **Update gate:** the single gate controlling the trade-off between the old hidden state and the new candidate.
* **Reset gate:** the gate controlling how much of the previous hidden state feeds into the new candidate's computation.
* **Candidate hidden state:** the tanh-activated proposed new value, blended with the old state to produce the final hidden state.

## Related

[[Long Short-Term Memory]] · [[The Artificial Neuron and Activation Functions]] · [[Bidirectional and Stacked RNNs]] · [[Sequence-to-Sequence Models]]
