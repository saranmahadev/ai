Ask a model for a multi-step answer directly, and it has to get everything right in one uninterrupted guess. Ask it to show its work first, and something changes in how reliable the final answer turns out to be — not because the model got smarter, but because the problem got restructured.

**You need:** [[Prompting and In-Context Learning]].

## The question it answers

"Why does asking a model to show intermediate steps improve its accuracy on multi-step problems?" **Chain-of-thought (CoT) prompting** asks a model to work through a problem step by step rather than jumping straight to a final answer. The key reason this helps: a single, direct guess at a multi-step problem has to be right about the *entire* problem at once, while a chain of smaller steps only needs each individual step to be reliable — and a chain of individually-reliable steps can have a much higher chance of ending up entirely correct than one combined guess does.

## Intuition

Asked to compute a three-step arithmetic problem entirely in your head and blurt out only the final number, you're betting everything on one combined mental operation going right. Asked instead to write out each step — compute this, then that, then combine them — each individual step is far easier to get right than the whole combined operation done silently, even though the chain has to get every step right in sequence to end up correct too. The surprising part is that breaking a hard, error-prone single guess into several easier, individually-more-reliable steps can come out ahead, even though success now requires every step in the chain to succeed.

## Definition and notation

```text
direct: one guess at the whole problem, correct with probability p_direct

chain-of-thought: n steps, each independently correct with probability
  p_step; the whole chain is correct only if every step is
  P(chain correct) = p_step^n
```

## A worked example

A toy multi-step problem where a single direct guess succeeds 55% of the time, compared to breaking it into 3 steps each individually 92% reliable:

```text
direct guess:        accuracy 55.7%
chain-of-thought:     accuracy 79.1%   (≈ 0.92³ = 77.9%, matching within simulation noise)
```

Even though the chain-of-thought path requires *three* separate steps to all go right — a seemingly harder bar to clear than one guess — its higher per-step reliability (92% versus the direct guess's 55.7%) more than compensates, landing at a meaningfully higher overall accuracy.

## Bench

```bench
id: cot-vs-direct
title: One guess vs. a chain of smaller, surer ones
fallback: Adjust how reliable each individual reasoning step is and watch chain-of-thought accuracy compare against one direct guess.
```

**Try this**

1. Lower per-step reliability toward 0.55 (matching the direct guess) and see the two converge.
2. Raise it back up and watch chain-of-thought pull ahead again.
3. Consider at what per-step reliability chain-of-thought would start doing *worse* than direct guessing.

**What you should notice:** chain-of-thought isn't automatically better — it only wins when each step is meaningfully more reliable than one combined guess would be; below some per-step reliability, a longer chain of weak steps can actually do worse.

## Where it appears in AI

* **Chain-of-thought prompting was one of the first major discoveries that a model's capability could be substantially unlocked purely by changing the prompt**, with no retraining at all — simply asking for intermediate steps.
* **[[Process Reward vs. Outcome Reward|evaluating the quality of the intermediate steps themselves]], not just the final answer, is a natural extension** once a model is already producing a visible chain of reasoning.
* **[[Test-Time Compute Scaling|reasoning models that "think" for much longer before answering]] are, in a real sense, chain-of-thought taken to its logical extreme** — far more, and often much more carefully structured, intermediate reasoning before any final answer is committed to.

## Common pitfalls

* **Assuming longer chains are always better.** As the worked example's formula shows, a chain's overall accuracy depends on both the number of steps *and* each step's reliability — more unreliable steps multiply the chance of failure.
* **Confusing a visible chain of reasoning with the model's actual internal computation.** The displayed steps are themselves generated text, not necessarily a transparent window into whatever computation actually produced the final answer.
* **Treating chain-of-thought as free.** Generating intermediate steps costs more tokens (and compute, and often money) than a direct answer — the accuracy gain has a real resource cost attached.

## Quick check

<details><summary>1. Why can breaking a problem into steps improve accuracy, even though every step must now succeed?</summary>
Because each individual step can be made far more reliable than one combined guess at the whole problem — a chain of highly reliable steps can have a higher overall success probability than one unreliable direct guess, even though the chain technically requires more individual successes.
</details>

<details><summary>2. In the worked example, roughly how did chain-of-thought's accuracy compare to a direct guess?</summary>
Chain-of-thought reached about 79% accuracy versus the direct guess's 56%, because its per-step reliability of 92%, cubed across three steps, still outperformed the direct guess's single 55% chance.
</details>

<details><summary>3. Under what condition would chain-of-thought actually perform worse than a direct guess?</summary>
If the per-step reliability were low enough that raising it to the power of the number of steps produced a lower overall probability than the direct guess's own accuracy — a chain of too many unreliable steps can underperform one direct guess.
</details>

## Key terms

* **Chain-of-thought (CoT):** prompting a model to produce intermediate reasoning steps before a final answer.
* **Per-step reliability:** the probability that one individual reasoning step is correct.
* **Compounding reliability:** the overall chance of a multi-step chain succeeding, found by multiplying each step's success probability.

## Related

[[Prompting and In-Context Learning]] · [[Process Reward vs. Outcome Reward]] · [[Test-Time Compute Scaling]]
