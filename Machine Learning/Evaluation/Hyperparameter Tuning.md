Parameters are learned; **hyperparameters** are chosen before training: learning rate, tree depth, penalty strength, number of neighbours. Tuning means trying combinations and keeping the one with the best validation score, within a fixed budget of training runs. How you spend the budget matters.

**You need:** [[Cross-Validation]], [[Pruning and Overfitting]] and [[Learning Rate]].

## The question it answers

"How do I choose the settings?" There is no formula; you search, and the search itself can overfit the validation data if you are careless.

## Intuition: hunting for a peak with few tries

Imagine validation score as a landscape over the settings. Some settings matter a lot (learning rate: too high or too low ruins training) and others barely (a mild penalty). You have, say, nine training runs. A **grid** tries a neat lattice: 3 values of each of 2 settings, so only 3 distinct values of the setting that matters. **Random search** picks nine random points, so it tries nine distinct values of *every* setting, and is more likely to land near the peak of the one that matters.

## Definitions

```text
grid search      try every combination from a fixed list of values per setting
random search    sample settings at random (often on a log scale for rates and penalties)
smarter search   Bayesian optimisation, successive halving: spend more on promising settings
search scale     learning rates and penalties are searched on a log scale: 10⁻⁴ … 1
```

Each trial is scored by cross-validation or a validation set. The best score found is optimistically biased: having picked the winner among many, its true performance is usually a bit lower, so report the final result on a test set touched only once.

## A worked example

A hidden validation score depends strongly on the learning rate (best near `10⁻²·³`) and weakly on regularisation; the true best score is 0.950. Best score found with the same number of trials:

```text
trials     grid search     random search (average of 200 draws)
   9          0.856              0.869   (median 0.893)
  16          0.907              0.902
  25          0.856              0.919   (median 0.928)
```

Random search is ahead at 9 and 25 trials and tied at 16. The grid's results are lumpy: 25 trials on a 5 × 5 lattice test only five learning rates, and none falls near the peak, whereas 25 random trials try 25 different ones. A single random draw can be unlucky (one seed scored only 0.774 at 9 trials), so the guarantee is about averages, not any one run.

## Bench

```bench
id: search-budget
title: Spend a tuning budget
fallback: A hidden validation-score landscape over learning rate and regularisation; the bench places grid or random trials with a chosen budget and shows the best score found, the best possible, and how many different learning rates were tried.
```

**Try this**

1. Use a grid with 9 trials and count the distinct learning rates.
2. Switch to random with 9 trials and press **New random draw** several times.
3. Raise the budget to 25 for each strategy.
4. Compare the best score with the best possible.

**What you should notice:** a grid repeats the same few values of the setting that matters, while random search explores it more richly but varies from draw to draw.

## Where it appears in AI

* **Every training pipeline:** learning rate, depth, penalties, batch size.
* **Automated tools:** Optuna, Ray Tune and similar libraries.
* **Neural network training:** the learning rate is usually the most important hyperparameter to tune.

## Common pitfalls

* **Tuning on the test set.**
* **Searching a linear scale** for rates and penalties that need a log scale.
* **Too few trials** for too many settings.
* **Reporting the best validation score** as if it were unbiased.

## Quick check

<details><summary>1. What is the difference between a parameter and a hyperparameter?</summary>
Parameters are learned during training; hyperparameters are set beforehand.
</details>

<details><summary>2. Why can random search beat grid search for the same budget?</summary>
It tries more distinct values of each setting, so it is likelier to land near the ones that matter.
</details>

<details><summary>3. Why report performance on a test set after tuning?</summary>
The best validation score is optimistically biased by the selection.
</details>

## Key terms

* **Hyperparameter:** a setting chosen before training.
* **Grid search:** trying every combination of listed values.
* **Random search:** sampling settings at random.
* **Search budget:** the number of training runs you can afford.

## Related

[[Cross-Validation]] · [[Pruning and Overfitting]] · [[Learning Rate]] · [[Ridge and Lasso]] · [[Common Test Mistakes]]
