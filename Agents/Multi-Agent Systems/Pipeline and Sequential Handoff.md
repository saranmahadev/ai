A research agent hands its findings to a drafting agent, which hands its draft to a review agent, which hands its approval to a finalizing agent. Each stage is a fixed, known step in a chain — the order never changes, and each stage only ever talks to the one right after it.

**You need:** [[Supervisor-Orchestrator Patterns|Supervisor/Orchestrator Patterns]].

## The question it answers

"What's the simplest way to wire several specialist agents in a fixed sequence?" A pipeline runs a fixed chain of agents, each one handing its output directly to the next — no central router deciding where things go, because the order is already known in advance. This is [[Prompt Chaining|prompt chaining]], one level up: the "steps" in the chain are now full agents rather than single calls, and the validation gate between them can check an entire stage's output before the next agent ever sees it.

## Definition and notation

```text
pipeline: stage1 → gate(result1) → stage2 → gate(result2) → stage3 → stage4
no gate:  a flaw at stage k flows into every later stage, wasting (total − k) stages
gate:     a flaw at stage k is caught at the handoff — 0 later stages wasted
```

## Intuition

An assembly line where each station passes its work straight to the next one, and nowhere in between, only works smoothly if a flawed part gets caught at the handoff rather than quietly continuing down the line. A line with inspection at every handoff stops wasting the later stations' work on something already broken; a line without it keeps assembling around a flaw until the final inspection finally catches it.

## A worked example

A 4-stage report pipeline, with a flaw introduced at stage 2, compared with and without a validation gate at each handoff:

```text
stages: research → draft → review → finalize
flaw appears at stage 2 (draft)

no gate between stages:
  stage 1 (research): runs normally
  stage 2 (draft):     produces the flaw
  stage 3 (review):    runs anyway, on flawed input     ← wasted
  stage 4 (finalize):  runs anyway, on flawed input     ← wasted
  stages wasted: 4 − 2 = 2

gated handoff:
  stage 1 (research): runs normally
  stage 2 (draft):     produces the flaw
  → caught at the handoff, before stage 3 ever runs
  stages wasted: 0
```

The gate doesn't make stage 2 any less likely to produce a flaw — what it changes is how much gets wasted *after* the flaw happens, by catching it at the very next handoff instead of letting it propagate.

## Bench

```bench
id: pipeline-handoff-gate
title: A flaw caught at handoff, or three stages later
fallback: Compare stages wasted on a flawed handoff with and without a per-stage validation gate.
```

**Try this**

1. Slide the flaw's stage earlier and later and watch how many stages get wasted without a gate.
2. Turn the gate on and see wasted stages drop to 0 regardless of where the flaw appears.
3. Imagine a flaw that the gate's check doesn't actually test for — what happens to the gate's benefit in that case?

**What you should notice:** the earlier a flaw appears in an ungated pipeline, the more later stages get wasted running on it — which is exactly why a gate's value grows with pipeline length, not just with how often flaws happen.

## Where it appears in AI

* **This is [[Prompt Chaining|prompt chaining]] with full agents as the chain's steps**, and its validation gate is the same mechanism, now checking an agent's whole output rather than one call's result.
* **[[Supervisor-Orchestrator Patterns|Supervisor/orchestrator patterns]] wire specialists through a central router instead**; a pipeline is the simpler case where the order is fixed enough that no router is needed at all.
* **[[Orchestrator-Workers]] runs its workers in parallel on independent subtasks**; a pipeline's stages are sequential and dependent on each other specifically because each one needs the previous stage's output.

## Common pitfalls

* **Treating a pipeline as fault-tolerant just because each stage is specialized.** Specialization helps each individual stage do its job well — it does nothing to stop a flawed result from flowing straight into the next stage unless something actually checks it at the handoff.
* **Putting the gate at the very end instead of between every stage.** A single check after the last stage catches a problem no earlier than the worked example's ungated case — the benefit specifically comes from checking at *every* handoff, not just the final one.
* **Assuming sequential means slow.** A pipeline's stages are sequential because each depends on the previous one's output, not because sequential execution is inherently the only option — independent work still belongs in [[Parallelization: Sectioning and Voting|sectioning]] instead.

## Quick check

<details><summary>1. In the worked example, why are exactly 2 stages wasted when the flaw appears at stage 2 of 4, without a gate?</summary>
Every stage after the one that produced the flaw (stages 3 and 4) runs on the flawed input anyway, since nothing checks it at the handoff — that's 4 total stages minus the 2 stages up to and including where the flaw appeared, leaving 2 wasted.
</details>

<details><summary>2. What's the key structural difference between a pipeline and a supervisor pattern?</summary>
A pipeline's order is fixed in advance and each stage hands off directly to the next; a supervisor pattern instead routes each piece of work through a central decision-maker that decides which specialist handles it.
</details>

<details><summary>3. Does adding a gate make a pipeline's individual stages less likely to produce a flaw?</summary>
No — the gate doesn't change how often a stage produces a flawed result; it changes how much work gets wasted after a flaw happens, by catching it at the very next handoff instead of letting it propagate further down the pipeline.
</details>

## Key terms

* **Pipeline:** a fixed sequence of specialist agents, each handing its output directly to the next.
* **Handoff:** the point where one stage's output becomes the next stage's input.
* **Validation gate (agent-level):** a check at a handoff that verifies a stage's output before the next stage runs on it.

## Related

[[Prompt Chaining]] · [[Supervisor-Orchestrator Patterns|Supervisor/Orchestrator Patterns]] · [[Orchestrator-Workers]]
