An answer can be perfectly grounded in its retrieved context and still completely fail to address what was asked — faithful to the wrong thing. Or it can directly, confidently answer the actual question while drawing on nothing that was ever retrieved. Faithfulness and answer relevancy measure these two failure directions separately, because an answer can fail at either one independently of the other.

**You need:** [[Grounded Generation and Faithfulness]].

## The question it answers

"Can an answer fail in two genuinely different ways, and does that require two separate metrics?" [[Grounded Generation and Faithfulness|Faithfulness]] measures whether an answer's claims are grounded in retrieved context. **Answer relevancy** measures something independent: how closely the answer actually addresses the question asked, typically by comparing the question's and the answer's embeddings directly. A grounded-but-off-topic answer and an on-topic-but-ungrounded answer fail in opposite ways, and a single combined score would hide which one happened.

## Intuition

A student asked "what time does the library close" who answers, word for word, something true from the assigned reading about library opening hours is being faithful to their source — and still hasn't answered the actual question. A student who confidently answers "9pm" from memory, with no source at all, has answered relevantly — and has nothing grounding that answer. Both responses fail, in opposite ways.

## Definition and notation

```text
faithfulness(answer)     = fraction of claims grounded in retrieved context
answer_relevancy(answer) = cosine_similarity(embed(question), embed(answer))
```

## A worked example

Two answers to "how long do refunds take," each failing a different one of the two metrics:

```text
"grounded, but off-topic":  answer about shipping (matches a retrieved passage about shipping)
  faithfulness: 1.000  (fully grounded in something retrieved)
  answer relevancy: 0.220  (barely related to the actual question asked)

"on-topic, but ungrounded":  a confident-sounding answer about refund timing, not matching any retrieved passage
  faithfulness: 0.000  (nothing retrieved supports it)
  answer relevancy: 0.998  (closely matches what the question was actually asking)
```

Neither answer scores well on both metrics. The first is entirely faithful to something retrieved, but that something isn't what was asked about. The second directly addresses the question, but has no grounding in anything actually retrieved — exactly the kind of answer that sounds right while potentially being wrong.

## Bench

```bench
id: faithfulness-vs-relevancy
title: Two different ways an answer can go wrong
fallback: Compare two answers that each fail one of faithfulness and answer relevancy, but not the other.
```

**Try this**

1. Look at the "grounded, but off-topic" scenario's two scores.
2. Switch to "on-topic, but ungrounded" and watch which score flips.
3. Consider what an answer scoring well on *both* metrics at once would actually look like.

**What you should notice:** these two scenarios are, in a sense, mirror images of each other — each is strong on exactly the metric the other is weak on, which is precisely why a single blended score would obscure what's actually wrong.

## Where it appears in AI

* **Faithfulness here is exactly the metric [[Grounded Generation and Faithfulness]] already derived** — this topic adds answer relevancy as its necessary complement.
* **[[End-to-End RAG Evaluation Frameworks]] combines both of these with the retrieval-side metrics** ([[Retrieval Metrics: Precision, Recall, MRR and NDCG]]) into a single scorecard that can localize which pipeline stage is actually weak.
* **[[Common RAG Failure Modes]] lists specific symptoms traceable to a low score on one of these two metrics but not the other** — a diagnostic use of exactly this distinction.

## Common pitfalls

* **Averaging faithfulness and answer relevancy into one number before looking at either individually.** The worked example's two scenarios would average to a similar-looking combined score despite failing in completely different ways — the individual breakdown is what actually tells you what's wrong.
* **Assuming a high relevancy score means the answer is trustworthy.** The "on-topic, but ungrounded" scenario scores 0.998 on relevancy while being entirely unsupported — relevancy says nothing about whether the content is grounded.
* **Assuming a high faithfulness score means the answer is useful.** The "grounded, but off-topic" scenario is perfectly faithful to a passage that doesn't answer the question at all.

## Quick check

<details><summary>1. Why can an answer score perfectly on faithfulness while scoring poorly on answer relevancy?</summary>
Faithfulness only checks whether an answer's claims trace back to some retrieved passage — it says nothing about whether that passage, or the resulting answer, actually addresses the specific question that was asked.
</details>

<details><summary>2. In the worked example, what specifically makes the "on-topic, but ungrounded" answer risky despite its high relevancy score?</summary>
It directly and confidently addresses the question asked (high relevancy), but nothing in the retrieved context actually supports it (zero faithfulness) — meaning its content may have come entirely from the model's own unretrieved, possibly outdated or incorrect, knowledge.
</details>

<details><summary>3. Why would averaging these two metrics into a single score be misleading?</summary>
Two very different failure modes (grounded-but-irrelevant and relevant-but-ungrounded) could produce similar average scores, hiding which specific problem actually occurred and therefore which stage of the pipeline needs fixing.
</details>

## Key terms

* **Answer relevancy:** how closely a generated answer's embedding matches the question's embedding.
* **Faithfulness:** the fraction of an answer's claims grounded in retrieved context (covered in depth in [[Grounded Generation and Faithfulness]]).
* **Independent failure modes:** two ways an answer can go wrong that don't imply or predict each other.

## Related

[[Grounded Generation and Faithfulness]] · [[End-to-End RAG Evaluation Frameworks]] · [[Common RAG Failure Modes]]
