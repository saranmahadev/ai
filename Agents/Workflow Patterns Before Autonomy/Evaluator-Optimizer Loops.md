A first draft critiqued once gets noticeably better; critiqued a second time, it gets better still, but by less than the first round did. An evaluator-optimizer loop makes that generate-critique-improve cycle explicit: one call generates or revises, a second call evaluates the result and says what's still wrong, and the first call revises again — repeating until the evaluator is satisfied or a round limit is reached.

**You need:** [[Prompt Chaining]].

## The question it answers

"How do you turn a single generation into something that improves itself with feedback?" An evaluator-optimizer loop pairs two roles: an **optimizer** that generates or revises a candidate, and an **evaluator** that judges the candidate and returns specific feedback. The optimizer's next revision responds directly to that feedback, and the two alternate for a fixed number of rounds or until the evaluator passes the result — the same generate-critique-improve cycle as [[Self-Refinement and Iterative Critique|self-refinement]], already covered in LLMs, used here as a workflow pattern rather than a reasoning technique.

## Intuition

A writer who hands a draft to an editor, gets back specific notes ("the ending doesn't land, the second paragraph repeats the first"), and revises accordingly improves faster than one revising blind — and the editor's second round of notes is usually shorter than the first, because most of the big problems already got fixed.

## Definition and notation

```text
loop:    generate → evaluate → feedback → revise → evaluate → feedback → revise → ...
quality after round r = 1 − 0.5^(r+1)        (the self-refinement curve from LLMs)
```

## A worked example

Quality after each evaluator-optimizer round, reusing the exact self-refinement curve already verified in LLMs:

```text
round 0 (first draft):  50.00%
round 1:                75.00%
round 2:                87.50%
round 3:                93.75%
round 4:                96.88%
```

Each round closes half of the remaining gap to a perfect result — round 1 closes half of the 50% that round 0 left open, round 2 closes half of what round 1 left open, and so on. The gains keep shrinking even as they keep coming, which is exactly why a loop like this needs a stopping rule rather than running forever.

## Bench

```bench
id: evaluator-optimizer-loop
title: Generate, critique, improve, repeat
fallback: Step through evaluator-optimizer rounds and watch quality climb with diminishing returns.
```

**Try this**

1. Step through all four rounds and watch the quality bar climb each time.
2. Notice how much smaller the jump from round 3 to round 4 is than the jump from round 0 to round 1.
3. Imagine the evaluator has a fixed quality bar it requires before passing a result — at what round would it likely stop this loop?

**What you should notice:** the loop's gains shrink round over round in exactly the same shape as the self-refinement curve in LLMs — it's the identical mechanism, just run inside a workflow with an explicit evaluator role instead of a single model critiquing its own output.

## Where it appears in AI

* **This is [[Self-Refinement and Iterative Critique|self-refinement]] from LLMs, used as a workflow pattern.** The underlying curve — each round closing half the remaining gap — is the exact same mechanism; what's new here is treating it as a structured loop with its own stopping condition, alongside the other workflow patterns in this subject.
* **[[Verifier-Guided Agent Loops]] generalizes this same evaluator role** into a check that runs continuously inside an autonomous agent, rather than a fixed number of workflow rounds.
* **[[Reflection and Self-Improvement|Reflection and self-improvement]], the next section, covers the agent-level version of this same critique-and-revise cycle** happening across an agent's own trajectory rather than inside a fixed workflow.

## Common pitfalls

* **Running the loop for a fixed large number of rounds regardless of returns.** The worked example shows round 4 adds only about 3 percentage points over round 3 — past some point, another round costs more compute than the quality gain is worth.
* **Giving the evaluator no specific feedback to act on.** A pass/fail verdict with no explanation of *what's* wrong gives the optimizer nothing concrete to revise — the loop depends on the evaluator's feedback being specific enough to act on.
* **Confusing this with the agent's own self-correction.** The loop here has a fixed workflow structure with two defined roles; an agent reflecting mid-trajectory (the next section) is doing something related but less structured, with no fixed round count decided in advance.

## Quick check

<details><summary>1. In the worked example, why does round 1 add 25 percentage points but round 4 adds only about 3?</summary>
Each round closes half of whatever quality gap was still remaining after the previous round — the gap itself keeps shrinking, so each round's absolute gain shrinks along with it, even though the loop keeps making progress.
</details>

<details><summary>2. What two roles does an evaluator-optimizer loop need?</summary>
An optimizer that generates or revises a candidate, and an evaluator that judges the candidate and returns specific feedback for the optimizer's next revision.
</details>

<details><summary>3. Why would an unlimited number of rounds be a bad default?</summary>
Returns diminish every round, so at some point another round's compute cost exceeds the quality gain it buys — a loop without a stopping rule keeps paying for smaller and smaller improvements indefinitely.
</details>

## Key terms

* **Evaluator-optimizer loop:** a workflow pairing a generating/revising call with an evaluating call that gives feedback, repeated until a stopping condition.
* **Optimizer:** the role that generates or revises a candidate based on feedback.
* **Evaluator:** the role that judges a candidate and returns specific, actionable feedback.

## Related

[[Self-Refinement and Iterative Critique]] · [[Verifier-Guided Agent Loops]] · [[Reflection and Self-Improvement]]
