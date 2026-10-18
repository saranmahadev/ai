Two agents, each waiting on a result only the other can produce, aren't making progress — they're stuck in a circular wait. A different failure: two agents, unaware of each other's progress, both redo the same piece of work neither needed to repeat. Different symptoms, same underlying cause: nothing coordinated who does what, or who waits on whom.

**You need:** [[Swarm and Peer-to-Peer Coordination]].

## The question it answers

"What specifically goes wrong when a multi-agent system isn't coordinated well enough?" Two distinct, concrete failure modes: **circular wait** (deadlock), where each of two agents is blocked on a result only the other can produce, so neither can proceed; and **duplicated work**, where agents unaware of each other's progress each independently redo a subtask that only needed doing once. Both come from the same root cause — a lack of shared awareness of who's doing what — but they produce opposite-looking symptoms: one freezes everything, the other wastes effort while still finishing.

## Intuition

Two coworkers each waiting for the other to send their half of a joint report first will wait forever if neither goes first — that's circular wait. Two coworkers who don't check in with each other and both independently write the same section from scratch get the report done, just with wasted, duplicated effort — a different failure, but from the same gap: neither knew what the other was doing.

## Definition and notation

```text
circular wait = (A waits on B) AND (B waits on A)             — true deadlock, 0 progress
duplicated work units = 2 × necessary units  (uncoordinated)
                        = 1 × necessary units  (coordinated)
```

## A worked example

The two failure modes, shown separately:

```text
circular wait:
  Agent A: waiting on B's result
  Agent B: waiting on A's result
  → deadlocked: neither can proceed, no matter how long they wait

duplicated work (3 shared subtasks):
  uncoordinated: both agents independently complete all 3 subtasks  → 6 total work units
  coordinated:   each of the 3 subtasks is done exactly once         → 3 total work units
```

Circular wait is a binary condition — either both agents are mutually blocked, in which case progress is exactly zero, or at least one isn't, in which case things proceed. Duplicated work is a matter of degree — the uncoordinated case still finishes the task, just at twice the necessary cost.

## Bench

```bench
id: coordination-failures-deadlock
title: Stuck waiting, or doing the same work twice
fallback: Show a circular-wait deadlock and duplicated-work coordination failures, and what fixes each.
```

**Try this**

1. In the deadlock mode, toggle each agent's wait condition and watch when the system becomes genuinely stuck.
2. Switch to duplicated work and compare coordinated versus uncoordinated total work units.
3. Imagine a three-agent cycle (A waits on B, B waits on C, C waits on A) — does breaking just one of those three wait conditions resolve it?

**What you should notice:** circular wait requires *both* directions of waiting to be true at once — breaking either one alone (not just both) is enough to let progress resume, which is exactly why a timeout or an arbitration rule on just one side is often all a fix needs.

## Where it appears in AI

* **Both failures are specific risks of [[Swarm and Peer-to-Peer Coordination]]'s shared state**, with no central hub enforcing who does what or who waits on whom — a cost explicitly flagged when that topology was introduced.
* **[[Shared State Across a Multi-Step Task]]'s blackboard is exactly the mechanism duplicated work needs to avoid**: a shared record of which subtasks are already claimed or completed prevents two agents from redoing the same one.
* **[[Supervisor-Orchestrator Patterns|A supervisor]] avoids circular wait by construction**: since every dependency routes through one central agent, two specialists can never end up directly waiting on each other.

## Common pitfalls

* **Adding more agents to a stuck system, hoping it unblocks.** If the actual problem is a circular wait, adding a third agent that doesn't break either waiting direction does nothing — the fix has to target the cycle itself, not the agent count.
* **Coordinating only after the fact, by comparing finished results.** Checking for duplicated work after both agents have already finished catches the waste too late to prevent it — the fix needs to happen before the redundant work starts, via shared state both agents check first.
* **Assuming a peer-to-peer system is inherently more failure-prone than a supervisor pattern.** It's specifically *more exposed* to these two failure modes because nothing centrally enforces coordination — but a supervisor pattern isn't failure-free either, it simply trades these particular risks for the single-point-of-failure risk covered in [[Swarm and Peer-to-Peer Coordination]].

## Quick check

<details><summary>1. Why does breaking just one agent's wait condition resolve a circular wait, rather than needing to fix both?</summary>
Circular wait requires both directions of waiting to hold simultaneously (A waits on B AND B waits on A) — if either one is false, at least one agent can proceed, which breaks the cycle.
</details>

<details><summary>2. In the worked example, why does the coordinated case still need 3 work units rather than 0?</summary>
The 3 subtasks genuinely need to be done once each — coordination removes the redundant, duplicated second pass, not the necessary work itself.
</details>

<details><summary>3. What do circular wait and duplicated work have in common, despite looking like opposite problems?</summary>
Both come from the same root cause: a lack of shared awareness between agents about who is doing what, or who is waiting on whom — one results in zero progress, the other in wasted but still-completed progress.
</details>

## Key terms

* **Circular wait (deadlock):** a cycle of agents each blocked on a result only another in the cycle can produce, so none can proceed.
* **Duplicated work:** independent agents each redoing a subtask that only needed to be completed once.
* **Shared awareness:** knowledge, available to every relevant agent, of what's already been claimed, completed, or is being waited on.

## Related

[[Swarm and Peer-to-Peer Coordination]] · [[Shared State Across a Multi-Step Task]] · [[Supervisor-Orchestrator Patterns|Supervisor/Orchestrator Patterns]]
