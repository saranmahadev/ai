A transformer needs a fixed, finite vocabulary of symbols to look up — but raw text has effectively unlimited distinct words. Byte pair encoding (BPE) builds a vocabulary that sits between individual characters and whole words, by repeatedly merging whatever pair of symbols shows up most often.

**You need:** [[Vector Operations]].

## The question it answers

"How do you build a vocabulary small enough to look up in a table, but still able to represent any word — including ones never seen during training?" BPE's answer: start from individual characters (which can represent anything), then greedily merge the most frequent adjacent pair into a new symbol, over and over, until the vocabulary reaches a target size. Frequent whole words end up as single symbols; rare or unseen words fall back to smaller, still-meaningful pieces.

## Intuition

Think of it as starting with the finest possible spelling of every word and gradually "gluing together" the letter pairs that keep showing up next to each other. "T" and "h" glue into "th" because they co-occur constantly; "th" and "e" glue into "the" for the same reason. Keep going, and common whole words eventually become single symbols, while rare words stay broken into smaller, still-reusable fragments — never falling back to an "unknown" symbol the way a fixed whole-word vocabulary would.

## Definition and notation

```text
1. Represent every word as a sequence of characters, with an end-of-word marker.
2. Count every adjacent symbol pair's frequency across the whole corpus.
3. Merge the single most frequent pair into one new symbol, everywhere it occurs.
4. Repeat steps 2–3 for a fixed number of merges (the vocabulary's target size).
```

To tokenize a new word later, the same merges are replayed in the order they were learned.

## A worked example

A tiny corpus — `low` (×5), `lower` (×2), `newest` (×6), `widest` (×3) — starts as character sequences with an end-of-word marker `</w>`. The first 8 merges, in order:

```text
merge 1: e + s      (count 9)  → ...n e w es t</w>...,  ...w i d es t</w>...
merge 2: es + t     (count 9)  → ...est</w>...
merge 3: est + </w> (count 9)  → est</w>
merge 4: l + o      (count 7)  → lo
merge 5: lo + w     (count 7)  → low
merge 6: n + e      (count 6)  → ne
merge 7: ne + w     (count 6)  → new
merge 8: new + est</w> (count 6) → newest</w>
```

After 8 merges, the vocabulary has settled into: `low</w>` (whole word), `low e r </w>` (still split — "lower" was rarer), `newest</w>` (whole word), `w i d est</w>` (partially split). Apply this exact sequence of learned merges to a brand-new, never-seen word, `lowest`:

```text
lowest → [low, est</w>]
```

Even though `lowest` never appeared in training, the learned pieces `low` and `est</w>` — both built from genuinely frequent patterns — combine to tokenize it sensibly.

## Bench

```bench
id: bpe-merges
title: Building a vocabulary one merge at a time
fallback: Step through BPE training on a small corpus, watching which pair merges at each step and why, then tokenize a brand-new word with the learned merges.
```

**Try this**

1. Step through the first several merges and read off which pair wins at each step and its count.
2. Once several merges have run, tokenize a new word that shares pieces with the training corpus.
3. Tokenize a word that shares almost nothing with the corpus and see it fall back to individual characters.

**What you should notice:** the number of merges directly controls vocabulary size — stop early and words stay split into small pieces; run many merges and common words become single symbols, while rare ones still fall back gracefully instead of becoming "unknown."

## Where it appears in AI

* **It is the first step in nearly every modern transformer's input pipeline**, before a single embedding or attention computation happens — see [[Token Embeddings and Embedding Scaling]] next.
* **[[WordPiece and SentencePiece]] are variations on exactly this idea**, changing which pair gets merged at each step rather than the overall greedy-merge structure.
* **The number of merges is a real design decision** with direct consequences — see [[Vocabulary Size and Out-of-Vocabulary Trade-offs]].

## Common pitfalls

* **Assuming BPE works on whole words.** It operates on sequences of characters (or bytes); "words" only emerge as a byproduct of enough frequent merges.
* **Forgetting the end-of-word marker's role.** Without it, a frequent fragment at the end of one word could merge with the start of the next, blurring word boundaries.
* **Expecting a merge order learned on one corpus to generalize to very different text.** A vocabulary trained on English prose will tokenize code, or a different language, much less efficiently.

## Quick check

<details><summary>1. What determines which pair gets merged at each step of BPE training?</summary>
Whichever adjacent symbol pair currently has the highest frequency across the whole corpus.
</details>

<details><summary>2. In the worked example, why did "newest" become a single token but "lower" did not?</summary>
"Newest" appeared 6 times and its component merges (e+s, es+t, est+</w>, n+e, ne+w, new+est</w>) were each the most frequent pair at their step; "lower" appeared only twice, so its own merges never won out within the first 8 steps.
</details>

<details><summary>3. How does BPE tokenize a word it never saw during training?</summary>
By replaying the learned merges in order against the new word's characters — any pieces that match still merge, and the rest stays split into smaller fragments rather than becoming an unknown symbol.
</details>

## Key terms

* **Merge:** combining the most frequent adjacent symbol pair into one new symbol, BPE's single training step.
* **Subword token:** a vocabulary entry smaller than a whole word but larger than a single character.
* **End-of-word marker:** a symbol marking where one word ends, preventing merges across word boundaries.

## Related

[[WordPiece and SentencePiece]] · [[Vocabulary Size and Out-of-Vocabulary Trade-offs]] · [[Token Embeddings and Embedding Scaling]]
