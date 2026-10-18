A single call asked to analyze a market, project financials, and assess risk, all in one response, often trails off after the first section or two — there was only so much the model would produce before it ran out of room. An orchestrator that first splits the task into exactly those three pieces and assigns each to its own worker call guarantees every piece gets its own fresh output, instead of competing for the same shrinking budget.

**You need:** [[Parallelization: Sectioning and Voting]].

## The question it answers

"What do you do when a task's pieces can't be known in advance, the way sectioning assumes they can?" Sectioning (the previous topic) works when the subtasks are fixed ahead of time — a developer decides "three report sections" before any call runs. The **orchestrator-workers** pattern handles the case where the pieces themselves need to be figured out first: an orchestrator call decides what the subtasks *are*, dynamically, then dispatches one worker call per subtask and assembles their results.

## Intuition

A project manager who is handed "write this quarterly report" doesn't try to write the whole thing alone in one sitting — they first decide the report needs a market analysis, financial projections, and a risk assessment, then hand each piece to a specialist who writes just that section. Nobody runs out of room partway through, because nobody is asked to produce all three sections inside one budget.

## Definition and notation

```text
single call:        one generation, fixed length budget, covering as many sections as fit
orchestrator-workers: orchestrator → {subtask₁, subtask₂, subtask₃} → one worker call per subtask → assemble
```

## A worked example

A quarterly report with three required sections, compared under a single big call versus orchestrator-workers:

```text
required sections: market analysis, financial projections, risk assessment

single big call:          covers 2 of 3 sections (market analysis, financial projections)
                           — ran out of room before reaching risk assessment
orchestrator-workers:     covers 3 of 3 sections
                           — each section is its own worker call with its own full budget
```

The single call's shortfall isn't a quirk of one bad generation — it's structural: all three sections compete for the same response budget, so whichever section comes last is the one most likely to be cut short or skipped. Giving each section its own worker call removes that competition entirely.

## Bench

```bench
id: orchestrator-workers
title: Guaranteed coverage, one worker per piece
fallback: Compare a single big call that ran out of room against an orchestrator assigning one worker to each section.
```

**Try this**

1. Look at the single big call's coverage and notice which section never gets reached.
2. Switch to orchestrator-workers and see all three sections covered.
3. Imagine a report with ten required sections instead of three — would the single-call shortfall get better or worse?

**What you should notice:** the orchestrator's job is deciding *what the subtasks are* before any worker runs — unlike sectioning, where the subtasks were already fixed in advance by whoever designed the workflow.

## Where it appears in AI

* **Orchestrator-workers extends [[Parallelization: Sectioning and Voting|sectioning]]** to tasks where the subtasks aren't known ahead of time — the orchestrator's dynamic decomposition step is the one piece sectioning doesn't need.
* **[[Goal Decomposition into Subtasks]] is the general mechanism behind the orchestrator's decomposition step**, applied here specifically to spawning parallel worker calls.
* **[[Supervisor/Orchestrator Patterns]] is the multi-agent version of the same structure**: workers become full agents rather than single calls, and the orchestrator's assembly step becomes an ongoing coordination job.

## Common pitfalls

* **Using a single call for a task whose required pieces are numerous or unpredictable.** The worked example's shortfall (missing the third of three sections) only gets worse as more sections are required — eventually no single call's budget covers them all.
* **Skipping the orchestrator's decomposition step and hard-coding subtasks instead.** If the subtasks really are fixed in advance, plain sectioning already covers that case more simply; orchestrator-workers earns its extra complexity only when the decomposition itself needs to happen dynamically.
* **Forgetting the assembly step.** Running three independent worker calls is only half the pattern — something still has to combine market analysis, financial projections, and risk assessment into one coherent report.

## Quick check

<details><summary>1. Why does the single big call cover only 2 of 3 sections in the worked example?</summary>
All three sections compete for the same fixed response budget in one generation, so whichever section comes last in the response is the most likely to be cut short or never reached at all.
</details>

<details><summary>2. What does the orchestrator do that a plain sectioning workflow doesn't?</summary>
It decides what the subtasks actually are, dynamically, before dispatching worker calls — sectioning assumes the subtasks were already fixed in advance by the workflow's designer.
</details>

<details><summary>3. Why doesn't giving each section its own worker call reintroduce the single call's shortfall?</summary>
Each worker call gets its own independent response budget, so one section's length no longer competes with another's — nothing is squeezed out by what came before it.
</details>

## Key terms

* **Orchestrator-workers:** a pattern where an orchestrator call dynamically decides a task's subtasks, then dispatches one worker call per subtask and assembles the results.
* **Dynamic decomposition:** figuring out what a task's pieces are at run time, rather than fixing them in advance.
* **Assembly step:** combining the separate worker calls' outputs into one coherent final result.

## Related

[[Parallelization: Sectioning and Voting]] · [[Goal Decomposition into Subtasks]] · [[Supervisor/Orchestrator Patterns]]
