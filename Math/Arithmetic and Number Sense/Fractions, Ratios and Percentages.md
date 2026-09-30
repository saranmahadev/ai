A **fraction**, a **decimal** and a **percentage** are three ways of writing the same quantity, and a **ratio** compares two quantities. Moving between them fluently is the everyday skill behind probabilities, accuracy scores and learning rates.

**You need:** [[Numbers and Their Kinds]].

## The question it answers

"What share of the whole is this, and how do I say it in the form I need?" A classifier is "0.92 accurate", "92% accurate" and "correct on 23 of 25 cases": three phrasings of one fact.

## Intuition: slicing a whole

A fraction `a/b` means "a parts out of b equal parts". Cut a bar into `b` equal slices and shade `a` of them. The decimal is the same share as a number between 0 and 1, and the percentage is the same share out of 100.

```text
3/4  =  0.75  =  75%
```

* **Fraction → decimal:** divide. 3 ÷ 4 = 0.75.
* **Decimal → percentage:** multiply by 100. 0.75 × 100 = 75%.
* **Percentage → decimal:** divide by 100.

Equal fractions describe the same share: `3/4 = 6/8 = 75/100`. Multiplying or dividing top and bottom by the same number never changes the value.

## Ratios

A **ratio** compares two amounts, written `a : b`. A recipe with 2 cups of flour to 1 cup of sugar has ratio 2 : 1, meaning flour is two thirds of the total (2 out of 3 parts) and sugar one third. A ratio compares parts to parts, while a fraction compares a part to the whole.

## Definition and rules

```text
a/b + c/b = (a + c)/b                 same bottom: add the tops
a/b + c/d = (a·d + c·b)/(b·d)         different bottoms: cross-multiply
a/b × c/d = (a·c)/(b·d)               multiply tops and bottoms
a/b ÷ c/d = a/b × d/c                 divide by flipping the second
x% of N   = (x/100) × N
```

## A worked example

A spam filter checks 200 emails and is right on 178.

```text
fraction:    178/200 = 89/100
decimal:     0.89
percentage:  89%
```

Of the 200 emails, 50 were spam and 150 were not. The ratio of spam to not-spam is 50 : 150 = 1 : 3. So spam is 1 part in 4, or 25% of the total.

A percentage change is relative to the start: accuracy rising from 80% to 88% is an increase of 8 *percentage points*, which is a relative rise of 8 ÷ 80 = 10%.

## Bench

```bench
id: fraction-linker
title: Fractions, decimals and percentages
fallback: Sliders for a numerator and denominator show the same share as a shaded bar, a decimal and a percentage, with the reduced fraction alongside.
```

**Try this**

1. Set 3 out of 4, then 6 out of 8. What stays the same?
2. Move the denominator to 100. How does the percentage relate to the numerator?
3. Find a fraction that gives a repeating decimal.
4. Set the numerator larger than the denominator. What does the bar show?

**What you should notice:** equal fractions fill the same fraction of the bar. Every fraction has a decimal and a percentage twin.

## Where it appears in AI

* **Probabilities** are fractions between 0 and 1 (see [[Probability Rules]]).
* **Accuracy, precision and recall** are ratios of counts.
* **Dropout rates and learning rates** are usually written as decimals.

## Common pitfalls

* **Percentage points vs percent.** A rise from 2% to 3% is one point but a 50% relative increase.
* **Adding tops and bottoms.** 1/2 + 1/3 is not 2/5; it is 5/6.
* **Confusing ratio with fraction.** A ratio of 1 : 3 means one quarter of the total, not one third.
* **Dividing by a percentage as if it were a whole number.** 50% of 80 is 0.5 × 80 = 40, not 50 × 80.

## Quick check

<details><summary>1. Write 3/8 as a decimal and a percentage.</summary>
3 ÷ 8 = 0.375, which is 37.5%.
</details>

<details><summary>2. What is 1/2 + 1/3?</summary>
3/6 + 2/6 = 5/6.
</details>

<details><summary>3. A model goes from 90% to 99% accuracy. What is the relative reduction in error?</summary>
Error falls from 10% to 1%, a tenfold reduction (a 90% relative drop).
</details>

## Key terms

* **Fraction:** a number written as a part over a whole, `a/b`.
* **Decimal:** a number written with digits after a point.
* **Percentage:** a share out of 100.
* **Ratio:** a comparison of two quantities, `a : b`.
* **Percentage point:** the difference between two percentages.

## Related

[[Numbers and Their Kinds]] · [[Order of Operations and Properties]] · [[Probability Rules]] · [[Estimation and Sanity Checks]]
