The copying mechanism in [[Prompting and In-Context Learning]] only works when the pattern it needs is actually present in the prompt — which raises a direct, practical question: how many examples does a prompt need before that pattern reliably shows up?

**You need:** [[Prompting and In-Context Learning]].

## The question it answers

"Does a prompt need zero, one, or many examples to work?" **Zero-shot** means asking for a task with no examples at all, relying entirely on an instruction. **Few-shot** means including a handful of worked examples in the prompt before the real question. Whether few-shot helps — and how many examples are enough — depends on whether a model's in-context mechanisms (like the copying trick from the previous note) actually get a chance to find a matching pattern; more examples simply raise the odds that one of them matches.

## Intuition

If a copying-style mechanism needs the *current* situation to have occurred once already somewhere earlier in the prompt, then zero examples means there is nothing to match against at all — the model is guessing blind. Each additional example is another independent roll of the dice for "does one of these happen to match what I'm asked about now?" More shots don't make the model smarter; they make it more likely the exact pattern needed is already sitting somewhere in the context.

## Definition and notation

```text
zero-shot:  prompt = instruction only, no worked examples
k-shot:     prompt = instruction + k worked examples, then the real query

if each example independently has probability q of matching
the query's category:
  P(at least one of k examples matches) = 1 − (1 − q)ᵏ
```

## A worked example

A toy setup with 5 possible categories, where a prompt includes k random example pairs before a query from one of the same 5 categories. The chance that at least one of the k examples happens to share the query's category (`q = 1/5`, so `1 − q = 0.8`):

```text
k = 0:  1 − 0.8⁰ = 0.000   (0.0% — zero-shot, nothing to match)
k = 1:  1 − 0.8¹ = 0.200   (20.0% match rate)
k = 2:  1 − 0.8² = 0.360   (36.0% match rate)
k = 3:  1 − 0.8³ = 0.488   (48.8% match rate)
k = 5:  1 − 0.8⁵ = 0.672   (67.2% match rate)
k = 8:  1 − 0.8⁸ = 0.832   (83.2% match rate)
```

Simulating 5,000 random prompts at each k matches this formula closely (k=3 simulated at 49.5%, k=8 at 83.6%, both within simulation noise of the exact values above) — confirming that the benefit of more shots here is entirely about the growing odds of a usable match existing in the prompt at all, with sharply diminishing returns as k grows past a handful.

## Bench

```bench
id: fewshot-matchrate
title: Shots in the prompt vs. chance of a match to copy
fallback: Adjust the number of example shots in a toy prompt and watch the chance of a usable match rise toward its theoretical curve.
```

**Try this**

1. Set shots to 0 and confirm the match rate is exactly zero.
2. Raise shots to 3 and compare the simulated rate to the formula's prediction.
3. Keep raising shots past 5 and notice how much the rate's growth slows down.

**What you should notice:** the match rate rises quickly at first and then flattens — going from 0 to 1 shot gains 20 percentage points, but going from 5 to 8 shots gains only about 16 more, even though it's three more examples.

## Where it appears in AI

* **Zero-shot performance is a common benchmark baseline**, specifically because it isolates what a model can do from instructions alone, with no chance for in-context pattern-matching to help.
* **Few-shot prompting became a headline result for large language models** precisely because performance on many tasks jumped sharply from a handful of in-context examples, with no training at all.
* **Beyond a task-specific pattern match, more shots also cost more input tokens** — every example in the prompt is tokens the model has to process and (on most APIs) tokens you pay for, so few-shot has a real, direct cost unrelated to accuracy.

## Common pitfalls

* **Assuming more shots always helps, without limit.** This worked example's own curve shows sharply diminishing returns; very long prompts can also push useful context out of a model's effective attention span.
* **Treating zero-shot failure as proof a model "can't" do a task.** It may only mean the task needs a demonstrated pattern to follow — the same model might do fine with just one or two well-chosen examples.
* **Picking unrepresentative examples.** A few-shot prompt whose examples don't resemble the real query's pattern can actively mislead a model, since in-context mechanisms are matching against whatever pattern the examples actually show, not the one you intended.

## Quick check

<details><summary>1. Why does zero-shot prompting have nothing for the copying mechanism from the previous note to use?</summary>
Because there are no worked examples in the prompt, so there is no earlier occurrence of a matching pattern for the mechanism to find and copy from.
</details>

<details><summary>2. In the worked example, roughly how much does the match rate improve from k=5 to k=8 shots, compared to k=0 to k=1?</summary>
From k=0 to k=1 the rate jumps 20 percentage points (0% to 20%); from k=5 to k=8 it only rises about 16 points (67.2% to 83.2%) despite adding three more examples instead of one — clearly diminishing returns.
</details>

<details><summary>3. What's a direct, non-accuracy cost of adding more few-shot examples?</summary>
Every example adds input tokens the model must process (and that are usually billed), independent of whether those extra examples actually improve accuracy.
</details>

## Key terms

* **Zero-shot:** prompting a model to perform a task with no worked examples, instruction only.
* **Few-shot:** including a small number of worked examples of a task directly in the prompt.
* **Diminishing returns:** each additional example improving performance by less than the one before it.

## Related

[[Prompting and In-Context Learning]] · [[Self-Consistency and Best-of-N Sampling]] · [[Parameter-Efficient Adaptation for Generation]]
