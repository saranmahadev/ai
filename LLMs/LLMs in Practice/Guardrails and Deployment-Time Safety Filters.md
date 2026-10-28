Alignment training shapes what a model tends to do on its own, but a deployed product rarely relies on that alone. A separate filter checks inputs and outputs around the model — catching what training missed, and adding a layer that can be updated without retraining the model itself.

**You need:** [[Adversarial and Jailbreak Evaluation]].

## The question it answers

"What's the difference between a model trained to be safe and a product that's actually safe to deploy?" Alignment training (RLHF, DPO, Constitutional AI, all covered earlier in this subject) changes the model's own behavior. A guardrail is a separate, external check — a classifier or rule scoring how risky a request or response looks — that runs *around* the model, blocking anything above a threshold regardless of what the model itself would have done. Looser thresholds catch more unsafe content but also block more safe content by mistake; stricter thresholds reduce false blocks but let more unsafe content through.

## Intuition

A bouncer at a venue's door is a separate check from however well-behaved the venue's own staff are trained to be — even a perfectly behaved staff benefits from someone checking IDs at the entrance. Set the bouncer's standard too loose, and some people who shouldn't get in, do; set it too strict, and legitimate guests get turned away at the door. There's no setting that avoids both kinds of mistakes entirely.

## Definition and notation

```text
false positive rate = (safe content scored above threshold) / (total safe content)
catch rate           = (unsafe content scored above threshold) / (total unsafe content)
```

Both rates move together as the threshold changes — there's no free lunch between over-blocking and under-catching.

## A worked example

Ten safe and ten unsafe example scores (0 = clearly safe, 1 = clearly unsafe), swept across three thresholds:

```text
threshold 0.4:  20% of safe content wrongly blocked,  100% of unsafe content caught
threshold 0.6:   0% of safe content wrongly blocked,   70% of unsafe content caught
threshold 0.8:   0% of safe content wrongly blocked,   40% of unsafe content caught
```

A loose threshold (0.4) catches every unsafe example in this set, but at the cost of blocking a fifth of legitimate requests. A strict threshold (0.8) never over-blocks, but lets 60% of unsafe content through. There's no threshold in this example that gets both numbers to their best value simultaneously.

## Bench

```bench
id: guardrail-threshold
title: Looser catches more, and over-blocks more
fallback: Slide a safety filter's block threshold and watch over-blocking trade off against catching real attacks.
```

**Try this**

1. Slide the threshold down until the false-positive rate first rises above 0%, and note the catch rate at that point.
2. Slide it up until the catch rate drops below 50%, and note the false-positive rate at that point.
3. Try to find a single threshold where both rates are simultaneously at their best possible value — notice it isn't possible here.

**What you should notice:** the two dots sets (safe and unsafe scores) overlap in the middle of the range — any threshold placed inside that overlap necessarily trades one kind of error for the other.

## Where it appears in AI

* **This is the same threshold trade-off [[Adversarial and Jailbreak Evaluation]] measures when testing attack success rates** — a guardrail's catch rate against adversarial attempts is exactly what that evaluation is checking.
* **A guardrail runs independently of the model's own alignment training** — it's a deployment-time addition, not a replacement, for the training-time work covered in Instruction Tuning and Alignment.
* **Updating a guardrail's threshold or rules can happen without retraining the model at all**, unlike [[Responsible Scaling Policies and Frontier Safety]]'s training-time commitments, which is part of why guardrails are a common first line of defense in production.

## Common pitfalls

* **Assuming a stricter guardrail is always safer.** The worked example's strictest threshold (0.8) has zero false positives but lets more than half the unsafe content in this set through — "stricter" reduces one error type at the direct cost of the other.
* **Treating a guardrail as a substitute for alignment training.** A guardrail catches what reaches it at the input/output boundary; it doesn't change what the model would otherwise produce, and sophisticated attacks can be built specifically to evade a known filter.
* **Picking a single global threshold for every use case.** A customer-facing product and an internal research tool often tolerate very different false-positive rates, so the "right" threshold isn't universal even for the same underlying filter.

## Quick check

<details><summary>1. In the worked example, why does lowering the threshold from 0.6 to 0.4 increase both the catch rate and the false-positive rate?</summary>
A lower threshold blocks anything scoring at or above it, which includes more of the unsafe examples (raising the catch rate) but also some safe examples that scored just below 0.6 (raising the false-positive rate) — both effects come from the same change.
</details>

<details><summary>2. Does a guardrail replace the need for alignment training, or complement it?</summary>
It complements it — alignment training shapes the model's own tendencies, while a guardrail is a separate check around the model that can catch what training missed and can be updated independently.
</details>

<details><summary>3. Why might two different products reasonably choose different guardrail thresholds for the same underlying filter?</summary>
They can have very different tolerances for over-blocking versus under-catching — a customer-facing product might prioritize not blocking legitimate requests, while a safety-critical context might prioritize catching more unsafe content even at the cost of some false positives.
</details>

## Key terms

* **Guardrail:** a deployment-time filter that checks inputs or outputs against a threshold, separate from the model's own training.
* **False positive rate (in this context):** the fraction of safe content incorrectly blocked by a filter.
* **Catch rate:** the fraction of genuinely unsafe content a filter successfully blocks.

## Related

[[Adversarial and Jailbreak Evaluation]] · [[Responsible Scaling Policies and Frontier Safety]] · [[Reward Hacking and Sycophancy]]
