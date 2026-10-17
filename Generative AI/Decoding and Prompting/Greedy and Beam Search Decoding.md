A trained language model hands back a probability distribution over the next token at every step, not a finished sentence — something has to decide, step after step, which token actually gets written down. This note covers the two oldest answers to that question: always take the single most likely token, or track several promising candidates at once.

**You need:** [[Decoder-Only Architectures]], [[Softmax and Cross-Entropy in Practice]].

## The question it answers

"Given a model's next-token probabilities at every step, how do you turn them into one finished sequence?" The simplest rule — **greedy decoding** — always takes the single most probable token at each step. It's fast and deterministic, but it's a *local* choice: the token that looks best right now can lead down a path whose *total* probability is worse than a path that looked slightly less promising at step one. **Beam search** fixes this by keeping several candidate sequences alive at once (the *beam*), extending each of them every step, and keeping only the best few by total score — trading some extra computation for a better chance at the globally best sequence.

## Intuition

Imagine choosing a hiking route one step at a time by always taking the path that looks steepest-uphill right now. That greedy choice can strand you on a lower peak, while a path that looked slightly less steep at the first fork actually led to the summit. Beam search is hiking with a few scouts: at every fork, send scouts down the best few routes seen *so far*, drop the ones falling behind, and keep going — more exploration than one greedy hiker, but far less than checking every possible route.

## Definition and notation

```text
greedy:  pick argmax P(token | prefix) at every step
beam search (width k): keep the k highest cumulative log-probability
  sequences after each step; extend every kept sequence by every
  possible next token, then keep only the best k of the results
cumulative score: log P(seq) = Σ log P(tokenᵢ | token₁...tokenᵢ₋₁)
```

Beam search with width 1 is exactly greedy decoding — it's the special case where only one candidate survives each step.

## A worked example

A tiny two-step toy model over the vocabulary `{A, B, C, <eos>}`, whose first-step logits very slightly favor B over A:

```text
step 1 (from start):        logits [A: 1.0, B: 1.3, C: 0.1, eos: −5]
step 2 (after A):           logits [A: 0.2, B: 0.2, C: 3.0, eos: −5]
step 2 (after B):           logits [A: 0.2, B: 1.0, C: 1.0, eos: −5]
```

Greedy decoding takes B at step 1 (its logit is highest), then — among A, B and C tied-ish after B — picks B again:

```text
greedy:  "B B"   log-probability ≈ −1.6117
```

But brute-force checking every two-token sequence finds a better one: A, followed by C, which was *very* likely once A was chosen:

```text
A C   log-probability ≈ −1.1299   ← the actual best sequence
B B   log-probability ≈ −1.6117   ← what greedy found
```

Beam search with width 1 reproduces greedy's "B B". Beam search with width 2 or more keeps both the A and B branches alive after step 1, and finds "A C":

```text
beam width 1:  B B   (−1.6117)
beam width 2:  A C   (−1.1299)  ·  B B   (−1.6117)
beam width 3:  A C   (−1.1299)  ·  B B   (−1.6117)  ·  B C   (−1.6117)
```

Greedy's single-step shortsightedness cost it the better sequence; keeping just one extra candidate alive was enough to recover it here.

## Bench

```bench
id: decode-greedy-beam
title: Greedy vs. beam search
fallback: Compare the sequence greedy decoding finds against the sequence beam search finds on a tiny toy model, at different beam widths.
```

**Try this**

1. Set beam width to 1 and confirm it matches greedy decoding exactly.
2. Raise the width to 2 and watch the kept sequence change to the better one.
3. Raise it to 3 and check whether a third candidate changes anything here.

**What you should notice:** going from width 1 to width 2 is the only change that matters on this toy model — once beam search can see past the single best first step, it finds the sequence greedy missed, and keeping a third candidate doesn't improve on that.

## Where it appears in AI

* **Machine translation and summarization** historically relied heavily on beam search, where a locally-tempting word choice can derail the rest of a sentence.
* **Modern [[Decoder-Only Architectures|decoder-only chat models]] mostly don't use beam search** — it tends to produce short, repetitive, "safe" text for open-ended generation, which is why [[Temperature and Nucleus (Top-p) Sampling|sampling-based decoding]] is more common there; beam search still shows up for tasks with one clearly correct output.
* **Beam width is a real latency knob**: width k costs roughly k times the compute of greedy decoding, since every candidate has to be extended every step.

## Common pitfalls

* **Assuming a wider beam always finds a better sequence.** It finds a sequence with higher *total probability* under the model, which is not the same as a better sequence by human judgment — beam search famously produces duller, more generic text as width grows past a point.
* **Forgetting beam width 1 is just greedy.** They're the same algorithm; beam search is the generalization, not a different approach.
* **Confusing cumulative log-probability with per-step probability.** A sequence can contain one very likely step and still lose overall to a sequence of several merely-good steps, because log-probabilities add up over the whole sequence.

## Quick check

<details><summary>1. Why does greedy decoding sometimes miss the sequence with the highest total probability?</summary>
Because it commits to the single best token at each step without looking ahead — a slightly less likely first token can lead to a much more likely second token, and greedy never considers that trade-off.
</details>

<details><summary>2. What does a beam width of 1 reduce beam search to?</summary>
Exactly greedy decoding — only one candidate sequence is ever kept alive.
</details>

<details><summary>3. In the worked example, what sequence did width-1 beam search (greedy) find, and what did width-2 find instead?</summary>
Width 1 found "B B" (log-probability ≈ −1.6117); width 2 found "A C" (log-probability ≈ −1.1299), which is the actual best two-token sequence.
</details>

## Key terms

* **Greedy decoding:** always choosing the single highest-probability next token.
* **Beam search:** keeping the k highest-scoring candidate sequences alive at every step, for beam width k.
* **Cumulative log-probability:** the sum of the log-probabilities of every token in a sequence, used to rank candidate sequences.

## Related

[[Decoder-Only Architectures]] · [[Temperature and Nucleus (Top-p) Sampling]] · [[Self-Consistency and Best-of-N Sampling]]
