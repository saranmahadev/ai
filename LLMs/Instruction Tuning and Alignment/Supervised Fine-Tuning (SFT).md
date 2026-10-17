A pretrained model is extremely good at continuing text in whatever style it appears in — but "the internet" doesn't naturally produce the specific pattern of a helpful assistant replying to a user's question. Supervised fine-tuning is the first, most direct step toward making that pattern the model's default.

**You need:** [[Causal Language Modeling as a Pretraining Objective]], [[Compute-Optimal Scaling (Chinchilla)]].

## The question it answers

"How do you turn a raw next-token predictor into something that responds like an assistant?" **Supervised fine-tuning (SFT)** continues training a pretrained model with the exact same causal language modeling objective from [[Causal Language Modeling as a Pretraining Objective]] — but now on a curated dataset of (instruction, ideal response) pairs, so the model is directly shown many examples of exactly the behavior it should produce. Nothing about the training mechanism changes; only the data does.

## Intuition

A pretrained model has read an enormous amount of text in every conceivable style — stories, forum posts, code, arguments — with no particular reason to default to "helpful assistant" as its voice. Showing it thousands of examples that specifically look like "a user asks something, an assistant replies helpfully" is like handing an actor a script and having them read it aloud repeatedly: they already knew how to speak, but repetition on this *specific* script makes that particular voice and structure the one that comes out by default.

## Definition and notation

```text
SFT dataset: {(instruction₁, response₁), (instruction₂, response₂), ...}

training: exactly causal language modeling (teacher forcing, cross-entropy
  loss), but computed only over the RESPONSE tokens, conditioned on the
  instruction as context
```

## A worked example

The same toy 4-token sequence scored by a base (pretrained-only) model and by a model after SFT:

```text
base model (pretrained only):   mean loss 1.9348
after SFT:                      mean loss 0.2670
```

Before SFT, the base model assigns relatively low probability to the exact tokens of this particular assistant-style response — it's plausible text, but not the response the model would have confidently produced on its own. After SFT on examples like it, the same response's tokens become far more probable under the model, reflected directly in the loss dropping by roughly 7×.

## Bench

```bench
id: sft-loss-drop
title: Learning to produce the assistant's own words
fallback: Compare a base model's loss on an assistant-style response against the same response scored by a model after SFT.
```

**Try this**

1. Look at the base model's per-position probabilities.
2. Switch to the SFT model and compare.
3. Notice which positions improved the most.

**What you should notice:** SFT doesn't change what the loss function measures or how training works — it only changes which examples the model is being trained to confidently reproduce.

## Where it appears in AI

* **SFT is the near-universal first step after pretraining** for any model meant to behave as an instruction-following assistant, almost always followed by further alignment ([[Reinforcement Learning from Human Feedback (RLHF)|RLHF]] or [[Direct Preference Optimization (DPO)|DPO]]).
* **The quality of [[Instruction Dataset Construction|the instruction dataset]] matters enormously** — SFT can only teach a model to reproduce the patterns actually present in its training examples, for better or worse.
* **SFT alone, without further alignment, tends to produce a model that's responsive but not especially good at handling genuinely ambiguous or adversarial requests** — it has learned to imitate good responses, not to judge what makes a response good in cases its training data didn't cover.

## Common pitfalls

* **Assuming SFT is a fundamentally different training algorithm from pretraining.** It's literally the same causal language modeling loss — only the data distribution (curated instruction-response pairs instead of general web text) changes.
* **Treating SFT as the final alignment step.** It's typically just the foundation that [[Reinforcement Learning from Human Feedback (RLHF)|RLHF]] or [[Direct Preference Optimization (DPO)|DPO]] build further training on top of.
* **Expecting SFT to teach judgment, not just imitation.** A model trained purely by imitating examples has no direct signal about *why* those examples were good — only reinforcement from preferences (RLHF/DPO) adds that.

## Quick check

<details><summary>1. What's different about SFT's training objective compared to ordinary pretraining?</summary>
Nothing about the objective itself — SFT uses the exact same causal language modeling loss; only the training data changes, to curated instruction-response pairs instead of general text.
</details>

<details><summary>2. In the worked example, what caused the loss to drop so sharply after SFT?</summary>
The model's assigned probability to the exact tokens of the assistant-style response rose substantially at every position, because the model had been directly trained on examples of that pattern.
</details>

<details><summary>3. Why is SFT alone usually not considered sufficient for full alignment?</summary>
SFT only teaches a model to imitate the specific examples it was shown — it provides no direct signal about which responses are actually better or worse in cases not covered by those examples, which is what preference-based methods like RLHF or DPO add.
</details>

## Key terms

* **Supervised fine-tuning (SFT):** continuing a pretrained model's training on curated instruction-response examples, using the same objective as pretraining.
* **Instruction-response pair:** one training example consisting of a user instruction and an ideal assistant response.
* **Imitation:** learning to reproduce the pattern of given examples, without an explicit signal about why they were chosen.

## Related

[[Causal Language Modeling as a Pretraining Objective]] · [[Instruction Dataset Construction]] · [[Reinforcement Learning from Human Feedback (RLHF)]]
