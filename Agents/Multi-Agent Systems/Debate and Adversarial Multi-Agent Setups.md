A single agent that states a claim has no one checking its arithmetic. A second agent whose explicit job is to challenge that claim — recompute it, look for the mistake — catches exactly the kind of error that would otherwise sail through unexamined.

**You need:** [[Supervisor-Orchestrator Patterns|Supervisor/Orchestrator Patterns]].

## The question it answers

"Can having two agents argue opposite sides of a question catch errors a single agent would miss?" A debate setup gives one agent the job of proposing an answer and a second agent the job of challenging it — recomputing, probing for mistakes, arguing the other side. A judge (sometimes a third agent, sometimes the same mechanism built into the exchange) decides the outcome once the challenge has been raised. The point isn't politeness or compromise — it's that an error the proposer didn't catch in its own reasoning is exactly the kind of thing a dedicated challenger, starting fresh, is positioned to catch.

## Intuition

A courtroom doesn't just ask one side to state their case and accept it — a dedicated opposing side is specifically tasked with finding the holes in it. The opposing side isn't being difficult for its own sake; an unchallenged claim and a claim that survived a real challenge carry very different evidentiary weight, precisely because the second one was actually tested.

## Definition and notation

```text
proposer:   generates a claim
challenger: independently re-derives the answer and checks it against the claim
mismatch → debate overrides to the recomputed answer
```

## A worked example

A proposer's arithmetic claim, checked by a challenger that redoes the computation independently:

```text
proposer:    "17 × 23 = 381."
(single agent, no debate: accepts the claim as final — final answer: 381, wrong)

challenger:  recomputes independently — 17 × 23 = 391.
mismatch found (381 ≠ 391) → debate overrides to the recomputed answer

final answer, with debate: 391 (correct)
```

Nothing about the proposer's claim looked obviously wrong on its own — 381 is a plausible-looking three-digit number. The error only becomes visible because the challenger redid the actual computation independently, rather than reviewing the proposer's reasoning for a mistake it might not even state.

## Bench

```bench
id: debate-adversarial-check
title: An unchecked claim, or one a challenger recomputes
fallback: Step through a proposer's claim and a challenger's recomputation catching a genuine error.
```

**Try this**

1. Step through and see the single-agent case accept the wrong claim.
2. Continue stepping and watch the challenger's independent recomputation catch the mismatch.
3. Imagine the challenger made the identical arithmetic mistake as the proposer, independently — would the mismatch still be caught?

**What you should notice:** the challenger's value here comes specifically from recomputing *independently*, not from reviewing the proposer's stated reasoning — a shared blind spot that both agents happen to share wouldn't be caught by this mechanism at all.

## Where it appears in AI

* **This is one specific structure built from [[Role Specialization in Agent Teams|role-specialized agents]]**: proposer and challenger are deliberately different roles, not two copies of the same agent doing the same thing.
* **[[Self-Critique Loops in Agents]] is the single-agent version of a similar idea**: one agent critiquing its own output, rather than a second, independent agent doing the challenging.
* **[[LLM-as-Judge for Agent Trajectories]] often plays the role of the judge deciding between a debate's competing claims**, once the challenge has actually been raised.

## Common pitfalls

* **Treating any two-agent exchange as a real debate.** If the challenger doesn't independently re-derive anything and just restates agreement, no actual checking happened — the worked example's benefit specifically comes from independent recomputation, not from having two agents talk.
* **Assuming debate catches every kind of error.** A mistake that both the proposer and the challenger happen to make identically and independently — a shared misconception, not an arithmetic slip — would survive a debate exactly as it would survive a single agent, since nothing here checks against ground truth directly.
* **Running debate on tasks with no checkable ground truth.** The worked example depends on the challenger being able to independently verify the proposer's claim (here, by redoing real arithmetic) — a genuinely subjective judgment has no equivalent "recompute and compare" step.

## Quick check

<details><summary>1. In the worked example, why does the single-agent case end up with the wrong final answer?</summary>
With no challenger, nothing re-derives or checks the proposer's claim — it's accepted as final exactly as stated, including whatever error it contains.
</details>

<details><summary>2. What specifically does the challenger do that catches the error?</summary>
It independently recomputes the same calculation from scratch, rather than reviewing the proposer's stated reasoning — the mismatch between the two independent results is what reveals the error.
</details>

<details><summary>3. Would debate catch a mistake that both the proposer and the challenger happen to make identically?</summary>
No — if both agents share the same error independently, their results would agree with each other despite both being wrong, since this mechanism only checks for disagreement between the two, not against an external ground truth.
</details>

## Key terms

* **Proposer:** the agent that generates an initial claim or answer.
* **Challenger:** the agent whose role is to independently check or dispute the proposer's claim.
* **Debate:** a multi-agent setup where opposing roles argue a question before a judgment is reached.

## Related

[[Role Specialization in Agent Teams]] · [[Self-Critique Loops in Agents]] · [[LLM-as-Judge for Agent Trajectories]]
