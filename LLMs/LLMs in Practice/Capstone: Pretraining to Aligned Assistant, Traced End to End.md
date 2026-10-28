Every stage this subject has covered — pretraining, fine-tuning, preference alignment, deployment — is usually described separately, with its own numbers and its own bench. This capstone follows one model through all four stages in order, reusing the exact same functions each earlier topic already verified, so the whole pipeline's numbers connect end to end.

**You need:** [[Causal Language Modeling as a Pretraining Objective]], [[Supervised Fine-Tuning (SFT)|Supervised Fine-Tuning (SFT)]], [[Direct Preference Optimization (DPO)]], [[Cost and Latency of LLM APIs]].

## The question it answers

"What does a model actually go through, in order, between raw pretraining and being a deployed, aligned assistant that costs money to run?" Four stages, each one this subject already covered in depth: pretraining on raw text with the causal language modeling objective; supervised fine-tuning on assistant-formatted demonstrations; preference alignment (via DPO, no separate reward model needed); and deployment behind an API, where every request now has a real cost and latency.

## Intuition

A single cut of meat moves through butchering, seasoning, cooking and plating before it reaches a table — each stage transforms it further toward "a meal," and each stage has its own techniques worth understanding on their own. But watching the whole sequence happen to one piece, start to finish, makes clear how each stage's result becomes the next stage's starting point.

## Definition and notation

```text
stage 1: pretraining        — clmLoss over raw text, teacher forcing
stage 2: SFT                — same clmLoss objective, over assistant-formatted data
stage 3: DPO alignment      — dpoStep, raising P(preferred) relative to a reference model
stage 4: deployment         — apiCostLatency, pricing and timing a real request
```

## A worked example

Reusing the exact logits and parameters already verified in this subject's own topics:

```text
stage 1 (pretraining):  mean CLM loss = 1.9348
stage 2 (SFT):           mean CLM loss = 0.2670   (same objective, assistant-formatted data)
stage 3 (DPO, 5 steps):  P(preferred response) rises from 0.310 to 0.484
stage 4 (deployment):    an 80-token prompt + 120-token reply → cost $0.00204, latency 2.54s
```

The loss dropping nearly 7× from pretraining to SFT reflects the model learning to produce assistant-style responses specifically, on top of general language modeling. The DPO step then reshapes *preferences* among already-fluent responses, not fluency itself — P(preferred) rising from 0.310 to 0.484 after only 5 steps, with no reward model and no RL loop. The resulting model is then just as subject to per-request cost and latency as any other deployed API.

## Bench

```bench
id: capstone-pretrain-to-assistant
title: One model, through every stage of this subject
fallback: Step through pretraining, SFT, DPO alignment and deployment and watch each stage's own verified numbers connect.
```

**Try this**

1. Step through all four stages in order and read each stage's own number.
2. Compare how large the loss drop is from pretraining to SFT against how large the probability shift is from DPO — notice they're not measuring the same kind of quantity.
3. Reset and think about which stage, if skipped, would leave the model least usable as a deployed assistant.

**What you should notice:** each stage's number was independently verified earlier in this subject — this capstone doesn't introduce new mechanics, it chains the same four mechanisms together in the order they actually happen.

## Where it appears in AI

* **Stage 1 reuses [[Causal Language Modeling as a Pretraining Objective]] exactly**, stage 2 reuses [[Supervised Fine-Tuning (SFT)|SFT]]'s own worked example, stage 3 reuses [[Direct Preference Optimization (DPO)]]'s own worked example, and stage 4 reuses [[Cost and Latency of LLM APIs]]'s formula — nothing here is new mechanics, only the ordering.
* **Skipping stage 2 or 3 is exactly what distinguishes a base (pretrained-only) model from an instruction-tuned, aligned assistant** — the gap between them is precisely these two stages.
* **Everything downstream of stage 4 — [[Choosing a Model for a Task]], [[Guardrails and Deployment-Time Safety Filters]] — assumes a model has already been through all three earlier stages.**

## Common pitfalls

* **Treating these four stages as interchangeable or reorderable.** Each stage assumes the previous one already happened — SFT assumes a pretrained model, DPO assumes an SFT'd model that can already produce fluent, on-format responses to have preferences *between*.
* **Expecting the loss numbers from stage 1 and 2 to be directly comparable to the probability numbers from stage 3.** They measure genuinely different things (next-token prediction accuracy vs. relative preference between two full responses) — the capstone's point is the pipeline's structure, not a single unified metric.
* **Forgetting that stage 4's cost and latency apply to the final, fully-trained model** — all the training cost in stages 1 through 3 is separate, one-time, and far larger than any single deployment-time request.

## Quick check

<details><summary>1. Why does the loss number drop so much more between pretraining and SFT than between any two other adjacent stages?</summary>
Pretraining and SFT use the same loss (next-token prediction via teacher forcing), so their numbers are directly comparable, and the drop from 1.9348 to 0.2670 reflects the model learning to reliably produce exactly the assistant-formatted tokens it's now being trained on — a large, measurable jump on the same scale.
</details>

<details><summary>2. What would be missing from a model that went through stage 1 and stage 2, but skipped stage 3?</summary>
It would be instruction-following and fluent in assistant format, but it wouldn't have been shaped toward human preferences among its own possible responses — it could still produce responses a person would rate as unhelpful, unsafe or low-quality relative to alternatives it could have generated.
</details>

<details><summary>3. Does stage 4's deployment cost reflect the cost of training the model through stages 1 to 3?</summary>
No — stage 4's cost and latency are purely per-request, incurred every time the already-trained model is called; the training cost in stages 1 through 3 is a separate, one-time (or periodically repeated) cost, far larger in absolute terms.
</details>

## Key terms

* **End-to-end pipeline:** the full sequence a model goes through from raw pretraining to a deployed, usable assistant.
* **Stage-specific objective:** the particular loss or update rule that defines what a given training stage is actually optimizing for.
* **Deployment-time cost:** the per-request cost and latency incurred once a model is serving live traffic, separate from however it was trained.

## Related

[[Direct Preference Optimization (DPO)]] · [[Supervised Fine-Tuning (SFT)|Supervised Fine-Tuning (SFT)]] · [[Cost and Latency of LLM APIs]]
