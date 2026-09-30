A **sample** is the part of a **population** you actually observe, and statistics uses it to say something about the whole. A **random** sample gives estimates that are right on average and improve with more data. A **biased** sample gives estimates that are systematically off, and no amount of data fixes that.

**You need:** [[Law of Large Numbers]], [[Central Limit Theorem]] and [[Describing Data]].

## The question it answers

"How much can I learn about everyone from a few, and when should I distrust it?" A model trained on data that does not represent its real users will fail on them, however much data it saw.

## Intuition: a spoonful of soup

Stir the pot and taste one spoon: it tells you about the whole pot. Skim only the surface and you learn only about the surface. **Random sampling** means every member of the population has an equal chance of being picked, so the sample is a fair miniature.

A sample mean varies from sample to sample by about `σ / √n` (the standard error, see [[Central Limit Theorem]]). More data narrows that spread, but **bias** is a different problem: it shifts the *centre* of the estimates.

## Common sources of bias

* **Selection bias:** the way you pick systematically excludes some people (a phone-in poll reaches only those who care to call).
* **Survivorship bias:** you see only the cases that survived (successful companies, models that got deployed).
* **Non-response bias:** the people who reply differ from those who do not.
* **Sampling frame problems:** the list you sample from is not the population.

## A worked example

A population of 1,000 people has an average age of 40. A **random** sample of 100 gives a mean age close to 40, typically within about ±2 if the population's standard deviation is 15 (`15 / √100 = 1.5`).

Now poll only people at a weekday-afternoon event, where mostly retirees show up, and the sample's mean age is 62. Ask 10,000 such people and the average is still about 62: **more data does not remove bias**; it only makes you more confident in the wrong answer.

## Bench

```bench
id: sample-vs-population
title: Random sample versus biased sample
fallback: A population of 1,000 hidden values; draw many samples either at random or with a bias toward larger values, and a histogram of the sample averages shows that random samples centre on the truth while biased ones do not, however large.
```

**Try this**

1. Draw random samples of size 20 and note where the averages centre.
2. Increase the sample size. What narrows?
3. Switch to the biased sampler and repeat.
4. Increase the sample size again: does the bias go away?

**What you should notice:** a larger sample narrows the spread of the estimates, but a biased sampler stays off-centre.

## Where it appears in AI

* **Training data** that under-represents groups makes models perform worse on them.
* **Evaluation sets** must be representative of the deployment population.
* **Feedback loops:** a model that shapes which data it sees can bias its own future data.

## Common pitfalls

* **Believing that a large sample fixes bias.**
* **Convenience sampling:** using whoever is easy to reach.
* **Ignoring who is missing** from the data.
* **Confusing sample size with sample quality.**

## Quick check

<details><summary>1. Which reduces random error: a bigger sample or a fairer sample?</summary>
A bigger sample reduces random error; a fairer (unbiased) sample removes bias.
</details>

<details><summary>2. A survey is sent only to existing customers to find out why people don't buy. What is the problem?</summary>
Selection bias: the non-buyers are missing.
</details>

<details><summary>3. What is the standard error of a mean with σ = 20 and n = 400?</summary>
1.
</details>

## Key terms

* **Population / sample:** everyone of interest / the part observed.
* **Random sample:** every member has an equal chance of selection.
* **Selection bias:** systematic exclusion in how the sample is chosen.
* **Standard error:** the typical random error of a sample mean.

## Related

[[Law of Large Numbers]] · [[Central Limit Theorem]] · [[Describing Data]] · [[Estimation and Bias]] · [[Where AI Goes Wrong]]
