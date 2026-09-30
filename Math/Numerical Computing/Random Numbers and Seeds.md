Computers cannot produce true randomness by calculation, so they use **pseudo-random number generators**: deterministic recipes that produce sequences that look random. The **seed** is the starting value. The same seed gives the same sequence, which is exactly what you want for reproducible experiments.

**You need:** [[Rounding, Absolute Value and Modulo]], [[Continuous Distributions]] and [[Sequences and Series]].

## The question it answers

"Where does the randomness in my model and simulations come from, and how do I get the same result twice?" Weight initialisation, data shuffling, dropout and sampling all use random numbers, and two runs that differ only by seed can give different results.

## Intuition: a scrambled recipe

A generator holds an internal **state**. Each call updates the state by a fixed rule and outputs a number derived from it. Nothing is random: knowing the state tells you every future number. But a good rule scrambles the state so thoroughly that the outputs pass statistical tests of randomness.

A tiny example, the **linear congruential generator**: `x ← (a·x + c) mod m`. With `a = 5`, `c = 3`, `m = 16` and seed `7`:

```text
7 → 6 → 1 → 8 → 11 → 10 → 5 → 12 → 15 → 14 → 9 → 0 → 3 → 2 → 13 → 4 → 7 → …
```

It visits all 16 values once and then **repeats** (period 16). Real generators use huge states, with periods far beyond any run you will ever make, and better mixing than this toy (which is easy to predict and shows lattice patterns).

## Seeds and reproducibility

* **Same seed, same sequence**, so experiments can be re-run exactly.
* **Different seeds** give different, equally valid runs, which is how you measure how much results vary.
* **Uniform to other shapes:** generators produce uniform numbers in `[0, 1)`; other distributions are made from them (for example the **Box–Muller** transform turns two uniforms into a normal sample).

## A worked example

A seed of 42 and a shuffle of 10 items gives one particular order every time you run it. Change the seed to 43 and you get another. Report results as an average over several seeds (say 5) with the spread, because a single lucky seed can mislead.

Reproducibility also depends on more than the seed: the order of floating-point additions on a GPU, library versions and hardware can change results slightly even with a fixed seed (see [[Floating Point]]).

## Bench

```bench
id: seed-replayer
title: The same seed replays the same numbers
fallback: Choose a seed and a generator; the bench lists the first ten numbers, replays them identically for the same seed, changes them for a new seed, and plots consecutive pairs to reveal the pattern in a poor generator.
```

**Try this**

1. Use a seed and note the first numbers. Press "Replay".
2. Change the seed by one and compare.
3. Switch to the tiny generator and look at the plot of pairs.
4. Compare it with the good generator's plot.

**What you should notice:** the same seed always gives the same list, and a poor generator shows a visible pattern where a good one fills the square evenly.

## Where it appears in AI

* **Initialisation, shuffling and dropout** all draw random numbers.
* **Reproducible research** fixes and reports seeds.
* **Monte Carlo methods** and sampling from models need good generators.
* **Cross-validation splits** are seeded so they can be repeated.

## Common pitfalls

* **Not setting or recording the seed.**
* **Assuming a fixed seed guarantees identical results** across hardware and libraries.
* **Reusing one seed** for things that should be independent.
* **Judging a method from one seed.**

## Quick check

<details><summary>1. Does the same seed always give the same sequence?</summary>
Yes, on the same generator.
</details>

<details><summary>2. Why report an average over several seeds?</summary>
A single seed may be unusually lucky or unlucky.
</details>

<details><summary>3. What is a generator's period?</summary>
The length after which its sequence repeats.
</details>

## Key terms

* **Pseudo-random generator:** a deterministic recipe producing random-looking numbers.
* **Seed:** the starting state of the generator.
* **Period:** the length before the sequence repeats.
* **Reproducibility:** getting the same results by repeating the setup.

## Related

[[Rounding, Absolute Value and Modulo]] · [[Continuous Distributions]] · [[Law of Large Numbers]] · [[Stochastic Gradient Descent]] · [[Floating Point]]
