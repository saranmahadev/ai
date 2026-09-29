**Generalization** is a model's ability to do well on examples it has never seen. A model that merely memorises its training examples, noise and all, scores perfectly on them and poorly on anything new. This gap between training and new data is called **overfitting**, and it is why we always test on data held back from training.

**You need:** [[Training vs Inference]] and [[Measuring Performance]].

## The question it answers

A model gets everything right on its training data. Can you trust it? Not yet. What matters is what happens next time.

## Intuition: the student who memorised the answers

A student memorises last year's exam answers word for word and scores full marks on last year's paper. On this year's paper, with new questions, they struggle. A different student learned the *ideas*, and does well on both. Only the second student **generalised**.

To catch the difference you test on questions the model **has not seen**:

* **Training set**: the examples the model learns from.
* **Test set**: examples held back, used only to judge the finished model.

If training accuracy is high and test accuracy is low, the model has overfit. If both are low, it has **underfit**: it is too simple to capture the pattern.

## A worked example: noisy points on a diagonal

The bench's true pattern is a diagonal line: points above it are "orange", points below are "purple". But 12% of labels are wrong (noise), as real data often is, so no model can score above about 88%.

A model called *k*-nearest neighbours labels a new point by the majority vote of its *k* closest training examples. With *k = 1* it copies the single nearest example, which memorises every noisy label. Larger *k* averages more neighbours:

| k (with 120 examples) | Accuracy on training data | Accuracy on new data |
| --- | --- | --- |
| 1 (pure memorising) | **100%** | **75%** |
| 5 | 87% | 87% |
| 15 | 84% | 84% |
| 31 | 82% | 83% |

The memoriser aces its own examples and fails on new ones. A gentler model scores slightly lower on the training set and much better on new data, close to the noise ceiling. Too much smoothing (very large k) would start to lose the real pattern, which is underfitting.

More data helps too. With only 20 examples and *k = 1*, the test accuracy is about 72%; with 120 examples it is 75%, and with more smoothing it can reach the ceiling.

## Bench

```bench
id: memoriser-vs-rule
title: Memorising vs learning the pattern
fallback: Noisy points around a diagonal boundary, with a nearest-neighbour model whose smoothing you control. The page shows accuracy on the training examples and on new examples, and the model's decision regions.
```

**Try this**

1. Set *k* to 1 with all 120 examples. What are the training and new-data accuracies? Look at the decision regions: do they follow the diagonal?
2. Raise *k* to 5, then 15. What happens to the gap between the two accuracies?
3. Push *k* to 31. Does new-data accuracy keep improving?
4. Cut the training examples to 20 and repeat. How does having less data change the story?

**What you should notice:** high training accuracy alone means little. The number that matters is accuracy on unseen data, and it peaks when the model is complicated enough to catch the pattern but not so flexible that it copies the noise.

## Where it appears in AI

Overfitting and generalization are central to [[Machine Learning]] and [[Deep Learning]], where huge models can memorise huge datasets. Tools such as validation sets, regularisation and early stopping exist to fight it. The concern returns in [[LLMs]], where a model's ability to handle new questions matters more than its ability to repeat text it has seen.

## Common pitfalls

* **Testing on training data.** It says nothing about new cases.
* **Tuning against the test set.** If you keep adjusting the model until the test score looks good, the test set stops being unseen.
* **Assuming a complex model is a better one.** Extra flexibility fits noise as well as signal.
* **Assuming the world stays the same.** New data may differ from anything in training (see [[Where AI Goes Wrong]]).

## Quick check

<details><summary>1. A model scores 99% on training data and 70% on new data. What has happened?</summary>
It has overfit: it memorised training quirks rather than learning the general pattern.
</details>

<details><summary>2. Why keep a test set separate?</summary>
So that you measure performance on examples the model has never seen, which is what real use looks like.
</details>

<details><summary>3. What is underfitting?</summary>
A model too simple to capture the real pattern, so it does poorly on both training and new data.
</details>

## Key terms

* **Training set:** the examples a model learns from.
* **Test set:** examples held back to judge the finished model.
* **Overfitting:** fitting the quirks and noise of the training data, so new data goes badly.
* **Underfitting:** being too simple to capture the real pattern.
* **Noise:** random errors or variation in data that hides the true pattern.

## Related

[[Training vs Inference]] · [[Measuring Performance]] · [[Where AI Goes Wrong]] · [[Machine Learning]] · [[Deep Learning]]
