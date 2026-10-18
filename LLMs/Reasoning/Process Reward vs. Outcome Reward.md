Once a model shows its reasoning steps, a new question opens up: should those steps themselves be rewarded, or only whether the final answer happens to be right? The difference matters more than it might sound.

**You need:** [[Chain-of-Thought Prompting]], [[Reward Modeling]].

## The question it answers

"Should a reward signal check every reasoning step, or only the final answer?" An **outcome reward** checks only whether the final answer is correct, ignoring everything in between. A **process reward** checks the validity of each intermediate step directly. The gap between them matters precisely because a chain of reasoning can contain genuine errors that happen to cancel out, landing on a correct final answer anyway — outcome reward would reward that chain; process reward would catch the flawed steps inside it.

## Intuition

A teacher grading only the final numerical answer on a multi-step math problem might give full marks to a student whose work contains two separate arithmetic mistakes that happen to cancel each other out — the answer is correct, so outcome-only grading sees nothing wrong. A teacher who checks every line of work would catch both errors, even though the final number was, by coincidence, still right. Only the second kind of grading can tell "got the right answer for the right reasons" apart from "got the right answer by accident."

## Definition and notation

```text
outcome reward(chain) = correct(final_answer(chain))

process reward(chain) = AND over every step: valid(stepᵢ)
  (can flag a chain as flawed even when the final answer is correct)
```

## A worked example

A reasoning chain solving `15 + 7 − 3`, whose true answer is 19:

```text
step 1: "15 + 7 = 23"   — INVALID (true value: 22)
step 2: "23 - 3 = 19"   — INVALID (given 23, true value: 20)
final answer written: 19

outcome reward: final answer 19 matches the true answer 19 → REWARDED
process reward: both intermediate steps contain arithmetic errors → NOT REWARDED
```

Two separate arithmetic slips — one in the addition, one in the subtraction — happen to cancel out exactly, producing a final answer that matches the true answer perfectly. Outcome reward, seeing only the final number, rewards this chain in full. Process reward, checking each step's own arithmetic, correctly identifies that neither step was actually valid.

## Bench

```bench
id: process-vs-outcome-reward
title: Two wrongs, one accidentally right answer
fallback: Reveal a reasoning chain's steps one at a time and compare what outcome reward sees against what process reward catches.
```

**Try this**

1. Reveal the first step and check whether its arithmetic is actually correct.
2. Reveal the second step and check it against the number it was actually given.
3. Compare the final outcome-reward and process-reward verdicts once both steps are visible.

**What you should notice:** outcome reward's verdict depends only on the very last number written down; process reward's verdict depends on checking every single step against what came before it, regardless of where the chain ends up.

## Where it appears in AI

* **Process reward models (PRMs) have been shown to catch training signal that outcome reward models (ORMs) miss entirely**, specifically on multi-step math and logic tasks where canceling errors like this worked example's are a real, documented failure mode.
* **Training a process reward model is harder than training an outcome reward model**: it needs step-level correctness labels, which are far more expensive to collect than a single final-answer judgment per example.
* **[[Tree-of-Thought and Search-Based Reasoning|search-based reasoning methods]] often use process-level signals to decide which partial reasoning paths are worth continuing to explore**, rather than waiting until a full chain is finished to find out if it was any good.

## Common pitfalls

* **Assuming a correct final answer means the reasoning that produced it was sound.** The worked example is built specifically to show this isn't guaranteed — canceling errors are rare but real, and more common on harder, more error-prone problems.
* **Assuming process reward is strictly superior in every case.** It requires much more expensive step-level labels to train, and for many simpler tasks, outcome reward alone is a perfectly adequate and far cheaper signal.
* **Forgetting that one canceling-errors example doesn't mean most correct chains are flawed.** It's a real but comparatively rare failure mode that process reward is specifically built to catch — most chains that reach a correct answer do so through genuinely valid steps.

## Quick check

<details><summary>1. What's the key difference between what outcome reward and process reward each check?</summary>
Outcome reward checks only whether the final answer is correct; process reward checks the validity of every individual intermediate step, regardless of where the chain ultimately ends up.
</details>

<details><summary>2. In the worked example, why did outcome reward reward a chain that process reward flagged as invalid?</summary>
Two separate arithmetic errors in the chain happened to cancel each other out, producing a final answer that matched the true answer — outcome reward only sees that final match, while process reward caught both individual errors.
</details>

<details><summary>3. Why is training a process reward model generally harder than training an outcome reward model?</summary>
It requires step-level correctness labels for training data, which are far more expensive and labor-intensive to collect than a single final-answer correctness judgment per example.
</details>

## Key terms

* **Outcome reward:** a reward signal based only on whether a chain's final answer is correct.
* **Process reward:** a reward signal that checks the validity of each intermediate reasoning step.
* **Canceling errors:** multiple mistakes in a reasoning chain that happen to offset each other, producing a correct final answer despite flawed steps.

## Related

[[Chain-of-Thought Prompting]] · [[Reward Modeling]] · [[Tree-of-Thought and Search-Based Reasoning]]
