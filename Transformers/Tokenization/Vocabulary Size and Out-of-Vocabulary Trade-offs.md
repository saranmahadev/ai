The number of merges [[Byte Pair Encoding|BPE training]] runs for sets a single number — vocabulary size — that quietly controls three different costs at once: how many parameters the embedding table needs, how long a given piece of text becomes once tokenized, and how gracefully unfamiliar words get handled.

**You need:** [[Byte Pair Encoding]].

## The question it answers

"Why not just make the vocabulary as large as possible?" Because every added vocabulary entry is a row in the embedding table — pure parameter cost, paid whether or not that token appears often — while a vocabulary that's too small forces ordinary words into long chains of tiny pieces, making every sequence longer and every layer of attention more expensive to compute, since attention's cost grows with the square of sequence length.

## Intuition

A vocabulary of individual characters needs almost no embedding parameters but turns every sentence into a very long sequence of tiny pieces. A vocabulary of a million whole words would make sequences short, but the embedding table alone would dwarf the rest of the network, and most of those million rows would be trained on only a handful of examples each. Real tokenizers sit deliberately in between, trading a moderate number of merges for a vocabulary that's small enough to train well and large enough to keep sequences short.

## Definition and notation

```text
embedding parameters = vocabulary_size × d_model
tokens per word ↓ as vocabulary_size ↑  (fewer, larger pieces)
```

More merges (points) ⇒ larger vocabulary, shorter sequences, more embedding parameters. Fewer merges ⇒ smaller vocabulary, longer sequences, fewer embedding parameters — but also a smaller table to spread training signal across.

## A worked example

Training BPE on a small corpus for different numbers of merges, then measuring average tokens per word on a mixed set of seen and unseen words (`low, lower, newest, widest, newer, lowest, slowest`):

```text
merges   vocabulary size   avg tokens per word
  0            11                6.43   (pure characters)
  4            10                4.00
  8            11                3.14
 12             8                2.43
```

More merges shrink the average tokens-per-word sharply, even on this tiny corpus. At real scale, the same trade-off shows up directly in embedding table size: at `d_model = 768` (BERT-base's width), a vocabulary of 8,000 costs `8,000 × 768 = 6,144,000` embedding parameters; BERT-base's actual vocabulary of 30,522 costs `30,522 × 768 = 23,440,896`; GPT-2's vocabulary of 50,257 costs `50,257 × 768 = 38,597,376` — the embedding table alone, before a single transformer layer.

## Bench

```bench
id: vocab-tradeoff
title: Vocabulary size, sequence length and parameter cost
fallback: Train BPE to a chosen number of merges and see the resulting vocabulary size, average tokens per word on a test set, and the embedding table's parameter cost at a chosen model width.
```

**Try this**

1. Increase the merge count and watch tokens-per-word fall while vocabulary size grows.
2. Set the model width (d_model) and watch the embedding parameter cost scale directly with vocabulary size.
3. Compare a word seen often in training against a rare or unseen one, and see how many more pieces the rare word needs.

**What you should notice:** there is no setting that minimizes both sequence length and parameter cost at once — every real tokenizer's vocabulary size is a deliberately chosen compromise, not a value that's obviously "correct."

## Where it appears in AI

* **It is the first of several budget trade-offs this subject makes concrete** — later sections weigh similar costs for attention computation itself (see [[Efficient and Scaled Attention]]) and for a transformer's total parameter count (see [[Counting a Transformer's Parameters and FLOPs]]).
* **Real tokenizers converge on broadly similar vocabulary sizes** (tens of thousands of entries) across very different models, because this trade-off has a genuine sweet spot rather than a single "more is better" direction.
* **A fixed vocabulary set at training time is one of the few truly immovable choices in a deployed model** — changing it means retraining the embedding table (and usually the whole model) from scratch.

## Common pitfalls

* **Assuming a bigger vocabulary is always better.** It directly increases embedding parameters and spreads training examples thinner across rare tokens, both real costs.
* **Forgetting sequence length feeds into a cost that grows faster than linearly.** Because attention's compute cost scales with the square of sequence length (see [[Why Attention Replaced Recurrence]]), a smaller vocabulary's longer sequences cost more than the token count alone suggests.
* **Treating out-of-vocabulary words as a solved problem below some vocabulary size.** Subword tokenization avoids a hard "unknown" fallback, but a rare word can still fragment into many small, less meaningful pieces.

## Quick check

<details><summary>1. What two costs does increasing vocabulary size trade against each other?</summary>
Embedding table parameters (which grow with vocabulary size) against sequence length and the per-token training signal (which shrink as whole words become single tokens more often).
</details>

<details><summary>2. Why does a smaller vocabulary cost more than its token count alone suggests?</summary>
Because the longer sequences it produces feed into attention, whose computational cost grows with the square of sequence length, not linearly.
</details>

<details><summary>3. How do BPE-family tokenizers handle a word that never appeared during training?</summary>
By falling back to smaller, still-meaningful subword pieces (as shown in the worked examples in [[Byte Pair Encoding]] and [[WordPiece and SentencePiece]]), rather than a single "unknown" token.
</details>

## Key terms

* **Embedding table:** the lookup matrix mapping each vocabulary entry to a vector, sized `vocabulary_size × d_model`.
* **Tokens per word:** how many vocabulary entries, on average, one word decomposes into — falls as vocabulary size grows.
* **Vocabulary size:** the total number of distinct entries a tokenizer can produce, set by how many merges (or equivalent) its training ran for.

## Related

[[Byte Pair Encoding]] · [[WordPiece and SentencePiece]] · [[Token Embeddings and Embedding Scaling]] · [[Counting a Transformer's Parameters and FLOPs]]
