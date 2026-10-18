When an agent's final answer is wrong, the final answer alone almost never says why. Observability means recording what happened at every step along the way — which tool was called, with what input, and what came back — so a failed run can actually be diagnosed instead of just noticed.

**You need:** [[Anatomy of an Agent Architecture]].

## The question it answers

"How do you actually find out why an agent run went wrong?" Without any instrumentation beyond the final output, a run's intermediate steps leave no trace at all — if step 8 of 12 called the wrong tool, nothing about that is visible once the run finishes. **Tracing** records each step as its own span: which tool was called, what input it received, what it returned, how long it took, and what it cost. With tracing, every intermediate step is individually inspectable after the fact; without it, none of them are.

## Intuition

A flight that lands late with no further explanation tells you almost nothing about which leg of a multi-stop journey caused the delay. A full itinerary with a timestamp at every stop — departure, each layover, arrival — lets you point to exactly where the delay happened, instead of only knowing that it did.

## Definition and notation

```text
without tracing:  intermediate steps visible = 0  (only the final output exists)
with tracing:      intermediate steps visible = n  (every step's tool, input, output recorded as a span)
```

## A worked example

A 12-step agent trajectory, compared with and without tracing:

```text
without tracing: 0 / 12 intermediate steps visible
with tracing:    12 / 12 intermediate steps visible
```

If the run's final answer turns out wrong, "0 of 12 visible" means there is no way to tell which step caused it without re-running the whole trajectory and hoping to reproduce the same failure — which an agent calling real tools with real side effects (booking something, sending an email) may not even be safe to do twice. "12 of 12 visible" means the specific step that went wrong is simply there to look at.

## Bench

```bench
id: observability-tracing
title: What a run actually left behind
fallback: Toggle tracing on and off and see how many of a trajectory's intermediate steps stay inspectable afterward.
```

**Try this**

1. With tracing off, look at how many steps are recorded.
2. Turn tracing on and watch every step become inspectable.
3. Slide the trajectory length up — does tracing's benefit grow, shrink, or stay the same as trajectories get longer?

**What you should notice:** tracing's benefit doesn't depend on how the run actually failed — it's a property of what was recorded in the first place, before anything is known to have gone wrong at all.

## Where it appears in AI

* **[[Error Attribution Across a Trajectory]] assumes tracing already exists** — its linear-scan-versus-binary-search comparison is about how *efficiently* to search a log that tracing already produced, not whether that log exists in the first place.
* **[[Production Agent Architecture]] is where these traces actually get recorded**, as part of running the loop itself rather than as an afterthought bolted on later.
* **A trace's per-step cost and latency fields are exactly what [[Cost and Latency of Agent Loops]] needs** to show where a loop's total cost actually accumulates, stage by stage.

## Common pitfalls

* **Logging only the final output and assuming that's enough.** The worked example shows this leaves zero of the run's intermediate steps inspectable — any debugging has to start from a complete re-run, not from evidence.
* **Recording a step's output without its input.** A span that shows what a tool returned but not what it was asked is only half the story — many failures come from the input being wrong, not the tool.
* **Treating tracing as a nice-to-have added after something goes wrong.** Tracing only helps with failures that happened *after* it was turned on — it has to be built into the loop from the start, not retrofitted once a specific bug shows up.

## Quick check

<details><summary>1. Why does a run with no tracing leave 0 of 12 intermediate steps visible, even though the run clearly did something at each of those 12 steps?</summary>
Without tracing, nothing records what happened at each individual step — only the final output exists afterward, so none of the 12 intermediate actions, tool calls, or results were ever captured anywhere.
</details>

<details><summary>2. What four things does a typical trace span record for one step?</summary>
Which tool was called, what input it received, what it returned, and how long it took (and typically its cost) — enough to reconstruct exactly what happened at that step without re-running anything.
</details>

<details><summary>3. Why might re-running a failed trajectory to find the bug not be a safe substitute for tracing?</summary>
Many agent actions have real side effects (booking something, sending a message, modifying a file) that aren't safe or even possible to repeat — tracing records what happened without needing to reproduce it.
</details>

## Key terms

* **Observability:** the ability to inspect what actually happened during a run after it finishes.
* **Tracing:** recording each step of a run as its own span, capturing its tool, input, output, latency and cost.
* **Span:** one recorded unit of a trace — typically one step's full record.

## Related

[[Error Attribution Across a Trajectory]] · [[Production Agent Architecture]] · [[Cost and Latency of Agent Loops]]
