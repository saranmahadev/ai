[[Byte Pair Encoding|BPE]] merges whichever adjacent pair is most *frequent*. WordPiece merges whichever pair is most *surprising* — co-occurring more than its two pieces' individual frequencies would predict. SentencePiece changes something else entirely: it tokenizes raw text directly, spaces included, instead of assuming words are already split apart.

**You need:** [[Byte Pair Encoding]].

## The question it answers

"Is raw frequency really the best signal for which pair to merge next, and does tokenization have to start from whitespace-separated words at all?" WordPiece answers the first question by scoring pairs on how much more often they co-occur than chance predicts, not on raw counts. SentencePiece answers the second by never assuming whitespace marks word boundaries in the first place — it treats spaces as ordinary symbols to be merged like any other.

## Intuition

**WordPiece** asks, for each candidate pair, "do these two symbols show up together far more than I'd expect given how common each one is on its own?" A frequent pair made of two already-common symbols might score lower than a rarer pair made of two uncommon symbols that almost always appear glued together — the second pair carries more genuine signal. **SentencePiece** solves a different problem: BPE and WordPiece both assume text arrives pre-split into words by whitespace, which quietly breaks for languages without spaces between words (like Japanese or Thai) and throws away exactly where the spaces were. SentencePiece keeps the spaces in the stream — usually marked with a visible symbol like `▁` — so segmentation and exact reconstruction both work without any special whitespace handling.

## Definition and notation

```text
BPE's merge score:        count(pair)
WordPiece's merge score:  count(pair) / (count(left) × count(right))
```

SentencePiece isn't a third scoring rule — it's a change to what gets fed into a merge algorithm (BPE-style or otherwise): the whole raw string, spaces replaced by a visible marker, with no prior word-splitting step at all.

## A worked example

The same toy corpus as [[Byte Pair Encoding]] — `low` (×5), `lower` (×2), `newest` (×6), `widest` (×3) — scored WordPiece's way instead of BPE's way:

```text
merge 1: i + d   score 0.333  (count 3)   ← WordPiece's first pick
merge 2: l + o   score 0.143  (count 7)
merge 3: s + t   score 0.111  (count 9)
merge 4: lo + w  score 0.063  (count 7)
```

Compare to BPE's first merge on the identical corpus: `e + s` (the single most frequent pair, count 9). WordPiece instead starts with `i + d` — far less frequent (count 3) but with a far higher co-occurrence score, since `i` and `d` almost never appear apart from each other in this corpus.

Now a SentencePiece-style pass: treat two full phrases as single symbol streams with spaces marked, `▁low▁tide` and `▁new▁tide`, and merge the same way:

```text
merges (in order): w+▁, w▁+t, w▁t+i, w▁ti+d, w▁tid+e, ▁+l
pieces for "▁low▁tide":  ▁l · o · w▁tide
reconstruction:  join pieces → "▁low▁tide" → replace ▁ with space → "low tide"
```

One of the learned pieces, `w▁tide`, spans straight across what used to be a word boundary — exactly what BPE and WordPiece's word-first pre-splitting would never allow. Reconstruction needs nothing more than joining pieces and swapping `▁` back for a space.

## Bench

```bench
id: wordpiece-score
title: Frequency vs co-occurrence score
fallback: Compare BPE's most-frequent-pair merge choice against WordPiece's co-occurrence-score merge choice on the same corpus, step by step.
```

**Try this**

1. Step through BPE and WordPiece merges side by side on the same corpus and compare their first few choices.
2. Find a step where the two disagree, and check each pair's raw count against its WordPiece score.
3. Look at the SentencePiece-style phrase segmentation and confirm the reconstruction recovers the exact original text.

**What you should notice:** BPE and WordPiece can diverge from their very first merge, even on identical data — the scoring rule alone, not the data, decides which pieces a vocabulary ends up with.

## Where it appears in AI

* **WordPiece is the tokenizer used by BERT and its descendants** — a real, widely-deployed design choice, not a textbook footnote.
* **SentencePiece is used wherever whitespace boundaries can't be trusted**, including multilingual models that must handle languages with and without spaces in the same vocabulary.
* **Both still feed into the exact same next step**: [[Token Embeddings and Embedding Scaling|looking up an embedding vector]] for every resulting token, regardless of which scoring rule produced it.

## Common pitfalls

* **Assuming WordPiece always picks less-frequent pairs.** It picks the pair with the highest co-occurrence *score* — that pair can still happen to be a frequent one; the worked example's divergence from BPE is not guaranteed on every corpus.
* **Treating SentencePiece as a different merge algorithm.** It's usually still BPE (or a related method) underneath — the change is in what text reaches the algorithm, not how pairs get scored.
* **Forgetting cross-word pieces are a real possibility.** As the worked example shows, a learned piece can span what looks like a word boundary — that's expected under SentencePiece, not a bug.

## Quick check

<details><summary>1. What does WordPiece's merge score measure that raw frequency doesn't?</summary>
How much more often a pair co-occurs than its two pieces' individual frequencies would predict by chance — not just how often the pair appears.
</details>

<details><summary>2. What problem does SentencePiece solve that BPE and WordPiece, as usually applied, do not?</summary>
Tokenizing text without relying on whitespace already marking word boundaries — needed for languages that don't separate words with spaces, and for lossless, unambiguous reconstruction of the original text.
</details>

<details><summary>3. In the worked example, what made "i + d" WordPiece's top pick despite its low raw count?</summary>
"i" and "d" almost always appeared next to each other in the corpus relative to how often each occurred on its own, giving the pair a high co-occurrence score even at count 3.
</details>

## Key terms

* **Co-occurrence score:** WordPiece's merge criterion, a pair's frequency divided by the product of its two pieces' individual frequencies.
* **Whitespace marker (▁):** a visible symbol standing in for a space, letting SentencePiece treat spaces as ordinary, mergeable symbols.
* **Lossless tokenization:** a scheme where the original text can be exactly reconstructed from its tokens, with no ambiguity about spacing.

## Related

[[Byte Pair Encoding]] · [[Vocabulary Size and Out-of-Vocabulary Trade-offs]] · [[Token Embeddings and Embedding Scaling]]
