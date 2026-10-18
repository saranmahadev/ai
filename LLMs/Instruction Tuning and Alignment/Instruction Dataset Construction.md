SFT can only be as good as the examples it's trained on — which raises an immediate, practical problem: writing enough high-quality (instruction, response) pairs by hand, across every kind of request a model might eventually see, doesn't scale well at all.

**You need:** [[Supervised Fine-Tuning (SFT)]].

## The question it answers

"Where do the thousands (or millions) of instruction examples SFT needs actually come from?" A small, carefully human-written **seed set** of instructions can be expanded dramatically through **template expansion** or **self-instruct**-style bootstrapping: systematically varying the phrasing, framing, or format of each seed instruction to generate many more, related instructions — trading some diversity and originality for a much larger dataset than hand-writing alone could produce in reasonable time.

## Intuition

A teacher writing one good exam question can turn it into a dozen variants just by changing the phrasing, the numbers, or the exact framing — "explain X," "explain X to a beginner," "explain X briefly," "explain X with an example" — without writing a dozen genuinely new questions from scratch. Instruction dataset construction leans on exactly this kind of multiplication: a handful of carefully chosen seed instructions, expanded systematically, produces far more training examples than the seed set alone, while still tracing back to a comparatively small amount of original human effort.

## Definition and notation

```text
seed instructions: a small, carefully written starting set
expansion templates: patterns that wrap or rephrase a seed instruction

expanded dataset = {template(seed) : seed ∈ seeds, template ∈ templates}
  size = |seeds| × |templates|
```

## A worked example

Three seed instructions, expanded through a growing number of phrasing templates:

```text
seeds (3):  "Summarize this article", "Translate this sentence", "Explain this concept"

1 template applied:   3 × 1 = 3   instructions
2 templates applied:   3 × 2 = 6   instructions
3 templates applied:   3 × 3 = 9   instructions
4 templates applied:   3 × 4 = 12  instructions
```

Three seed instructions, run through four phrasing templates, become twelve distinct training instructions — a 4× expansion with no additional instructions hand-written. Scaled up to hundreds of seeds and dozens of templates (or a model generating the variations instead of fixed templates, as in self-instruct), this same multiplication is how real instruction datasets reach the scale SFT needs.

## Bench

```bench
id: instruction-expansion
title: A handful of seeds, many more instructions
fallback: Adjust how many phrasing templates are applied to a small seed set and watch the expanded instruction count grow.
```

**Try this**

1. Start with just one template applied and look at the resulting instructions.
2. Add more templates and watch the count grow.
3. Compare the phrasing of the expanded instructions against the original seeds.

**What you should notice:** every expanded instruction still clearly traces back to one of the three original seeds — expansion multiplies coverage of *phrasing and framing*, not genuinely new underlying tasks.

## Where it appears in AI

* **Self-instruct and similar bootstrapping methods go further than fixed templates**, using a model itself to generate new instructions from a seed set, then filtering the results for quality and diversity before adding them to the training set.
* **Expansion trades some diversity for scale**: a dataset built this way can end up with many superficially different instructions that are, underneath, close variations on a smaller number of genuinely distinct tasks.
* **This is a close relative of [[Synthetic Data for Pretraining|synthetic data for pretraining]]**, but applied specifically to instruction-following examples rather than general training text — and at a much smaller scale, where the risks of recursive collapse are less central than the risk of low task diversity.

## Common pitfalls

* **Mistaking a large expanded dataset for a diverse one.** The worked example's twelve instructions are still fundamentally three underlying tasks with varied phrasing — true task diversity requires varied *seeds*, not just more templates applied to few of them.
* **Over-relying on templates that introduce systematic patterns.** If every expanded instruction from a given template shares an artifact (a particular phrase, a particular structure), a model can learn to key off that artifact rather than the underlying instruction.
* **Skipping quality filtering on model-generated expansions.** Self-instruct-style bootstrapping can produce low-quality or nonsensical instructions alongside good ones — unfiltered inclusion degrades the dataset.

## Quick check

<details><summary>1. What's the basic idea behind expanding a small seed set into a larger instruction dataset?</summary>
Systematically varying the phrasing or framing of each seed instruction — through fixed templates or model-generated paraphrases — to multiply a small amount of original writing into many more training examples.
</details>

<details><summary>2. In the worked example, how many instructions resulted from 3 seeds and 4 templates?</summary>
12 — each of the 3 seeds combined with each of the 4 templates, giving 3 × 4 = 12 distinct instructions.
</details>

<details><summary>3. Why can a large expanded dataset still lack real diversity?</summary>
Because expansion multiplies phrasing variations of a fixed, often small, set of underlying tasks — more expanded instructions doesn't mean more genuinely distinct tasks unless the seed set itself is varied.
</details>

## Key terms

* **Seed instructions:** a small, carefully written starting set of instructions.
* **Template expansion:** generating more instructions by applying varied phrasings or framings to each seed.
* **Self-instruct:** using a model to generate new instructions from a seed set, rather than fixed templates.

## Related

[[Supervised Fine-Tuning (SFT)]] · [[Synthetic Data for Pretraining]] · [[Reward Modeling]]
