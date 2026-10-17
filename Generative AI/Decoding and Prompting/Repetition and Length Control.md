Left alone, a decoding loop can get stuck: once a model starts favoring a short cycle of tokens, each repetition can make that same cycle even more likely next time. This note covers two practical levers for taming generation length and repetition directly at decoding time.

**You need:** [[Temperature and Nucleus (Top-p) Sampling]].

## The question it answers

"How do you stop a model from looping forever, and how do you control how long its output runs?" A **repetition penalty** reduces the logit of any token in proportion to how many times it has already appeared, making an already-used token progressively less attractive. A **length bias** directly nudges the end-of-sequence token's logit — suppressing it before a minimum length, boosting it past a target length — without touching any other token's score.

## Intuition

Repetition penalty is like a conversation where repeating yourself gets harder to justify each time — the first repeat barely registers, but by the fifth time you're saying the same thing, it's clearly time to say something else. A length bias is a separate, blunter lever: it doesn't care what's being said, only how long the model has been talking, nudging it to wrap up (or keep going) purely based on position.

## Definition and notation

```text
repetition penalty (applied per distinct token, count = times seen so far):
  logit' = logit × penaltyᶜᵒᵘⁿᵗ      if logit < 0
  logit' = logit / penaltyᶜᵒᵘⁿᵗ      if logit ≥ 0
  (penalty = 1 is a no-op; larger penalty punishes repeats harder,
   and the exponent means the second repeat is punished more than the first)

length bias (on the <eos> logit only):
  logit'(<eos>) = logit(<eos>) − bias    if step < minLen
  logit'(<eos>) = logit(<eos>) + bias    if step ≥ softCapLen
```

## A worked example

A toy model over `{the, cat, sat, again, <eos>}` whose transitions form a loop: `cat → sat → again → sat → again → ...`. With no repetition penalty, greedy decoding loops for the full 20-step budget:

```text
no penalty:   cat sat again sat again sat again sat again sat again ... (hits the length limit)
```

With a repetition penalty of 2.5, the "sat" / "again" cycle gets progressively more expensive each time either token reappears. By the third repeat of the cycle, the (still unpenalized) `<eos>` logit of 0.50 finally beats the heavily-penalized "sat" logit of 0.45:

```text
penalty 2.5:  cat sat again sat again <eos>     (6 tokens — the loop breaks on its own)
```

Separately, a length bias can force an early stop regardless of what the content-token logits say. Boosting `<eos>` by 3 once the sequence reaches 2 tokens overrides the model's preference for continuing:

```text
soft cap at step 2, bias 3:  cat sat <eos>      (3 tokens — stopped well before the natural loop)
```

## Bench

```bench
id: repetition-length-control
title: Breaking a loop, and stopping on time
fallback: Adjust a repetition penalty and a soft length cap and watch a looping toy model's generated sequence change.
```

**Try this**

1. With no repetition penalty, confirm the model loops for the full 20-token budget.
2. Raise the penalty until the loop breaks on its own, and watch how many repeats it takes.
3. Set the penalty back to 1 and lower the soft length cap instead — notice this stops generation immediately, with no regard for whether the content "wanted" to continue.

**What you should notice:** the two controls solve different problems — repetition penalty makes the model *want* to stop by making the loop itself unattractive, while a length bias can force a stop regardless of what the model wants.

## Where it appears in AI

* **Chat APIs commonly expose both as separate parameters** (often named `repetition_penalty` or `frequency_penalty`, and `max_tokens` or a length-based stop condition), because they address different failure modes.
* **Open-ended generation without any repetition control is a classic early-GPT-era failure mode** — tight loops of a few repeated phrases were common before penalties like this became standard practice.
* **[[Few-Shot and Zero-Shot Generation|task-oriented prompts]] often rely on length control to keep an answer concise** rather than letting the model keep elaborating past the point of being useful.

## Common pitfalls

* **Setting the repetition penalty too high.** Past a point it can push the model away from words that legitimately need to repeat (like "the" in ordinary prose), producing stilted text.
* **Expecting a length bias to produce exactly the target length.** It shifts the odds toward stopping; the content-token logits can still occasionally win out, especially with a small bias.
* **Applying repetition penalty to every past token equally regardless of count.** The worked example's penalty grows with each repeat specifically so that a single earlier use barely matters, while persistent looping is punished hard — a flat, count-independent penalty behaves quite differently.

## Quick check

<details><summary>1. Why does a repetition penalty eventually break a loop that a flat (count-independent) penalty might not?</summary>
Because the penalty compounds with each repeat (it scales by the count of prior occurrences), so a token that keeps reappearing gets progressively more expensive, until even the end-of-sequence token becomes more attractive.
</details>

<details><summary>2. What's the difference between what a repetition penalty and a length bias each act on?</summary>
A repetition penalty adjusts the logits of tokens that have already appeared; a length bias adjusts only the end-of-sequence token's logit, based purely on how many tokens have been generated so far.
</details>

<details><summary>3. In the worked example, how many tokens did it take for a repetition penalty of 2.5 to break the loop?</summary>
Six tokens: "cat sat again sat again &lt;eos&gt;" — the loop ran through one full cycle before the penalty made &lt;eos&gt; more attractive than continuing.
</details>

## Key terms

* **Repetition penalty:** a logit adjustment that makes an already-generated token progressively less likely to be generated again.
* **Length bias:** a direct adjustment to the end-of-sequence token's logit, used to encourage stopping earlier or later.
* **Soft cap:** a length past which generation is nudged (but not forced) to stop, as opposed to a hard limit that cuts generation off outright.

## Related

[[Temperature and Nucleus (Top-p) Sampling]] · [[Constrained and Structured Generation]] · [[Self-Consistency and Best-of-N Sampling]]
