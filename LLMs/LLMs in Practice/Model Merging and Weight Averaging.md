Training a brand-new model that's good at two different tasks usually means training on both tasks' data together. There's a cheaper alternative when two models already exist, each fine-tuned on one task: average their weights directly, with no further training at all.

**You need:** [[Catastrophic Forgetting in Fine-Tuning]].

## The question it answers

"Can two separately fine-tuned models be combined into one without retraining?" Given two models that started from the same base and were each fine-tuned on a different task, averaging their weights parameter-by-parameter often produces a single model that performs reasonably on both tasks — worse than either specialist on its own specialty, but far better than either specialist on the *other* task.

## Intuition

Think of two apprentices who both trained under the same master, then each specialized — one in pastry, one in bread. Averaging their specific techniques doesn't produce someone as good at pastry as the pastry specialist, but it produces someone meaningfully better at both than either specialist alone would be at the other's craft.

## Definition and notation

```text
wA: weights fine-tuned for task A
wB: weights fine-tuned for task B
w_merged = (wA + wB) / 2
```

This only tends to work well when wA and wB started from the same base model and didn't diverge too far from it — merging models with unrelated origins generally doesn't produce anything coherent.

## A worked example

Toy 2D weights, task A's target [1, 0] and task B's target [0, 1], loss = squared distance to the target:

```text
specialist A  (wA = [1, 0]):  lossA = 0.0,  lossB = 2.0
specialist B  (wB = [0, 1]):  lossA = 2.0,  lossB = 0.0
merged        ([0.5, 0.5]):   lossA = 0.5,  lossB = 0.5
```

Each specialist is perfect at its own task and terrible at the other (loss 2.0, the worst possible in this toy setup). The merged model is never perfect, but it's never terrible either — moderate loss (0.5) on both tasks, instead of alternating between 0.0 and 2.0.

## Bench

```bench
id: model-merge-tradeoff
title: One model, moderately good at both
fallback: Compare each task-specialist model's loss against the merged model's, on both tasks.
```

**Try this**

1. Select each specialist model in turn and note how its own task's loss is 0 but the other task's loss is high.
2. Select the merged model and compare both losses to each specialist's corresponding numbers.
3. Consider a situation where you need acceptable performance on both tasks from a single deployed model, with no further training budget — which option would you pick?

**What you should notice:** neither specialist is a good general-purpose choice (each fails badly on the task it wasn't tuned for) — the merged model trades peak performance for balanced performance across both.

## Where it appears in AI

* **Merging is one practical response to [[Catastrophic Forgetting in Fine-Tuning]]** — averaging a narrowly fine-tuned model's weights back toward the original or another task's weights can partially recover what specialization cost it.
* **Merging only works because the models started from the same pretrained-and-aligned base** — it's a direct consequence of how [[Fine-Tuning for a Specific Task]] moves weights from a shared starting point, rather than training from scratch.
* **A product deciding between several fine-tuned variants versus one merged model is a [[Choosing a Model for a Task]] decision**, trading specialist peak performance against operational simplicity.

## Common pitfalls

* **Expecting a merged model to match either specialist's peak performance.** The worked example shows the merged model strictly worse than each specialist on that specialist's own task — merging trades peak capability for balance.
* **Merging models that didn't start from the same base.** The averaging operation assumes the two weight vectors are meaningfully comparable position-by-position, which only holds when they diverged from a shared starting point.
* **Assuming merging always helps.** If the two tasks pull weights in sufficiently conflicting directions, the merged model can end up mediocre at both rather than usefully balanced — the toy example's clean trade-off is an illustration, not a guarantee.

## Quick check

<details><summary>1. In the worked example, why is the merged model's loss on task A worse than specialist A's but better than specialist B's?</summary>
The merged weights sit exactly halfway between the two specialists' weights, so its loss on any single task is also roughly "halfway" between how well a specialist in that task and a specialist in the other task would do.
</details>

<details><summary>2. Why does model merging typically require both models to have started from the same base model?</summary>
Averaging assumes the two weight vectors occupy comparable positions in the same parameter space; weights from unrelated training runs don't correspond to each other in any meaningful way, so averaging them produces incoherent results.
</details>

<details><summary>3. When would you prefer a merged model over keeping two separate specialist models?</summary>
When you need one deployed model to handle both tasks reasonably well, with no retraining budget, and can accept lower peak performance on each individual task than a dedicated specialist would give.
</details>

## Key terms

* **Model merging:** combining two or more models' weights, usually by averaging, without further training.
* **Weight averaging:** taking the parameter-by-parameter mean of two models' weights to produce a single combined model.
* **Specialist model:** a model fine-tuned for strong performance on one specific task, typically at the cost of weaker performance elsewhere.

## Related

[[Catastrophic Forgetting in Fine-Tuning]] · [[Fine-Tuning for a Specific Task]] · [[Choosing a Model for a Task]]
