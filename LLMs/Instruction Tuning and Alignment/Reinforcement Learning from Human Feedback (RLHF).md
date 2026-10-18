A reward model can score any response — but scoring responses isn't the same as producing better ones. RLHF closes that loop: it uses the reward model's scores as a training signal to actually push the policy (the language model being aligned) toward generating higher-scoring responses.

**You need:** [[Reward Modeling]].

## The question it answers

"How do you use a reward model's scores to actually change a language model's behavior?" **RLHF** treats the language model as a policy in a reinforcement learning setup: generate candidate responses, score them with the reward model, and update the policy's parameters to make higher-reward responses more likely and lower-reward ones less likely. The simplest version of this update — **REINFORCE**, a basic policy-gradient method — nudges each candidate's probability in proportion to how much its reward exceeds the *average* reward across candidates (the baseline), so above-average candidates get boosted and below-average ones get suppressed.

## Intuition

Picture rolling several differently-weighted dice, where each face represents a possible response, and getting paid according to how good the response turns out to be. After a round, a policy-gradient update is like filing down the faces that paid worst and building up the faces that paid best — not based on some external rule about which face is which, but purely based on how much better or worse each face did compared to the average payoff that round. Repeat that enough rounds, and the dice drift toward favoring whichever faces keep paying well.

## Definition and notation

```text
policy π gives a probability to each candidate response (via softmax over logits)
baseline = expected reward under the current policy = Σᵢ π(i) · R(i)

REINFORCE gradient step, for each candidate i:
  logit(i) += learning_rate × π(i) × (R(i) − baseline)

→ candidates with reward above the baseline get a positive push;
  candidates below it get a negative push
```

## A worked example

Four candidate responses with fixed rewards `[0.2, 0.9, 0.4, 0.1]` from a reward model, starting from a uniform policy and taking repeated REINFORCE steps:

```text
step 0: probabilities  0.250, 0.250, 0.250, 0.250   (uniform)
step 1: probabilities  0.244, 0.266, 0.250, 0.241
step 3: probabilities  0.230, 0.302, 0.247, 0.222
step 5: probabilities  0.214, 0.342, 0.241, 0.203
```

Candidate B (reward 0.9, the highest) steadily gains probability mass — from 0.250 up to 0.342 after just 5 steps — while every other candidate loses some, in proportion to how far below the average reward they sit. Nothing was told "B is correct"; the policy simply drifted toward whichever candidate the reward model consistently scored highest.

## Bench

```bench
id: rlhf-policy-gradient
title: Pulling probability toward what the reward model likes
fallback: Step through policy-gradient updates and watch probability mass shift toward the highest-reward candidate.
```

**Try this**

1. Step through several updates and track probability for the highest-reward candidate.
2. Compare how quickly the lowest-reward candidate's probability falls.
3. Consider what would happen if two candidates had identical, high rewards.

**What you should notice:** the shift is gradual and proportional — one update doesn't jump straight to favoring the best candidate exclusively; many small, reward-proportional nudges accumulate into the final shift.

## Where it appears in AI

* **RLHF (using PPO, a more stable policy-gradient variant than plain REINFORCE) was the method behind the first widely-deployed instruction-following LLMs**, applied after SFT to sharpen a model's behavior using a trained reward model.
* **RLHF training is notoriously more complex and less stable to run than SFT alone**, requiring careful tuning of the reward model, the policy update, and typically a KL-divergence penalty keeping the policy from drifting too far from its SFT starting point.
* **[[Direct Preference Optimization (DPO)|DPO]] was developed specifically to get a similar effect without RLHF's reinforcement-learning machinery** — no separate reward model, no policy-gradient loop, just a direct loss on preference pairs.

## Common pitfalls

* **Assuming RLHF directly optimizes for "truth" or "goodness."** It optimizes for whatever the reward model scores highly — see [[Reward Hacking and Sycophancy]] for what happens when that diverges from true quality.
* **Forgetting the baseline matters.** Without subtracting the expected reward, every candidate's probability would simply increase, with no meaningful comparison between them — the baseline is what makes the update push *relatively* better candidates up and relatively worse ones down.
* **Expecting one policy-gradient update to produce a large behavior change.** As the worked example shows, each update is a small, proportional nudge; meaningful shifts require many accumulated steps.

## Quick check

<details><summary>1. What does a REINFORCE-style policy-gradient update push a candidate's probability toward, and based on what signal?</summary>
It pushes probability up for candidates whose reward is above the current expected reward (the baseline), and down for candidates below it — the signal is purely the reward model's score relative to that baseline.
</details>

<details><summary>2. In the worked example, why did candidate B's probability rise fastest?</summary>
Its reward (0.9) was the highest among the four candidates, giving it the largest positive gap above the baseline at every step, and so the largest positive push.
</details>

<details><summary>3. What's a key practical difference between RLHF and DPO?</summary>
RLHF requires a separately trained reward model and a reinforcement-learning policy-gradient loop; DPO optimizes the policy directly from preference pairs, with no separate reward model and no RL loop at all.
</details>

## Key terms

* **RLHF:** using a reward model's scores to update a language model's behavior via reinforcement learning.
* **Policy gradient:** an update rule that shifts a policy's probabilities in proportion to how much a candidate's reward exceeds a baseline.
* **Baseline:** the expected reward under the current policy, subtracted so updates reflect relative, not absolute, reward.

## Related

[[Reward Modeling]] · [[Direct Preference Optimization (DPO)]] · [[Reward Hacking and Sycophancy]]
