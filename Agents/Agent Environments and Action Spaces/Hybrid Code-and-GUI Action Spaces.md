A script can rename fifty files in one call; clicking through a file manager to do the same thing takes fifty clicks. But a form with real browser validation sometimes only accepts input that comes from an actual click, type and tab sequence — a script that pokes the underlying values directly can silently skip whatever checks were wired to those real events. The cheaper path isn't always the one that works.

**You need:** [[Code-Execution Agents]], [[Computer-Use Agents and GUI Grounding]].

## The question it answers

"If an agent can both write code and click through a GUI, which should it use for a given step?" A **hybrid** action space gives an agent both options and lets it choose per step: code for anything repetitive or bulk, direct GUI interaction for anything that depends on the interface's own behavior actually firing (validation, confirmation dialogs, drag-and-drop). Picking the cheaper option by action count alone, without checking whether it actually works, is a trap.

## Intuition

A warehouse worker moving one box uses their hands; moving a thousand identical boxes, they'd rather drive the forklift. But if one particular box is fragile and needs to be checked by hand on the way, driving the forklift through that step just because it's usually faster would be the wrong call — some steps need the slower, more careful tool specifically because of what it verifies along the way.

## Definition and notation

```text
GUI-only strategy:    every step uses GUI actions
code-only strategy:   every step uses code, regardless of whether it actually succeeds
hybrid strategy:      each step uses code when it works, falls back to GUI when it doesn't
```

## A worked example

Three tasks of different shapes, compared across all three strategies:

```text
task                              GUI actions   code actions   code succeeds?
bulk-rename 50 files                   50             1              yes
single confirmation click               1             1              yes
10-field validated form + submit       11             1              no (skips validation events)

GUI-only:   50+1+11 = 62 actions,  3 of 3 tasks completed
Code-only:   1+1+1  =  3 actions,  2 of 3 tasks completed (the form silently fails)
Hybrid:      1+1+11 = 13 actions,  3 of 3 tasks completed
```

Code-only looks cheapest by action count, but it quietly fails the one task where setting form values directly skips the validation logic that only fires on real input events. The hybrid strategy pays the GUI's higher action count only where it's actually needed, landing at roughly a fifth of the GUI-only total while still completing every task.

## Bench

```bench
id: hybrid-action-strategy
title: Click through it, script it, or pick per step
fallback: Compare total actions and tasks completed across GUI-only, code-only and hybrid strategies for three different tasks.
```

**Try this**

1. Compare the three strategies' total actions and completed-task counts.
2. Notice code-only's lower action count comes with a real cost — one task doesn't actually finish.
3. Imagine a fourth task where code and GUI both succeed equally well — which strategy would still win, and why?

**What you should notice:** the right choice per step isn't "whichever is fewer actions" — it's whichever actually produces the correct outcome, with action count as the tiebreaker only among options that work.

## Where it appears in AI

* **This combines [[Code-Execution Agents]] and [[Computer-Use Agents and GUI Grounding]]** into a single action space, where the agent's job includes deciding which of the two to use at each step, not just how to use either one.
* **[[Action-Space Design and Its Failure Modes]], the next topic, generalizes the lesson here**: the available actions themselves, not just the policy choosing among them, determine what can go right or wrong.
* **The validation-skipping failure is a concrete instance of [[Tool Result Verification]]'s general point**: a call can return successfully (no exception) while still not having done what it looked like it did.

## Common pitfalls

* **Always preferring code because it's fewer actions.** The worked example's form task shows a code path can complete with no error and still not have actually worked — fewer actions isn't the same as task success.
* **Always preferring the GUI "to be safe."** That leaves bulk, repetitive tasks far more expensive than they need to be — the hybrid strategy's savings come specifically from using code where it's safe to.
* **Picking a strategy once per task type instead of per step.** The form task in this example needed GUI interaction specifically for the step with validation — a strategy applied uniformly to an entire task misses that nuance.

## Quick check

<details><summary>1. Why does the code-only strategy fail the third task despite using only 1 action for it?</summary>
Setting form field values directly through code can skip the browser events (focus, input, change) that the form's validation logic is actually listening for, so the submission is rejected or silently incomplete even though the code itself ran without error.
</details>

<details><summary>2. Why does the hybrid strategy use far fewer total actions than GUI-only while still completing every task?</summary>
It uses the cheap code path for the two tasks where code genuinely succeeds (bulk rename, confirmation click) and only pays the GUI's higher action count for the one task where code doesn't actually work.
</details>

<details><summary>3. What's the general principle for choosing between code and GUI actions per step?</summary>
Prefer whichever option actually produces the correct outcome for that specific step, and only use action count as a tiebreaker among options that both work.
</details>

## Key terms

* **Hybrid action space:** an action space combining code execution and direct GUI interaction, chosen per step.
* **Silent validation failure:** a code-based action that completes without error but skips interface logic (like form validation) tied to real user-input events.
* **Per-step strategy selection:** choosing the action type for each individual step of a task, rather than committing to one action type for an entire task.

## Related

[[Code-Execution Agents]] · [[Computer-Use Agents and GUI Grounding]] · [[Action-Space Design and Its Failure Modes]]
