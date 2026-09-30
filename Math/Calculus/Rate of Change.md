A **rate of change** says how much one quantity changes per unit of another, such as kilometres per hour or dollars per item. The **average** rate uses two points; the **instantaneous** rate is what the average becomes as the two points squeeze together, and it is the seed of the derivative.

**You need:** [[Functions]] and [[Linear Functions]].

## The question it answers

"How fast is something changing?" A car's odometer gives distance; the speedometer gives the *rate* at which that distance changes. Model training asks the same question about error.

## Intuition: slope between two points

For a straight line, the rate of change is the slope, the same everywhere. For a curve it varies. The **average rate of change** between `x = a` and `x = b` is the slope of the straight line (a **secant**) joining the two points:

```text
average rate = (f(b) − f(a)) / (b − a) = Δf / Δx
```

Now let `b` slide toward `a`. The secant tilts, and its slope settles toward a single number: the **instantaneous rate**, the slope of the curve at that point (the tangent).

## A worked example

A ball's distance from the start is `s(t) = t²` metres after `t` seconds. Average speed from `t = 1`:

```text
1 → 3:    (9 − 1) / 2       = 4      m/s
1 → 2:    (4 − 1) / 1       = 3      m/s
1 → 1.1:  (1.21 − 1) / 0.1  = 2.1    m/s
1 → 1.01: (1.0201 − 1) / 0.01 = 2.01 m/s
```

The averages approach **2**. So at the instant `t = 1` the ball moves at 2 m/s. In general the instantaneous speed at time `t` is `2t`, which is the derivative of `t²` (see [[Derivatives]]).

Units matter: distance divided by time gives metres per second. For a model, a loss changing by −0.02 per training step has rate −0.02 loss/step.

## Bench

```bench
id: speed-slider
title: Average versus instantaneous rate
fallback: A curve with two points on it; sliders set the first point and the gap between them, drawing the secant line and showing its slope, with a marker for the instantaneous slope.
```

**Try this**

1. Set a wide gap and read the average rate.
2. Shrink the gap towards zero and watch the secant slope settle.
3. Move the first point and see how the instantaneous rate changes.
4. Try a different curve, such as sin x.

**What you should notice:** as the gap shrinks, the average rate converges to one number, the slope of the tangent.

## Where it appears in AI

* **Loss curves:** how fast the error falls per step.
* **Learning-rate schedules** adjust the size of steps by how quickly things change.
* **Sensitivity:** how much an output moves for a small change in an input.

## Common pitfalls

* **Using a wide gap** and calling the answer instantaneous.
* **Forgetting units.**
* **Confusing rate with value.** A high value can have a zero rate.
* **Assuming rates are constant.** Only linear functions have one slope.

## Quick check

<details><summary>1. What is the average rate of f(x) = x² from x = 0 to x = 4?</summary>
(16 − 0) / 4 = 4.
</details>

<details><summary>2. A tank goes from 20 L to 8 L in 3 minutes. What is the average rate?</summary>
−4 L per minute.
</details>

<details><summary>3. What does the secant become as the gap shrinks?</summary>
The tangent line.
</details>

## Key terms

* **Average rate of change:** change in output over change in input.
* **Instantaneous rate:** the rate at a single point.
* **Secant:** a line through two points of a curve.
* **Tangent:** the line that touches a curve at a point.

## Related

[[Linear Functions]] · [[Limits]] · [[Derivatives]] · [[Gradient Descent]]
