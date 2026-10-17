A single sampled answer is a coin flip against the model's own uncertainty — if it's right 50% of the time per try, one sample is right about half the time, full stop. This note covers the simple fix: ask more than once, and combine the answers.

**You need:** [[Temperature and Nucleus (Top-p) Sampling]].

## The question it answers

"If one sampled answer is unreliable, can asking several times help?" **Best-of-N sampling** generates N independent candidate answers and keeps the single best one by some scoring rule. **Self-consistency** is a specific, scoring-free version of that idea for tasks with a discrete final answer: generate N candidates and take whichever answer appears most often — a majority (or plurality) vote. It works whenever the model's mistakes are more scattered across wrong answers than its correct answers are, which is a weaker requirement than "the model is always right."

## Intuition

Ask one person a trivia question and they might guess wrong. Ask the same question to a room of people who each have an *independent* shot at the right answer, and even if no individual is reliable, the most common answer in the room is usually right — their individual mistakes tend to scatter across different wrong answers, while people who know the right answer all converge on the same one. Self-consistency is running that room-of-guessers trick with one model, sampled multiple times.

## Definition and notation

```text
best-of-N: generate candidates c₁, ..., c_N independently;
           keep argmax score(cᵢ) by some scoring rule

self-consistency: generate candidates c₁, ..., c_N independently;
                   tally identical final answers;
                   keep the answer with the highest tally (majority/plurality vote)
```

## A worked example

A toy model answering a fixed question, where it samples the correct answer "4" about half the time, and splits the rest of its probability across three wrong answers:

```text
P(answer):  4 → 0.50   (correct)
            3 → 0.25
            5 → 0.15
           22 → 0.10
```

With a single sample, accuracy is exactly the probability of sampling the correct answer: about 49% over 2,000 simulated trials (matching the 0.50 probability, within simulation noise). Taking a majority vote over several independent samples does much better, because the wrong answers are split three ways while the correct answer isn't split at all:

```text
N =  1:  49.0% correct
N =  3:  72.3% correct
N =  5:  74.8% correct
N =  9:  84.1% correct
N = 15:  89.3% correct
```

Going from one sample to nine roughly cuts the error rate by two thirds (51% wrong → 16% wrong), without changing the underlying model at all — only how many times it's asked and how the answers are combined.

## Bench

```bench
id: self-consistency-vote
title: One sample vs. a vote over many
fallback: Compare the accuracy of a single sampled answer against a majority vote over several samples, at different sample counts.
```

**Try this**

1. Set N to 1 and note the accuracy is close to the model's raw per-sample correctness rate.
2. Raise N and watch accuracy climb well past that rate.
3. Compare the jump from N=1 to N=3 against the jump from N=9 to N=15 — notice the gains shrink as N grows.

**What you should notice:** accuracy keeps improving with more samples, but with diminishing returns — the biggest single jump comes from going from one sample to just a few.

## Where it appears in AI

* **Math and reasoning benchmarks routinely report "self-consistency@N" scores** alongside single-sample accuracy, since the gap can be large for exactly the reason shown here.
* **It costs N times the inference compute** of a single sample, which is the real trade-off being made — accuracy for cost, not accuracy for free.
* **[[Prompting and In-Context Learning|chain-of-thought prompting]] and self-consistency are often used together**: sample several different reasoning paths, then vote on the final answers they arrive at, rather than voting on the reasoning text itself.

## Common pitfalls

* **Expecting self-consistency to help when the model's wrong answers all agree with each other.** The method relies on correct answers being more consistent across samples than incorrect ones; if the model has one specific, confidently wrong answer it always converges on, voting won't fix it.
* **Using it on tasks without a clean final answer to tally.** Self-consistency needs a discrete answer to vote over; for open-ended generation, a scored best-of-N (not a vote) is the applicable version.
* **Forgetting the N samples must be independent.** Voting over N samples that are all small variations of the same single draw doesn't capture the same independent-error-scattering effect.

## Quick check

<details><summary>1. Why can a majority vote over several samples beat the per-sample accuracy of the model generating them?</summary>
Because the model's incorrect answers tend to scatter across several different wrong options, while its correct answers all land on the same value — so the correct answer is more likely to be the most frequent one, even if it's not the most frequent on every individual sample.
</details>

<details><summary>2. In the worked example, roughly how much did going from N=1 to N=9 reduce the error rate?</summary>
From about 51% wrong to about 16% wrong — a reduction of roughly two thirds.
</details>

<details><summary>3. What's the real cost of self-consistency or best-of-N sampling?</summary>
It requires N times the inference compute of generating a single answer, since N independent samples have to be generated and then combined.
</details>

## Key terms

* **Best-of-N sampling:** generating N candidates and keeping the one with the highest score under some rule.
* **Self-consistency:** best-of-N with a majority (or plurality) vote over final answers, used for tasks with a discrete answer.
* **Majority vote:** keeping whichever sampled answer occurs most often among the generated candidates.

## Related

[[Temperature and Nucleus (Top-p) Sampling]] · [[Prompting and In-Context Learning]] · [[Human Evaluation of Generated Content]]
