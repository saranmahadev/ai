An agent built to summarize an inbox only needs to read email. Give it a mail tool that can also send, delete, and forward, and every one of those extra abilities sits there unused — right up until a mistake or a manipulated instruction tries to use one of them, at which point it turns out they were never blocked at all.

**You need:** [[Designing Tools for Agent Reliability]].

## The question it answers

"What's the actual cost of granting an agent more tool access than its task requires?" **Excessive agency** — a named risk in the OWASP Top 10 for LLM applications — is granting an agent permissions, tools, or autonomy beyond what its task genuinely needs. The cost isn't visible while everything goes to plan: an agent with four tools and one task behaves identically to an agent with just the one tool it needed, until something — a bug, a misunderstanding, or a manipulated instruction — tries to use one of the other three.

## Intuition

A guest given a key to every room in a house, when they only ever needed the guest bedroom, is no more likely to misbehave on an ordinary visit than a guest given just that one key. The difference only shows up the day something goes wrong — a child wanders off, a visitor with bad intentions shows up — and the house either has interior doors to stop them, or it doesn't.

## Definition and notation

```text
granted tools ⊇ required tools  →  excessive agency = granted tools − required tools
attacker-achievable actions = attempted actions ∩ granted tools
```

## A worked example

A task that genuinely requires only reading email, compared against four tools an attacker (via a manipulated instruction) attempts to use:

```text
attempted actions:  read, forward, delete, pay

broad scope (all 4 tools granted):            4 of 4 actions succeed
least-privilege scope (read only, matches task): 1 of 4 actions succeeds
```

Under broad scope, every attempted action has a matching tool and simply runs. Under least-privilege scope, three of the four attempts have no tool to use at all — they aren't blocked by a judgment call that could go either way, they're mechanically impossible, because the capability to forward, delete, or pay was never granted in the first place.

## Bench

```bench
id: excessive-agency-scope
title: Only the tools the task actually needs
fallback: Compare how many of an attacker's desired actions succeed under broad vs. least-privilege tool grants.
```

**Try this**

1. Check the broad-scope list and note all four actions succeed.
2. Switch to least-privilege and see three actions fail for having no matching tool.
3. Imagine the read tool itself returned sensitive data — would narrowing the scope to read-only fully eliminate risk, or only the risk from the other three tools?

**What you should notice:** least-privilege scope doesn't make the agent smarter about which actions are appropriate — it removes the *capability* for the inappropriate ones entirely, which holds regardless of what instruction (legitimate or injected) asks for them.

## Where it appears in AI

* **This is the same reachability idea as [[Sandboxing and Isolation]], applied to tool grants instead of filesystem access** — both work by removing what's reachable, not by trusting judgment about what should be reachable.
* **[[Guardrails for Agent Actions]], next in this section, is the layer that still matters even within a granted tool** — scope limits decide which tools exist at all; a guardrail decides which specific calls to an allowed tool are still too risky to run.
* **[[Prompt Injection in Agent Contexts]] is exactly the failure mode excessive agency makes dangerous**: an injected instruction can only succeed at actions the agent was actually granted the tools to perform.

## Common pitfalls

* **Granting broad tool access "to be safe" in case the task changes later.** The worked example shows this reasoning backwards — broader access doesn't protect against task changes, it expands exactly what a mistake or manipulated instruction can achieve right now.
* **Reviewing an agent's prompt for safety while ignoring its tool grants.** A perfectly careful prompt paired with an overly broad set of tools still leaves every one of those tools available to anything that can influence the agent's next action, prompt quality aside.
* **Treating least-privilege as a one-time setup step.** As a task's requirements genuinely expand, its granted tools should expand to match — but that's a deliberate, reviewed change, not a default of granting broad access upfront and narrowing only if something goes wrong.

## Quick check

<details><summary>1. Why do 3 of the 4 attempted actions fail under least-privilege scope in the worked example?</summary>
The agent was only granted a read tool, so forward, delete, and pay have no matching tool at all — those three actions are impossible to execute, not merely discouraged.
</details>

<details><summary>2. What's the difference between excessive agency and a judgment mistake?</summary>
A judgment mistake is the agent choosing a bad action among the ones it's capable of; excessive agency is granting capabilities beyond what the task needs in the first place, which widens what any mistake (or manipulated instruction) could achieve.
</details>

<details><summary>3. Does narrowing scope to read-only eliminate every risk from the read tool itself?</summary>
No — scope limits remove risk from capabilities the agent was never granted; a tool that is granted can still be misused within what it allows (for example, a read tool returning sensitive data), which is why scope limits are paired with guardrails on the calls that remain possible.
</details>

## Key terms

* **Excessive agency:** granting an agent tools, permissions, or autonomy beyond what its task requires.
* **Least-privilege scope:** granting only the tools a task genuinely needs, nothing more.
* **Attacker-achievable actions:** the actions an attempted manipulation can actually carry out, limited by which tools were granted.

## Related

[[Designing Tools for Agent Reliability]] · [[Sandboxing and Isolation]] · [[Guardrails for Agent Actions]]
