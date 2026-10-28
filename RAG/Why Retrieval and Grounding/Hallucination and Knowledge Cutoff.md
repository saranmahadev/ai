Every model has a training cutoff — a date after which nothing happened in its training data. Ask it about something before that date, and it usually answers confidently and correctly. Ask it about something after, and it doesn't say "I don't know" by default — it often produces a fluent, plausible-sounding answer anyway, wrong in a way that's hard to tell apart from being right.

**You need:** [[Parametric vs. Non-Parametric Knowledge]], [[Hallucination and Factuality]].

## The question it answers

"What actually happens when a model is asked about something past its training cutoff?" [[Hallucination and Factuality|Hallucination]] in general covers any confident-but-wrong output; this topic is about one specific, very common cause of it — a knowledge gap the model has no way of knowing it has. The model's confidence in its own unretrieved answer stays high right up to the cutoff, then decays the further past it a question falls, but it never hits zero: a language model is built to produce fluent text, and "I genuinely don't know" isn't the default completion for most questions.

## Intuition

Asking someone who left on a long expedition about recent news gets you confident answers about everything up to the day they left, and increasingly uncertain, outdated, or simply wrong guesses about anything after — but they usually don't just say "I don't know," because people (and models) are built to keep the conversation going, not to flag the exact edge of their own knowledge.

## Definition and notation

```text
confidence(event, cutoff) = 0.95                              if event is before cutoff
                           = max(0.05, 0.95 · e^(−days_past/30))  if event is after cutoff
```

An illustrative decay — the exact shape varies by model and topic, but the direction (confident, then decaying, never literally zero) is the real pattern.

## A worked example

Confidence in an unretrieved answer, at various distances from a training cutoff of January 1, 2024:

```text
365 days before cutoff:  95% confident
 30 days before cutoff:  95% confident
  1 day  before cutoff:  95% confident
  1 day  after  cutoff:  92% confident
 30 days after  cutoff:  35% confident
180 days after  cutoff:   5% confident (floor)
365 days after  cutoff:   5% confident (floor)
```

Confidence doesn't fall off a cliff exactly at the cutoff — it stays high for a short while (recent pre-cutoff training data is sparse too) and then drops sharply over the following weeks, settling at a low floor rather than zero. A model asked about something 180 days past its cutoff isn't refusing to answer; it's guessing with 5% of the confidence it would have for something it actually knows.

## Bench

```bench
id: knowledge-cutoff-confidence
title: Confident up to a point, then guessing
fallback: Slide an event's date relative to a training cutoff and watch confidence decay past it.
```

**Try this**

1. Slide to well before the cutoff and note confidence stays flat and high.
2. Cross the cutoff and watch confidence start falling within the first month.
3. Slide far past the cutoff and notice confidence never reaches exactly zero.

**What you should notice:** there's no sharp "I don't know" boundary at the cutoff — confidence degrades gradually, which is exactly why a hallucinated answer about a post-cutoff event can sound just as fluent as a correct one.

## Where it appears in AI

* **This is a specific, dateable instance of the broader [[Hallucination and Factuality|hallucination]] problem** covered in Generative AI — knowledge cutoff is one concrete, predictable cause among several.
* **Retrieval directly addresses this gap** by giving the model current documents to answer from instead of relying on its own decaying confidence — the motivation behind everything else in this subject.
* **[[RAG vs. Fine-Tuning vs. Long-Context]] treats "freshness" as one of the dimensions that decides whether retrieval is the right fix for a given knowledge gap.**

## Common pitfalls

* **Assuming a model will say "I don't know" when asked about something past its cutoff.** The worked example's confidence floor (5%, not 0%) reflects that models keep answering fluently well past the point where they should be uncertain.
* **Treating the cutoff date as a hard boundary.** Confidence starts sliding within days of the cutoff, not exactly at midnight on the cutoff date — training data near the cutoff is often sparse too.
* **Confusing knowledge cutoff with the model simply not knowing a fact that was always obscure.** Cutoff-related hallucination is specifically about events that didn't exist yet during training, not facts the training data merely omitted.

## Quick check

<details><summary>1. In the worked example, why does confidence 1 day after the cutoff (92%) look almost as high as confidence 1 day before it (95%)?</summary>
The decay function only starts applying once an event is past the cutoff, and the exponential decay is still very close to its starting value just one day in — the drop accelerates over the following weeks rather than happening instantly.
</details>

<details><summary>2. Does a model's confidence in an unretrieved answer ever reach exactly zero for events far past its cutoff?</summary>
No — the worked example's confidence floor is 5%, reflecting that models are built to produce fluent completions and rarely default to flat refusal, however far past their knowledge the question falls.
</details>

<details><summary>3. What's the direct fix retrieval offers for this specific problem?</summary>
Giving the model a current document about the event at answer-time, so it can ground its response in real information instead of relying on its own decaying, unretrieved confidence.
</details>

## Key terms

* **Training cutoff:** the date after which no data existed in a model's training set.
* **Hallucination:** a model producing a confident, fluent answer that is factually wrong.
* **Confidence decay:** the gradual drop in reliability of a model's unretrieved answers as a question moves further past its training cutoff.

## Related

[[Hallucination and Factuality]] · [[Parametric vs. Non-Parametric Knowledge]] · [[RAG vs. Fine-Tuning vs. Long-Context]]
