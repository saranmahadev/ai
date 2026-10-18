Applying a discount to 200 items one tool call at a time costs 200 separate round trips, each one a full request and response. Writing a short piece of code that loops over all 200 items and calls the same underlying function internally costs one round trip — the model produces the loop once, and a sandbox runs it however many times is needed.

**You need:** [[Designing Tools for Agent Reliability]].

## The question it answers

"Does every action an agent takes need to be its own separate tool call?" Structured function calling gives the model one discrete, schema-checked call per action — reliable and easy to validate, but a loop over many items costs one call per item. Letting the model instead write a short piece of **code** that calls already-defined functions, with real loops and conditionals, lets a single generated call express arbitrarily much control flow, executed all at once in a sandbox rather than round-tripped back to the model at every step.

## Intuition

Asking an assistant to update 200 spreadsheet rows one instruction at a time ("update row 1," wait for confirmation, "update row 2," wait again...) takes 200 back-and-forth exchanges. Handing the assistant a short script that says "for each row, do this update" and letting them run it once accomplishes exactly the same 200 updates in a single instruction.

## Definition and notation

```text
structured tool calls(n items) = n            (one call per item)
code-as-tool calls              = 1            (one call, however many items the code loops over)
```

## A worked example

Applying one operation to a growing number of items, under both interfaces:

```text
n = 10 items:   structured calls = 10    code-as-tool calls = 1
n = 50 items:   structured calls = 50    code-as-tool calls = 1
n = 200 items:  structured calls = 200   code-as-tool calls = 1
```

The structured interface's call count scales directly with the number of items — ten times the items, ten times the calls. The code interface's call count never moves, because the looping itself happens inside the one call's generated code, not across repeated round trips to the model.

## Bench

```bench
id: code-as-tool-interface
title: One call per item, or one loop
fallback: Compare total tool calls needed to process a growing number of items under structured calling versus code as the interface.
```

**Try this**

1. Slide the item count up and watch the structured-calls bar grow while the code-as-tool bar stays flat.
2. Imagine each structured call also costs a fixed network round-trip delay — how would that change the total time, not just the call count, as items grow?
3. Think of an operation where each item's handling genuinely depends on the result of handling the previous one — would code-as-tool still save calls the same way?

**What you should notice:** the saving comes specifically from moving a loop that's genuinely repetitive into the generated code itself — it isn't a universal replacement for structured calls, just a better fit whenever the actual task is "do this same thing many times."

## Where it appears in AI

* **This is the same call-count logic behind [[Orchestrator-Workers]] and sectioning, in reverse**: those patterns split one task into many separate calls when the pieces genuinely need independent handling; code-as-tool collapses many repetitive pieces back into one call when they don't.
* **[[Code-Execution Agents]], covered in the next district, is the full environment built around this idea** — an execution sandbox, state carried between code snippets, and the broader question of what an agent can do once code itself is its action space. This topic is specifically about the *interface* choice; that one is about the environment it runs in.
* **Structured function calling still has real advantages this topic doesn't erase**: its schema makes every individual action easy to validate and log, which a freeform code blob makes harder to inspect before it runs.

## Common pitfalls

* **Using code-as-tool for operations that genuinely need per-item oversight.** Collapsing 200 individually risky actions (each needing a human or verification check before proceeding) into one uninterrupted loop removes the checkpoints a structured per-item call would have given.
* **Assuming the call-count saving means code-as-tool is strictly better.** It trades call count for a loss of per-action granularity and schema validation — a real cost, not a free win, for tasks where that granularity mattered.
* **Writing code that calls undefined or unsafe operations.** The safety of this pattern depends entirely on the sandbox only exposing the same already-vetted functions a structured interface would have exposed directly — it isn't a license for the model to call anything it can imagine.

## Quick check

<details><summary>1. Why does the structured interface's call count scale directly with the number of items while code-as-tool's doesn't?</summary>
Structured calling requires a separate round trip for every action, so repeating an action n times costs n calls. Code-as-tool expresses the repetition as a loop inside one generated snippet, so the loop itself runs inside a single call regardless of how many times it iterates.
</details>

<details><summary>2. What does code-as-tool give up in exchange for its lower call count?</summary>
Per-item granularity and schema validation — a structured call can be checked and logged individually before it runs, while a code snippet's internal loop iterations aren't individually inspected the same way before the whole thing executes.
</details>

<details><summary>3. When would code-as-tool not actually save any calls compared to structured calling?</summary>
When each item's handling genuinely depends on an earlier item's result in a way that needs to be checked or decided by the model between iterations — at that point the task isn't a simple repetitive loop, and collapsing it into one call loses exactly the oversight that made per-item calls useful.
</details>

## Key terms

* **Code as a tool-calling interface:** letting a model express an action (including loops and conditionals) as generated code executed in a sandbox, rather than as one discrete structured call per action.
* **Structured function calling:** a schema-checked tool call representing exactly one discrete action.
* **Call count:** the number of model-to-tool round trips a given approach requires for a task.

## Related

[[Designing Tools for Agent Reliability]] · [[Orchestrator-Workers]] · [[Code-Execution Agents]]
