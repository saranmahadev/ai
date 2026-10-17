Given a fixed training budget, there's a real choice buried inside it: spend it on a bigger model, or on more training data? Get this split wrong and you leave real performance on the table, for free, with no extra compute spent.

**You need:** [[Causal Language Modeling as a Pretraining Objective]].

## The question it answers

"Given a fixed compute budget, what's the best way to split it between model size and training data?" A loss surface like `L(N, D) = E + A/N^α + B/D^β` — an irreducible floor plus two separately-shrinking terms, one for model size `N`, one for training tokens `D` — can be minimized subject to a fixed total compute `C ≈ 6ND` (the standard FLOPs-per-token-per-parameter approximation for training). The Chinchilla paper's finding, confirmed by exactly this kind of minimization, was that earlier large models had been **too big for their training data** — compute would have been better spent on more tokens, holding the same budget fixed.

## Intuition

Given a fixed amount of money to spend on either a bigger kitchen or more cooking lessons, spending it all on the kitchen while barely practicing wastes the kitchen's potential; spending it all on lessons with a tiny kitchen hits a different ceiling. There's a genuine optimal split for any given budget — and the striking finding behind Chinchilla-style scaling is that, for a loss function shaped this way, that split tends to grow model size and training data at *roughly the same rate* as the budget grows, not favoring one lopsidedly over the other.

## Definition and notation

```text
L(N, D) = E + A/Nᵅ + B/Dᵝ        (E: irreducible loss floor)
compute constraint: C ≈ 6 · N · D

compute-optimal (N*, D*) = argmin L(N, D)  subject to  C = 6ND
```

## A worked example

Minimizing a toy loss surface (`α = β = 0.5`, so model size and data are symmetric) across three compute budgets, two orders of magnitude apart each:

```text
C = 10¹⁸:  N* ≈ 4.07×10⁸   D* ≈ 4.09×10⁸   loss ≈ 1.540
C = 10²⁰:  N* ≈ 4.07×10⁹   D* ≈ 4.09×10⁹   loss ≈ 1.513
C = 10²²:  N* ≈ 4.07×10¹⁰  D* ≈ 4.09×10¹⁰  loss ≈ 1.504
```

Going from `C = 10¹⁸` to `C = 10²⁰` — a 100× increase in compute — the optimal model size *and* the optimal data size both grow by almost exactly 10×, matching `100^0.5 = 10` from the symmetric exponents. Model size and data aren't competing for the extra budget; at the optimum, they grow together.

## Bench

```bench
id: chinchilla-optimal
title: Splitting a compute budget in two
fallback: Adjust a compute budget and watch the optimal model size and training-token count grow together.
```

**Try this**

1. Set a small compute budget and note the optimal N and D.
2. Raise it by two orders of magnitude and compare the growth factor for each.
3. Check that N and D grow by roughly the same factor.

**What you should notice:** at every compute budget tested, the optimal split keeps model size and data size close to each other — this toy loss surface's symmetric exponents are exactly why neither one dominates the optimal allocation.

## Where it appears in AI

* **The actual Chinchilla paper (Hoffmann et al., 2022) found several earlier large models had been trained with roughly this kind of imbalance** — too many parameters relative to the training tokens they'd been given, for their actual compute budget.
* **This result changed how major labs allocate training budgets**, generally shifting toward relatively smaller models trained on relatively more data, compared to the scaling philosophy that preceded it.
* **[[Scaling Laws Beyond Chinchilla: Data-Constrained and Overtrained Regimes|real deployments often deliberately deviate from this optimum]]** — a model meant to be served cheaply might be trained smaller and "overtrained" on more data than the compute-optimal split would suggest, trading training efficiency for inference efficiency.

## Common pitfalls

* **Assuming "optimal" means "best possible model."** Compute-optimal means best use of a *fixed training budget* — a model trained compute-optimally with a small budget can still be much worse than a larger-budget model trained sub-optimally.
* **Treating the exponents α and β as universal constants.** They're empirically fit to a specific architecture, data distribution, and training setup — different setups can shift exactly where the optimal split falls.
* **Forgetting the compute constraint itself is an approximation.** `C ≈ 6ND` is a standard rule of thumb for transformer training FLOPs, not an exact accounting of every computational cost involved.

## Quick check

<details><summary>1. What question does compute-optimal scaling actually answer?</summary>
Given a fixed training compute budget, how that budget should be split between model size (parameters) and training data (tokens) to minimize loss.
</details>

<details><summary>2. In the worked example, what happened to the optimal model size and data size when compute grew by 100×?</summary>
Both grew by almost exactly 10× — matching the square root of the compute increase, since the toy loss surface's exponents treated model size and data symmetrically.
</details>

<details><summary>3. What was the Chinchilla paper's key finding about earlier large models?</summary>
That several of them had been trained too large relative to the amount of data they were given, for their actual compute budget — the same compute would have gone further with a smaller model trained on more tokens.
</details>

## Key terms

* **Compute-optimal scaling:** the split of a fixed compute budget between model size and training data that minimizes loss.
* **Scaling law:** an empirical power-law relationship between loss and model size, data, or compute.
* **FLOPs:** floating-point operations, the unit used to measure and budget training compute.

## Related

[[Causal Language Modeling as a Pretraining Objective]] · [[Scaling Laws Beyond Chinchilla: Data-Constrained and Overtrained Regimes]] · [[Emergent Abilities and Capability Jumps]]
