An agent that must stop and ask before every single action is safe but slow; an agent that never asks is fast but unwatched. The useful middle ground isn't a single on/off switch — it's a small set of named oversight tiers, each trading a specific amount of review burden for a specific amount of unsupervised exposure.

**You need:** [[Open-Loop vs. Closed-Loop Behavior]].

## The question it answers

"How much human review does an agent actually need, and does every action need the same amount?" **Human-in-the-loop** requires a person's approval before every action runs. **Human-on-the-loop** lets the agent run freely but routes only its irreversible actions through a person first, while reversible ones proceed on their own. **Human-out-of-the-loop** removes approval entirely — the agent acts fully autonomously within its granted scope, and oversight happens only after the fact, if at all. These three tiers (the framing used in guidance from bodies like the UK's National Cyber Security Centre and MIT's work on autonomy and oversight) aren't about how capable the agent is — they're about how much of its own trajectory a person actually reviews before it happens.

## Intuition

A new employee on their first day has every email checked before it's sent (in-the-loop); a trusted employee a year in only needs a manager's sign-off on something that can't be undone, like a refund over a certain amount (on-the-loop); a fully trusted employee with a clearly bounded role just gets their work reviewed later, if at all (out-of-the-loop). None of these is "more correct" in general — the right level depends on how costly a mistake would be and how well-understood the agent's behavior already is.

## Definition and notation

```text
human-in-the-loop:     approvals needed = every action
human-on-the-loop:     approvals needed = only irreversible actions
human-out-of-the-loop: approvals needed = none
```

## A worked example

A 10-step agent run — 7 reversible actions (search, read, summarize, draft, compute) and 3 irreversible ones (send an email, delete a file, make a purchase) — under each tier:

```text
human-in-the-loop:      10 of 10 actions need approval  (100%)
human-on-the-loop:        3 of 10 actions need approval   (30%)
human-out-of-the-loop:    0 of 10 actions need approval    (0%)
```

Moving from in-the-loop to on-the-loop cuts the review burden by 70 percentage points without changing which actions are actually risky — the 3 irreversible actions still get a human's eyes before they run, while the 7 reversible ones no longer wait on anyone. Moving to out-of-the-loop removes that last safety net entirely.

## Bench

```bench
id: oversight-tier-burden
title: How much review each oversight tier needs
fallback: Switch between human oversight tiers and watch how many of a trajectory's actions need approval.
```

**Try this**

1. Start at human-in-the-loop and note every action needs approval.
2. Switch to human-on-the-loop and notice only the 3 irreversible actions still need a person.
3. Switch to human-out-of-the-loop and consider what happens if one of those 3 actions turns out to be a mistake.

**What you should notice:** human-on-the-loop isn't a compromise that reviews "some fraction" of actions arbitrarily — it specifically targets the actions that can't be undone, which is exactly where a human's judgment matters most.

## Where it appears in AI

* **This tiering is the agent-specific extension of [[Open-Loop vs. Closed-Loop Behavior]]**: a closed loop checks its own results automatically, while an oversight tier decides when a *human*, not the agent itself, is the one doing the checking.
* **[[Sandboxing and Isolation]] and [[Excessive Agency and Scope Limits]], later in this section, are the complementary approach**: instead of relying on a human catching a mistake before it happens, they limit how much damage any single mistake can do in the first place.
* **The irreversibility distinction this topic relies on recurs throughout [[Guardrails for Agent Actions]]**: a guardrail can use the exact same reversible/irreversible split to decide which proposed actions need an extra check.

## Common pitfalls

* **Treating oversight as one setting for an entire agent.** The worked example's whole benefit comes from distinguishing reversible from irreversible actions — a single blanket tier either over-reviews harmless actions or under-reviews costly ones.
* **Assuming a higher-numbered tier is always the goal to work toward.** Moving toward less oversight is appropriate only once an agent's behavior in that specific action category is well understood — it isn't a maturity ladder every agent should climb regardless of risk.
* **Confusing "reversible" with "low-stakes."** A reversible action repeated at scale (sending the same draft to a thousand recipients) can still cause real harm even though any single instance of it could be undone.

## Quick check

<details><summary>1. Why does human-on-the-loop reduce the approval count from 10 to 3 in the worked example, rather than to some other number?</summary>
Human-on-the-loop specifically routes only irreversible actions through a human — and exactly 3 of the 10 actions in the worked example (send email, delete file, make purchase) are irreversible, so those are the only ones still requiring approval.
</details>

<details><summary>2. What's the key difference between human-on-the-loop and human-out-of-the-loop?</summary>
Human-on-the-loop still routes irreversible actions through a person before they run; human-out-of-the-loop removes approval entirely, so even irreversible actions proceed without anyone reviewing them first.
</details>

<details><summary>3. Why isn't a single oversight tier chosen once and used for every agent?</summary>
The right tier depends on how costly a mistake in that specific context would be and how well the agent's behavior in that action category is already understood — a tier appropriate for one agent's low-stakes task can be badly wrong for another's high-stakes one.
</details>

## Key terms

* **Human-in-the-loop:** every action requires a person's approval before it runs.
* **Human-on-the-loop:** the agent runs autonomously, but irreversible actions are routed through a person first.
* **Human-out-of-the-loop:** the agent acts fully autonomously, with no approval step at all.

## Related

[[Open-Loop vs. Closed-Loop Behavior]] · [[Sandboxing and Isolation]] · [[Guardrails for Agent Actions]]
