A fixed [[Learning Rate|learning rate]] is rarely the best choice for an entire training run: a step size that is safe once the network has settled down can be unstable right at the start, and a step size that makes fast early progress is too coarse for fine-tuning near the end. A **learning rate schedule** changes the step size over the course of training instead of fixing it.

**You need:** [[Learning Rate]] and [[Vanishing and Exploding Gradients]].

## The question it answers

"Should the learning rate really stay the same from the first step to the last?" No — early training can tolerate (and benefit from) a smaller, cautious step size while gradients are least reliable, and a schedule that shrinks the rate later lets training settle into a sharper minimum.

## Intuition: coarse first, fine later

Think of tuning an old analogue radio: you turn the dial in big sweeps to find roughly the right station, then in tiny increments to land exactly on it. Early in training, large steps make fast progress across a mostly-unexplored loss landscape; late in training, the same large steps would overshoot a minimum the small steps could settle into precisely. **Warmup** adds a third phase at the very start: ramping the rate up from (near) zero over the first few steps, because right after random initialization the gradient estimate is at its least trustworthy, and a large first step can be the most destructive one in the whole run.

## Definitions

```text
step decay:        lr(t) = lr₀ · decay^⌊t / step_size⌋
cosine decay:       lr(t) = lr_min + ½(lr₀ − lr_min)(1 + cos(π t / T))
linear warmup:      lr(t) = lr₀ · t / warmup_steps              for t < warmup_steps
```

Warmup is typically combined with a decay schedule afterward: ramp up linearly for the first `warmup_steps`, then follow a cosine (or step) decay for the remaining `T − warmup_steps` steps.

## A worked example

`lr₀ = 0.1` over `T = 100` steps, step decay halving every 30 steps, cosine decay down to 0, and a 10-step linear warmup followed by cosine decay:

```text
step (t)        0      10      20      30      50      70      90     100
step decay    0.1000  0.1000  0.1000  0.0500  0.0500  0.0250  0.0125  0.0125
cosine        0.1000  0.0976  0.0905  0.0794  0.0500  0.0206  0.0024  0.0000
warmup+cosine 0.0000  0.1000  0.0970  0.0883  0.0587  0.0250  0.0030  0.0000
```

Warmup starts at exactly 0 and climbs to the full `0.1` by step 10 — the first ten steps are deliberately smaller than plain cosine decay's — then it tracks a cosine curve down to 0 by the end, just reaching full strength ten steps later than plain cosine would.

## Bench

```bench
id: lr-schedule
title: Learning rate over a training run
fallback: Pick a schedule — constant, step decay, cosine decay, or warmup followed by cosine — and see the learning rate plotted across the whole run, with its value at a chosen step read out.
```

**Try this**

1. Compare constant against cosine decay: where do they agree, and where do they diverge most?
2. Turn warmup on and off (on the cosine schedule) and see what changes in just the first few steps.
3. Move the step marker to the very start of warmup and watch the rate value in the readout climb from (near) zero.

**What you should notice:** every schedule here reaches the same final destination (a small or zero rate) but takes a different path, and warmup is the only one that deliberately starts below the base rate rather than at it.

## Where it appears in AI

* **Cosine decay with warmup** is close to the default schedule for training large modern networks, including transformers.
* **Step decay** is common in older computer-vision training recipes (drop the rate at fixed milestones).
* **Warmup specifically matters most for architectures prone to early instability** — very deep networks, and anything using large batch sizes (see [[Batch Size and Training Dynamics]]).

## Common pitfalls

* **Treating the schedule as independent of the base learning rate.** A schedule just reshapes a chosen `lr₀` over time; a badly chosen `lr₀` is still badly chosen at every point on the schedule.
* **Skipping warmup on a network that clearly needs it.** Symptoms of a missing warmup often look like a bad initialization or an exploding gradient (see [[Vanishing and Exploding Gradients]]) in the first few steps specifically.
* **Decaying to exactly zero and stopping there for many remaining steps.** Wastes compute; schedules are usually timed so decay finishes near the end of training, not partway through.

## Quick check

<details><summary>1. Why might a fixed learning rate be too large late in training even though it worked early on?</summary>
Early training can tolerate large, exploratory steps across the loss surface; near a minimum, the same step size can overshoot and bounce rather than settle.
</details>

<details><summary>2. What problem does warmup specifically address?</summary>
The gradient right after random initialization is especially unreliable, so a full-size first step can be unusually destructive; warmup starts small and ramps up once the network has stabilised a little.
</details>

<details><summary>3. In the worked example, at what step does the warmup schedule reach the same rate plain cosine decay started at?</summary>
At step 10 — warmup ramps linearly from 0 up to the full 0.1 by then, ten steps later than cosine decay's immediate start at 0.1.
</details>

## Key terms

* **Learning rate schedule:** a rule for changing the learning rate over the course of training.
* **Warmup:** a short initial phase that ramps the learning rate up from near zero.
* **Step decay:** multiplying the learning rate by a fixed factor at set intervals.
* **Cosine decay:** smoothly decreasing the learning rate following a cosine curve.

## Related

[[Learning Rate]] · [[Vanishing and Exploding Gradients]] · [[Batch Size and Training Dynamics]] · [[Momentum and Adam]]
