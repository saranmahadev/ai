[[Self-Consistency and Best-of-N Sampling|best-of-N sampling]] picks the best of several candidates at *answer time*. Rejection sampling fine-tuning takes the same idea and moves it earlier — into building the training set itself.

**You need:** [[Reward Modeling]], [[Self-Consistency and Best-of-N Sampling]].

## The question it answers

"Can you improve a model without a full RLHF or DPO training loop?" **Rejection sampling fine-tuning** (sometimes called RAFT) samples N candidate responses per prompt from the current model, scores every one with a reward model, keeps only the single best-scoring candidate per prompt, and runs ordinary [[Supervised Fine-Tuning (SFT)|supervised fine-tuning]] on that curated set of "winners." No policy gradient, no preference-pair loss — just SFT, but on a dataset that's been pre-filtered to contain disproportionately good examples.

## Intuition

Instead of trying to directly teach someone to write better by critiquing every draft (RLHF's approach) or showing them exactly which of two drafts was better (DPO's approach), you could simply have them write ten different drafts, pick the best one by whatever judgment you trust, and have them study and imitate *that* draft specifically. Do this across many prompts, and the resulting "imitate your own best work" training set is measurably better than what the model would produce from a single, unfiltered attempt — purely because filtering removed the weaker attempts before training ever saw them.

## Definition and notation

```text
for each prompt:
  sample N candidate responses from the current model
  score all N with a reward model
  keep only the single highest-scoring candidate

fine-tune (ordinary SFT) on the curated {prompt: best-of-N response} set
```

## A worked example

The expected reward of the kept response, as N grows, averaged over many simulated prompts:

```text
N =  1:  mean reward of kept sample = 0.4005
N =  2:  mean reward of kept sample = 0.5049
N =  4:  mean reward of kept sample = 0.5901
N =  8:  mean reward of kept sample = 0.6507
N = 16:  mean reward of kept sample = 0.6941
```

At N=1 there's no selection at all — the "kept" response is just whatever was sampled, with a mean reward of 0.4005. By N=16, the kept response's mean reward has risen to 0.6941, nearly 75% higher, purely from keeping only the best of 16 independent tries rather than accepting the first one. A model fine-tuned on these higher-reward examples inherits some of that improvement.

## Bench

```bench
id: best-of-n-rejection
title: Keeping only the best of N samples
fallback: Adjust how many samples are drawn per prompt before keeping only the best one, and watch the kept sample's mean reward improve.
```

**Try this**

1. Compare N=1 (no selection) against N=2.
2. Keep raising N and track how much more the mean reward improves.
3. Notice the improvement's rate slowing as N grows further.

**What you should notice:** this is exactly the same underlying effect as [[Self-Consistency and Best-of-N Sampling|best-of-N sampling at generation time]] — the difference here is that the selected "winners" become training data, rather than being the final answer shown to a user.

## Where it appears in AI

* **Rejection sampling fine-tuning is a popular, comparatively simple alignment step** — it reuses ordinary SFT machinery, with all the alignment improvement coming from how the training data was curated rather than from a new training algorithm.
* **It composes naturally with [[Reinforcement Learning from Human Feedback (RLHF)|RLHF]] or [[Direct Preference Optimization (DPO)|DPO]]**, often as an earlier, cheaper stage before (or instead of) a full preference-optimization pass.
* **Its effectiveness is capped by the reward model's quality**, exactly the same dependency [[Reinforcement Learning from Human Feedback (RLHF)|RLHF]] has — selecting the reward model's favorite candidate is only useful if the reward model's favorites are actually good.

## Common pitfalls

* **Assuming larger N always keeps improving training data proportionally.** The worked example's own curve shows diminishing returns — going from N=8 to N=16 gains far less than going from N=1 to N=2 did.
* **Forgetting this still needs a reward model.** The selection step is only as good as whatever scores the N candidates — a poor reward model means "best of N" selects something that only looks good by a flawed metric.
* **Treating this as equivalent to RLHF or DPO.** It's a simpler, cheaper technique that captures part of the same benefit (training toward higher-reward behavior) without a policy-gradient or preference-pair loss — it's not a drop-in replacement for either.

## Quick check

<details><summary>1. What does rejection sampling fine-tuning actually train on?</summary>
Ordinary supervised fine-tuning, but on a dataset curated by sampling N candidates per prompt and keeping only the single highest-reward-model-scored one.
</details>

<details><summary>2. In the worked example, roughly how much did the kept sample's mean reward improve from N=1 to N=16?</summary>
From about 0.4005 to about 0.6941 — nearly a 75% increase, purely from selecting the best of more independent samples.
</details>

<details><summary>3. What's the key difference between rejection sampling fine-tuning and RLHF?</summary>
Rejection sampling fine-tuning uses ordinary SFT on a reward-model-filtered dataset, with no policy gradient or RL loop; RLHF directly optimizes the policy against the reward model's scores using reinforcement learning.
</details>

## Key terms

* **Rejection sampling fine-tuning (RAFT):** fine-tuning on a dataset built by keeping only the best-of-N reward-model-scored samples per prompt.
* **Curated training set:** a dataset filtered to disproportionately contain high-quality examples, rather than a raw, unfiltered sample.
* **Best-of-N selection:** sampling several candidates and keeping only the highest-scoring one.

## Related

[[Reward Modeling]] · [[Self-Consistency and Best-of-N Sampling]] · [[Supervised Fine-Tuning (SFT)]]
