A plain RNN's hidden state is rewritten from scratch at every step — nothing is deliberately preserved. **LSTM** (long short-term memory) adds a second, separate **cell state** that is updated *additively*, through gates that learn what to keep, what to add, and what to reveal — giving training a much more direct path for gradients to survive many steps, the same trick [[Residual and Skip Connections|residual connections]] use in feedforward networks.

**You need:** [[Backpropagation Through Time]] and [[The Artificial Neuron and Activation Functions]].

## The question it answers

"A plain RNN's gradients and memory both decay fast over long sequences — can a recurrent cell be designed to hold onto information deliberately, for as long as it's useful?" Yes: keep a cell state that gates can protect from being overwritten, instead of forcing every step to recompute the whole state from scratch.

## Intuition: three gates deciding what to remember

Picture a notebook (the cell state) that gets consulted and updated at every step. The **forget gate** decides how much of what's already written to keep. The **input gate** decides how much of the new information to add. The **output gate** decides how much of the notebook's current contents to actually reveal as this step's hidden state (useful output), as opposed to keeping some of it private for future steps. All three gates are themselves tiny neural network layers (sigmoid-activated, so each decision is a soft 0-to-1 fraction), and all three are learned.

## Definitions

```text
f = σ(Wf·[x,h] + bf)        forget gate
i = σ(Wi·[x,h] + bi)        input gate
o = σ(Wo·[x,h] + bo)        output gate
g = tanh(Wg·[x,h] + bg)     candidate new content

c' = f ⊙ c + i ⊙ g          cell state update (⊙ = elementwise multiply) — additive, like a skip connection
h' = o ⊙ tanh(c')           hidden state actually output this step
```

Because the cell-state update is additive (`f ⊙ c` plus something, not a full rewrite), a gradient flowing backward through many steps can survive far better than in a plain RNN, provided the forget gate `f` stays close to 1 for the information that matters.

## A worked example

One input, one hidden unit, reading `(1, 1, 0)`, starting from `h₀ = c₀ = 0`:

```text
step 1 (x=1):  f=0.6682  i=0.6457  o=0.6225  g=0.7616
               c₁ = 0.6682·0 + 0.6457·0.7616 = 0.4917
               h₁ = 0.6225 · tanh(0.4917) = 0.2836

step 2 (x=1):  f=0.6988  i=0.6391  o=0.6487  g=0.7844
               c₂ = 0.6988·0.4917 + 0.6391·0.7844 = 0.8450
               h₂ = 0.6487 · tanh(0.8450) = 0.4466

step 3 (x=0):  f=0.6043  i=0.4888  o=0.5692  g=0.0891
               c₃ = 0.6043·0.8450 + 0.4888·0.0891 = 0.5542
               h₃ = 0.5692 · tanh(0.5542) = 0.2867
```

Notice the cell state `c` keeps climbing through steps 1 and 2 as the forget gate stays comfortably above 0.5 — it is *retaining*, not discarding, what came before — while the hidden state `h` the rest of the network actually sees is a separately gated, partial view of that accumulated cell state.

## Bench

```bench
id: lstm-gates
title: An LSTM's gates, step by step
fallback: Step an LSTM cell through an input sequence, watching the forget, input and output gates, the candidate content, and the resulting cell and hidden states update at each step.
```

**Try this**

1. Step through the default sequence and watch the cell state climb while the forget gate stays high.
2. Feed a long run of zeros and watch whether the cell state is retained or decays.
3. Push the forget gate's weights down (via the sliders) and see the cell state reset far more aggressively each step.

**What you should notice:** the cell state can hold a value steady across many steps as long as the forget gate stays near 1 — something a plain RNN's hidden state, rewritten from scratch every step, cannot do nearly as reliably.

## Where it appears in AI

* **LSTMs were, for years, the default** for language modelling, translation, and speech recognition, before attention-based architectures (see [[Attention and the Road to Transformers]]) took over most of these tasks.
* **[[Gated Recurrent Units|GRU]]** is a simplified cousin, merging some of LSTM's gates to reduce the parameter count.
* **Time-series and sensor applications** with limited data or compute still often favour LSTMs over larger attention-based models.

## Common pitfalls

* **Confusing the cell state with the hidden state.** The cell state `c` is the long-term memory; the hidden state `h` is a gated, partial view of it exposed to the rest of the network each step.
* **Assuming LSTM entirely solves vanishing gradients.** It mitigates the problem substantially (via the additive cell-state update) but does not eliminate it outright over arbitrarily long sequences.
* **Forgetting all three gates and the candidate are separately learned layers.** An LSTM cell has roughly four times the parameters of a plain RNN cell of the same hidden size.

## Quick check

<details><summary>1. What does the forget gate control?</summary>
How much of the existing cell state is kept (versus discarded) when updating to the next step.
</details>

<details><summary>2. Why is the cell-state update additive rather than a full rewrite?</summary>
An additive update (keeping most of the old cell state and adding a gated new contribution) gives gradients a much more direct path backward through many steps than a plain RNN's full rewrite.
</details>

<details><summary>3. In the worked example, what is the difference between the cell state and the hidden state at step 2?</summary>
The cell state (0.8450) is the accumulated long-term memory; the hidden state (0.4466) is the output gate's gated, squashed view of that cell state, which is smaller because the output gate (0.6487) only reveals part of it.
</details>

## Key terms

* **Cell state:** an LSTM's long-term memory, updated additively through gates.
* **Forget, input, output gates:** learned sigmoid layers controlling what is kept, added, and revealed at each step.
* **Candidate content:** the tanh-activated new information proposed for the cell state at each step.

## Related

[[Backpropagation Through Time]] · [[The Artificial Neuron and Activation Functions]] · [[Residual and Skip Connections]] · [[Gated Recurrent Units]]
