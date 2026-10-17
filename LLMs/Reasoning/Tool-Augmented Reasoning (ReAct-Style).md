No amount of chain-of-thought or tree search fixes a problem the model simply can't solve on its own — exact large-number arithmetic, a live lookup, running actual code. For that, reasoning needs to reach outside itself.

**You need:** [[Chain-of-Thought Prompting]], [[Code Generation and Program Synthesis]].

## The question it answers

"How does a model combine reasoning with calling an external tool mid-task?" The **ReAct** pattern interleaves **Thought** (reasoning about what to do next), **Action** (calling a tool — a calculator, a search function, code execution), and **Observation** (the tool's actual result), repeated as many times as needed before a final **Answer**. The tool handles whatever the model itself is unreliable at; the model's own reasoning handles deciding *when* and *how* to use it.

## Intuition

A person doing mental arithmetic on small numbers is usually fine; asked to multiply two large, awkward numbers precisely, most people reach for a calculator rather than trusting their own mental math. The calculator doesn't replace their reasoning about the problem — it replaces the one specific sub-step (precise large-number arithmetic) that mental computation is unreliable at. ReAct gives a model the same option: reason about the problem, recognize a sub-step that calls for an external tool, use the tool, and continue reasoning with its exact result in hand.

## Definition and notation

```text
ReAct loop:
  Thought:     reasoning about what to do next
  Action:      a call to an external tool, with specific arguments
  Observation: the tool's actual returned result
  (repeat Thought → Action → Observation as needed)
  Answer:      the final response, informed by every observation so far
```

## A worked example

Computing `847 × 293` two different ways:

```text
mental-math-only guess:  248,000        — WRONG (true value: 248,171)

ReAct-style trace:
  Thought: I need 847 × 293. Let me estimate... roughly 248,000.
  Action:  call calculator(847, 293)
  Observation: 248171
  Answer: 248171                        — CORRECT
```

The model's own "mental" estimate (248,000) was wrong by 171 — a small but real error, exactly the kind large-number multiplication is prone to without a tool. Calling the calculator mid-reasoning replaced that one unreliable sub-step with an exact result, which the final answer then used directly.

## Bench

```bench
id: react-tool-call
title: Thought, action, observation, answer
fallback: Step through a ReAct-style trace and compare the mental-math-only guess against the tool-augmented exact answer.
```

**Try this**

1. Look at the initial "Thought" stage's rough mental estimate.
2. Step through the "Action" and "Observation" stages.
3. Compare the final answer to the original mental estimate.

**What you should notice:** the model's own reasoning (recognizing it needed precise multiplication, and deciding to call a tool for it) is doing real work here — the tool only handles the one specific computation it was asked for, not the whole problem.

## Where it appears in AI

* **Production "agentic" LLM systems use this exact pattern constantly**: deciding when to search the web, run code, query a database, or call any other external function, interleaved with ordinary reasoning about the overall task.
* **[[Structured Output and Tool-Calling APIs|the practical mechanics of a tool call]] — getting a model to emit a well-formed function call with the right arguments — is a separate, engineering-level concern from the ReAct reasoning pattern itself.**
* **It's the direct ancestor of what later became formalized as [[Agents|agentic systems]]** on the next planet — repeated cycles of reasoning, acting, and observing results, chained together to complete a larger task.

## Common pitfalls

* **Assuming a model always correctly recognizes when it needs a tool.** A model can just as easily attempt (and fail at) a calculation it should have delegated, or call a tool unnecessarily for something it could handle directly.
* **Treating tool results as infallible once retrieved.** The tool's observation is only as reliable as the tool itself — a flawed or outdated external tool can feed wrong information into otherwise sound reasoning.
* **Forgetting the loop can repeat.** Real tasks often need several rounds of thought-action-observation, not just one tool call — a single call is the simplest case, not the general pattern.

## Quick check

<details><summary>1. What are the four stages of the ReAct loop, in order?</summary>
Thought (reasoning about what to do next), Action (calling an external tool), Observation (the tool's actual result), and Answer (the final response) — with Thought, Action and Observation potentially repeating before a final Answer.
</details>

<details><summary>2. In the worked example, why was the mental-math-only guess wrong while the tool-augmented answer was correct?</summary>
Precise multiplication of large numbers is a sub-step the model itself is unreliable at; the calculator tool performed that exact computation instead, replacing the model's rough mental estimate with an exact result.
</details>

<details><summary>3. What does the model's own reasoning handle in a ReAct loop, versus what the tool handles?</summary>
The model's reasoning decides when and how to use a tool (recognizing which sub-steps need it, and with what arguments); the tool itself performs the specific operation (calculation, lookup, code execution) the model delegated to it.
</details>

## Key terms

* **ReAct:** a pattern interleaving reasoning (Thought), tool calls (Action), and tool results (Observation) before a final answer.
* **Tool-augmented reasoning:** reasoning that delegates specific sub-steps to external tools rather than attempting them directly.
* **Observation:** the actual result returned by a tool call, used to inform subsequent reasoning.

## Related

[[Chain-of-Thought Prompting]] · [[Code Generation and Program Synthesis]] · [[Structured Output and Tool-Calling APIs]]
