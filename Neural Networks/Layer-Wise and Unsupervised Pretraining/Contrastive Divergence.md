[[Restricted Boltzmann Machines|The previous topic]] walked through a single CD-1 cycle by hand. This topic zooms out: what happens when that cycle is repeated over an entire dataset, why it is called an *approximation* at all, and what the "1" in CD-1 is short for.

**You need:** [[Restricted Boltzmann Machines]].

## The question it answers

"The exact maximum-likelihood gradient for an RBM needs an intractable sum over every possible hidden and visible state — so what does contrastive divergence actually approximate, and how good is that approximation?" The exact gradient needs the model's negative-phase statistics computed at *equilibrium* — after running Gibbs sampling forever. Contrastive divergence replaces "forever" with a small, fixed number of steps, `k`, starting from the real data instead of from randomness. CD-1 (`k = 1`) is the cheapest, most common choice.

## Intuition

Training an RBM pulls the weights in two opposite directions: toward correlations seen in real data (the "positive phase"), and away from correlations the model currently believes in (the "negative phase"). Computing the negative phase exactly would mean letting the model's own Gibbs sampling run to its equilibrium distribution — in general, an unbounded number of steps. Contrastive divergence's trick is to start that Gibbs chain *at the data* rather than at random noise, and stop after just `k` steps. Because the chain starts close to the data, even a few steps give a reconstruction that is "off" in roughly the right direction — close enough to train from, far cheaper than running to equilibrium.

## Definition and notation

```text
CD-k:  start the Gibbs chain at v⁰ = data, run k steps of alternating
       visible ↔ hidden sampling, then use the chain's final state for
       the negative-phase statistics instead of the true equilibrium.
```

`k = 1` (CD-1) is the version used in [[Restricted Boltzmann Machines|the previous topic's]] worked example. **Persistent contrastive divergence (PCD)** is a variant that keeps a running Gibbs chain across minibatches instead of restarting it at the data every time, trading a bit more computation for a less biased estimate. CD-k is a genuinely biased estimator of the true gradient — it is not that it is "slower but exact," it systematically differs from the true gradient, more so for small `k`.

## A worked example

Training the same style of two-visible, two-hidden RBM on three small binary patterns, repeating a CD-1 update after every pattern, for 100 passes over the data (mean-field reconstruction error, averaged over the three patterns, tracked without any sampling noise):

```text
epoch   1:  error 0.491
epoch  10:  error 0.427
epoch  20:  error 0.425
epoch  60:  error 0.378
epoch 100:  error 0.269
```

The error is not a smooth, monotonic curve — it rises slightly between epoch 0 and epoch 1 before trending down — because CD-1's negative-phase estimate is both approximate and, since the updates themselves use sampled states, noisy. Despite that, the overall trend across 100 passes is a clear and substantial decrease, which is what makes CD-1 useful in practice even though it is not computing the exact gradient.

## Bench

```bench
id: cd-training
title: Training an RBM with contrastive divergence
fallback: Run repeated contrastive-divergence updates over a small dataset and watch the reconstruction error trend down over many epochs, with some noise along the way.
```

**Try this**

1. Run training for a small number of epochs and watch the error fluctuate without a clear trend yet.
2. Run for many more epochs and see the overall downward trend become clear despite the noise.
3. Compare CD-1 against a larger number of Gibbs steps per update, and notice the trade-off between cost per update and how biased each update is.

**What you should notice:** contrastive divergence trades an exact, intractable gradient for a cheap, biased, noisy one — and that trade is worth it because, averaged over many updates, the biased estimate still reliably points the weights in a useful direction.

## Where it appears in AI

* **It is the training rule that made [[Deep Belief Networks|stacking RBMs into deep networks]] practical**, one layer at a time, each trained with CD before the next layer was added.
* **The bias-for-speed trade-off recurs constantly in machine learning** — stochastic gradient descent itself, covered in [[Machine Learning]], is a related story: cheap, noisy gradient estimates that work well in aggregate.
* **Modern practice has mostly moved away from CD**, in favour of methods like score matching or simply not using RBMs at all — see [[Choosing Classical vs Modern Approaches]] for when a classical energy-based model is still the right tool.

## Common pitfalls

* **Calling CD-1 "slow but exact."** It is fast *and* approximate — the bias does not disappear with more training, only with a larger `k` (more Gibbs steps per update).
* **Expecting a smooth, monotonic error curve.** Because both the updates and the error's inputs involve sampling, short-term noise is normal; judge CD training by its trend over many epochs, not epoch to epoch.
* **Confusing CD-k's `k` with the number of training epochs.** `k` is the number of Gibbs steps inside *one* update; the number of epochs is how many times the whole dataset is passed through.

## Quick check

<details><summary>1. What does contrastive divergence approximate, and what makes the true version intractable?</summary>
It approximates the negative-phase (model-distribution) statistics needed for the exact maximum-likelihood gradient, which in principle requires running Gibbs sampling to equilibrium — an unbounded number of steps.
</details>

<details><summary>2. Why does CD-k start its Gibbs chain at the real data instead of at a random state?</summary>
Starting near the data means even a small number of steps (`k`) gives a reconstruction that is already close to correct, making the short chain a usable stand-in for the true equilibrium statistics.
</details>

<details><summary>3. In the worked example, why does the reconstruction error rise slightly before it falls?</summary>
Both the CD-1 updates and the error estimate rely on sampled, stochastic states, so short-term noise is expected even while the longer-run trend is downward.
</details>

## Key terms

* **Positive phase:** the part of the gradient computed from real data.
* **Negative phase:** the part of the gradient that should reflect the model's own equilibrium distribution, approximated by a short Gibbs chain in CD-k.
* **Persistent contrastive divergence:** a variant that keeps a Gibbs chain running across updates instead of restarting it at the data each time.

## Related

[[Restricted Boltzmann Machines]] · [[Deep Belief Networks]] · [[Boltzmann Machines]]
