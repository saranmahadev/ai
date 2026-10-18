An agent that fires off four actions in a row and reports "done" might be lying — not out of any intent to deceive, but because it never actually checked whether any of those four actions worked. Whether an agent checks its own results, every single time, is the difference between a silent failure and a caught one.

**You need:** [[From a Single Call to a Loop]].

## The question it answers

"Does an agent ever verify that its own actions actually had the intended effect?" **Open-loop** execution runs a sequence of actions without checking any of their real results — if one silently fails partway through, nothing in the loop notices, and the agent proceeds as if everything worked. **Closed-loop** execution checks the actual outcome after every single action — a silent failure is caught the moment it happens, because the loop looks at the real result before deciding what to do next.

## Intuition

Mailing four letters and assuming all four arrived, with no tracking and no confirmation, is open-loop — if one gets lost in transit, you won't find out unless something else eventually depends on it having arrived. Getting a delivery confirmation for each one before sending the next is closed-loop — a lost letter is caught immediately, right when it happens, not whenever its absence finally causes a problem downstream.

## Definition and notation

```text
open-loop:    run action; move to next action, regardless of what actually happened
closed-loop:  run action; check its real result; only then decide the next step
```

## A worked example

A 4-step action sequence, with a silent failure injected at different steps:

```text
failure at step 2:
  open-loop:    never checks — proceeds through steps 3 and 4, reports success at the end
  closed-loop:  checks after step 2, catches the failure immediately, stops there

failure at step 4 (the last step):
  open-loop:    never checks — still reports success
  closed-loop:  catches it immediately, at step 4
```

However consistently a step's result is injected to fail, open-loop execution never notices by construction — it simply doesn't look. Closed-loop execution catches the failure at exactly the step it happened, regardless of which step that is.

## Bench

```bench
id: open-vs-closed-loop
title: Checking the result, or not
fallback: Slide where a failure happens in a 4-step run and see whether open-loop or closed-loop execution catches it.
```

**Try this**

1. Slide the failure to different steps and watch open-loop's result — it never changes.
2. Watch closed-loop catch the failure at exactly the step you chose, every time.
3. Imagine the failed step was "transfer money" — what's the real-world cost of open-loop missing it?

**What you should notice:** open-loop's blindness isn't a matter of bad luck or an unlucky failure mode — it's structural: nothing in open-loop execution ever looks at the actual result, so there's nothing that could catch a failure regardless of where it happens.

## Where it appears in AI

* **This is the mechanism underneath [[Re-Planning on Failure]]**: re-planning can only happen once a failure has actually been detected, which requires closed-loop checking in the first place.
* **[[Tool Result Verification]] is the specific, tool-level version of this same idea** — checking a tool's actual output before trusting it, rather than assuming the call succeeded.
* **[[Error Attribution Across a Trajectory]] depends on closed-loop checkpoints existing at all** — attributing a later failure to an earlier step requires having actually recorded what each step's real result was.

## Common pitfalls

* **Assuming a tool call "probably worked" without checking its return value.** The worked example shows this is exactly the open-loop failure mode — the assumption holds right up until it doesn't, silently.
* **Checking results inconsistently — sometimes, but not after every action.** A closed loop that skips checking on some steps reduces to open-loop exactly on those steps, reintroducing the same blind spot.
* **Confusing "the action completed" with "the action worked."** A tool call can return without an error while still not having accomplished the intended effect — closed-loop checking needs to verify the actual outcome, not just that the call didn't crash.

## Quick check

<details><summary>1. Why does open-loop execution fail to catch the injected failure regardless of which step it happens at?</summary>
Open-loop never checks any step's actual result at all — there's no point in the loop where a failure, wherever it occurs, could be noticed.
</details>

<details><summary>2. What does closed-loop execution need, structurally, that open-loop doesn't?</summary>
A check after every action that compares the action's actual result against what was expected, before deciding what to do next.
</details>

<details><summary>3. Does a tool call returning without an error guarantee the action actually succeeded?</summary>
No — a call can return normally while still not accomplishing its intended effect, which is why closed-loop checking needs to verify the real outcome, not just that the call completed without crashing.
</details>

## Key terms

* **Open-loop execution:** running a sequence of actions without checking their actual results.
* **Closed-loop execution:** checking each action's real outcome before deciding the next step.
* **Silent failure:** an action that fails without raising any error, detectable only by checking its actual effect.

## Related

[[From a Single Call to a Loop]] · [[Re-Planning on Failure]] · [[Tool Result Verification]]
