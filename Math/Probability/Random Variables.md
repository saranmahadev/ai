A **random variable** is a number whose value depends on chance: the total of two dice, the number of heads in ten flips, a model's error on the next example. It turns outcomes into numbers, so we can average them, measure their spread and describe them with a **distribution**.

**You need:** [[Events and Sample Spaces]] and [[Functions]].

## The question it answers

"How do I describe an uncertain quantity as a number?" Outcomes like "heads" are not numbers. A random variable assigns each outcome a number so that maths can take over.

## Intuition: a rule that reads off a number

Roll two dice. The outcome is a pair like `(3, 5)`. Let `X` be the sum. Then `X` is a rule that maps each pair to a number: `X(3, 5) = 8`. Before the roll, `X` is uncertain; after it, it has a value.

A random variable is either:

* **Discrete:** takes separate values (counts, dice sums, labels 0/1).
* **Continuous:** takes any value in a range (height, time, a model's weight).

## Distributions

For a discrete variable, the **probability mass function** (PMF) lists `P(X = x)` for every value. The probabilities add to 1. For a continuous variable, a **density** describes it instead (see [[Continuous Distributions]]).

## A worked example: the sum of two dice

```text
x         2     3     4     5     6     7     8     9    10    11    12
P(X = x)  1/36  2/36  3/36  4/36  5/36  6/36  5/36  4/36  3/36  2/36  1/36
```

The pattern is `P(X = k) = (6 − |k − 7|) / 36`. The probabilities add to `36/36 = 1` ✓. Then `P(X ≥ 10) = (3 + 2 + 1)/36 = 1/6`.

Simulating shows the pattern: after many rolls, the fraction of times each total appears approaches its probability. That is the idea behind the [[Law of Large Numbers]].

Another random variable: `Y` = "number of spam emails among the next 5", with each independent and 40% likely to be spam. `Y` takes values 0 to 5 and follows a binomial distribution (see [[Discrete Distributions]]).

## Bench

```bench
id: simulate-tally
title: Roll it and tally it
fallback: Roll two dice many times; a histogram of the totals grows next to the exact probabilities so you can see the simulated frequencies approach them.
```

**Try this**

1. Roll once, then ten times, then a thousand times.
2. Compare the bars with the exact probabilities.
3. Switch to one die and to the number of heads in ten flips.
4. Reset and see that a new run looks different.

**What you should notice:** small runs are ragged, and large runs settle onto the theoretical shape.

## Where it appears in AI

* **Model outputs** (a score, a predicted class) are random variables when inputs are uncertain.
* **Errors and noise** are modelled as random variables.
* **Sampling from a model** draws a value from its distribution.

## Common pitfalls

* **Confusing the random variable with its value.**
* **Assuming all values are equally likely.**
* **Forgetting that probabilities must sum to 1.**
* **Treating a continuous variable as if `P(X = x)` were positive.** For continuous variables it is 0.

## Quick check

<details><summary>1. What is P(X = 2) for the sum of two dice?</summary>
1/36.
</details>

<details><summary>2. Is the number of emails received today discrete or continuous?</summary>
Discrete.
</details>

<details><summary>3. Do the probabilities of all values of a discrete variable add to 1?</summary>
Yes.
</details>

## Key terms

* **Random variable:** a number determined by chance.
* **Discrete / continuous:** separate values / any value in a range.
* **PMF:** the list of probabilities for a discrete variable.
* **Distribution:** the pattern of how likely each value is.

## Related

[[Events and Sample Spaces]] · [[Expectation]] · [[Discrete Distributions]] · [[Continuous Distributions]] · [[Law of Large Numbers]]
