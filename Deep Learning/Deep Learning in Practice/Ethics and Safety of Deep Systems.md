[[Where AI Goes Wrong]] and [[Fairness Metrics]] cover risks shared across machine learning generally. Deep learning adds a few risks that are specific to it — mostly consequences of scale, of how deep networks tend to memorise, and of what generative models in particular can now produce.

**You need:** [[Where AI Goes Wrong]] and [[Fairness Metrics]].

## The question it answers

"What risks does deep learning specifically add, beyond the bias and fairness concerns that apply to machine learning broadly?" A handful of things scale and memorisation make distinctive: privacy leakage through overfitting, synthetic content convincing enough to deceive at scale, and the sheer compute cost of training and running the largest models.

## Intuition: memorisation as a privacy leak, not just an accuracy problem

[[Overfitting and Double Descent|Overfitting]] is usually framed purely as an accuracy problem — the model does worse on new data. But a model that has memorised specific training examples unusually well is *also* leaking information: an attacker probing the model's confidence can sometimes guess, with real accuracy, whether a particular record was in the training set at all — a genuine privacy concern when that training data is sensitive (medical records, private messages, anything someone didn't expect to be guessable from a trained model's behaviour).

## Definitions

```text
membership inference attack:   guess whether a specific record was in the training set,
                                by exploiting a model's tendency to behave differently
                                (e.g. much lower loss, higher confidence) on examples it was trained on

generative misuse:              using a generative model's realistic output (deepfakes,
                                 synthetic text or images) to deceive, impersonate or defraud

compute/energy cost:            training (and running, at scale) very large models consumes
                                 real, substantial compute and energy
```

## A worked example

The [[Overfitting and Double Descent|double-descent worked example]]'s interpolation-threshold model (exactly `p = n` features) fits its training data *exactly* — training error of essentially zero — while its test error on new data was measured at over 160. That gap is not just a performance problem:

```text
training-set example:  loss ≈ 0          (fit exactly, by construction at this threshold)
held-out example:      loss ≈ 160+       (test error measured for this same model)
```

An attacker who can query this model's loss (or confidence) on a specific record, without knowing whether it was in the training set, could exploit exactly this gap: a suspiciously near-zero loss is a strong signal the record was seen during training — the same overfitting behaviour that hurts accuracy is, here, also a privacy leak.

## Bench

```bench
id: membership-gap
title: The confidence gap overfitting leaves behind
fallback: Adjustable training-set loss and held-out loss values. See how large a gap between them would be, and how that gap could be exploited to guess whether a record was in the training set.
```

**Try this**

1. Set training loss near zero and held-out loss much higher, and note the gap size.
2. Narrow the gap (as a well-regularised model would) and see the privacy risk shrink correspondingly.
3. Think about what kinds of training data would make this risk most serious.

**What you should notice:** regularisation techniques from earlier in this planet (dropout, data augmentation, early stopping) that reduce overfitting also, as a side effect, reduce this particular privacy risk — the two problems share a root cause.

## Where it appears in AI

* **Differential privacy**, a technique not covered in depth here, adds carefully calibrated noise during training specifically to limit how much any single training example can be inferred from the trained model afterward.
* **Deepfake detection** has become its own active research area, directly in response to how convincing generative models' output has become (see [[Generative Adversarial Networks]] and [[Diffusion Models]]).
* **Training large models' compute and energy cost** has become a factor organisations explicitly weigh (and sometimes report) alongside accuracy when deciding how large a model to train.

## Common pitfalls

* **Treating deep-learning-specific risks as separate from, rather than layered on top of, general ML fairness and bias concerns.** Both apply simultaneously to any deployed deep system.
* **Assuming only enormous models carry these risks.** Membership inference and overfitting-related privacy leakage can appear at much smaller scales too, wherever a model memorises its training data unusually well.
* **Treating "the model is very accurate" as evidence it is also safe or fair.** Accuracy, privacy, robustness and fairness are different properties, and a model can score well on one while failing badly on another.

## Quick check

<details><summary>1. What is a membership inference attack trying to determine?</summary>
Whether a specific record was part of a model's training data, typically by exploiting the model's tendency to behave differently (lower loss, higher confidence) on examples it was trained on.
</details>

<details><summary>2. Why does reducing overfitting also tend to reduce membership-inference risk?</summary>
Both problems share the same root cause — a model behaving unusually differently on training examples versus new ones — so regularisation techniques that narrow that gap help with both at once.
</details>

<details><summary>3. What is one deep-learning-specific risk that doesn't apply to classical, non-generative machine learning models in the same way?</summary>
Generative misuse — using a model's realistic synthetic output (deepfakes, fabricated text or images) to deceive, impersonate or defraud, which plain classifiers don't produce.
</details>

## Key terms

* **Membership inference attack:** inferring whether a specific record was in a model's training data.
* **Generative misuse:** using a generative model's realistic output to deceive or defraud.
* **Differential privacy:** training techniques that limit how much any single training example can be inferred from a trained model.

## Related

[[Where AI Goes Wrong]] · [[Fairness Metrics]] · [[Interpretability and Attribution]] · [[Adversarial Examples and Robustness]]
