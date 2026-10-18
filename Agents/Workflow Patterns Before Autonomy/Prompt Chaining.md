Splitting a task into a fixed sequence of calls — outline, then draft, then polish — lets each step check the previous one's work before building on it. A malformed outline gets caught right there, before it wastes an entire draft written from something that was never going to work.

**You need:** [[Anatomy of an Agent Architecture]].

## The question it answers

"How do you split one task into smaller, checkable steps, without needing full agentic autonomy to do it?" Prompt chaining runs a fixed sequence of LLM calls, each one's output feeding into the next, with a **validation gate** between steps that checks an intermediate result before it's allowed to proceed. The sequence itself (what step comes after what) is decided in advance by the developer — nothing here decides its own next step the way an agent does; the structure is simply broken into smaller, individually checkable pieces.

## Intuition

A copyeditor who reviews a chapter's outline before the author writes a single page of the chapter itself catches a missing section immediately — far cheaper than discovering it's missing only after the whole chapter is drafted around a gap that was never there.

## Definition and notation

```text
chain:  step1 → gate(result1) → step2 → gate(result2) → step3 → ...
gate(result) = passes if result has every field the next step needs
```

## A worked example

Three generated outlines, each checked by a gate requiring an intro, a body, and a conclusion, before any of them would be drafted:

```text
outline 1: intro, body, conclusion  → passes gate → proceeds to draft
outline 2: intro, body              → fails gate → caught before drafting (missing conclusion)
outline 3: intro, body, conclusion  → passes gate → proceeds to draft

2 of 3 proceed; 1 is caught before an entire draft step gets wasted on it
```

Outline 2's problem — a missing conclusion section — is detectable the instant the outline itself is produced. Catching it there, rather than only noticing the final draft has no conclusion, saves an entire wasted drafting step.

## Bench

```bench
id: prompt-chaining-gate
title: Checking the outline before writing the draft
fallback: Step through a chained pipeline and watch its validation gate catch a malformed intermediate result.
```

**Try this**

1. Step through all three outlines and watch the gate's verdict on each.
2. Notice outline 2 is caught *before* any drafting step runs on it.
3. Imagine the gate didn't exist — at what point would the missing conclusion finally get noticed?

**What you should notice:** the gate's check doesn't require understanding the whole task — it only needs to verify the one thing the next step actually depends on, which is cheap to check and catches the problem at the earliest possible point.

## Where it appears in AI

* **This is the structured, developer-controlled version of the gate check [[Open-Loop vs. Closed-Loop Behavior]] already covered**: a chain's gate is exactly a closed-loop check, applied between fixed steps rather than inside an autonomous loop.
* **[[Routing Between Specialized Prompts]] is the other common workflow pattern for splitting work**, choosing which single prompt handles a request rather than running a fixed sequence of several.
* **A chain's steps are themselves the kind of single augmented-LLM calls covered in [[The Augmented LLM]]** — chaining is an arrangement of that building block, not a different mechanism.

## Common pitfalls

* **Skipping the gate "to save a step."** The worked example shows exactly what that costs — a malformed intermediate result flows straight into an expensive next step instead of being caught cheaply where it happened.
* **Writing a gate that checks too little.** A gate that only checks "is there any text at all" would pass outline 2 despite its missing conclusion — the gate needs to check the specific fields the next step actually depends on.
* **Reaching for full agentic autonomy when a fixed chain would do.** If the sequence of steps is known in advance and doesn't need to change based on what happens, a chain is simpler and more predictable than a loop that decides its own next step.

## Quick check

<details><summary>1. Why does outline 2 get caught before the draft step, rather than after?</summary>
The gate checks the outline's own fields immediately after it's produced, and a missing conclusion section is detectable right there — there's no need to wait until a draft is written to notice something the outline already lacked.
</details>

<details><summary>2. What's the minimum a gate needs to check to be useful?</summary>
Specifically the fields or properties the *next* step actually depends on — a gate that checks something irrelevant to the next step wouldn't catch the failure that actually matters.
</details>

<details><summary>3. Is prompt chaining an example of agentic autonomy?</summary>
No — the sequence of steps is fixed in advance by the developer; nothing in the chain decides its own next step based on results the way a genuinely autonomous agent would.
</details>

## Key terms

* **Prompt chaining:** a fixed sequence of LLM calls, each one's output feeding into the next.
* **Validation gate:** a check between chained steps that verifies an intermediate result before letting it proceed.
* **Workflow pattern:** a structured, developer-controlled arrangement of calls, as opposed to an autonomous agent's self-directed loop.

## Related

[[Open-Loop vs. Closed-Loop Behavior]] · [[Routing Between Specialized Prompts]] · [[The Augmented LLM]]
