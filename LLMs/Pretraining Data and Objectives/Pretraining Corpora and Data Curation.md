Before any training happens, someone has to decide what text a model is even allowed to learn from. That choice — what's included, what's filtered out, and in what proportion — shapes a model's knowledge and behavior as much as any architectural decision does.

**You need:** [[Decoder-Only Architectures]].

## The question it answers

"What actually goes into the dataset a large language model is pretrained on?" A pretraining **corpus** is typically assembled from several sources — web crawls, books, code repositories, reference material, forums — each with different quality, different biases, and different coverage of topics and languages. **Curation** means filtering and weighting that raw material: discarding low-quality, duplicated, or harmful content before it ever reaches training, since every token a model sees shapes what it eventually produces.

## Intuition

Imagine building a personal library by raiding dumpsters outside bookstores, libraries, and print shops. You'd get an enormous amount of material — some of it excellent, much of it junk mail, spam, broken formatting, or outright garbage. You wouldn't shelve all of it unread; you'd sort through, keep what's genuinely useful, and the proportions you keep would quietly determine what kind of reader you turn into. A pretraining corpus is that same raiding-and-sorting process, at a scale of trillions of words.

## Definition and notation

```text
corpus = {source₁: tokens, source₂: tokens, ...}
curation: filter each document by a quality signal (length, language,
  repetition, toxicity, dedup status, ...); keep only documents whose
  quality meets some threshold
```

## A worked example

A toy corpus of 10 documents from three sources, each with a quality score. Filtering by different thresholds:

```text
threshold 0.00: keeps all 10 documents (6 web, 2 books, 2 code)
threshold 0.50: keeps 6 documents (3 web, 2 books, 1 code)
threshold 0.85: keeps 2 documents (0 web, 1 books, 1 code)
```

As the threshold rises, the *mix* shifts, not just the count — the web documents (which had the widest range of quality scores in this toy set) get filtered out fastest, while books and code survive longer. A high enough threshold leaves a dataset that looks nothing like the raw mix it started from.

## Bench

```bench
id: corpus-mixture-breakdown
title: Filtering shifts what's left
fallback: Raise a quality threshold and watch how many documents from each source survive.
```

**Try this**

1. Start at threshold 0 and note the full mix.
2. Raise the threshold and watch which source's documents disappear first.
3. Push it high enough to see only one or two sources survive at all.

**What you should notice:** filtering for quality is never source-neutral — if one source's documents happen to average lower quality, aggressive filtering quietly shifts the final mix toward the sources that didn't.

## Where it appears in AI

* **Published pretraining-data reports (where they exist) describe exactly this kind of sourcing and filtering pipeline**, often citing specific heuristics (language identification, perplexity filtering, classifier-based quality scores) used to decide what survives.
* **[[Data Mixture and Domain Weighting|how much of each surviving source to include]] is a separate decision from filtering itself** — filtering decides what's eligible at all; mixture weighting decides how much of what's eligible actually gets sampled.
* **Corpus composition is a leading explanation for why models vary in their strengths** — a model trained on more code tends to code better; one trained on more of a given language tends to handle that language better.

## Common pitfalls

* **Assuming more data is unconditionally better.** Including low-quality or duplicated content can actively hurt a model, not just fail to help it — see [[Data Deduplication and Quality Filtering]].
* **Treating "curation" as a neutral, purely technical step.** Every filtering heuristic encodes a judgment about what counts as "quality," and those judgments can systematically favor or disfavor particular topics, dialects, or perspectives.
* **Forgetting that filtering changes composition, not just size.** As the worked example shows, aggressive filtering can leave a dataset dominated by whichever source happened to score well on the chosen quality signal.

## Quick check

<details><summary>1. What does "curating" a pretraining corpus actually involve?</summary>
Filtering and weighting raw text from multiple sources — discarding low-quality, duplicated, or harmful content and deciding how much of what remains to include — before it's used for training.
</details>

<details><summary>2. In the worked example, why did raising the quality threshold change the corpus's source mix, not just its size?</summary>
Because the sources didn't have identical quality distributions — web documents in the toy example spanned a wider quality range, so they were filtered out disproportionately as the threshold rose.
</details>

<details><summary>3. Why can corpus composition explain differences in model behavior across languages or domains?</summary>
A model can only get as good at something as its training data allows — more representation of a language, domain or skill in the corpus generally means stronger capability in that area, and less representation means weaker capability.
</details>

## Key terms

* **Corpus:** the full collection of text a model is pretrained on.
* **Curation:** filtering and weighting raw data sources before training, based on quality signals.
* **Quality signal:** a heuristic or score (length, language, repetition, toxicity, …) used to decide whether a document is worth including.

## Related

[[Decoder-Only Architectures]] · [[Data Deduplication and Quality Filtering]] · [[Data Mixture and Domain Weighting]]
