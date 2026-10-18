RLHF's reward model, policy-gradient loop, and stability tricks are a lot of moving parts for a relatively simple goal: make preferred responses more likely than dispreferred ones. DPO gets there with a single loss function, no separate reward model, and no reinforcement learning at all.

**You need:** [[Reinforcement Learning from Human Feedback (RLHF)]].

## The question it answers

"Can you get RLHF's effect without RLHF's machinery?" Yes — **Direct Preference Optimization** shows that the same preference data RLHF would use to train a reward model can instead be plugged directly into a loss on the *policy itself*. The loss compares how much more (in log-probability, relative to a frozen reference policy) the current policy prefers the preferred response over the dispreferred one, and pushes that gap wider through ordinary gradient descent — no reward model, no sampling-based policy gradient, no RL stability tricks.

## Intuition

RLHF's approach is like training a judge (the reward model) to score performances, then separately coaching the performer to chase whatever the judge scores highly — two separate systems, with all the complexity of keeping them working together. DPO skips the judge entirely: given a specific pair where one performance was preferred over another, directly adjust the performer to make the preferred one relatively more likely next time, compared to how likely it already was under their original style (the reference policy) — one system, one direct adjustment, no separate scoring step at all.

## Definition and notation

```text
for a (preferred, dispreferred) pair, under policy π and frozen reference π_ref:
  z = β · [ log(π(preferred)/π_ref(preferred)) − log(π(dispreferred)/π_ref(dispreferred)) ]

  loss = −log(sigmoid(z))

  minimizing this loss directly increases π(preferred) relative to
  π_ref(preferred), and decreases π(dispreferred) relative to π_ref(dispreferred)
```

## A worked example

Starting a policy exactly equal to its reference, with one preferred response (B) and one dispreferred response (D) in a 4-option set, taking repeated gradient steps on the DPO loss:

```text
step 0:  P(preferred)=0.310  P(dispreferred)=0.253  loss=0.6931   (ln 2 — no separation yet)
step 1:  P(preferred)=0.354  P(dispreferred)=0.215  loss=0.5544
step 3:  P(preferred)=0.428  P(dispreferred)=0.162  loss=0.3792
step 5:  P(preferred)=0.484  P(dispreferred)=0.128  loss=0.2801
```

At step 0, with the policy identical to the reference, the loss starts at exactly `ln 2 ≈ 0.693` — the loss when the two log-ratios are equal, which is exactly what should happen before any training has pulled them apart. By step 5, the preferred response's probability has grown from 0.310 to 0.484 while the dispreferred one's has shrunk from 0.253 to 0.128 — the same qualitative separation RLHF produces, achieved by gradient descent on one direct loss.

## Bench

```bench
id: dpo-preference-step
title: No reward model, no RL loop
fallback: Step through DPO gradient updates and watch the preferred response's probability rise while the dispreferred one's falls.
```

**Try this**

1. Note the starting loss value and why it equals ln 2.
2. Step through updates and track both probabilities moving apart.
3. Compare this separation to RLHF's policy-gradient result on a similar setup.

**What you should notice:** there's no reward model anywhere in this computation — only the policy's own probabilities, the frozen reference's probabilities, and the preference pair itself.

## Where it appears in AI

* **DPO (Rafailov et al., 2023) has become a popular alternative to full RLHF** for exactly this reason: it needs one fewer trained model and a much simpler, more stable training loop, while targeting the same underlying objective.
* **The frozen reference policy plays a crucial role**: it anchors the loss so the update can't simply inflate every response's probability uniformly — only changes *relative* to the reference are rewarded.
* **DPO and RLHF are both downstream of [[Reward Modeling|the same underlying idea]] — a Bradley-Terry-style model of preference** — DPO just substitutes the policy's own log-probability ratio for what would otherwise be a separately learned reward model's score.

## Common pitfalls

* **Assuming DPO has no notion of "reward" at all.** It implicitly defines an equivalent reward via the policy's log-probability ratio to the reference — it just never materializes that reward as a separate trained model.
* **Forgetting the reference policy must stay frozen.** If the reference moved along with the policy, the log-ratio term would lose its anchor, and the loss would no longer have the same meaning.
* **Expecting DPO to need no preference data at all.** It still requires exactly the same (preferred, dispreferred) comparison pairs RLHF's reward model would be trained on — the data requirement doesn't go away, only the separate reward-model-training step does.

## Quick check

<details><summary>1. What does DPO optimize directly, that RLHF instead optimizes indirectly through a reward model?</summary>
The policy's own log-probability ratio (relative to a frozen reference) between a preferred and dispreferred response — DPO adjusts this ratio directly via gradient descent, with no separate reward model in between.
</details>

<details><summary>2. In the worked example, why did the loss start at exactly ln 2 (≈0.693)?</summary>
Because the policy started identical to the reference, making the two log-ratio terms equal and so z = 0 — and −log(sigmoid(0)) = −log(0.5) = ln 2.
</details>

<details><summary>3. What role does the frozen reference policy play in the DPO loss?</summary>
It anchors the comparison, so the loss only rewards genuine relative shifts in preference — without it, the policy could trivially inflate every response's probability without actually separating preferred from dispreferred.
</details>

## Key terms

* **Direct Preference Optimization (DPO):** a method for aligning a policy directly from preference pairs, without a separate reward model or RL loop.
* **Reference policy:** a frozen copy of the policy (typically right after SFT) that anchors the DPO loss's comparison.
* **Log-probability ratio:** the policy's log-probability for a response divided by the reference's, used as DPO's implicit reward signal.

## Related

[[Reinforcement Learning from Human Feedback (RLHF)]] · [[Reward Modeling]] · [[Constitutional AI and RLAIF]]
