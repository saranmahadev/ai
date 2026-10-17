None of the decoding controls so far change what the model "knows" — they only change how its existing distribution gets turned into tokens. This note covers a different lever entirely: changing the *input*, with no retraining, to change what that distribution looks like in the first place.

**You need:** [[Decoder-Only Architectures]].

## The question it answers

"How can a model perform a task it was never specifically trained on, with no weight updates at all?" **Prompting** is simply choosing what text to put in front of a model before it starts generating. **In-context learning** is the specific, striking version of this: giving the model a few examples of a pattern *inside the prompt itself*, after which it continues the pattern on a new, unseen case — purely by reading the context, not by learning in the usual sense.

## Intuition

A plausible mechanical story behind this (confirmed by looking inside real transformer attention patterns) is a **copying** operation: somewhere in a sequence, find an earlier position where the *current* token last appeared, and look at whatever token came right after it back then — then guess that again. If a prompt reads "dog → bark, cat → meow, bird → chirp, dog → ", a model doing exactly this copying trick finds the earlier "dog", looks at what followed it, and answers "bark" — not because it looked anything up, but because the pattern was right there in the context to copy from.

## Definition and notation

```text
induction-style copy completion:
  given tokens t₁, t₂, ..., tₙ (tₙ is the token to complete after)
  find the largest i < n such that tᵢ = tₙ
  return tᵢ₊₁ as the completion (or: no completion, if no such i exists)
```

This is a simplified model of one real, measured mechanism ("induction heads") behind in-context learning — not the whole story of how it works, but enough to see why more examples in context make a difference.

## A worked example

A prompt that repeats one earlier token at the very end:

```text
dog · bark · cat · meow · bird · chirp · dog → ?
```

Scanning backward from the final "dog", the only earlier occurrence of "dog" is at the very start, immediately followed by "bark" — so the completion is "bark", recovered correctly by copying, with nothing about dogs or barking "known" ahead of time.

```text
completion:  bark
```

This copying trick isn't magic, though — it only works when the *pattern itself* is a repetition the model can find. A prompt built around a function instead of a repeated token, like "2 → 4, 3 → 6, 5 → 10, 4 → ?" (doubling), finds the earlier "4" from the very first pair and copies whatever followed *that* occurrence — "3" — which is not the doubled value at all:

```text
prompt:  2 · 4 · 3 · 6 · 5 · 10 · 4 → ?
copy completion:  3   (wrong — 4 doubled is 8)
```

Copying solves "find the pattern that already repeated here"; it does not, by itself, solve "apply a general rule to a new input."

## Bench

```bench
id: induction-copy
title: Completing by copying, not by knowing
fallback: Pick a prompt and watch a copy-based completion find (or fail to find) an earlier matching token to copy from.
```

**Try this**

1. Try the dog/cat/bird prompt and confirm the completion correctly copies "bark".
2. Try the prompt that never repeats a token at all, and see what happens when there's nothing to copy from.
3. Compare this to what [[Few-Shot and Zero-Shot Generation|more examples in the prompt]] would do to the chance of finding a match at all.

**What you should notice:** the completion only succeeds when the exact token at the end genuinely reappeared earlier in the prompt — it's pattern-matching against the prompt's own content, not recalling a fact.

## Where it appears in AI

* **"Prompt engineering" as a skill is largely about shaping context so the right pattern is available to be found or copied**, rather than about phrasing a request more politely.
* **Induction heads were identified by directly inspecting attention patterns in trained transformers** — a rare case where a mechanistic hypothesis about *why* a capability works was checked against the actual weights, not just behavior.
* **It explains why example *order and format* in a prompt matters**: the pattern has to be literally present and consistent for a copying mechanism to latch onto it.

## Common pitfalls

* **Assuming in-context learning means the model is truly learning a general rule.** The worked example's doubling-function failure shows the copying mechanism specifically solves repetition, not arbitrary function learning — real models combine this with other mechanisms, but the gap is real.
* **Treating prompting and fine-tuning as the same lever at different strengths.** Prompting changes what's visible in context for one generation; it leaves the model's weights completely untouched, unlike [[Parameter-Efficient Adaptation for Generation|fine-tuning]].
* **Forgetting the pattern has to appear *before* the point it's needed.** A copying mechanism can only look backward in the context it's already seen.

## Quick check

<details><summary>1. What does the simplified copy-completion rule in this note actually do?</summary>
It looks backward from the final token for the most recent earlier occurrence of that same token, and returns whatever token immediately followed it back then.
</details>

<details><summary>2. Why did the copy rule fail on the doubling-function prompt?</summary>
Because the rule only knows how to repeat a pattern that already occurred verbatim — it found the earlier "4" and copied what followed it, which doesn't correspond to applying the doubling rule to that same "4" the second time.
</details>

<details><summary>3. Does in-context learning update a model's weights?</summary>
No — it only changes what's in the input context for that one generation; the model's parameters are completely unchanged.
</details>

## Key terms

* **Prompting:** choosing the input text given to a model to shape its output, with no change to its weights.
* **In-context learning:** a model performing a task demonstrated by examples placed directly in its input, without any training step.
* **Induction head:** a simplified name for an attention mechanism that copies whatever token followed an earlier occurrence of the current token.

## Related

[[Few-Shot and Zero-Shot Generation]] · [[Decoder-Only Architectures]] · [[Self-Consistency and Best-of-N Sampling]]
