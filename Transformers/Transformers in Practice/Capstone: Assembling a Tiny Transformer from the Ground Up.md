This capstone traces one phrase through every stage this subject built, in order: tokenizing it, embedding and scaling the pieces, adding positional information, running one full transformer block, and projecting back to a prediction over the vocabulary — checking that every piece still fits together exactly as each individual topic claimed.

**You need:** [[Byte Pair Encoding]], [[Token Embeddings and Embedding Scaling]], [[Learned Positional Embeddings]], [[Weight Tying]], [[Assembling One Transformer Block]].

## The question it answers

"Do all of this subject's individually-verified pieces actually compose into one working pipeline?" This capstone builds the pipeline directly, stage by stage, reusing the same tokenizer, embedding scaling, transformer block, and tied output projection verified separately throughout the subject — and checks that a genuinely novel input flows cleanly from raw text to a predicted next token.

## The pipeline

```text
1. Tokenization (Byte Pair Encoding)
2. Scaled embedding lookup (Token Embeddings and Embedding Scaling)
3. Add positional information (Positional Information Beyond Sinusoids)
4. One transformer block: attention + residual + norm, feed-forward + residual + norm
   (Assembling One Transformer Block)
5. Output projection via the tied embedding table, then softmax
   (Weight Tying)
```

## A worked walkthrough

The exact same BPE merges from [[Byte Pair Encoding]], applied to the exact same unseen word, `lowest`:

```text
1. tokens: ["low", "est</w>"]
```

A tiny 5-entry, 4-dimensional tied embedding table (`low`, `est</w>`, plus three distractor pieces), scaled by `√4 = 2`:

```text
2. scaled embeddings for "low" and "est</w>":
   [-0.383, 0.488, 0.065, 0.304]
   [-0.798, 0.508, -0.782, -0.631]

3. with positional vectors added:
   [-0.361, 0.593, 0.018, 0.414]
   [-0.610, 0.516, -0.877, -0.446]
```

One full pre-norm transformer block (self-attention, then feed-forward, each wrapped in normalization and a residual connection):

```text
4. block output at the final position (after "est</w>"):
   [-1.2839, 1.1197, -1.4763, -0.7382]
```

Projecting that final hidden vector back through the *same tied* embedding table used in step 2, then softmax:

```text
5. logits:  [0.3585, 1.6070, 0.6746, 0.8445, 0.4250]
   probabilities:
     low:      0.1169
     est</w>:  0.4075   ← highest
     er</w>:   0.1604
     new:      0.1901
     wid:      0.1250
```

The model's top prediction after "lowest" is `est</w>` itself — not a meaningful prediction (the weights here are untrained, small random numbers), but a complete, working pipeline: a word the BPE merges never saw during training was still tokenized sensibly, embedded, positioned, transformed through a full attention-and-feed-forward block, and turned into a genuine probability distribution over the vocabulary, using nothing but the pieces this subject built one at a time.

## Bench

```bench
id: nn-capstone-transformer
title: One phrase, the whole pipeline
fallback: Trace a word through tokenization, embedding, one transformer block and the output projection, watching each stage's output in turn.
```

**Try this**

1. Step through each stage and watch the vectors (or tokens, or probabilities) change.
2. Try a different word and see how its tokenization and final prediction differ.
3. Compare the final probabilities' spread — notice how flat they are with untrained, random weights.

**What you should notice:** every stage's output is exactly consistent with that stage's own topic earlier in this subject — nothing here is special-cased for this capstone; it's the same functions, called in sequence.

## Where it appears in AI

* **This is, structurally, exactly what a real transformer does on every input** — the only difference from a production model is scale (far more layers, far wider vectors, trained weights) and the specific architectural variants (RoPE instead of simple positions, RMSNorm, gated feed-forward) covered as options earlier in this subject.
* **It demonstrates this subject's central claim**: a transformer is not one monolithic mechanism, but a composition of independently-understandable pieces, each doing one job, stacked and connected in a fixed, learnable pattern.
* **From here, [[LLMs|training this pipeline on real data at real scale]]**, generating many tokens autoregressively, and grounding it in retrieved documents or tool use are the next subjects' jobs — this subject's job was the architecture itself.

## Common pitfalls

* **Expecting a meaningful prediction from untrained weights.** The point of this worked example is that the *pipeline* works correctly end to end, not that small random weights produce useful output.
* **Assuming a real transformer differs structurally from this capstone.** It doesn't — more layers, wider vectors, and trained weights are scale and training differences, not architectural ones.
* **Forgetting the tied embedding table is used in both directions.** The same matrix that looked up "low" and "est</w>" at the start is the matrix the final hidden vector is projected back through at the end.

## Quick check

<details><summary>1. What are the five stages this capstone traces a phrase through, in order?</summary>
Tokenization, scaled embedding lookup, adding positional information, one transformer block (attention and feed-forward, each with residual connections and normalization), and output projection through the tied embedding table followed by softmax.
</details>

<details><summary>2. Why was the word "lowest" specifically chosen for this worked example?</summary>
It was never part of the BPE training corpus, so successfully tokenizing and processing it demonstrates the pipeline generalizing to unseen input, not just replaying memorized training examples.
</details>

<details><summary>3. What does this capstone's result demonstrate about the subject's topics as a whole?</summary>
That the individually-verified pieces — tokenization, embedding scaling, the transformer block, and tied weights — genuinely compose into one working pipeline, with each stage's output consistent with what its own topic claimed.
</details>

## Key terms

* **Pipeline:** the ordered sequence of stages — tokenization, embedding, transformer blocks, output projection — that turns raw text into a prediction.
* **End-to-end:** covering every stage from raw input to final output, with no stage skipped or special-cased.
* **Untrained weights:** randomly initialized parameters, used here to verify the pipeline's mechanics rather than to produce a meaningful prediction.

## Related

[[Byte Pair Encoding]] · [[Token Embeddings and Embedding Scaling]] · [[Weight Tying]] · [[Assembling One Transformer Block]]
