Two quantities are **correlated** when they tend to move together, but that alone does not mean one causes the other. A hidden third factor, a **confounder**, can drive both, and a model that learns a correlation without the cause will break the moment the pattern changes.

**You need:** [[Covariance and Correlation]] and [[Independence]].

## The question it answers

"If A and B move together, does A cause B?" Not necessarily. Ice-cream sales and drowning deaths rise together, but ice cream does not cause drowning: hot weather drives both.

## Intuition: a hidden driver

If `Z` (temperature) raises both `X` (ice-cream sales) and `Y` (swimming, hence drownings), then `X` and `Y` will be correlated even though neither influences the other. Ways this happens:

* **Confounding:** a third variable drives both.
* **Reverse causation:** `Y` actually causes `X`.
* **Coincidence:** with enough variables, some pairs correlate by chance.
* **Selection:** the way data was collected creates a link.

## Telling them apart

* **Hold the confounder fixed.** Compare only cases with similar temperature; if the link vanishes, it was the confounder.
* **Run an experiment** that randomly assigns `X` (a randomised controlled trial). Random assignment breaks any link to hidden causes.
* **Use domain knowledge** about which direction is plausible.

**Simpson's paradox** is a striking case: a trend that appears in every subgroup can reverse when the groups are combined, because group sizes differ.

## A worked example

Suppose in a town, daily temperature `Z` drives ice-cream sales `X` and drownings `Y` (each also has its own noise). Across all days the correlation between `X` and `Y` might be `0.7`. But among days of *similar* temperature, the correlation is close to `0`: the link came entirely from temperature.

A recommender might notice that users who watch trailers buy more tickets and conclude "show more trailers". If enthusiastic users both watch trailers and buy tickets, forcing trailers on everyone would not raise sales.

Correlation coefficient `r` has a formula (see [[Covariance and Correlation]]) but **no value of `r`, however high, proves causation**.

## Bench

```bench
id: confounder-scatter
title: A hidden driver behind a correlation
fallback: Sliders set how strongly a hidden factor drives two variables; the scatter plot of the two variables shows a correlation, and a control restricts the view to days with similar values of the hidden factor to show the link disappearing.
```

**Try this**

1. Set a strong hidden driver and note the correlation between X and Y.
2. Turn on "hold the hidden factor roughly fixed" and see the correlation drop.
3. Set the driver to zero and see the correlation vanish.
4. Add a direct effect of X on Y and compare.

**What you should notice:** a strong correlation appears with no direct link, and it disappears when the hidden factor is held fixed.

## Where it appears in AI

* **Spurious features:** a classifier uses background or watermarks that correlate with the label in training but not in the real world.
* **Fairness:** proxies for protected attributes.
* **Causal questions** ("what if we change this?") need experiments or causal models, not just prediction.

## Common pitfalls

* **Reading causation into correlation.**
* **Ignoring confounders** that are easy to name.
* **Assuming no correlation means no relationship.** It can be curved.
* **Data dredging:** searching many pairs and reporting the strongest.

## Quick check

<details><summary>1. A and B are strongly correlated. Does A cause B?</summary>
Not necessarily: B might cause A, or a third factor might drive both.
</details>

<details><summary>2. What breaks the influence of hidden confounders in an experiment?</summary>
Random assignment.
</details>

<details><summary>3. What is a confounder?</summary>
A hidden variable that affects both quantities under study.
</details>

## Key terms

* **Correlation:** a tendency to move together.
* **Causation:** one thing bringing about another.
* **Confounder:** a hidden common cause.
* **Randomised experiment:** assigning conditions by chance to isolate cause.

## Related

[[Covariance and Correlation]] · [[Independence]] · [[Sampling and Bias]] · [[Hypothesis Testing and P-values]] · [[Where AI Goes Wrong]]
