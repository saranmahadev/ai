A flaky network call that succeeds 70% of the time individually succeeds 99.19% of the time within four tries — failures that are transient are exactly the kind retrying is good for. A call that fails because its arguments are malformed succeeds 0% of the time no matter how many times it's retried, because nothing about trying again fixes a request that was wrong to begin with.

**You need:** [[Re-Planning on Failure]].

## The question it answers

"When does retrying a failed tool call actually help, and when is it pointless?" A **transient** error (a timeout, a momentary rate limit, a flaky network) has some real chance of succeeding if tried again under the same conditions — each retry is an independent new chance. A **permanent** error (malformed arguments, calling a tool that doesn't exist, a request the API will reject in exactly the same way every time) will fail identically on every retry, because nothing about the retry itself changes what made it fail.

## Intuition

A coffee shop having a brief run of noisy, dropped orders might fill yours correctly if you ask again — the problem was circumstantial, not about what you ordered. Ordering an item that's not on the menu at all will keep failing no matter how many times you repeat the exact same order — repeating it doesn't make the item exist.

## Definition and notation

```text
success within n tries = 1 − (1 − p)ⁿ      where p = per-try success probability
transient error:  p > 0   → success probability climbs toward 100% with more tries
permanent error:  p = 0   → success probability stays at 0% no matter how many tries
```

## A worked example

A transient error with a 70% per-try success rate, and a permanent error that always fails, both retried up to four times:

```text
transient (p = 0.70):
  1 try:  70.00%
  2 tries: 91.00%
  3 tries: 97.30%
  4 tries: 99.19%

permanent (p = 0):
  any number of tries: 0.00%
```

Four retries of the transient call turn a 30%-chance-of-failure single attempt into a call that fails only about 1 time in 125. The permanent error's probability never moves at all — the formula itself shows why: with p = 0, every term in (1 − p)ⁿ stays at 1, so 1 minus it stays at 0 regardless of n.

## Bench

```bench
id: tool-retry-success
title: Retrying a flaky call, or a broken one
fallback: Step through retries of a transient and a permanent tool error and watch cumulative success probability.
```

**Try this**

1. Step through all four tries on the transient error and watch the probability climb toward 100%.
2. Switch to the permanent error and step through the same four tries.
3. Imagine a per-try success probability of 95% instead of 70% — would fewer retries reach the same cumulative success?

**What you should notice:** retrying only ever helps when the failure has some non-zero chance of not recurring — the bench's permanent-error case isn't a different retry strategy, it's a demonstration that no retry strategy helps when the underlying cause is deterministic.

## Where it appears in AI

* **This is the same detect-and-recover shape as [[Re-Planning on Failure]]**, but at the level of a single tool call rather than a whole plan — the key judgment call in both cases is distinguishing a fixable failure from one that will recur identically.
* **[[Designing Tools for Agent Reliability]], later in this section, is about reducing how often permanent errors happen in the first place** — a well-designed tool interface prevents many "malformed arguments" failures before any retry logic is even needed.
* **Blind retries without this distinction waste calls and money on errors retrying can never fix**, which is exactly why production agent systems need to classify an error before deciding whether to retry it at all.

## Common pitfalls

* **Retrying every failure the same way regardless of its cause.** The worked example makes the cost of this explicit: retrying a permanent error four times spends four calls to arrive at exactly the same 0% success the first call already showed.
* **Giving up after one failure without trying again.** For a genuinely transient error, this throws away most of the benefit — a single try at 70% leaves a 30% failure rate that four tries would cut to under 1%.
* **Assuming every error that "looks" like a server hiccup is actually transient.** A malformed request might happen to also return a generic server error, making a permanent problem look retryable when it isn't — the error needs to be inspected, not just its symptom.

## Quick check

<details><summary>1. Why does success probability keep climbing with more tries for the transient error but not for the permanent one?</summary>
A transient error has some real chance (70% here) of not recurring on the next try, so each additional try adds a genuine independent chance of success. A permanent error has a 0% per-try success rate by its nature, so every additional try adds exactly nothing.
</details>

<details><summary>2. What's the practical difference between treating an error as transient versus permanent?</summary>
Treating it as transient means retrying is worth spending more calls on, since each one has a real chance of succeeding; treating it as permanent means retrying is pointless and the actual request needs to be fixed (or a different tool used) instead.
</details>

<details><summary>3. What does the formula 1 − (1 − p)ⁿ reveal about why permanent errors can never be fixed by retrying?</summary>
With p = 0, the term (1 − p) equals 1, and 1 raised to any power n is still 1 — so the whole expression stays at 1 − 1 = 0 regardless of how large n gets.
</details>

## Key terms

* **Transient error:** a failure with some real chance of not recurring if the same call is tried again.
* **Permanent error:** a failure that will recur identically on every retry, because its cause doesn't change between tries.
* **Cumulative success probability:** the chance that at least one of n independent tries succeeds.

## Related

[[Re-Planning on Failure]] · [[Designing Tools for Agent Reliability]] · [[Tool Result Verification]]
