[[Byte Pair Encoding|a BPE vocabulary]] is trained on a specific corpus, and whatever that corpus happens to contain determines which character sequences are common enough to earn their own token. Train mostly on one language, and text in a very different language or script pays a real, measurable price for every single piece of it.

**You need:** [[Byte Pair Encoding]], [[Data Mixture and Domain Weighting]].

## The question it answers

"Does the same tokenizer treat every language equally?" No — a tokenizer's vocabulary is only efficient for text that resembles what it was trained on. **Fertility** (tokens produced per word) measures this directly: text in a well-represented language gets split into few, large tokens; text in an underrepresented language or script gets shattered into many tiny ones, often down to individual characters, because none of its character combinations earned a merge during vocabulary training.

## Intuition

A simple substitution cipher applied to English still looks like gibberish to an English-trained reader, letter by letter, with nothing to recognize — reading it is exhausting and slow, word by word, letter by letter, compared to reading ordinary English fluently. A BPE tokenizer trained overwhelmingly on one language experiences something structurally similar on any very different language: instead of recognizing whole words or common sub-words the way it does in its "native" language, it has to fall back to the smallest possible pieces, one character at a time.

## Definition and notation

```text
fertility = (number of tokens produced) / (number of words)
  fertility ≈ 1: most words become a single token (efficient)
  fertility ≫ 1: words are shattered into many small tokens (inefficient)
```

## A worked example

A BPE vocabulary trained on an English-heavy toy corpus (`the`, `quick`, `brown`, `fox`, `jumps`, `over`, `lazy`, `dog`, ...), applied to two very different texts:

```text
well-represented (English): "the quick brown fox"
  4 words → 4 tokens → fertility 1.00
  (every word was common enough during training to merge into one token)

underrepresented script:    "zxqvkplmwjhf qzxvbnmklpo wertyuiopas"
  3 words → 37 tokens → fertility 12.33
  (none of these character sequences were ever seen often enough to merge;
   the tokenizer falls back to splitting almost down to single characters)
```

The English text's fertility of 1.00 means the tokenizer is working exactly as intended — nearly one token per word. The underrepresented text's fertility of over 12 means each word costs more than twelve times as many tokens to represent, for text that (to a human) is no more complex than the English sentence.

## Bench

```bench
id: multilingual-fertility
title: The same vocabulary, two very different fertilities
fallback: Compare how many tokens the same BPE vocabulary produces for text it was trained on versus text in an unfamiliar script.
```

**Try this**

1. Look at the well-represented text's token breakdown.
2. Switch to the underrepresented text and watch it shatter into single characters.
3. Compare the two fertility numbers directly.

**What you should notice:** the tokenizer isn't "worse" at recognizing the underrepresented text's meaning — it simply never learned any efficient way to represent it, because its training corpus barely (or never) contained anything like it.

## Where it appears in AI

* **Higher fertility directly costs more**: every token costs compute to process and (on most APIs) costs money, so text in a high-fertility language is systematically more expensive to send through the same model, for equivalent content.
* **It also costs effective context**: a model with a fixed context window of N tokens can fit far less *content* in a high-fertility language than in a low-fertility one, since each piece of content costs more tokens to represent.
* **This is a genuine, measured fairness concern in multilingual NLP**, directly traceable to [[Data Mixture and Domain Weighting|how much of each language was represented in the tokenizer's own training corpus]] — not an inherent property of any language itself.

## Common pitfalls

* **Assuming fertility reflects a language's intrinsic complexity.** It reflects how well-represented that language was in the *tokenizer's* training data, not anything about the language itself — the same text in the same language would tokenize efficiently under a tokenizer trained on it.
* **Treating this as solely a cost problem.** It's also a capability problem: a model effectively has less "room" to reason about high-fertility-language content within the same context window.
* **Forgetting the fix lives upstream of the model.** Addressing tokenizer fairness means changing what the tokenizer itself was trained on — it can't be patched by changing the model's weights alone.

## Quick check

<details><summary>1. What does a fertility of 1.00 indicate, and what does a fertility of 12 indicate?</summary>
A fertility near 1.00 means the tokenizer produces roughly one token per word (efficient representation); a fertility of 12 means each word costs roughly twelve tokens on average, indicating the tokenizer has no efficient representation for that text.
</details>

<details><summary>2. In the worked example, why did the underrepresented script's text shatter into so many tokens?</summary>
None of its character sequences appeared often enough in the tokenizer's training corpus to earn a BPE merge, so the tokenizer had no choice but to fall back to the smallest available units, close to individual characters.
</details>

<details><summary>3. Is high fertility for a given language a property of that language itself?</summary>
No — it reflects how well-represented that language was in the data the tokenizer was trained on; the same language tokenized by a vocabulary trained specifically on it would show much lower fertility.
</details>

## Key terms

* **Fertility:** the number of tokens a tokenizer produces per word, used to measure tokenization efficiency.
* **Underrepresented language:** a language with little presence in a tokenizer's training corpus, leading to high fertility and inefficient tokenization.
* **Tokenizer fairness:** the concern that a shared tokenizer can impose systematically unequal costs across languages.

## Related

[[Byte Pair Encoding]] · [[Data Mixture and Domain Weighting]] · [[Vocabulary Size and Out-of-Vocabulary Trade-offs]]
