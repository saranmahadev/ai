Judging "which of these two responses is better" is a question most people can answer confidently; assigning an absolute numerical quality score to a single response, consistently, is much harder for the same person to do reliably. Reward modeling builds a scoring function from exactly the easier kind of judgment.

**You need:** [[Instruction Dataset Construction]], [[Human Evaluation of Generated Content]].

## The question it answers

"How do you turn a pile of pairwise human preferences into a single numerical quality score?" A **reward model** is trained to assign a scalar score to a response, fit so that higher-scored responses are predicted to win pairwise comparisons more often. The **Bradley-Terry model** gives this a precise form: the probability that response A beats response B in a comparison is `sigmoid(score(A) − score(B))`, and fitting scores to match a large set of observed comparisons (via gradient-based maximum likelihood) recovers a consistent, ranked scalar reward — the same underlying idea as [[Human Evaluation of Generated Content|the Elo rating system]], but trained as a differentiable model's output rather than updated incrementally match by match.

## Intuition

If you only ever watched pairs of chess games and never saw a single numerical "skill score," you could still, given enough games, work backward to a consistent ranking — someone who reliably beats people who reliably beat someone else must be better than both. Reward modeling does exactly this kind of backward inference from human comparisons: it never gets told any response's "true quality" directly, only which of two responses a person preferred, and from enough of those pairwise judgments, a consistent scalar score for every response emerges.

## Definition and notation

```text
Bradley-Terry model:
  P(A beats B) = sigmoid(score(A) − score(B))

fitting from observed comparisons (winner, loser):
  increase score(winner), decrease score(loser),
  by an amount proportional to how surprising that outcome was
  under the CURRENT scores (small if already expected, large if not)
```

## A worked example

Three responses with true (hidden) latent quality 2.0, 0.5 and −1.0, scored only from simulated pairwise comparisons — 500 of them — with no access to the true values at all:

```text
true quality:     A = 2.0    B = 0.5    C = -1.0
learned scores:   A = 1.489  B = 0.210  C = -1.698
```

The learned scores aren't identical to the true values (Bradley-Terry only recovers scores up to a scale and shift from finite data), but the **ranking** is recovered exactly: A > B > C, matching the true ordering, purely from which response won each sampled comparison.

## Bench

```bench
id: reward-model-bradley-terry
title: Learning a scalar score from "which is better"
fallback: Step through simulated pairwise comparisons and watch learned reward scores converge toward the true ranking.
```

**Try this**

1. Step through a few rounds of comparisons and watch the scores start to separate.
2. Keep stepping and check whether the ranking stabilizes at A > B > C.
3. Reset and run again — the exact scores will vary, but the ranking should recover reliably.

**What you should notice:** the reward model never sees a single absolute quality number during training — every piece of information it learns from comes in the form of "this one beat that one."

## Where it appears in AI

* **A trained reward model is the component [[Reinforcement Learning from Human Feedback (RLHF)|RLHF]] optimizes against** — it replaces a human in the loop after the (comparatively small) set of human comparisons used to train it.
* **Reward model quality is a hard ceiling on RLHF's final result**: a policy trained to maximize a reward model's score can only ever be as good, at best, as that reward model's judgments actually are.
* **[[Reward Hacking and Sycophancy|a reward model that's imperfectly calibrated]] creates a specific, serious risk** — optimizing a policy against its scores can exploit whatever the reward model gets systematically wrong.

## Common pitfalls

* **Assuming reward model scores are meaningful in absolute terms.** Like Elo ratings, Bradley-Terry scores are only meaningful relative to each other within the same comparison pool — an absolute number alone doesn't mean much.
* **Expecting a reward model trained on limited comparisons to generalize perfectly.** Its scores are only as reliable as the comparisons it was trained on are representative of the full range of responses it will later be asked to score.
* **Forgetting the reward model is itself a trained, imperfect approximation.** It's standing in for human judgment, not a ground-truth oracle — treating its output as infallible is exactly how [[Reward Hacking and Sycophancy|reward hacking]] goes unnoticed.

## Quick check

<details><summary>1. What kind of information does a reward model learn from, under the Bradley-Terry model?</summary>
Pairwise comparisons — which of two responses a human preferred — rather than any absolute quality score assigned directly to a single response.
</details>

<details><summary>2. In the worked example, was the learned ranking correct even though the learned scores didn't exactly match the true values?</summary>
Yes — the relative ordering (A > B > C) was recovered exactly, even though the specific numerical scores differed from the true latent values, which is expected since Bradley-Terry scores are only identifiable up to a shift and scale from finite data.
</details>

<details><summary>3. Why is reward model quality described as a "ceiling" on RLHF's final result?</summary>
Because RLHF optimizes a policy to maximize the reward model's score — if the reward model itself is a poor approximation of true human preference, optimizing against it can never produce a policy better than what that imperfect approximation rewards.
</details>

## Key terms

* **Reward model:** a trained model that assigns a scalar quality score to a response.
* **Bradley-Terry model:** a model of pairwise comparison outcomes as a function of two latent scalar scores.
* **Pairwise preference:** a judgment that one response is better than another, without an absolute quality value.

## Related

[[Human Evaluation of Generated Content]] · [[Reinforcement Learning from Human Feedback (RLHF)]] · [[Reward Hacking and Sycophancy]]
