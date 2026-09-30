Statisticians have two philosophies. **Frequentists** treat probability as a long-run frequency and parameters as fixed but unknown numbers, so they ask how data would behave over repeated experiments. **Bayesians** treat probability as a degree of belief and parameters as uncertain quantities, so they combine a **prior** belief with data to get a **posterior** belief.

**You need:** [[Bayes Theorem]], [[Maximum Likelihood]] and [[Confidence Intervals]].

## The question it answers

"What does it mean to be uncertain about a parameter, and how do I update?" The two views give different-looking answers to the same problem, and modern machine learning uses ideas from both.

## Intuition: repeated experiments versus updated beliefs

**Frequentist:** the coin's heads-chance `p` is a fixed number. We estimate it (say by maximum likelihood) and quote a confidence interval, whose meaning is about repeating the experiment many times. We do not assign probabilities to `p` itself.

**Bayesian:** we describe our uncertainty about `p` with a distribution, the **prior**. Data arrives, and Bayes' rule updates it into the **posterior**:

```text
posterior  ∝  likelihood × prior            P(θ | data) ∝ P(data | θ) · P(θ)
```

The posterior can then be the prior for the next batch of data.

## A worked example: a coin

Flip 10 times, see 7 heads. Frequentist maximum likelihood: `p̂ = 0.7`.

Bayesian, with a **Beta** prior (a flexible distribution over `[0, 1]`): a `Beta(α, β)` prior updated with `h` heads and `t` tails becomes `Beta(α + h, β + t)`, whose mean is `(α + h)/(α + β + h + t)`.

```text
flat prior Beta(1, 1):    posterior Beta(8, 4)     mean 8/12 = 0.667
sceptical prior Beta(5, 5) (a fair-ish coin):   posterior Beta(12, 8)    mean 12/20 = 0.600
```

With a flat prior the posterior sits close to the data (0.667 versus 0.7). A strong prior belief in fairness pulls the estimate toward 0.5 (0.6). With more data the prior matters less: at 700 heads in 1,000 flips both priors give a posterior mean of about 0.70.

The prior acts like **imaginary earlier flips**, a natural way to add caution when data is scarce. It is also how **regularisation** can be read: an L2 penalty is a normal prior on the weights (see [[Regularization as a Constraint]]).

## Bench

```bench
id: prior-posterior
title: Beliefs before and after the data
fallback: Sliders set how strongly you believe the coin is fair, and the heads and flips observed; curves show the prior, the likelihood and the posterior, with the posterior mean and the maximum-likelihood estimate compared.
```

**Try this**

1. Start with a flat prior (strength 1) and 7 heads in 10.
2. Strengthen the prior toward fairness and watch the posterior shift.
3. Keep the same fraction of heads and increase the flips.
4. Compare the posterior mean with the frequentist estimate.

**What you should notice:** the posterior is a compromise between prior and data, and more data pulls it toward what the data says.

## Where it appears in AI

* **Bayesian machine learning** keeps distributions over model parameters.
* **Regularisation** has a Bayesian reading as a prior.
* **Naive Bayes, Bayesian optimisation and Gaussian processes** use these ideas directly.
* **Frequentist tools** still dominate evaluation: p-values and confidence intervals.

## Common pitfalls

* **Treating the prior as arbitrary.** It should encode real knowledge and be reported.
* **Ignoring the prior** when data is scarce.
* **Confusing credible and confidence intervals.**
* **Thinking one philosophy is always right.** Each suits different questions.

## Quick check

<details><summary>1. What is posterior ∝ ?</summary>
Likelihood times prior.
</details>

<details><summary>2. A Beta(1, 1) prior and 3 heads, 1 tail: which Beta is the posterior?</summary>
Beta(4, 2).
</details>

<details><summary>3. How does more data affect the influence of the prior?</summary>
It shrinks.
</details>

## Key terms

* **Frequentist:** probability as long-run frequency.
* **Bayesian:** probability as a degree of belief.
* **Prior / posterior:** belief before / after seeing data.
* **Conjugate prior:** a prior that keeps the posterior in the same family (Beta for coins).

## Related

[[Bayes Theorem]] · [[Maximum Likelihood]] · [[Confidence Intervals]] · [[Regularization as a Constraint]] · [[Estimation and Bias]]
