A supervisor agent never does the specialized work itself — it decides which specialist should handle a piece of a task, hands it off, and collects the result. Every specialist talks only to the supervisor; none of them talk to each other. That hub-and-spoke shape is simple to reason about, but it puts the whole system's coordination through one place.

**You need:** [[Routing Between Specialized Prompts]].

## The question it answers

"What's the simplest way to wire several specialized agents together?" A supervisor/orchestrator pattern puts one agent in charge of routing: it receives the overall task, decides which specialist agent should handle each piece, sends that piece to the specialist, and collects the result back. This is exactly [[Routing Between Specialized Prompts|routing]], one level up — instead of dispatching a request to a specialized *prompt*, the supervisor dispatches a subtask to a specialized *agent* capable of running its own multi-step loop.

## Intuition

A general contractor on a job doesn't personally do the plumbing, the electrical work, and the drywall — they decide which subcontractor handles which piece, hand off the work, and check it comes back done. The plumber and the electrician never coordinate directly with each other; everything routes through the contractor, who's the only one with the full picture of the job.

## Definition and notation

```text
star topology: supervisor ↔ each of n specialists      (n links; specialists never link to each other)
full mesh:     every pair of n agents linked directly    (n(n−1)/2 links)
```

## A worked example

A supervisor coordinating 4 specialist agents, compared to what a fully connected peer-to-peer version of the same 4 agents would need:

```text
supervisor (star) topology:  4 links — one from the supervisor to each specialist
full peer mesh, same 4 agents:  4×3/2 = 6 links — every pair connected directly
```

Every specialist in the star only ever has to know how to talk to the supervisor — not to the other three. That's 2 fewer connections than a full mesh would need at this size, and the gap only widens as more specialists are added, since the star grows linearly while the mesh grows quadratically.

## Bench

```bench
id: supervisor-orchestrator-topology
title: Routing through one hub, or everyone to everyone
fallback: Compare a supervisor's hub-and-spoke communication edges against a fully connected peer mesh of the same agents.
```

**Try this**

1. Slide the specialist count up and watch the star's edge count grow in a straight line.
2. Compare it to the mesh's edge count at the same specialist count.
3. Imagine the supervisor itself fails — what happens to the specialists' ability to coordinate with each other at all?

**What you should notice:** the star's simplicity (fewer connections, one place that knows the whole picture) comes with a cost that the last question points at directly — explored next in [[Coordination Failures and Deadlock]] and contrasted with [[Swarm and Peer-to-Peer Coordination]].

## Where it appears in AI

* **This is [[Routing Between Specialized Prompts|routing]] applied to full agents instead of prompts** — the mechanism (classify, then dispatch to whichever specialist handles that category) is identical; what's new is that each specialist can now run its own multi-step loop rather than returning in one call.
* **[[Pipeline and Sequential Handoff]] is a different wiring of the same kind of specialist agents**: fixed order and direct handoff between stages, instead of a central router deciding where each piece goes.
* **[[Swarm and Peer-to-Peer Coordination]] is the explicit alternative to this topology**: no central hub at all, at the cost of more connections to manage.

## Common pitfalls

* **Letting specialists communicate directly "to save a round-trip."** The moment two specialists talk to each other outside the supervisor, the system stops being a clean star — and loses the property that made it easy to reason about in the first place: everything routing through one place.
* **Treating the supervisor as just a router with no judgment.** Beyond classifying which specialist handles a subtask, a supervisor often also has to decide what to do when a specialist's result isn't good enough — that's a real decision, not a mechanical dispatch.
* **Not noticing the single point of failure.** The star's simplicity is bought at a specific cost: if the supervisor itself goes down, every specialist loses its only link to the rest of the system at once.

## Quick check

<details><summary>1. Why does the star topology need only 4 links for 4 specialists, while a full mesh of the same 4 agents needs 6?</summary>
In a star, each specialist needs exactly one link, to the supervisor — that's n links total. A full mesh needs a separate link for every pair of agents, which is n(n−1)/2 — 6 for n=4, since specialists in a mesh also connect directly to each other.
</details>

<details><summary>2. What's the one thing a specialist in a supervisor pattern never does?</summary>
Talk directly to another specialist — every piece of communication, in both directions, goes through the supervisor.
</details>

<details><summary>3. What does a supervisor pattern have in common with plain routing between prompts?</summary>
The same core mechanism: classify the incoming work and dispatch it to whichever specialist is built to handle that category — the only difference is that the specialist here is a full agent rather than a single prompt.
</details>

## Key terms

* **Supervisor (orchestrator):** the single agent that routes subtasks to specialists and collects their results, with no direct specialist-to-specialist communication.
* **Star (hub-and-spoke) topology:** a communication structure where every participant links only to a central hub, never to each other.
* **Single point of failure:** a component whose failure disconnects every participant that depended solely on it.

## Related

[[Routing Between Specialized Prompts]] · [[Pipeline and Sequential Handoff]] · [[Swarm and Peer-to-Peer Coordination]]
