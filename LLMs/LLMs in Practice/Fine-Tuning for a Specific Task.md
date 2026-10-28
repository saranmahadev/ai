An aligned, general-purpose assistant is often not what a product actually needs — a narrower model trained specifically on one job's data can do that one job better, cheaper, and more predictably. Task-specific fine-tuning is how a general model becomes a specialist.

**You need:** [[Supervised Fine-Tuning (SFT)|Supervised Fine-Tuning (SFT)]], [[Direct Preference Optimization (DPO)]].

## The question it answers

"After pretraining and alignment, how does a model actually get adapted to one narrow job?" The same supervised fine-tuning mechanism covered earlier in this subject — more gradient steps, on a new, narrower dataset — is reused, but now the goal is narrowing the model's behavior to one task rather than broadening it into a general assistant. The practical question is how much of the model to update: a full fine-tune updates every parameter; a low-rank update (already derived in Generative AI as [[Parameter-Efficient Adaptation for Generation|LoRA]]) updates a tiny fraction of that, added on top of the frozen base weights.

## Intuition

Retraining a generalist doctor to become a specialist doesn't mean re-teaching them anatomy from scratch — it means a focused residency on top of everything they already know. Full fine-tuning is closer to re-schooling from scratch (expensive, every parameter moves); a low-rank update is the focused residency: a small number of new, targeted parameters layered on top of a frozen foundation.

## Definition and notation

```text
full fine-tune params  = d²         (every weight in a d×d matrix updated)
LoRA-style params      = 2·d·r      (two low-rank d×r matrices, r ≪ d)
```

This is the exact mechanism already derived in [[Parameter-Efficient Adaptation for Generation|LoRA]]; this topic is about *when* and *why* you'd reach for task-specific fine-tuning at all, not re-deriving the low-rank update itself.

## A worked example

For a hidden size d = 1024 and a low rank r = 8:

```text
full fine-tune: 1024² = 1,048,576 parameters updated
LoRA:           2 × 1024 × 8 = 16,384 parameters updated
ratio: 1,048,576 / 16,384 = 64× fewer trainable parameters with LoRA
```

Updating 64× fewer parameters means far less optimizer state, far less memory, and a far smaller file to store and ship per task — often the deciding factor when a product needs many task-specific variants of the same base model.

## Bench

```bench
id: lora-vs-full-finetune
title: How many parameters actually need to change
fallback: Slide hidden size and rank and compare full fine-tuning's parameter count against LoRA's.
```

**Try this**

1. Start at d=1024, r=8 and note the 64× gap.
2. Raise r toward d and watch the gap shrink — at r=d/2, LoRA's efficiency advantage mostly disappears.
3. Raise d (hidden size) and watch the full fine-tune bar grow quadratically while LoRA's grows only linearly.

**What you should notice:** the full fine-tune's parameter count grows with d², while LoRA's grows only with d·r — the gap between them widens as the base model gets larger, which is exactly when the memory savings matter most.

## Where it appears in AI

* **This reuses the exact low-rank mechanism derived in [[Parameter-Efficient Adaptation for Generation|LoRA]] in Generative AI** — the mechanism doesn't change for LLMs, only the motivation (task specialization rather than style or subject adaptation).
* **A fine-tuned model can be merged with others ([[Model Merging and Weight Averaging]]) or risk forgetting what it knew before fine-tuning ([[Catastrophic Forgetting in Fine-Tuning]])** — both are direct consequences of how fine-tuning updates the model's weights.
* **Choosing whether to fine-tune at all, versus prompting a general model, is part of [[Choosing a Model for a Task]].**

## Common pitfalls

* **Assuming fine-tuning for a task always means a full fine-tune.** In practice, low-rank and other parameter-efficient methods are the default for most task adaptation precisely because of the gap the worked example shows.
* **Expecting fine-tuning to add new knowledge the base model never saw.** Fine-tuning mostly reshapes *how* the model uses what it already learned during pretraining; it's a poor tool for injecting large amounts of new factual knowledge (that's closer to [[Continued Pretraining and Domain Adaptation]] or retrieval).
* **Ignoring catastrophic forgetting.** Narrowing a model to one task can measurably degrade its performance on everything else — covered next.

## Quick check

<details><summary>1. Why does the parameter-count gap between full fine-tuning and LoRA widen as the base model's hidden size grows?</summary>
Full fine-tuning's parameter count scales with d² while LoRA's scales with d·r (r fixed and small), so as d grows, the full fine-tune's cost grows quadratically while LoRA's grows only linearly.
</details>

<details><summary>2. Does task-specific fine-tuning typically teach a model large amounts of brand-new factual knowledge?</summary>
Not usually — it mostly reshapes how the model applies knowledge it already has from pretraining; injecting substantial new knowledge is better handled by continued pretraining or retrieval.
</details>

<details><summary>3. What's the main practical benefit of updating 64× fewer parameters, beyond raw training speed?</summary>
Far less optimizer state and memory during training, and a much smaller artifact to store and distribute per task — important when a product needs many task-specific fine-tunes of the same base model.
</details>

## Key terms

* **Task-specific fine-tuning:** further training a pretrained, aligned model on a narrower dataset to specialize it for one job.
* **Full fine-tune:** updating every parameter of the base model during fine-tuning.
* **Low-rank update:** adding a small number of new parameters (two low-rank matrices) on top of a frozen base model, as in LoRA.

## Related

[[Supervised Fine-Tuning (SFT)|Supervised Fine-Tuning (SFT)]] · [[Catastrophic Forgetting in Fine-Tuning]] · [[Model Merging and Weight Averaging]]
