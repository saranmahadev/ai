A leaderboard promises a simple answer to "which model is best?" — rank them by score, read off the winner. The quiet catch: that ranking depends entirely on a weighting decision that's usually invisible, and a different reasonable weighting can produce a different winner from the exact same underlying scores.

**You need:** [[Capability Evaluation vs. Safety Evaluation]].

## The question it answers

"Can a single leaderboard ranking be trusted as *the* answer to which model is best?" Not without knowing how it was weighted. A leaderboard combines scores across several categories into one ranking number — and which category gets more weight is a real choice, not a neutral default. Two models can trade the #1 spot depending entirely on that weighting, even with their individual category scores held completely fixed.

## Intuition

Ranking job candidates by "overall fit" when one is clearly stronger on technical skill and the other is clearly stronger on communication produces a different winner depending on how much the hiring decision happens to weigh technical skill against communication — neither candidate's individual skills changed, only which one the ranking favors did. A leaderboard combining several evaluation categories into one score is making exactly this kind of weighting decision, usually without making it explicit.

## Definition and notation

```text
weighted leaderboard score(model) = Σᵢ weightᵢ · scoreᵢ(model) / Σᵢ weightᵢ

→ the RANKING between two models can flip entirely depending on
  which weighting is used, even with every individual score fixed
```

## A worked example

Two models with fixed category scores:

```text
Model X:  reasoning 0.90   creativity 0.50   safety 0.70
Model Y:  reasoning 0.60   creativity 0.90   safety 0.70
```

Under a weighting that favors reasoning 3× over the others:

```text
Model X: 0.780      Model Y: 0.680      → Model X leads
```

Under a weighting that favors creativity 3× over the others instead:

```text
Model X: 0.620      Model Y: 0.800      → Model Y leads
```

Neither model's underlying category scores changed at all between the two calculations — only the weighting did, and the leaderboard's declared "winner" flipped completely as a result.

## Bench

```bench
id: leaderboard-reweight
title: The ranking depends on the weighting
fallback: Adjust how heavily a leaderboard weighs one category and watch which of two models comes out on top.
```

**Try this**

1. Set the creativity weight low and note which model leads.
2. Raise the creativity weight and watch the leader flip.
3. Find the weighting where the two models are essentially tied.

**What you should notice:** the flip happens with absolutely no change to either model — it's purely a consequence of the weighting applied to the same fixed underlying scores.

## Where it appears in AI

* **Different public LLM leaderboards genuinely rank the same models differently**, in no small part because they weigh categories (reasoning, safety, creativity, cost, speed) differently, not because they disagree about any individual category score.
* **A leaderboard's weighting choice reflects a judgment about what matters most**, which may or may not match what matters most for a specific downstream use case — the "best" model on a general leaderboard isn't necessarily the best choice for a specific task.
* **[[Choosing a Model for a Task|picking a model for a real application]] should generally look at the relevant category breakdown directly**, rather than relying on a single aggregate leaderboard ranking built around someone else's weighting choices.

## Common pitfalls

* **Treating a leaderboard's #1 ranking as an objective, universal fact.** It's the result of a specific, often unstated weighting decision applied to the underlying category scores — a different reasonable weighting can produce a different #1.
* **Assuming different leaderboards disagreeing means one of them is simply wrong.** Both can be using accurate underlying category scores while still disagreeing on the final ranking, purely due to different weighting choices.
* **Ignoring the category breakdown in favor of the aggregate rank.** The most actionable information — which model is actually better for a specific need — usually lives in the category-level scores, not the single combined ranking number.

## Quick check

<details><summary>1. Why can two leaderboards disagree about which model is "best" even when they agree on individual category scores?</summary>
Because the overall ranking depends on how those category scores are weighted and combined — different weighting choices can produce different rankings from identical underlying scores.
</details>

<details><summary>2. In the worked example, what caused the ranking between Model X and Model Y to flip?</summary>
Only the weighting applied to the fixed category scores changed — from favoring reasoning to favoring creativity — with no change at all to either model's actual underlying scores.
</details>

<details><summary>3. What should someone choosing a model for a specific task look at, rather than relying solely on an aggregate leaderboard rank?</summary>
The category-level score breakdown directly, weighted according to what actually matters for their specific use case, rather than trusting a general leaderboard's own (often unstated) weighting choices.
</details>

## Key terms

* **Leaderboard:** a ranking of models by a combined score across evaluation categories.
* **Category weighting:** the relative importance assigned to each evaluation category when combining them into one score.
* **Ranking flip:** a change in which model ranks highest, caused purely by a change in weighting rather than in underlying scores.

## Related

[[Capability Evaluation vs. Safety Evaluation]] · [[Benchmark Suites (MMLU, HELM, BIG-bench)]] · [[Choosing a Model for a Task]]
