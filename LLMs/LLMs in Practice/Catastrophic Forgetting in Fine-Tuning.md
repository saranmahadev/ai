Fine-tuning a model to be excellent at one narrow task can quietly make it worse at everything it used to do. The same gradient updates that pull the model toward the new task pull it away from whatever made it good at the old one.

**You need:** [[Fine-Tuning for a Specific Task]].

## The question it answers

"Why would teaching a model something new make it worse at something it already knew?" A model's weights are a single, shared resource. Fine-tuning moves those weights toward whatever minimizes loss on the new task's data — and unless that movement happens to also help the old task, it moves the weights away from wherever they were doing well on it. The more fine-tuning steps taken, the further the weights drift and the more of the old capability is lost.

## Intuition

Imagine retraining a generalist nurse into a specialist anesthesiologist by having them practice nothing but anesthesia procedures for months. Their anesthesia skills sharpen fast — but if they never practice general wound care in the meantime, that skill doesn't stay frozen in place; it atrophies. The hours spent get reallocated, and so does the model's capacity.

## Definition and notation

```text
w: the model's weights (toy: a 2D vector)
task A target: [1, 0]      task B target: [0, 1]
lossA(w) = ‖w − [1,0]‖²     lossB(w) = ‖w − [0,1]‖²
fine-tuning step:  w ← w − lr·(w − targetB)
```

## A worked example

Starting at w₀ = [1, 0] (perfectly tuned for task A, lossA = 0), fine-tuning toward task B's target at lr = 0.3:

```text
step 0: w=[1.000, 0.000]  lossA=0.0000  lossB=2.0000
step 1: w=[0.700, 0.300]  lossA=0.1800  lossB=0.9800
step 2: w=[0.490, 0.510]  lossA=0.5202  lossB=0.4802
step 3: w=[0.343, 0.657]  lossA=0.8633  lossB=0.2353
step 4: w=[0.240, 0.760]  lossA=1.1549  lossB=0.1153
step 5: w=[0.168, 0.832]  lossA=1.3842  lossB=0.0565
step 6: w=[0.118, 0.882]  lossA=1.5571  lossB=0.0277
```

By step 6, loss on the new task B has dropped from 2.0 to 0.0277 — but loss on the old task A has climbed from 0 all the way to 1.5571. The model got much better at B by getting much worse at A, exactly as fast.

## Bench

```bench
id: catastrophic-forgetting
title: Learning the new task un-learns the old one
fallback: Step through fine-tuning updates and watch loss on the old task climb as loss on the new task falls.
```

**Try this**

1. Step through all 6 fine-tuning steps and watch both loss curves move in opposite directions.
2. Compare how much lossB drops by step 2 against how much lossA has already risen by then.
3. Reset and imagine stopping fine-tuning early, at step 2 — how would that change the trade-off?

**What you should notice:** the two losses move in lockstep, in opposite directions — there's no point in this trace where the new task improves without the old one getting worse.

## Where it appears in AI

* **This is a direct risk of [[Fine-Tuning for a Specific Task]]** — the more aggressively a model is specialized, the more of its prior general capability it tends to lose.
* **[[Model Merging and Weight Averaging]] is one practical way to recover some of what was lost**, by combining a forgetting specialist's weights back with the original (or another task's) weights.
* **The same phenomenon appears earlier in this subject wherever a single model is pushed to serve multiple objectives in sequence** — any time an update moves shared weights toward a new target, it can degrade an old one.

## Common pitfalls

* **Assuming forgetting is binary (either the model forgets everything or nothing).** The worked example shows a smooth trade-off: a small number of fine-tuning steps causes a small amount of forgetting, more steps cause more.
* **Expecting forgetting to be visible from the fine-tuning loss curve alone.** The fine-tuning run's own loss (on the new task) looks great the whole time — the degradation only shows up when you separately measure performance on the old task.
* **Fine-tuning on a narrow task for far longer than needed "just to be safe."** The worked example shows loss on the new task saturating (0.0565 → 0.0277, a small further gain) while the old task keeps getting worse — extra steps past that point are nearly pure forgetting with little new-task benefit.

## Quick check

<details><summary>1. In the worked example, does the model's loss on task A ever stop increasing while loss on task B keeps decreasing?</summary>
No — in this trace, every step that decreases lossB increases lossA; they move together because both are driven by the same shared weight update.
</details>

<details><summary>2. Why can't you see catastrophic forgetting just by watching the fine-tuning run's own training loss?</summary>
The training loss only measures performance on the new task's data, which keeps improving — forgetting shows up only when performance on the old task is measured separately, which the fine-tuning run doesn't do by default.
</details>

<details><summary>3. What's one way to reduce how much a fine-tuned model forgets?</summary>
Stop fine-tuning earlier (the worked example shows new-task gains flattening out well before old-task loss stops rising), or merge the fine-tuned weights back with the original model's weights, as in model merging.
</details>

## Key terms

* **Catastrophic forgetting:** the loss of a model's prior capability caused by further training on a new task.
* **Shared weights:** the single set of parameters that every task's gradient update moves, with no separation between what's "for" one task and what's "for" another.
* **Fine-tuning trade-off:** the relationship between how much a model improves on a new task and how much it degrades on tasks it previously performed well.

## Related

[[Fine-Tuning for a Specific Task]] · [[Model Merging and Weight Averaging]] · [[Supervised Fine-Tuning (SFT)|Supervised Fine-Tuning (SFT)]]
