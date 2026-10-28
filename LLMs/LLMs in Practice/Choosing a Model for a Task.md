There's no single "best" LLM — only the best model for a particular task's particular mix of needs. A model that tops every capability benchmark can still be the wrong choice if the task cares more about speed or cost than about squeezing out the last few points of quality.

**You need:** [[Leaderboards and Their Limits]], [[Cost and Latency of LLM APIs]].

## The question it answers

"Given several models of different sizes, how do you pick the right one for a specific task?" The same weighted-scoring mechanism already derived for reweighting a leaderboard ([[Leaderboards and Their Limits]]) applies directly here: score each candidate model on the dimensions the task actually cares about (quality, speed, affordability), weight those dimensions by how much the task values each one, and the model with the highest weighted score is the right choice *for that task* — not necessarily the most capable model in the abstract.

## Intuition

Choosing a vehicle for a job isn't about which vehicle is "best" overall — it's about matching the vehicle to the job. A sports car wins on speed; a cargo van wins on capacity; neither is simply better than the other until you specify what you're hauling and how fast you need to get there. Choosing a model works the same way: specify what the task needs, then rank models against exactly that.

## Definition and notation

```text
score(model, weights) = Σ model[dimension] × weights[dimension]  /  Σ weights[dimension]
```

Exactly the weighted-leaderboard formula from [[Leaderboards and Their Limits]], now applied with task-specific weights instead of a general-purpose leaderboard's weights.

## A worked example

Three model sizes, scored on quality, speed and affordability (0–1, higher is better):

```text
small:  quality 0.60, speed 0.95, affordability 0.95
medium: quality 0.80, speed 0.70, affordability 0.70
large:  quality 0.95, speed 0.30, affordability 0.30
```

Scored under two different task weightings:

```text
latency-sensitive chat (weights: quality 0.2, speed 0.6, affordability 0.2):
  small 0.880  medium 0.720  large 0.430   →  small wins

quality-sensitive offline task (weights: quality 0.9, speed 0.05, affordability 0.05):
  small 0.635  medium 0.790  large 0.885   →  large wins
```

The same three models, the same three scores each — but which one wins flips entirely depending on what the task actually values. Neither "small" nor "large" is the universally right answer.

## Bench

```bench
id: model-choice-weighted
title: The best model depends on what the task actually needs
fallback: Switch between task scenarios and see which model size actually scores best for each.
```

**Try this**

1. Compare the winning model under each scenario and note that it's not the same model both times.
2. Look at how close medium and large are under the quality-sensitive scenario, despite large's much worse speed and affordability scores.
3. Imagine a third scenario that weights all three dimensions equally — which model would you expect to win, and why?

**What you should notice:** "large" isn't a safe default choice even when quality matters most — it only wins when quality is weighted heavily enough to outweigh its much worse speed and affordability scores.

## Where it appears in AI

* **This reuses the exact weighted-scoring mechanism from [[Leaderboards and Their Limits]]**, applied to model selection instead of leaderboard ranking — the same lesson (reweighting flips the winner) shows up at both levels.
* **The "speed" and "affordability" dimensions here are exactly what [[Cost and Latency of LLM APIs]] measures concretely** — this topic is about the decision; that one is about the underlying numbers.
* **A model's capability score itself comes from the kind of benchmark evaluation covered in the Evaluating LLMs section of this subject** — model choice sits downstream of how models are measured in the first place.

## Common pitfalls

* **Defaulting to the largest, most capable model "to be safe."** The worked example shows this can be a clearly worse choice when the task actually values speed or cost — "most capable" and "best for this task" are different questions.
* **Picking a model based on one dimension's score alone.** A model can look great on a quality benchmark and still be the wrong choice once speed and cost are weighted in at the levels the task actually requires.
* **Assuming the right weighting is obvious or fixed.** Two products that look similar can have very different latency or cost sensitivity, which changes the right choice even with identical candidate models.

## Quick check

<details><summary>1. In the worked example, why does the "small" model win the latency-sensitive scenario despite having the lowest quality score of the three?</summary>
Because that scenario weights speed and affordability far more heavily than quality (0.6 and 0.2 versus 0.2), and small scores highest on exactly those two dimensions.
</details>

<details><summary>2. Does picking the model with the single highest quality score always give the best result for a task?</summary>
No — the right choice depends on the task's weighting across all the dimensions that matter to it, not on any one dimension's score alone, as the worked example's two different winners show.
</details>

<details><summary>3. What mechanism does this topic reuse from evaluating LLMs more generally?</summary>
The weighted-scoring formula from leaderboard reweighting — the same arithmetic, applied here to choosing a model for a task instead of to ranking a leaderboard.
</details>

## Key terms

* **Task-specific weighting:** assigning importance to each evaluation dimension (quality, speed, cost) according to what a particular task actually needs.
* **Weighted score:** a single number combining a model's scores across several dimensions, according to a chosen set of weights.
* **Model selection:** choosing which available model to deploy for a task, based on how well it matches that task's specific requirements.

## Related

[[Leaderboards and Their Limits]] · [[Cost and Latency of LLM APIs]] · [[Fine-Tuning for a Specific Task]]
