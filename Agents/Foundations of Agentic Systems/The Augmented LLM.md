A bare model call can only ever draw on what was baked into its weights during training. Give it a way to call tools, a way to remember across turns, and a way to search outside documents, and it can suddenly do things none of those weights alone ever could — act on the real world, recall a past conversation, answer from something it's never seen.

**You need:** [[Parametric vs. Non-Parametric Knowledge]], [[Structured Output and Tool-Calling APIs]].

## The question it answers

"What's the minimal set of additions that turns a plain model call into the building block almost every agent is made of?" Three additions, each already derived elsewhere on this road: tools ([[Structured Output and Tool-Calling APIs|the ability to call a function and act]]), memory (state that persists across turns), and retrieval ([[Parametric vs. Non-Parametric Knowledge|a document store searched at answer-time]]). None of these require a different model — they're capabilities wired around the same underlying call.

## Intuition

A brilliant scholar locked in a room with no phone, no notes and no library can only ever answer from what they've already memorized. Give them a phone (tools), a notebook they can write in and read back (memory), and a library card (retrieval), and the same scholar can now do things that were never possible from memorization alone — not because they got smarter, but because they're no longer limited to what's already in their head.

## Definition and notation

```text
augmented LLM = bare LLM + tools + memory + retrieval
```

## A worked example

Four capabilities, checked against a bare LLM and the same model augmented with tools, memory and retrieval:

```text
capability                                          bare LLM   augmented LLM
answer from training data alone                        ✓            ✓
take an action in the real world                         ✗            ✓
recall something from a past conversation                ✗            ✓
answer using a document it's never seen                   ✗            ✓
```

A bare LLM handles exactly 1 of these 4 capabilities — whatever it can answer purely from its own training. Every other capability requires one of the three augmentations: tools to act, memory to recall, retrieval to answer from unseen documents.

## Bench

```bench
id: augmented-llm-capabilities
title: What augmentation actually unlocks
fallback: Compare what a bare LLM can do against the same model augmented with tools, memory and retrieval.
```

**Try this**

1. Switch to "bare LLM" and note only one capability is checked.
2. Switch to "augmented LLM" and see all four checked.
3. Match each newly unlocked capability to the specific augmentation (tools, memory, or retrieval) responsible for it.

**What you should notice:** each of the three new capabilities maps to exactly one augmentation — acting needs tools, recalling needs memory, answering from unseen documents needs retrieval — none of the three substitutes for either of the others.

## Where it appears in AI

* **This is the single building block nearly every pattern on this road is built from** — [[Workflow Patterns Before Autonomy]]'s structured patterns and [[Planning and Task Decomposition]]'s autonomous loops are both arrangements of augmented LLM calls, not a different underlying mechanism.
* **Tools are covered in depth in [[Tool Use and Function Calling]]**, memory in [[Memory and State Management]], retrieval across the entire RAG planet — this topic is only about naming the three as one shared building block.
* **Removing any one augmentation removes exactly the capabilities tied to it** — an agent with tools and memory but no retrieval still can't answer from a document it's never seen, however good its other two augmentations are.

## Common pitfalls

* **Assuming a bigger model closes the gap a bare call has with an augmented one.** The worked example's gap isn't about capability or quality — a bare call, however large the model, still can't take a real-world action without a tool wired to it.
* **Treating the three augmentations as interchangeable.** Memory doesn't help an agent search a document it's never seen, and retrieval doesn't let an agent recall what happened earlier in the same conversation — each covers a specific, non-overlapping gap.
* **Adding all three augmentations to every task regardless of need.** A task that never needs to act on the real world doesn't benefit from tools, and wiring them in anyway only adds complexity and new failure modes.

## Quick check

<details><summary>1. Why can't a bare LLM take an action in the real world, no matter how capable it is?</summary>
Taking an action requires something outside the model itself — a tool wired to actually do something — a bare call only produces text, with nothing connecting that text to any real-world effect.
</details>

<details><summary>2. If an agent has tools and retrieval but no memory, what specific capability is it still missing?</summary>
It can't recall something from a past conversation — tools let it act and retrieval lets it search documents, but neither substitutes for state that persists across turns.
</details>

<details><summary>3. Does "augmenting" an LLM require retraining or fine-tuning the model itself?</summary>
No — tools, memory and retrieval are all wired around the existing model call (function definitions, stored state, a search step before generation), not changes to the model's own weights.
</details>

## Key terms

* **Augmented LLM:** a model call combined with tools, memory and retrieval as its three standard additions.
* **Tool:** a function an agent can call to take an action or fetch information beyond its own training.
* **Memory (in this context):** state that persists across turns or runs, as opposed to what's baked into the model's weights.

## Related

[[Structured Output and Tool-Calling APIs]] · [[Tool Use and Function Calling]] · [[Memory and State Management]]
