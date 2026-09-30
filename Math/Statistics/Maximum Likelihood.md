**Maximum likelihood estimation** picks the parameter value that makes the observed data as probable as possible. It is the most widely used way to fit a model, and many familiar loss functions, including squared error and cross-entropy, are negative log-likelihoods in disguise.

**You need:** [[Estimation and Bias]], [[Discrete Distributions]], [[Logarithms]] and [[Derivatives]].

## The question it answers

"Which parameter values best explain what I saw?" A coin lands heads 7 times in 10. Which chance of heads makes that result least surprising?

## Intuition: score each candidate by how well it predicts the data

For each candidate parameter, compute the probability the model would have assigned to the data you actually observed. That number, viewed as a function of the parameter, is the **likelihood**. Choose the parameter where it peaks.

```text
L(θ) = P(data | θ)            the likelihood
θ̂  = the θ that maximises L(θ)
```

For independent observations the likelihood is a product, which is awkward for both maths and computers, so we take logs: the **log-likelihood** turns the product into a sum, and it peaks at the same place (see [[Logarithms]]).

```text
log L(θ) = Σ log P(xᵢ | θ)
```

## A worked example: a coin

Seven heads and three tails in 10 flips. For heads-chance `p`, the probability of one *specific* sequence with 7 heads is:

```text
L(p) = p⁷ (1 − p)³
L(0.5) = 0.5¹⁰                   = 0.000977
L(0.7) = 0.7⁷ × 0.3³ = 0.0824 × 0.027 = 0.002224
L(0.9) = 0.9⁷ × 0.1³             = 0.000478
```

`p = 0.7` beats both neighbours. Setting the derivative of `log L = 7 ln p + 3 ln(1 − p)` to zero: `7/p − 3/(1 − p) = 0`, so `p = 7/10`. In general the MLE for a coin is simply the **fraction of heads**.

For a normal distribution with known spread, the MLE of the mean is the sample mean; and maximising the log-likelihood of normally distributed errors is the same as **minimising squared error** (see [[Least Squares]]). For classification, maximising the likelihood of the labels is the same as minimising **cross-entropy** (see [[Cross-Entropy]]).

## Bench

```bench
id: likelihood-peak
title: Slide the parameter, watch the likelihood peak
fallback: Set the number of heads and flips; a slider chooses the coin's heads-chance and the bench plots the likelihood (or log-likelihood) with the maximum marked and compares your choice with the best value.
```

**Try this**

1. Set 7 heads in 10 and slide p to find the peak.
2. Increase the number of flips at the same fraction of heads: how does the peak's width change?
3. Switch to the log-likelihood and compare the peak's location.
4. Try 0 heads.

**What you should notice:** the peak sits at the observed fraction, more data makes it sharper, and the log turns a tiny number into a manageable one without moving the peak.

## Where it appears in AI

* **Training classifiers and language models** maximises the likelihood of the data.
* **Cross-entropy loss** is the negative average log-likelihood.
* **Gaussian noise assumptions** give squared-error loss.
* **Generative models** are fitted by maximum likelihood.

## Common pitfalls

* **Treating the likelihood as a probability of the parameter.** It is not (that is Bayesian; see [[Bayesian vs Frequentist]]).
* **Overfitting:** the MLE can be extreme with little data (0 heads gives p = 0).
* **Multiplying many small probabilities** instead of adding logs.
* **Assuming a unique peak.** Some likelihoods have several.

## Quick check

<details><summary>1. 3 heads in 12 flips: what is the MLE of p?</summary>
3/12 = 0.25.
</details>

<details><summary>2. Why use the log-likelihood?</summary>
Products become sums, which are easier and numerically safer, and the peak is unchanged.
</details>

<details><summary>3. What loss corresponds to the log-likelihood of yes/no labels?</summary>
Cross-entropy.
</details>

## Key terms

* **Likelihood:** the probability of the data as a function of the parameters.
* **Maximum likelihood estimate (MLE):** the parameter maximising the likelihood.
* **Log-likelihood:** the logarithm of the likelihood.
* **Negative log-likelihood:** the loss obtained by flipping the sign.

## Related

[[Estimation and Bias]] · [[Discrete Distributions]] · [[Logarithms]] · [[Cross-Entropy]] · [[Bayesian vs Frequentist]]
