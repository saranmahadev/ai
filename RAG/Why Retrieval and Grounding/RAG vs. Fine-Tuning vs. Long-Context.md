A model that doesn't know something, or doesn't behave the way you want, has more than one fix available. Retrieval, fine-tuning, and simply stuffing more into the prompt (long-context) all address a gap between what a model does and what you need — but they're good at different gaps, for different reasons.

**You need:** [[Parametric vs. Non-Parametric Knowledge]], [[Long-Context Transformers]], [[Fine-Tuning for a Specific Task]].

## The question it answers

"Given a gap between what a model knows or does and what's needed, how do you decide which of these three fixes it?" Retrieval (RAG) and long-context both keep the model's weights untouched and supply information at answer-time — RAG searches a large collection for the relevant few documents; long-context relies on stuffing everything that might be relevant directly into the prompt, which only scales as far as the context window and its cost allow. Fine-tuning changes the weights themselves, which is the right tool when the gap is about *behavior* or *style* rather than *facts* — information baked into weights through fine-tuning doesn't update the moment something changes, the way a retrieved document can.

## Intuition

Three different ways to help someone answer questions about an enormous reference library: hand them a search engine over the whole library (RAG); hand them a stack of every book that might be relevant and let them read through it each time (long-context); or send them back to school to actually learn the material (fine-tuning). The search engine scales to a huge library cheaply; handing over physical books gets expensive and slow as the stack grows; sending someone to re-learn material is the right call only when you want them to behave differently, not just to have looked something up once.

## Definition and notation

```text
score(approach, weights) = Σ approach[dimension] × weights[dimension] / Σ weights[dimension]
```

Each approach is scored on freshness (how quickly new information can be reflected), update cost (how cheap it is to incorporate a change), latency cost (how much slower a request gets), transparency (how traceable an answer is to its source), and style (how well it reshapes the model's own behavior).

## A worked example

Three approaches, scored 0–1 on five dimensions, under two different task scenarios:

```text
                freshness  updateCost  latencyCost  transparency  style
RAG                0.95       0.90        0.60          0.90       0.30
fine-tuning        0.20       0.20        0.90          0.30       0.95
long-context       0.95       0.95        0.30          0.70       0.30

freshness-critical knowledge base:  RAG 0.900  long-context 0.860  fine-tuning 0.280  →  RAG wins
writing-style adaptation:            fine-tuning 0.800  RAG 0.4825  long-context 0.405  →  fine-tuning wins
```

For a knowledge base that changes constantly, RAG edges out long-context (similar freshness, but far cheaper to update as the collection grows) and both crush fine-tuning. For adapting a model's writing style, the ranking flips entirely — fine-tuning wins by a wide margin, because style isn't something either RAG or long-context was ever trying to fix.

## Bench

```bench
id: rag-vs-finetune-vs-longcontext
title: Different gaps need different fixes
fallback: Switch between task scenarios and see which approach actually scores best for each.
```

**Try this**

1. Compare the winning approach under each scenario — notice it's a different one each time.
2. Look at how close RAG and long-context are under the freshness scenario, and why RAG still edges ahead.
3. Imagine a scenario that weights latency most heavily — which approach would you expect to suffer most, and why?

**What you should notice:** RAG and long-context solve a similar problem (supplying fresh, non-parametric information) in different ways, while fine-tuning solves a genuinely different problem (changing the model's own behavior) — picking between them is about identifying which kind of gap you actually have.

## Where it appears in AI

* **This reuses the same weighted-scoring mechanism as [[Choosing a Model for a Task]] on the LLMs planet**, applied here to choosing an adaptation strategy instead of a model size.
* **Long-context's latency and cost scale with how much is stuffed into the prompt every single request ([[Cost and Latency of LLM APIs]])** — exactly the trade-off RAG's targeted retrieval is designed to avoid.
* **Fine-tuning's own trade-offs (forgetting, update cost) are covered in depth on the LLMs planet ([[Fine-Tuning for a Specific Task]], [[Catastrophic Forgetting in Fine-Tuning]])** — this topic only covers when fine-tuning is the right tool to reach for in the first place.

## Common pitfalls

* **Treating these three as mutually exclusive.** Production systems routinely combine them — a fine-tuned model that's also retrieval-augmented, with long-context used for a handful of documents too important to risk missing in retrieval.
* **Defaulting to long-context "because context windows are big now."** The worked example shows long-context's update cost is cheap but its *latency* cost is the worst of the three — stuffing more into every single request has a real, recurring price.
* **Reaching for fine-tuning to fix a freshness problem.** The worked example shows fine-tuning scores worst on freshness and update cost by a wide margin — it's the right tool for reshaping behavior, not for keeping facts current.

## Quick check

<details><summary>1. In the worked example, why does RAG edge out long-context in the freshness-critical scenario despite both scoring 0.95 on freshness itself?</summary>
The scenario also weights update cost, where RAG scores higher (0.90 vs. 0.95 is close, but long-context's advantage narrows once latency cost — where RAG scores much better, 0.60 vs. 0.30 — is factored in too) — the combination across all weighted dimensions, not freshness alone, decides the winner.
</details>

<details><summary>2. Why does fine-tuning win decisively in the style-adaptation scenario when it scored worst in the freshness scenario?</summary>
The two scenarios weight completely different dimensions — freshness and update cost (where fine-tuning is weakest) barely matter in the style scenario, which instead weights style (where fine-tuning scores 0.95, far above the other two).
</details>

<details><summary>3. Can RAG and fine-tuning be used on the same model at the same time?</summary>
Yes — they address different kinds of gaps (non-parametric facts vs. parametric behavior), so a production system can fine-tune a model for style or task-specific behavior and still retrieve documents for it to answer from.
</details>

## Key terms

* **Long-context:** supplying potentially relevant information directly in the prompt rather than searching for it, limited by the context window and its per-request cost.
* **Adaptation strategy:** the general choice of mechanism (retrieval, fine-tuning, long-context, or some combination) used to close a gap between a model's default behavior and what a task needs.
* **Freshness:** how quickly a change in the real world can be reflected in a system's answers.

## Related

[[Parametric vs. Non-Parametric Knowledge]] · [[Choosing a Model for a Task]] · [[Anatomy of a RAG Pipeline]]
