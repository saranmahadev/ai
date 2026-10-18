With a curated corpus in hand, there's still a question of what, exactly, a model is being trained to *do* with it. For almost every modern LLM, the answer is strikingly simple: predict the next token, over and over, across trillions of examples.

**You need:** [[Pretraining Corpora and Data Curation]], [[Softmax and Cross-Entropy in Practice]].

## The question it answers

"What is a language model actually optimizing during pretraining?" **Causal language modeling** trains a model to predict each token in a sequence from only the tokens before it — never the tokens after, which is exactly what the [[Attention Masks: Padding and Causal Masking|causal mask]] enforces architecturally. The loss, averaged over every position in every training sequence, is simply the negative log-probability the model assigned to the token that actually came next — this is **teacher forcing**: the model is always shown the *true* preceding tokens, never its own previous guesses, while learning.

## Intuition

Imagine being handed a sentence one word at a time, and before seeing each new word, you have to guess it. After you guess, you're told the real word (not your guess) and move on to guessing the next one. Across millions of sentences, getting better at this one game — "guess the very next word, given everything true that came before" — is the entire training signal; nothing more exotic is going on beneath the surface of a pretrained LLM.

## Definition and notation

```text
for a sequence of tokens t₁, ..., t_n:
  loss = -(1/n) · Σᵢ log P(tᵢ | t₁, ..., tᵢ₋₁)

teacher forcing: the model's input at every position is always the TRUE
  prefix t₁...tᵢ₋₁, regardless of what the model itself would have predicted
```

## A worked example

A toy 4-token sequence, scored position by position against the model's predicted probability for the actual next token:

```text
"the":  P(true) = 0.657   loss = 0.420
"cat":  P(true) = 0.622   loss = 0.475
"sat":  P(true) = 0.780   loss = 0.248
"down": P(true) = 0.250   loss = 1.386

mean loss across the sequence: 0.6324
```

The model was most confident (and paid the smallest loss) on "sat," and least confident on "down" (where its probability of 0.25 matches pure chance among four options) — the mean loss of 0.6324 is simply the average of these four per-position penalties, and is exactly what gradient descent is minimizing during pretraining.

## Bench

```bench
id: clm-loss-teacher-forcing
title: Scoring the token that actually comes next
fallback: Step through a sequence and watch the loss computed at each position, under teacher forcing.
```

**Try this**

1. Step through all four positions and watch the loss at each one.
2. Compare the position with the highest assigned probability against the one with the lowest.
3. Check that the running mean matches the overall average once all positions are shown.

**What you should notice:** every position's loss depends only on how much probability the model assigned to the one token that actually happened — not on how plausible any of the *other* tokens the model considered might have been.

## Where it appears in AI

* **This single objective, scaled up, is responsible for essentially every capability a pretrained LLM has** before any instruction tuning or alignment — grammar, facts, reasoning patterns, and style are all learned purely as side effects of getting better at next-token prediction.
* **Teacher forcing is why training and generation look different**: during training, every position sees the true prefix; during generation (as in [[Greedy and Beam Search Decoding]]), a model has only its own previous outputs to condition on, which is where compounding errors can creep in.
* **[[Causal Language Modeling as a Pretraining Objective|the same objective]] underlies both encoder-decoder and decoder-only models' pretraining**, though decoder-only models apply it to the entire sequence rather than splitting it into separately-handled source and target halves.

## Common pitfalls

* **Assuming the loss cares about the full probability distribution.** It only looks at the probability assigned to the single token that actually came next — a model that was "close" (assigning decent probability to a near-synonym) but didn't put enough probability on the exact true token still pays a real loss.
* **Confusing teacher forcing with how generation actually works.** Training always conditions on the ground truth; generation has no ground truth to condition on beyond what the model itself already produced.
* **Thinking causal language modeling is a special, LLM-specific invention.** It's the direct continuation of the same cross-entropy loss used throughout this road's earlier planets — the only LLM-specific part is doing it at a vastly larger scale.

## Quick check

<details><summary>1. What is a model's loss based on at each position, under causal language modeling?</summary>
The negative log-probability the model assigned to the single token that actually came next, given everything true that preceded it.
</details>

<details><summary>2. In the worked example, why did "down" incur the highest loss?</summary>
The model's assigned probability to "down" being the true next token was only 0.25 — barely above chance among the four options — so its negative log-probability (loss) was correspondingly the largest.
</details>

<details><summary>3. What's the key difference between how a sequence is processed during training (teacher forcing) versus during generation?</summary>
During training, the model always conditions on the true preceding tokens regardless of what it itself would have predicted; during generation, there's no ground truth, so the model conditions on its own previously generated tokens.
</details>

## Key terms

* **Causal language modeling:** training a model to predict each token from only the tokens before it.
* **Teacher forcing:** training on the true preceding tokens rather than the model's own previous predictions.
* **Cross-entropy loss:** the negative log-probability assigned to the correct outcome, averaged across positions.

## Related

[[Pretraining Corpora and Data Curation]] · [[Softmax and Cross-Entropy in Practice]] · [[Decoder-Only Architectures]]
