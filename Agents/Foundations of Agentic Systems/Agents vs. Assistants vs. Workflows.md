"Agent" gets used loosely enough that a chatbot, a fixed multi-step pipeline, and a genuinely autonomous loop all sometimes get called one. They're not the same thing, and picking the wrong one for a task costs real reliability or real flexibility, depending on which way the mismatch goes.

**You need:** [[From a Single Call to a Loop]].

## The question it answers

"What actually tells an assistant, a workflow and an agent apart?" An **assistant** is a single-turn (or simply-turn-taking) conversational call — fast and cheap, but it can't reliably drive itself through a multi-step task. A **workflow** is a fixed, developer-coded sequence of calls — highly predictable for the specific steps it was built for, but it can't adapt beyond that script. An **agent** decides its own next step at run-time based on what's happened so far — flexible enough for open-ended tasks, at the cost of being far less predictable.

## Intuition

A receptionist who answers one question at a time is the assistant. A printed checklist that always runs the same five steps in the same order is the workflow — reliable, as long as the situation matches what the checklist assumed. A problem-solver who improvises a new plan based on whatever they find is the agent — adaptable, but you can't predict exactly what they'll do next.

## Definition and notation

```text
score(system, weights) = Σ system[dimension] × weights[dimension] / Σ weights[dimension]
```

Each system scored on predictability, flexibility, cost (higher = cheaper) and autonomy (ability to run without a human driving each step).

## A worked example

Three systems, scored 0–1 on four dimensions, under two different task types:

```text
              predictability  flexibility  cost  autonomy
assistant          0.30          0.40      0.95    0.05
workflow           0.95          0.20      0.80    0.50
agent              0.45          0.95      0.30    0.95

well-defined, multi-step task:   workflow 0.815  >  agent 0.520  >  assistant 0.398
open-ended, novel task:           agent 0.835  >  workflow 0.395  ≈  assistant 0.375
```

For a well-defined task, the workflow wins decisively — its high predictability is worth the most when the weights favor getting the same, correct steps done reliably. For an open-ended task, the ranking flips entirely: the agent's flexibility and autonomy make it the clear winner, while the workflow (rigid) and the assistant (can't drive multiple steps at all) both struggle about equally.

## Bench

```bench
id: agent-vs-assistant-vs-workflow
title: Different tasks want different structures
fallback: Switch the task type and see which of an assistant, a workflow or an agent actually scores best.
```

**Try this**

1. Check the well-defined task scenario and note the workflow wins clearly.
2. Switch to the open-ended scenario and watch the ranking flip entirely.
3. Think of a real task you'd assign to each of the three — would your intuition match these numbers?

**What you should notice:** the workflow and the assistant land close together on the open-ended task — neither is actually built for genuine flexibility, so the gap between "rigid but reliable" and "simple but limited" stops mattering once the task stops being well-defined.

## Where it appears in AI

* **This reuses the exact weighted-scoring mechanism already used for choosing a model** ([[Choosing a Model for a Task]]) **and choosing between RAG, fine-tuning and long-context** ([[RAG vs. Fine-Tuning vs. Long-Context]]) — the same lesson (the right structure depends on the task) recurs at this level too.
* **[[Workflow Patterns Before Autonomy]] is specifically about the structured, workflow side of this choice** — the patterns worth reaching for before deciding a task actually needs full agentic autonomy.
* **[[When Planning Hurts More Than It Helps]] covers the symmetric mistake**: reaching for an agent's flexibility on a task simple enough that a workflow (or no loop at all) would have done better.

## Common pitfalls

* **Defaulting to "agent" for every multi-step task.** The worked example shows a workflow beats an agent decisively on a well-defined task — autonomy isn't free, and it costs predictability a well-defined task doesn't need to spend.
* **Assuming a workflow can handle a task it wasn't specifically built for.** A workflow's high predictability only holds for the exact steps it was coded to run — present it with something outside that script and it has no mechanism to adapt.
* **Assuming an assistant can be turned into a workflow or agent just by asking it nicely.** The distinction is architectural (does something outside the single call decide and drive the next step), not a matter of prompting the same single call harder.

## Quick check

<details><summary>1. In the worked example, why does the workflow score so much higher than the agent on the well-defined task, despite the agent being more capable overall?</summary>
The well-defined task's weights heavily favor predictability, where the workflow scores far higher (0.95 vs. 0.45) — the agent's extra flexibility and autonomy don't make up for being meaningfully less predictable, when predictability is what the task actually needs.
</details>

<details><summary>2. Why do the workflow and the assistant end up scoring so similarly on the open-ended task?</summary>
Neither is built for genuine adaptability — the workflow is rigid by design, and the assistant can't drive itself through multiple steps at all — so once the task stops being well-defined, their different strengths (reliability vs. simplicity) stop mattering much.
</details>

<details><summary>3. What's the architectural difference between a workflow and an agent, beyond just "a workflow is simpler"?</summary>
A workflow's sequence of steps is fixed by the developer in advance; an agent decides its own next step at run-time based on what's happened so far — the workflow's steps don't change based on intermediate results the way an agent's can.
</details>

## Key terms

* **Assistant:** a single-turn or simply-turn-taking conversational system with no autonomous multi-step drive.
* **Workflow:** a fixed, developer-coded sequence of calls, predictable but inflexible.
* **Agent:** a system that decides its own next step at run-time, flexible but less predictable.

## Related

[[From a Single Call to a Loop]] · [[Workflow Patterns Before Autonomy]] · [[When Planning Hurts More Than It Helps]]
