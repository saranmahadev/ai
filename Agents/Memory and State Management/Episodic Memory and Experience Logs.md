The first time an agent faces a task, it has to actually discover which approach works — try something, see it fail, try something else. Without a record of that, every later instance of the same recurring task pays the discovery cost all over again. Logging what was tried and what happened, an **episodic memory**, is what lets a later instance skip straight to what already worked.

**You need:** [[Short-Term vs. Long-Term Agent Memory]].

## The question it answers

"What specifically should an agent remember about its own past runs, beyond plain facts?" An episodic memory records *episodes*: what task was attempted, what approach was tried, and what the outcome was — not a fact about the world, but a record of the agent's own experience. When the same (or a similar) task recurs, the agent can look up what it logged last time instead of rediscovering the right approach from scratch.

## Intuition

A technician who writes "tried swapping the battery first, didn't fix it — the actual issue was a loose cable" in a repair log saves the next technician (or themselves) from redoing the same failed first attempt on a similar fault. The notebook isn't a fact about the machine in general — it's a record of what was tried on this specific kind of problem and what actually worked.

## Definition and notation

```text
episode = (task, approach tried, outcome)
without episodic log:  every instance rediscovers the working approach from scratch
with episodic log:     only the first instance discovers it; later instances recall it
```

## A worked example

A recurring task where the first attempt at an approach fails and a second attempt succeeds, repeated across 5 instances:

```text
without episodic log:  every instance tries approach A (fails), then B (succeeds) — 2 attempts each
  5 instances × 2 attempts = 10 total attempts

with episodic log:     instance 1 tries A (fails), then B (succeeds), logs "B worked" — 2 attempts
                        instances 2-5 recall the log, go straight to B — 1 attempt each
  2 + (4 × 1) = 6 total attempts
```

The saving isn't from the agent getting smarter at the task itself — the second instance's B still succeeds for exactly the same reason it did the first time. The saving is entirely from not re-running a failed experiment (approach A) that the log already knows doesn't work.

## Bench

```bench
id: episodic-memory-log
title: Rediscovering what works, or recalling it
fallback: Compare total attempts spent on a recurring task with and without an episodic memory log.
```

**Try this**

1. Slide the number of instances up with the log off and watch the total climb by 2 every time.
2. Turn the log on and see every instance after the first drop to 1 attempt.
3. Imagine the task's correct approach changes over time (what worked last month stops working) — what would a pure "recall the log" agent miss that an agent which still occasionally re-checks wouldn't?

**What you should notice:** the log's benefit depends on the task actually recurring in a similar enough form that last time's outcome is still relevant — a one-off task gets no benefit from logging it at all.

## Where it appears in AI

* **This is a specific, structured application of [[Short-Term vs. Long-Term Agent Memory|long-term memory]]**: not arbitrary facts, but a record of the agent's own past attempts and outcomes.
* **[[Self-Critique Loops in Agents]] produces the kind of outcome judgment an episodic log actually stores** — a critique of what happened is exactly the information worth logging for next time.
* **[[Learning from Feedback Without Weight Updates]] is the general principle this topic is one concrete mechanism for**: changing future behavior from past experience without touching the model's weights at all.

## Common pitfalls

* **Logging episodes for tasks that never recur.** A log entry for a genuinely one-off task is pure overhead — it will never be looked up again, which is exactly why this topic specifies a *recurring* task.
* **Logging only successes.** The worked example's saving comes specifically from knowing that approach A *doesn't* work — a log that only records what succeeded would still let every instance waste an attempt rediscovering that A fails.
* **Assuming a logged outcome stays valid forever.** An approach that worked under past conditions can stop working if something in the environment changes — a log entry is evidence from a specific past attempt, not a permanent guarantee.

## Quick check

<details><summary>1. In the worked example, why do instances 2 through 5 need only 1 attempt instead of 2?</summary>
The episodic log already recorded that approach B worked and approach A didn't, so each later instance can go straight to B instead of re-trying the already-known-to-fail A first.
</details>

<details><summary>2. What does an episodic memory entry actually store — a fact, or something else?</summary>
Something else: an episode, a record of what task was attempted, what approach was tried, and what the outcome was — the agent's own experience, not a general fact about the world.
</details>

<details><summary>3. Why does episodic memory provide no benefit for a task that never recurs?</summary>
The whole saving comes from a later instance looking up what an earlier instance already discovered — if the task never happens again, there is no later instance to benefit from the log entry.
</details>

## Key terms

* **Episode:** a record of a specific task attempt, the approach tried, and its outcome.
* **Episodic memory:** a long-term memory store specifically of an agent's own past episodes.
* **Rediscovery cost:** the attempts spent finding a working approach from scratch, paid again by every instance that lacks access to a log of what already worked.

## Related

[[Short-Term vs. Long-Term Agent Memory]] · [[Self-Critique Loops in Agents]] · [[Learning from Feedback Without Weight Updates]]
