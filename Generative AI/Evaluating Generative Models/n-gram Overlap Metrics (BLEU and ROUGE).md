Perplexity measures how well a model predicts text it's shown; it says nothing about a model's own generated output compared to a correct answer. This note covers the much older, much simpler approach: just count how many words overlap between a generated text and a reference one.

**You need:** [[Perplexity as a Generation Metric]].

## The question it answers

"How closely does a generated piece of text match a reference, by shared words and phrases?" **BLEU** is a *precision*-based score: of all the word sequences (n-grams) the candidate produced, what fraction also appear in the reference? It's commonly used for translation, where producing extra, unsupported content should be penalized. **ROUGE** flips the question into a *recall*-based score: of all the n-grams in the reference, what fraction did the candidate manage to reproduce? It's commonly used for summarization, where missing important reference content should be penalized.

## Intuition

Imagine grading two different kinds of essay answers against a model answer. For a translation, you want to penalize someone who added things that aren't actually in the source — that's precision, BLEU's question: "of what you said, how much was right?" For a summary, you instead want to penalize someone who left out the point entirely, even if everything they *did* write was accurate — that's recall, ROUGE's question: "of what mattered, how much did you capture?"

## Definition and notation

```text
n-gram: a sequence of n consecutive words ("the cat" is a bigram, n=2)

BLEU (precision, with a length-shortfall penalty):
  precisionₙ = (matching n-grams in candidate) / (total n-grams in candidate)
  BLEU = brevity_penalty × geometric_mean(precision₁, precision₂, ...)

ROUGE-n (recall):
  recallₙ = (matching n-grams, clipped to reference counts) / (total n-grams in reference)
```

## A worked example

Reference: `"the cat sat on the mat"`. Three candidates scored against it:

```text
"the cat sat on the mat"  (exact match)
  BLEU = 1.0000      ROUGE-1 recall = 1.0000

"a dog ran in the park"   (unrelated, shares only "the")
  BLEU = 0.0000      ROUGE-1 recall = 0.1667   (1 of 6 reference unigrams matched)
```

The exact match scores perfectly on both metrics, as expected. The unrelated sentence scores exactly 0 on BLEU — it has essentially no matching n-grams of any length, and BLEU's geometric mean over n-gram precisions collapses to zero the moment any one precision does — but ROUGE-1 recall still gives it a small positive score of 0.1667, simply because one shared word ("the") happens to appear in both.

## Bench

```bench
id: bleu-rouge-score
title: Precision (BLEU) vs. recall (ROUGE)
fallback: Compare a candidate sentence's BLEU and ROUGE-1 recall scores against a fixed reference sentence.
```

**Try this**

1. Compare the exact match's scores on both metrics.
2. Compare the paraphrase's BLEU score against its ROUGE score.
3. Notice the unrelated sentence still gets a small nonzero ROUGE score, despite scoring exactly zero on BLEU.

**What you should notice:** BLEU and ROUGE can disagree sharply on the same pair of texts — they're measuring genuinely different things (precision versus recall over shared n-grams), not two versions of the same underlying score.

## Where it appears in AI

* **Machine translation has historically reported BLEU as a standard benchmark metric**, specifically because penalizing unsupported extra content (low precision) matters a lot for faithful translation.
* **Summarization has historically reported ROUGE**, specifically because missing the source's key points (low recall) is the more damaging failure mode there.
* **Both metrics are increasingly supplemented or replaced by [[Human Evaluation of Generated Content|human evaluation]] and learned metrics**, since exact n-gram overlap can't recognize a correct paraphrase that happens to use different words entirely.

## Common pitfalls

* **Using BLEU for summarization or ROUGE for translation without considering which failure mode matters more.** Each metric is built around a specific sensitivity (precision vs. recall) that fits one task's typical error pattern better than the other's.
* **Treating a low score as proof of a bad generation.** A perfectly good paraphrase that avoids repeating the reference's exact wording can score poorly on both metrics, despite being semantically correct — n-gram overlap can't recognize synonyms or restructured sentences.
* **Forgetting BLEU's geometric mean makes it brittle to a single zero precision.** If a candidate happens to share no bigrams at all with the reference, its BLEU score collapses to zero regardless of how good its unigram overlap is.

## Quick check

<details><summary>1. What's the key conceptual difference between BLEU and ROUGE?</summary>
BLEU measures precision — how much of what the candidate produced also appears in the reference; ROUGE measures recall — how much of the reference the candidate managed to reproduce.
</details>

<details><summary>2. In the worked example, why did the unrelated sentence score 0 on BLEU but a small positive value on ROUGE?</summary>
BLEU's geometric mean over several n-gram precisions collapses to zero once any one precision (like the bigram precision, with essentially no matches) is zero; ROUGE-1 recall only needed one matching unigram ("the") out of six reference unigrams to register a small nonzero score.
</details>

<details><summary>3. Why might a correct paraphrase score poorly on both BLEU and ROUGE?</summary>
Because both metrics rely on exact n-gram (word-sequence) overlap, which can't recognize that a differently-worded sentence conveys the same meaning as the reference.
</details>

## Key terms

* **BLEU:** a precision-based n-gram overlap metric, commonly used for machine translation.
* **ROUGE:** a recall-based n-gram overlap metric, commonly used for summarization.
* **N-gram:** a sequence of n consecutive tokens, the basic unit both metrics compare.

## Related

[[Perplexity as a Generation Metric]] · [[Distributional Metrics (FID, Inception Score and CLIP Score)]] · [[Human Evaluation of Generated Content]]
