Every method so far in this section needs human preference judgments — and those are slow and expensive to collect at the scale alignment training wants. Constitutional AI replaces the human judge with an AI judge instructed to follow a written set of principles.

**You need:** [[Direct Preference Optimization (DPO)]].

## The question it answers

"Can an AI's own judgment substitute for human preference labels?" **Constitutional AI** gives a model a written **constitution** — a set of principles like "prefer the response that is more helpful and less harmful" — and has the model (or a separate judge model) use those principles to rank or critique responses instead of a human doing it. **RLAIF** (reinforcement learning from AI feedback) then feeds those AI-generated preferences into the same RLHF or DPO machinery already covered, substituting AI judgments for human ones in the training pipeline, not changing the training method itself.

## Intuition

A company that writes down its hiring principles explicitly — what counts as a strong candidate, what counts as a red flag — can train more interviewers to make consistent decisions, faster than if every single hiring decision needed personal sign-off from the one person who best embodies the company's judgment. Constitutional AI does something similar: writing the judging principle down explicitly lets an AI apply it at a scale no team of human raters could match, trading away whatever human nuance wasn't captured in the written principle for sheer throughput.

## Definition and notation

```text
constitution: a written principle, e.g.
  "prefer the response that is more helpful and less harmful"

AI judge score(response) = a function derived from the constitution
  (here, a toy weighted combination: helpfulness − weight × harmfulness)

RLAIF: feed the AI judge's rankings into the SAME RLHF/DPO pipeline
  that would otherwise consume human preference rankings
```

## A worked example

Three candidate responses, scored by an AI judge applying the written principle with different weights on harmfulness, compared against a fixed "true" human preference ranking:

```text
responses:
  "Detailed, safe, helpful answer"     helpful 0.90  harmful 0.05
  "Vague, unhelpful, safe answer"      helpful 0.30  harmful 0.05
  "Detailed but harmful answer"        helpful 0.80  harmful 0.70

human ranking (true weighting, harm weight 2.2):
  Detailed, safe, helpful  >  Vague, unhelpful, safe  >  Detailed but harmful

AI judge, harm weight 0.5:  ranking does NOT match human ranking
  (the harmful response's high helpfulness outweighs its harm too easily)
AI judge, harm weight 1.0 or higher:  ranking matches human ranking exactly
```

With too low a harm weight baked into the written principle, the AI judge's ranking diverges from the human one — it under-penalizes the harmful-but-detailed response. Once the weight crosses roughly 1.0 in this toy setup, the AI judge's ranking matches the human ranking exactly, for every weight tested above that point.

## Bench

```bench
id: constitutional-judge
title: Scoring by a written principle
fallback: Adjust how heavily an AI judge's written principle weighs harmfulness, and see whether its ranking matches a human preference ranking.
```

**Try this**

1. Set the harm weight low and check whether the AI judge's ranking matches the human one.
2. Raise the weight and find where the rankings start to agree.
3. Consider what it would take to write a principle that matches human judgment across *every* possible response, not just these three.

**What you should notice:** the AI judge's ranking is entirely determined by how the written principle was phrased (specifically, how it weighs the trade-off between helpfulness and harm) — getting that weighting wrong produces a judge that confidently disagrees with human preference.

## Where it appears in AI

* **Anthropic's Constitutional AI work introduced this approach specifically to reduce reliance on large volumes of human-labeled harmful content**, which is both expensive and distressing to produce at scale.
* **RLAIF has been shown to work nearly as well as RLHF on various tasks**, making it an increasingly common substitute, at least for generating a large quantity of preference data to complement a smaller set of human-labeled comparisons.
* **The quality of the constitution is the whole game**: a vague, poorly weighted, or incomplete written principle produces a judge whose confident rankings can systematically diverge from what humans would actually prefer.

## Common pitfalls

* **Assuming AI feedback and human feedback are interchangeable in quality.** The worked example shows how sensitive an AI judge's output is to exactly how a principle is weighted — a poorly specified constitution produces confidently wrong rankings, not merely noisier ones.
* **Treating a constitution as a one-time, fixed artifact.** Principles that miss edge cases (as the low-weight setting did here) need revision once disagreements with intended judgment are found.
* **Forgetting RLAIF still ultimately traces back to some human judgment.** Someone had to write the constitution, and typically some human-labeled data still validates or calibrates the AI judge's outputs — it reduces, but doesn't eliminate, human involvement.

## Quick check

<details><summary>1. What does Constitutional AI replace, and what does it keep the same?</summary>
It replaces the source of preference judgments (an AI applying a written principle, instead of a human judging directly) while keeping the same downstream alignment machinery (RLHF or DPO) that consumes those judgments.
</details>

<details><summary>2. In the worked example, what determined whether the AI judge's ranking matched the human ranking?</summary>
How heavily the written principle weighted harmfulness relative to helpfulness — too low a weight let a harmful-but-detailed response rank too highly, disagreeing with the human ranking.
</details>

<details><summary>3. What's the main appeal of RLAIF over collecting human preference labels directly?</summary>
It can generate a large volume of preference data at much lower cost and without the burden (including psychological burden, for harmful content) of having humans review every comparison directly.
</details>

## Key terms

* **Constitutional AI:** aligning a model using a written set of principles applied by an AI judge, rather than direct human preference labels.
* **Constitution:** the written principles an AI judge uses to rank or critique responses.
* **RLAIF:** reinforcement learning from AI feedback — feeding AI-generated preferences into the same RLHF/DPO training pipeline.

## Related

[[Direct Preference Optimization (DPO)]] · [[Reward Modeling]] · [[Content Safety and Red-Teaming]]
