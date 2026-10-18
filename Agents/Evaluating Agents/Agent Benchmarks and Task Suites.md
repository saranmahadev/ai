A question-answering benchmark checks one generated string against one reference string, and either matches or doesn't. An agent benchmark gives a goal and a live environment instead — and since many different action sequences, and many different final messages, can all reach the identical correct outcome, grading by matching text against a fixed reference string badly undercounts success that actually happened.

**You need:** [[Anatomy of an Agent Architecture]].

## The question it answers

"What does it mean for a benchmark to test *agentic* capability, rather than just one-shot generation?" A standard benchmark checks a single generated output against a single expected one. An agent benchmark instead drops the agent into an **environment** — a browser, a sandboxed filesystem, a shopping cart — gives it a goal, and lets it take as many actions as it needs. Grading has to check the environment's resulting *state* (did the cart actually end up with the right items?), not just whether the agent's final message happens to match some fixed reference text, because agentic tasks have many valid paths and many valid phrasings that all reach the same correct state.

## Intuition

Grading a cooking exam by checking whether the student's written description of the dish matches a reference sentence word-for-word would fail plenty of students who cooked the dish perfectly but described it differently. Grading by tasting the actual dish — checking the real outcome — catches every one of them.

## Definition and notation

```text
text-match grading:   correct if final_message == reference_text
state-check grading:  correct if environment_state == expected_state
```

## A worked example

Four agent runs on the same "add 2 items to the cart" task, each ending with different wording but the identical correct cart state:

```text
run 1: "Done! Added 2 items."                    → cart = 2 (expected 2)
run 2: "I added two items to your cart."          → cart = 2 (expected 2)
run 3: "Added 2 items to cart."  (= reference)    → cart = 2 (expected 2)
run 4: "Your cart now has 2 items in it."         → cart = 2 (expected 2)

text-match grading:   1 of 4 correct   (only run 3 matches the reference string exactly)
state-check grading:  4 of 4 correct   (every run actually reached the correct cart state)
```

All four runs are genuinely successful — the cart has the right items in every case. Text-match grading would report a 25% success rate purely because of wording differences that have nothing to do with whether the task was actually accomplished.

## Bench

```bench
id: grading-method-accuracy
title: Grading a run by its words, or by its result
fallback: Compare grading four agent runs by exact text match against grading them by their actual environment state.
```

**Try this**

1. Check text-match grading's score and notice which single run it credits.
2. Switch to state-check grading and see all four runs credited.
3. Imagine a fifth run whose final message matches the reference text exactly but whose cart ended up with the wrong item count — which grading method would wrongly call it a success?

**What you should notice:** the four runs are identically successful by the task's real goal — only the grading *method* differs, which is exactly why agent benchmarks are built around environments with checkable state, not fixed reference strings.

## Where it appears in AI

* **Agent benchmarks (web-browsing, coding, tool-use task suites) are built specifically around checkable environment state**, for exactly the reason this worked example shows — free-form final messages can't be matched against one fixed string.
* **[[Success-Rate Metrics and Their Blind Spots]], the next topic, covers what even a correctly state-checked success rate still hides** about how an agent actually performed.
* **[[Code-Execution Agents]] and [[Web-Browsing Agents]], already covered, are exactly the kinds of environments these benchmarks run agents inside** — a task suite is a curated collection of goals set in one or more of these environments.

## Common pitfalls

* **Grading agentic tasks with exact-match string comparison.** The worked example's 1-of-4 score shows this directly undercounts genuine success — the fix is to check environment state, not phrasing.
* **Assuming a single task suite covers every environment an agent might need to handle.** A benchmark built entirely around web-browsing tasks says nothing reliable about an agent's coding or tool-use competence.
* **Treating a benchmark's held-out tasks as permanently held out.** Once a task suite's tasks (and their solutions) appear in training data or public discussion, scores on it stop measuring genuine capability — the same contamination risk already covered for LLM benchmarks.

## Quick check

<details><summary>1. Why does text-match grading score only 1 of the 4 runs correct in the worked example?</summary>
All four runs reach the identical correct cart state, but only one of them happens to phrase its final message exactly like the fixed reference string — text-match grading only credits that one.
</details>

<details><summary>2. What does an agent benchmark need that a standard one-shot benchmark doesn't?</summary>
A live environment with checkable state (a sandbox, a browser, a shopping cart) that the benchmark can inspect after the agent finishes, rather than a single fixed reference answer to compare text against.
</details>

<details><summary>3. What real risk do agent benchmarks share with standard LLM benchmarks?</summary>
Contamination — once a task suite's tasks and their solutions become part of training data or public discussion, scores on it stop reliably measuring genuine capability.
</details>

## Key terms

* **Agent benchmark:** a task suite that drops an agent into a live environment with a goal, rather than checking one generated output against one reference.
* **State-check grading:** verifying success by inspecting the environment's resulting state rather than matching generated text.
* **Task suite:** a curated collection of benchmark tasks, often spanning several environments (browsing, coding, tool use).

## Related

[[Success-Rate Metrics and Their Blind Spots]] · [[Code-Execution Agents]] · [[Web-Browsing Agents]]
