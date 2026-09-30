The **information** (or **surprise**) of an event is `−log₂ p` bits, where `p` is its probability. A certain event carries no information, a fair coin flip carries one bit, and a very rare event carries a lot. It is the basic quantity from which entropy and cross-entropy are built.

**You need:** [[Logarithms]] and [[Probability Rules]].

## The question it answers

"How surprised should I be by this outcome, and how do I count it?" Hearing "the sun rose today" tells you nothing; hearing "an earthquake hit" tells you a lot. Information theory turns that instinct into a number.

## Intuition: yes/no questions

Information counts the **number of yes/no questions** needed to identify an outcome. One fair coin flip: one question ("heads?"), one bit. Eight equally likely outcomes: three questions (each halves the possibilities), three bits.

```text
information(event) = −log₂ p        (in bits;  −ln p  gives nats)
```

Why the minus sign? Probabilities are between 0 and 1, so `log₂ p` is negative; the minus makes surprise positive. Why a logarithm? Independent events multiply their probabilities but *add* their surprises, exactly what a logarithm does (see [[Logarithms]]).

```text
p = 1       →  0 bits     (no surprise)
p = 1/2     →  1 bit
p = 1/8     →  3 bits
p = 0.01    →  6.64 bits
p → 0       →  infinite
```

## A worked example

You roll a fair die and are told the result is a 6: `p = 1/6`, information `−log₂(1/6) = 2.585` bits. If told "the result is even" (`p = 1/2`), you learn only 1 bit.

Two independent coin flips both heads: `p = 1/4`, and `−log₂ (1/4) = 2` bits, which equals `1 + 1` bits from the two flips separately ✓.

For a language model, the surprise of a word is `−log₂ P(word | context)`. A word assigned probability 0.5 costs 1 bit; one assigned probability 0.001 costs about 10 bits. Averaging these costs over text is exactly the loss used to train such models (see [[Cross-Entropy]]).

## Bench

```bench
id: surprise-meter
title: How surprising is it?
fallback: A slider sets the probability of an event; the bench shows its surprise in bits and in nats, the equivalent number of yes/no questions, and lets you combine independent events to see surprises add.
```

**Try this**

1. Set p = 0.5 and read the surprise.
2. Set p = 0.125 and check it equals three halvings.
3. Move p toward 0 and watch the surprise grow.
4. Combine two independent events and check that the bits add.

**What you should notice:** surprise falls as probability rises, reaches zero at certainty, and grows without limit for the nearly impossible.

## Where it appears in AI

* **Log loss** is the surprise of the true label under the model's probabilities.
* **Language model quality** is measured in bits or nats per token.
* **Compression:** likely symbols get short codes, unlikely ones long.

## Common pitfalls

* **Forgetting the minus sign.**
* **Mixing bases.** Bits (log₂) and nats (ln) differ by a factor of `ln 2 ≈ 0.693`.
* **Confusing rare with important.** Information measures surprise, not usefulness.
* **Taking `log 0`.** Impossible events would have infinite surprise (see [[Numerical Stability]]).

## Quick check

<details><summary>1. How many bits of surprise for an event with probability 1/16?</summary>
4 bits.
</details>

<details><summary>2. Which is more informative, p = 0.9 or p = 0.1?</summary>
p = 0.1.
</details>

<details><summary>3. If two independent events carry 2 and 3 bits, how much do both together carry?</summary>
5 bits.
</details>

## Key terms

* **Information / surprise:** `−log p`, how unexpected an event is.
* **Bit:** the information in one fair yes/no answer.
* **Nat:** information measured with the natural logarithm.
* **Self-information:** another name for surprise.

## Related

[[Logarithms]] · [[Probability Rules]] · [[Entropy]] · [[Cross-Entropy]] · [[Numerical Stability]]
