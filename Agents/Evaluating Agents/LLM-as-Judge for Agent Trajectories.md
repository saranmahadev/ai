Checking an agent's full trajectory for soundness, not just its final answer, often has no fixed rule to check against — there's no reference string for "was this a reasonable approach." Using an LLM as the judge, already covered on the LLMs planet for single outputs, extends naturally to reading an entire transcript and rendering a verdict on the whole run — and it inherits that judge's exact same biases while doing it.

**You need:** [[Trajectory-Level Evaluation]].

## The question it answers

"How do you grade a property of an agent's run that no fixed rule can check?" Rule-based trajectory checkers (like the step-validity check in the previous topic) only work when "valid" has a checkable definition. For judgments like "was this a sound approach" or "did the agent waste effort," there's often no reference answer to check against — so the same **LLM-as-judge** mechanism already covered for single outputs gets applied to the entire trajectory transcript instead, with the identical position-bias risk the LLMs planet already demonstrated.

## Intuition

Grading a single essay for quality is already subjective enough to need a human-like judge rather than a fixed answer key. Grading an entire research process — which sources a student consulted, in what order, and why — is the same kind of judgment call, just applied to a much longer document. Whatever biases crept into the single-essay judge don't disappear just because the document got longer.

## Definition and notation

```text
judge_score(trajectory, position) = quality(trajectory) + bias_term(position)
                                     (the exact mechanism from the LLMs planet,
                                      "trajectory" standing in for "response")
```

## A worked example

Two full agent trajectories, A (quality 0.60) and B (quality 0.65) — B is genuinely the better trajectory — judged under the identical toy position bias of +0.15 for whichever is shown first:

```text
A shown first, B second:
  A score: 0.60 + 0.15 = 0.75     B score: 0.65 + 0 = 0.65
  judge prefers: A   ← wrong; B was actually the better trajectory

B shown first, A second:
  A score: 0.60 + 0 = 0.60        B score: 0.65 + 0.15 = 0.80
  judge prefers: B   ← correct

for comparison, a single-turn response is maybe 50 tokens;
a full trajectory transcript here runs roughly 2000 tokens — about 40× longer
```

The verdict flips purely from presentation order, exactly as it did for single-turn responses — nothing about applying this to a full trajectory changes the underlying bias. What *is* new is the input size: judging a trajectory means feeding the judge a transcript many times longer than a single response, which is a real cost consideration of its own.

## Bench

```bench
id: trajectory-judge-position-bias
title: Which trajectory the judge reads first
fallback: Swap which full agent trajectory is shown first and watch the judge's preferred winner flip.
```

**Try this**

1. Put Trajectory A first and see which one the judge prefers.
2. Swap the order and compare the verdict.
3. Consider how a production pipeline might cancel out this effect, the same way it would for single-response judging.

**What you should notice:** this is the identical position-bias mechanism already verified on the LLMs planet — nothing about judging trajectories instead of single responses changes how the bias behaves, only what's being read has gotten much longer.

## Where it appears in AI

* **This directly reuses the [[LLM-as-Judge Evaluation|LLM-as-judge mechanism]] already covered on the LLMs planet** — the bias term, the mitigation (order randomization), and the underlying risk are unchanged; only the object being judged (a full trajectory instead of a single output) is new.
* **The 40× longer input in the worked example is exactly why [[Cost and Reliability as Joint Metrics]], covered next, matters for trajectory judging** — reading and scoring full transcripts costs meaningfully more than judging single outputs.
* **[[Debate and Adversarial Multi-Agent Setups]] often uses a judge of exactly this kind** to decide between two agents' competing trajectories, once a challenge has been raised.

## Common pitfalls

* **Assuming trajectory judging is immune to biases found in single-output judging.** The worked example shows the identical position-bias mechanism carries over unchanged — it was never specific to short responses.
* **Ignoring the token-cost difference between judging an output and judging a trajectory.** A full transcript can run tens of times longer than a single response, which multiplies the judge's own compute cost accordingly.
* **Using an LLM judge for trajectory properties a rule-based checker could verify instead.** If "was this step valid" has a fixed, checkable definition (like the previous topic's step-validity check), a cheaper rule-based checker is more reliable than an LLM judge for exactly that part.

## Quick check

<details><summary>1. What's different about applying LLM-as-judge to a trajectory instead of a single output?</summary>
Mainly the size of what's being judged — a full trajectory transcript can run many times longer than a single response — while the underlying judging mechanism and its biases (like position bias) are exactly the same.
</details>

<details><summary>2. Why does the judge's verdict flip between the two orderings in the worked example?</summary>
The position-bias term adds a fixed bonus to whichever trajectory is shown first, and that bonus is large enough to overcome the real (smaller) quality gap between the two trajectories — exactly the same effect already shown for single-output judging.
</details>

<details><summary>3. When would a rule-based trajectory checker be preferable to an LLM judge?</summary>
Whenever the property being checked has a fixed, checkable definition — rule-based trajectory-level evaluation (like checking each step against a validity rule) is cheaper and more reliable than an LLM judge for anything that doesn't require subjective judgment.
</details>

## Key terms

* **LLM-as-judge (for trajectories):** using a model to read and score an agent's full run, applying the same judging mechanism used for single outputs.
* **Position bias:** a judge's tendency to favor whichever item is shown first, independent of actual quality — unchanged when judging trajectories instead of single outputs.
* **Trajectory transcript:** the full record of an agent's steps, typically far longer than a single generated response.

## Related

[[LLM-as-Judge Evaluation]] · [[Cost and Reliability as Joint Metrics]] · [[Debate and Adversarial Multi-Agent Setups]]
