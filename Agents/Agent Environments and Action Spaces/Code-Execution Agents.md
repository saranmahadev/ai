Running code one snippet at a time from a clean slate means every new snippet has to re-establish everything the previous ones already set up — reload the data, redefine the variables — before it can do anything new. A persistent execution environment, the kind a notebook or REPL gives you, remembers what came before, so each new snippet only has to add its own piece.

**You need:** [[Code as a Tool-Calling Interface]].

## The question it answers

"What does an agent need from the *environment* it executes code in, beyond the ability to run code at all?" [[Code as a Tool-Calling Interface]] covered writing code as the action itself, instead of calling one structured tool per primitive step. This topic is about what that code runs *inside*: a **stateful** execution environment (variables, loaded data and open connections persist between calls) versus a **stateless** one (every call starts from nothing and must re-establish its own setup).

## Intuition

A chef working at the same station all day keeps their knives, prepped ingredients and pans exactly where they left them between dishes. A chef forced to tear down and rebuild their entire station from scratch before each dish wastes most of their time on setup that was already done minutes earlier — every dish after the first pays the same fixed cost all over again.

## Definition and notation

```text
stateful (persistent) total code volume over n steps:    n × (code per step)
stateless (resend-everything) total over n steps:  n(n+1)/2 × (code per step)
```

## A worked example

A four-step data pipeline (load, filter, aggregate, format), where each step depends on the previous one's result:

```text
stateful total:   4 units of code  (each step sends only its own new code)
stateless total:  10 units of code  (step n must resend all n prior steps' code)
ratio:            2.5× more code sent and re-executed, stateless vs. stateful
```

The stateless total isn't just "a bit more" — it grows as a triangular number (1+2+3+4 = 10), so the gap between the two widens as the pipeline gets longer, not just a fixed multiple of it.

## Bench

```bench
id: code-execution-state
title: Remembering between steps, or starting over
fallback: Slide the number of pipeline steps and compare total code volume between a stateful and a stateless execution environment.
```

**Try this**

1. At 4 steps, confirm the stateless total is 10 and the ratio is 2.5×.
2. Slide the step count up to 8 and watch the ratio keep growing.
3. Imagine a pipeline with 20 steps — would you expect the ratio to be larger or smaller than at 8?

**What you should notice:** the ratio itself grows with pipeline length — a stateless environment doesn't cost "some fixed amount more," it costs proportionally more the longer the task runs, which matters a great deal for a long-running agent.

## Where it appears in AI

* **This extends [[Code as a Tool-Calling Interface]]**, which covered choosing code as the action representation at all; this topic is specifically about what persists across the calls that representation produces.
* **[[Shared State Across a Multi-Step Task]], already covered in the memory district, is the general version of this same problem** — a code-execution sandbox's persistent variables are one concrete mechanism for carrying state between steps, alongside a blackboard or shared document.
* **[[Hybrid Code-and-GUI Action Spaces]], the next topic, has to decide when code execution (with its own state model) is the right tool at all**, versus clicking through an interface instead.

## Common pitfalls

* **Resetting the execution environment between every tool call "to be safe."** The worked example shows this isn't free — it multiplies the code volume sent and re-executed, and that multiplier grows with task length.
* **Assuming persistent state is strictly better with no downsides.** A long-running sandbox accumulates stale variables and side effects across unrelated tasks if it's never reset — the right lifetime for persistent state is the task, not forever.
* **Confusing "stateful execution" with "stateful conversation."** The code environment's variables and the agent's own memory of what it's doing are two different kinds of state, often with different lifetimes.

## Quick check

<details><summary>1. Why does the stateless total (10) more than double the stateful total (4) at n=4, rather than just doubling?</summary>
The stateless total grows as a triangular number (1+2+3+4), because step n has to resend all n prior steps' code, not just its own — the gap compounds with every added step rather than staying a fixed multiple.
</details>

<details><summary>2. What's the key difference between a stateful and a stateless code-execution environment?</summary>
A stateful environment keeps variables, loaded data and other setup alive between calls; a stateless one starts fresh each call, so anything from a previous step has to be re-established before new work can happen.
</details>

<details><summary>3. Does a longer pipeline make the stateless-vs-stateful gap better or worse?</summary>
Worse — the ratio between the two totals grows with the number of steps, since the stateless total scales roughly with the square of step count while the stateful total scales linearly.
</details>

## Key terms

* **Stateful (persistent) execution:** a code environment whose variables and setup persist across separate calls.
* **Stateless execution:** a code environment that starts fresh each call, with nothing carried over from before.
* **Triangular growth:** a quantity that grows as 1+2+3+...+n, compounding faster than a fixed multiple of n.

## Related

[[Code as a Tool-Calling Interface]] · [[Shared State Across a Multi-Step Task]] · [[Hybrid Code-and-GUI Action Spaces]]
