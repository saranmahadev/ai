A model pretrained on a broad, general corpus is a generalist — reasonably competent everywhere, expert nowhere in particular. Rather than training a new model from scratch for a specialized domain, it's usually far cheaper to keep training an existing one on domain-specific text.

**You need:** [[Causal Language Modeling as a Pretraining Objective]], [[Perplexity as a Generation Metric]].

## The question it answers

"How do you specialize an already-pretrained model for a particular domain, without starting over?" **Continued pretraining** simply keeps running the same causal language modeling objective, but on a new, narrower corpus (medical text, legal text, a specific codebase) instead of general web text. The model's existing general knowledge and language ability carry over as a starting point; additional training on domain text sharpens its predictions specifically within that domain, measurable directly as a drop in [[Perplexity as a Generation Metric|perplexity]] on held-out domain text.

## Intuition

A generalist doctor who then spends a year specifically immersed in cardiology doesn't forget how to practice general medicine — they build sharper, more specific pattern recognition on top of everything they already knew. Continued pretraining does the same thing to a model: it doesn't discard the general competence pretraining built, it adds a further, more specialized pass focused on one domain's particular vocabulary, style, and patterns.

## Definition and notation

```text
continued pretraining: take a pretrained model's weights as the
  starting point; keep training with the same objective (causal LM),
  but on domain-specific text instead of the original general corpus

perplexity before vs. after measures the adaptation's effect directly:
  lower perplexity on domain text = better domain-specific prediction
```

## A worked example

A general base model and a continued-pretrained model, each scored on the same medical text by their assigned token probabilities:

```text
general base model:              probabilities [0.30, 0.25, 0.20, 0.35, 0.28]  →  perplexity 3.686
continued-pretrained on domain:  probabilities [0.75, 0.80, 0.70, 0.85, 0.78]  →  perplexity 1.291
```

The continued-pretrained model's perplexity on this medical text is less than half the general model's — it assigns far higher probability to the tokens that actually appear in domain text, a direct, measurable sign that the additional training pass sharpened its predictions specifically within that domain.

## Bench

```bench
id: continued-pretrain-perplexity
title: Perplexity on domain text, before and after
fallback: Compare a general model's perplexity on domain-specific text against a continued-pretrained model's.
```

**Try this**

1. Look at the general model's perplexity on the domain text.
2. Switch to the continued-pretrained model and compare.
3. Consider what this same comparison would look like on *general* (non-domain) text instead.

**What you should notice:** the improvement is specific to the domain the continued pretraining targeted — nothing here demonstrates the adapted model got better at *everything*, only at predicting text like what it was further trained on.

## Where it appears in AI

* **Continued pretraining is standard practice for building domain-specialized models** (legal, medical, financial, code-focused variants of a general base model) without the enormous cost of training from scratch.
* **It's a different lever from [[Fine-Tuning for a Specific Task|task-specific fine-tuning]]**: continued pretraining keeps the same general objective (predict the next token) on different data, while fine-tuning typically changes what's being optimized for a specific downstream behavior.
* **[[Catastrophic Forgetting in Fine-Tuning|too much continued pretraining on a narrow domain]] can erode general capability**, the same trade-off that shows up in task-specific fine-tuning — specializing too hard risks losing some of the breadth the original pretraining built.

## Common pitfalls

* **Assuming continued pretraining is the same thing as fine-tuning.** Continued pretraining keeps the original objective (next-token prediction) on new data; it's a separate step from (and often precedes) task-specific fine-tuning.
* **Expecting improvement to transfer to unrelated domains.** The worked example's perplexity drop is specific to the medical text the model was continued-pretrained on — it says nothing about performance elsewhere.
* **Ignoring the forgetting risk.** Pushing continued pretraining too far on a narrow domain, with too little of the original broad data mixed back in, risks degrading the model's general capabilities.

## Quick check

<details><summary>1. What does continued pretraining change about a model's training, compared to its original pretraining?</summary>
Only the data — it uses the same causal language modeling objective, but continues training on a narrower, domain-specific corpus instead of the original general one.
</details>

<details><summary>2. In the worked example, by roughly what factor did perplexity improve after continued pretraining?</summary>
It dropped from about 3.686 to about 1.291 — less than half its original value — reflecting much higher assigned probability to the domain text's actual tokens.
</details>

<details><summary>3. What's a real risk of continued pretraining too aggressively on one narrow domain?</summary>
Catastrophic forgetting — eroding the model's general capabilities as training increasingly specializes on the narrow domain's data.
</details>

## Key terms

* **Continued pretraining:** further training an already-pretrained model with the same objective, on domain-specific data.
* **Domain adaptation:** specializing a general model's behavior for a particular subject area or style.
* **Perplexity gap:** the difference in perplexity on domain text before and after adaptation, used to measure its effect.

## Related

[[Causal Language Modeling as a Pretraining Objective]] · [[Perplexity as a Generation Metric]] · [[Fine-Tuning for a Specific Task]]
