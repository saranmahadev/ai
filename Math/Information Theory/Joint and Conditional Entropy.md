**Joint entropy** `H(X, Y)` is the uncertainty of two variables together, and **conditional entropy** `H(Y | X)` is the uncertainty left in `Y` once you know `X`. Their relationship, `H(X, Y) = H(X) + H(Y | X)`, is the entropy version of the chain rule of probability.

**You need:** [[Entropy]] and [[Joint and Marginal Distributions]].

## The question it answers

"After I learn one thing, how much uncertainty remains about another?" If a weather report removes most of the uncertainty about whether to bring an umbrella, the conditional entropy is small.

## Intuition: total uncertainty splits into two parts

The total uncertainty of the pair splits into the uncertainty of `X`, plus what is left of `Y` after `X` is known:

```text
H(X, Y) = H(X) + H(Y | X)             (chain rule)
H(Y | X) = H(X, Y) − H(X)
H(Y | X) ≤ H(Y)                       knowing X never increases uncertainty on average
```

If `X` tells you nothing about `Y` (independent), then `H(Y | X) = H(Y)`. If `X` determines `Y` completely, `H(Y | X) = 0`.

## A worked example

Use the joint table from [[Joint and Marginal Distributions]]:

```text
            Y = 0   Y = 1  | P(X)
X = 0        0.30    0.20  | 0.50
X = 1        0.10    0.40  | 0.50
              0.40    0.60     = P(Y)
```

```text
H(X)      = 1 bit                                       (0.5, 0.5)
H(Y)      = −(0.4·log₂ 0.4 + 0.6·log₂ 0.6) = 0.971 bits
H(X, Y)   = −Σ p·log₂ p over the four cells = 0.521 + 0.464 + 0.332 + 0.529 = 1.846 bits
H(Y | X)  = 1.846 − 1 = 0.846 bits
```

Knowing `X` reduces our uncertainty about `Y` from `0.971` to `0.846` bits, a saving of `0.125` bits. That saving has a name: the **mutual information** (see [[Mutual Information]]).

For language, `H(next word | previous words)` is what a language model tries to make small: the better it predicts, the lower this conditional entropy.

## Bench

```bench
id: table-entropy
title: Entropy of a joint table
fallback: Sliders set three cells of a two-by-two joint table; the bench shows H(X), H(Y), H(X,Y), H(Y given X) and how much knowing X reduces the uncertainty about Y.
```

**Try this**

1. Start with the example table and check the chain rule.
2. Make X and Y independent: does knowing X help?
3. Make Y almost determined by X.
4. Compare H(Y | X) with H(Y).

**What you should notice:** conditioning never raises entropy on average, it is unchanged for independent variables, and it drops to zero if one variable determines the other.

## Where it appears in AI

* **Language modelling:** the conditional entropy of the next token.
* **Feature usefulness:** how much a feature reduces label uncertainty.
* **Decision trees:** conditional entropy after a split.

## Common pitfalls

* **Confusing `H(Y | X)` with `H(X | Y)`.** They usually differ.
* **Assuming `H(X, Y) = H(X) + H(Y)`.** That holds only for independence.
* **Forgetting the weighting** by `P(X)` when averaging.
* **Mixing bits and nats.**

## Quick check

<details><summary>1. If X and Y are independent, what is H(X, Y)?</summary>
H(X) + H(Y).
</details>

<details><summary>2. If Y is determined by X, what is H(Y | X)?</summary>
0.
</details>

<details><summary>3. Can H(Y | X) exceed H(Y)?</summary>
No (on average, conditioning does not increase entropy).
</details>

## Key terms

* **Joint entropy:** the uncertainty of two variables together.
* **Conditional entropy:** the uncertainty left in one after knowing another.
* **Chain rule:** `H(X, Y) = H(X) + H(Y | X)`.
* **Determined:** fixed exactly by another variable.

## Related

[[Entropy]] · [[Joint and Marginal Distributions]] · [[Conditional Probability]] · [[Mutual Information]]
