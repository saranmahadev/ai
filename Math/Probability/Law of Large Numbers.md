The **law of large numbers** says that the average of many independent repetitions settles down to the expectation. Flip a fair coin enough times and the fraction of heads approaches one half. It is why casinos win, why polls work, and why a model's average loss on a big enough sample tells you about its true performance.

**You need:** [[Expectation]], [[Variance and Standard Deviation]] and [[Independence]].

## The question it answers

"Why do averages become predictable even when single outcomes are not?" One flip is a coin toss; a thousand flips are nearly always close to half heads.

## Intuition: randomness averages out

Each new observation is a small random nudge to the running average. Early on, one lucky streak matters a lot. Later, each new value is a tiny fraction of a large total, so streaks are diluted.

```text
sample mean  X̄ₙ = (X₁ + … + Xₙ) / n      →      E[X]      as n grows
```

How fast? The spread of the sample mean shrinks like `σ / √n`. To halve the typical error you need four times the data.

## A worked example

Flip a fair coin (`p = 0.5`, `σ = 0.5` per flip). The standard deviation of the fraction of heads after `n` flips is `0.5 / √n`:

```text
n = 100:     0.5 / 10   = 0.05        fraction of heads usually within about ±0.10 of 0.5
n = 10,000:  0.5 / 100  = 0.005       usually within about ±0.01
```

Rolling a die: the average of many rolls approaches 3.5. Ten rolls might average anywhere from 2.5 to 4.5; ten thousand rolls average within about 0.03 of 3.5 (`1.708 / 100 = 0.017` per standard deviation).

A caution: the law describes the *average*, not the *count*. After 100 flips the number of heads can still be 6 away from 50; only the *fraction* converges. The "gambler's fallacy" (expecting tails after a run of heads) misreads this: flips have no memory, and the average settles by dilution rather than correction.

## Bench

```bench
id: running-average
title: Watch an average settle
fallback: Simulate flipping a coin or rolling a die up to a chosen number of times; the running average is plotted with the true expectation as a reference, and several runs can be overlaid.
```

**Try this**

1. Run 100 flips and watch the running fraction of heads.
2. Increase to 10,000 and compare.
3. Overlay several runs. Where do they differ most?
4. Switch to a die and watch the average approach 3.5.

**What you should notice:** runs wander widely at first, then all funnel toward the same value, and the funnel narrows like one over the square root of n.

## Where it appears in AI

* **Evaluation:** average performance on a large test set estimates true performance.
* **Monte Carlo methods** estimate integrals by averaging random samples.
* **SGD** relies on averages of mini-batches being close to the full gradient.
* **A/B tests** need enough samples for averages to stabilise.

## Common pitfalls

* **The gambler's fallacy.**
* **Assuming small samples are reliable.**
* **Forgetting that dependent samples may not average out** as fast.
* **Expecting the law to fix bias.** It converges to the wrong value if the sampling is biased.

## Quick check

<details><summary>1. To cut the typical error of a sample mean in half, how much more data?</summary>
Four times as much.
</details>

<details><summary>2. Does the law say the number of heads becomes exactly half?</summary>
No, only the fraction does.
</details>

<details><summary>3. What does the sample mean approach as n grows?</summary>
The expectation.
</details>

## Key terms

* **Law of large numbers:** sample means converge to the expectation.
* **Sample mean:** the average of the observations.
* **Convergence:** getting arbitrarily close.
* **Standard error:** the spread of a sample mean, `σ / √n`.

## Related

[[Expectation]] · [[Variance and Standard Deviation]] · [[Central Limit Theorem]] · [[Sampling and Bias]] · [[Stochastic Gradient Descent]]
