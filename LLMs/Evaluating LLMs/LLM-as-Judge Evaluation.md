Benchmark suites work well for questions with a single checkable right answer. Most interesting LLM output — a summary, a piece of writing, a conversational response — doesn't have one. Using another LLM as the judge scales human-like evaluation far beyond what human raters alone could manage — at the cost of inheriting whatever biases that judge brings with it.

**You need:** [[Benchmark Contamination and Leakage]], [[Constitutional AI and RLAIF]].

## The question it answers

"Can an LLM reliably judge the quality of another LLM's output?" Often, roughly — but not without real, documented biases. One of the best-known is **position bias**: when a judge is shown two responses and asked which is better, its preference can shift measurably just from *which one is shown first*, independent of the responses' actual content.

## Intuition

Asking a human reviewer to compare two near-tied essays, which one they pick can genuinely be swayed by which one they happened to read first — a documented effect in human judgment too, not unique to AI judges. An LLM judge, trained on patterns in human-generated text and human preference data, can inherit exactly this same kind of bias — preferring whichever response occupies a particular position in the prompt, regardless of its actual content.

## Definition and notation

```text
judge_score(response, position) = quality(response) + bias_term(position)

position bias: bias_term("first") > bias_term("second")
  → the SAME response can score differently depending on
    where it's placed in the judge's prompt
```

## A worked example

Two responses, A (quality 0.60) and B (quality 0.65) — B is genuinely slightly better — judged under a toy position bias of +0.15 for whichever is shown first:

```text
A shown first, B second:
  A score: 0.60 + 0.15 = 0.75     B score: 0.65 + 0 = 0.65
  judge prefers: A   ← wrong; B was actually the better response

B shown first, A second:
  A score: 0.60 + 0 = 0.60        B score: 0.65 + 0.15 = 0.80
  judge prefers: B   ← correct
```

The exact same two responses, with the exact same underlying quality, produce opposite judge verdicts purely depending on which one happened to be placed first in the prompt. Nothing about the responses changed between the two trials — only their order did.

## Bench

```bench
id: judge-position-bias
title: The same two answers, a different winner
fallback: Swap which response is shown first and watch the judge's preferred winner flip, even though neither response actually changed.
```

**Try this**

1. Put A first and see which response the judge prefers.
2. Swap the order and compare.
3. Consider what would happen if the quality gap between A and B were much larger than the position bias itself.

**What you should notice:** the judge's verdict flips completely from just swapping presentation order — a clear sign the bias term, not the responses' actual quality, is deciding the outcome in this toy example.

## Where it appears in AI

* **Production LLM-as-judge pipelines commonly randomize or swap response order and average the results**, specifically to cancel out position bias rather than trust a single-order comparison.
* **Other documented LLM-judge biases include length bias (preferring longer responses) and self-preference bias (a model favoring responses similar to its own style)**, both close relatives of the [[Reward Hacking and Sycophancy|reward hacking concerns]] already covered in alignment training.
* **LLM-as-judge is widely used specifically because it's far cheaper and faster than collecting large volumes of human preference judgments** — the biases are a real cost of that scalability, not a reason to discard the approach outright.

## Common pitfalls

* **Trusting a single-order comparison as a fair judgment.** As the worked example shows, that alone can be enough to flip the verdict, with no change to the responses themselves.
* **Assuming LLM-as-judge is strictly worse than human judgment because of these biases.** Humans show related biases of their own (not identical ones, but real presentation effects); the question is how to mitigate rather than eliminate bias entirely.
* **Using LLM-as-judge to evaluate properties the judge itself is unreliable at assessing.** A judge's own blind spots (in factuality-checking, for instance) can limit how trustworthy its evaluations are on exactly those dimensions.

## Quick check

<details><summary>1. What is position bias, in the context of LLM-as-judge evaluation?</summary>
A measurable tendency for a judge to prefer whichever response is shown first (or in some other specific position), independent of the responses' actual quality.
</details>

<details><summary>2. In the worked example, why did the judge's preferred response change between the two trials?</summary>
Only the display order changed — B scored higher when shown first, and A scored higher when shown first — the position bias term, not any change in the responses, determined which one "won" each time.
</details>

<details><summary>3. What's a standard mitigation for position bias in LLM-as-judge pipelines?</summary>
Randomizing or swapping which response is shown first and averaging the results across both orderings, to cancel out the position-dependent bias.
</details>

## Key terms

* **LLM-as-judge:** using an LLM to evaluate the quality of generated outputs, often by comparison.
* **Position bias:** a judge's tendency to favor whichever response is shown in a particular position, independent of content.
* **Order randomization:** swapping response order across evaluations to cancel out position bias.

## Related

[[Constitutional AI and RLAIF]] · [[Reward Hacking and Sycophancy]] · [[Capability Evaluation vs. Safety Evaluation]]
