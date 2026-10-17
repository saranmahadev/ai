[[Layer Normalization Placement: Pre-Norm vs Post-Norm|The previous topic]] was about *where* normalization sits. This one is about *what it computes*: LayerNorm centers a vector around zero before rescaling it; RMSNorm skips the centering step entirely and just rescales.

**You need:** [[Layer Normalization Placement: Pre-Norm vs Post-Norm]].

## The question it answers

"Does normalization actually need to subtract the mean, or is rescaling alone enough?" LayerNorm does both: subtract the mean (re-centering), then divide by the standard deviation (rescaling). RMSNorm drops the first step — no mean subtraction — and divides only by the root-mean-square. Many modern transformers (the LLaMA family among them) use RMSNorm specifically, trading away the centering step for a simpler, cheaper computation that empirically works just as well in practice.

## Intuition

LayerNorm treats a vector's values as a little distribution: find its average, shift everything so that average becomes zero, then rescale so the spread is standard. RMSNorm skips straight to the rescaling: measure the vector's overall size (its root-mean-square), and divide by that — no shifting involved. Because RMSNorm never subtracts anything, its output is always a plain positive-scalar multiple of the input; the vector's *direction* (which component is biggest, which is negative) is completely preserved. LayerNorm's mean-centering step can change that direction.

## Definition and notation

```text
LayerNorm(x) = (x − mean(x)) / √(var(x) + ε)
RMSNorm(x)   = x / √(mean(x²) + ε)
```

`mean(x²)` is a vector's mean squared value — its root-mean-square, squared. RMSNorm needs only this one statistic; LayerNorm needs both the mean and the variance.

## A worked example

The same vector `x = [2, 4, −1, 3]` normalized both ways:

```text
mean(x) = 2,  variance(x) = 3.5
LayerNorm(x) = [0.000, 1.069, −1.604, 0.535]

mean(x²) = 7.5
RMSNorm(x) = [0.730, 1.461, −0.365, 1.095]
```

Notice RMSNorm's output is *exactly* `x` scaled by one constant (`1/√7.5 ≈ 0.365`): `2 × 0.365 = 0.730`, `4 × 0.365 = 1.461`, and so on for every entry — a pure rescaling, preserving the input's exact proportions and sign pattern. LayerNorm's output is not a scalar multiple of `x` at all — the first entry became exactly `0` (since `x₀` happened to equal the mean), something no scalar multiplication of a nonzero input could ever produce.

## Bench

```bench
id: rmsnorm-vs-layernorm
title: Centering and rescaling, or rescaling alone
fallback: Normalize a chosen vector with both LayerNorm and RMSNorm, and compare whether each output stays proportional to the original input.
```

**Try this**

1. Try a vector whose mean is zero already, and see LayerNorm and RMSNorm produce very similar (though not necessarily identical) results.
2. Try a vector with a large mean offset, and watch LayerNorm's output diverge sharply from a simple rescaling of the input.
3. Check whether RMSNorm's output stays exactly proportional to the input for every vector you try.

**What you should notice:** RMSNorm's output is always exactly proportional to its input — confirm this by checking that every output component divided by the matching input component gives the same constant.

## Where it appears in AI

* **RMSNorm is the normalization function in several widely-used modern transformer families** — a real production choice valued for being cheaper to compute (no mean to track) and, empirically, not costing accuracy.
* **It fits into the exact same slot [[Layer Normalization Placement: Pre-Norm vs Post-Norm|pre-norm or post-norm placement]] describes** — the placement question and the "which normalization function" question are independent choices that can be mixed and matched.
* **[[The Feed-Forward Sublayer|the next topic]] sits right where this normalization is applied**, inside each transformer block, whichever normalization function is used.

## Common pitfalls

* **Assuming RMSNorm is a special case of LayerNorm.** They compute genuinely different statistics (mean-square vs. variance around the mean), not the same formula with a step skipped and nothing else different.
* **Expecting RMSNorm to center outputs around zero.** It makes no such guarantee — it only controls overall scale, not the distribution of signs or values.
* **Treating the choice as purely about speed.** It is cheaper to compute, but the main reason it's used in practice is that it performs comparably to LayerNorm while being simpler — not that speed alone justifies the switch.

## Quick check

<details><summary>1. What statistic does RMSNorm skip computing that LayerNorm needs?</summary>
The mean — RMSNorm only needs the mean squared value (root-mean-square), while LayerNorm needs both the mean and the variance around it.
</details>

<details><summary>2. In the worked example, why is RMSNorm's output exactly proportional to the input, but LayerNorm's is not?</summary>
RMSNorm divides by a single scalar with no subtraction, so every output component is the matching input component times that same constant; LayerNorm first subtracts the mean, which is not a uniform scalar operation and can change the vector's relative proportions (or even zero out a nonzero entry).
</details>

<details><summary>3. Which transformer families are known to use RMSNorm specifically?</summary>
The LLaMA family of models is a well-known example of a widely-used transformer family built with RMSNorm instead of LayerNorm.
</details>

## Key terms

* **RMSNorm:** normalization that rescales a vector by its root-mean-square, without subtracting the mean.
* **Root-mean-square:** the square root of a vector's mean squared value, `√(mean(x²))`.
* **Direction-preserving:** a transformation that outputs a positive scalar multiple of its input, leaving relative proportions and signs unchanged.

## Related

[[Layer Normalization Placement: Pre-Norm vs Post-Norm]] · [[The Feed-Forward Sublayer]] · [[Assembling One Transformer Block]]
