**Boosting** builds a model in rounds. Start with a crude prediction, look at what it still gets wrong (the residuals), fit a small tree to those errors, add it in, and repeat. Each new tree fixes what the previous ones missed. Gradient boosting is the workhorse behind many of the best models for tabular data.

**You need:** [[Random Forests]], [[The Learning Loop]] and [[Gradient Descent]].

## The question it answers

"How can many weak models add up to a strong one?" Not by voting independently as a forest does, but by working as a team in sequence, each one specialising in the previous team's mistakes.

## Intuition: correct the leftovers

Predict every house price as the average. That is wrong by different amounts for different houses. Fit a small tree to those leftover errors: it learns "large houses are under-predicted". Add a fraction of its prediction. The errors shrink; fit another tree to the new leftovers, and so on. The **learning rate** scales each tree's contribution so no single tree dominates.

## Definitions

```text
start:        F₀(x) = average of y
each round:   residuals  rᵢ = yᵢ − F(xᵢ)
              fit a small tree h(x) to the residuals
              F(x) ← F(x) + η · h(x)          (η is the learning rate, e.g. 0.1)
```

For squared error the residuals are exactly the negative gradient of the loss, which is where "gradient" comes from: boosting is gradient descent in the space of functions, each tree a step. Trees are kept shallow (stumps or depth 3–6) because they only need to be weak learners.

## A worked example

Sixty noisy points along a wiggly curve; 200 unseen points to test on; each tree is a single split (a stump). The noise alone limits the best possible error to about 0.09. Mean squared error after each round (learning rate 0.3):

```text
trees      0       1      5      10     20     50     100    150
train    0.546   0.400  0.238  0.177  0.120  0.069  0.050  0.042
unseen   0.697   0.569  0.383  0.295  0.224  0.153  0.137  0.136
```

Error falls fast at first and then slowly. With a learning rate of 1 (each stump added at full strength) the model learns faster but overfits sooner:

```text
lr 1:  unseen error 0.151 at 20 trees, rising to 0.160 by 150 trees (training 0.020)
```

So a small learning rate with many trees usually wins, at the price of more rounds. The number of rounds is chosen on validation data (early stopping).

## Bench

```bench
id: gradient-boosting
title: Boosting, one small tree at a time
fallback: A wiggly curve with noisy points is fitted by adding one single-split tree per step to what is still wrong; a slider sets the learning rate and the bench shows the growing prediction, the residuals and the training and unseen error.
```

**Try this**

1. Press **Add a tree** several times and watch the curve bend.
2. Play to 100 trees at learning rate 0.3.
3. Reset and play with learning rate 1.
4. Compare the unseen error at 20 and at 150 trees for each rate.

**What you should notice:** the fitted curve builds up step by step, training error keeps falling, and a large learning rate lets unseen error turn back up sooner.

## Where it appears in AI

* **XGBoost, LightGBM and CatBoost** dominate tabular competitions and industry ranking and risk models.
* **The idea of fitting residuals** reappears in stacked and residual architectures.
* **Gradient boosting for other losses:** classification, ranking, quantiles.

## Common pitfalls

* **Too many rounds without early stopping,** which overfits.
* **Deep trees,** which make each round too strong.
* **Noisy labels,** which boosting eagerly chases.
* **Comparing on the training set:** boosting fits it extremely well.

## Quick check

<details><summary>1. What does each new tree in boosting try to predict?</summary>
The residuals: what the current model still gets wrong.
</details>

<details><summary>2. What does a smaller learning rate do?</summary>
Each tree contributes less, so more rounds are needed but overfitting is slower.
</details>

<details><summary>3. How does boosting differ from a random forest?</summary>
Boosting builds trees in sequence to correct earlier errors; a forest builds independent trees in parallel and averages them.
</details>

## Key terms

* **Boosting:** building a model in rounds, each fixing earlier errors.
* **Residual:** the current error, actual minus predicted.
* **Weak learner:** a small, simple model such as a stump.
* **Early stopping:** stopping rounds when validation error stops improving.

## Related

[[Random Forests]] · [[Decision Trees]] · [[Gradient Descent]] · [[The Learning Loop]] · [[Learning Rate]]
