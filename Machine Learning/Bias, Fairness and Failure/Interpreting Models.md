When a model makes a decision that matters, people ask why. Some models can be read directly (a short tree, the weights of a linear model), but the most accurate ones cannot. **Model-agnostic tools** such as **permutation importance** treat the model as a black box: scramble one feature and see how much the score suffers. A big drop means the model leans on that feature.

**You need:** [[Logistic Regression as a Classifier]], [[Random Forests]] and [[Correlation vs Causation]].

## The question it answers

"Which inputs is the model actually using?" That helps debug (is it relying on a leaky or spurious feature?), build trust, and satisfy people who are affected by decisions.

## Intuition: break one thing and see what fails

Take a trained model and a held-out set. Randomly shuffle one feature's column so it no longer matches the rows: that feature now carries no information, but keeps its normal range. If accuracy barely moves, the model was not using it. If accuracy collapses, the model depended on it. Repeat for each feature (several shuffles each, since one is noisy).

## Definitions

```text
permutation importance of feature j = score on the test set − score with column j shuffled
global explanation       how the model behaves overall (importance, partial dependence)
local explanation        why this one prediction was made (methods such as LIME and SHAP)
intrinsically readable   linear models, short trees, rule lists
```

Importance measures the model's *reliance*, not causal effect in the world. Features that carry the same information share the credit, so each looks less important than it really is. Importance computed on training data can flatter overfitted features; use held-out data.

## A worked example

Four features: a real signal `A`, a noisy copy of `A`, a weaker real signal `B`, and pure noise. A logistic regression reaches 90.5% on 400 held-out points. Average accuracy over 20 shuffles of each column:

```text
shuffled feature           accuracy    drop
signal A                    63.0%     27.5 points
copy of A                   86.5%      4.0
signal B                    79.2%     11.3
pure noise                  91.1%     −0.6  (no reliance)
A and its copy together     56.5%     34.0
```

Shuffling `A` costs 27.5 points, `B` 11.3, noise nothing, as expected. The copy of `A` looks nearly unimportant (4 points) even though it carries the same information as `A`: the model spreads the weight between them, so scrambling one leaves the other to compensate. Scrambling both drops accuracy by 34 points, more than either alone. Reading the copy's low score as "useless" would be a mistake.

## Bench

```bench
id: permutation-importance
title: Shuffle a feature, watch the score
fallback: Four features (two real signals, a noisy copy of one, and pure noise) feed a logistic regression; tick which columns to shuffle to see the accuracy on held-out points, with a chart of the accuracy lost when each feature is shuffled alone.
```

**Try this**

1. Shuffle each feature on its own and read the drop.
2. Shuffle the noise column and note the change.
3. Shuffle signal A and its copy together.
4. Compare the copy's solo drop with its real information content.

**What you should notice:** real signals cost accuracy when scrambled, noise costs nothing, and features that duplicate each other hide one another's importance.

## Where it appears in AI

* **Debugging:** finding leaky or spurious features.
* **Regulated decisions:** explaining credit and insurance models.
* **Tree ensembles:** built-in importances (with the same caveats).
* **Neural networks:** saliency maps and attribution methods.

## Common pitfalls

* **Reading importance as causation.**
* **Correlated features** hiding each other's importance.
* **Computing importance on training data.**
* **Trusting a pretty explanation:** explanations can be unstable or misleading, so check them.

## Quick check

<details><summary>1. What does shuffling a feature's column remove?</summary>
Its relationship with the label, while keeping the feature's overall distribution.
</details>

<details><summary>2. Why can a useful feature show low permutation importance?</summary>
Another feature carries the same information, so the model can lean on that one instead.
</details>

<details><summary>3. Does high importance mean a feature causes the outcome?</summary>
No, only that the model relies on it.
</details>

## Key terms

* **Permutation importance:** the score drop when one feature is shuffled.
* **Global vs local explanation:** how a model behaves overall vs why one prediction was made.
* **Black-box model:** a model whose internals are not directly interpretable.
* **Feature attribution:** assigning credit for a prediction to its inputs.

## Related

[[Random Forests]] · [[Logistic Regression as a Classifier]] · [[Correlation vs Causation]] · [[Decision Trees]] · [[Where AI Goes Wrong]]
