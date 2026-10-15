A [[Residual and Skip Connections|residual block]]'s update, `h_(t+1) = h_t + F(h_t)`, looks suspiciously like a single step of a very basic way to solve a differential equation. A **Neural ODE** takes that resemblance seriously: instead of a fixed number of discrete residual blocks, it treats "depth" as continuous time and solves `dh/dt = F(h, t)` directly with an ODE solver.

**You need:** [[Residual and Skip Connections]] and [[Rate of Change]].

## The question it answers

"A ResNet's depth is a fixed number you choose ahead of time — what if the transformation it's approximating is more naturally continuous?" Treat it as one: define how `h` changes *per unit of continuous depth* (a rate of change, `dh/dt`), and let a numerical ODE solver decide how finely to step through it, rather than fixing the number of steps in advance.

## Intuition: counting discrete floors versus riding a continuously moving elevator

A plain deep (or residual) network is like a building with a fixed number of floors — however coarse or fine, that number is baked in when it's built. A Neural ODE is more like a continuously moving elevator: you specify the *rate* at which it moves at any given position, and a solver figures out how many stops (steps) to actually take to get you there accurately, potentially using more small steps where the rate is changing quickly and fewer where it isn't.

## Definitions

```text
residual block:    h_(t+1) = h_t + F(h_t)              — looks like one step of Euler's method
Neural ODE:         dh/dt = F(h, t, θ)                  — the continuous version
                     h(T) = h(0) + ∫₀ᵀ F(h, t, θ) dt     — solved by any ODE solver, with any step size

Euler's method (the simplest solver):   x_(n+1) = x_n + h · f(x_n)     (h = step size)
```

A plain ResNet is, in effect, always using Euler's method with a step size fixed at exactly 1, for exactly as many steps as it has residual blocks.

## A worked example

Solving the simple differential equation `dx/dt = x` (true solution `x(t) = x₀eᵗ`) from `x₀ = 1` to `t = 2`, using Euler's method with different step sizes:

```text
step size h=1    (2 steps):   x(2) ≈ 4.0000
step size h=0.5  (4 steps):   x(2) ≈ 5.0625
step size h=0.25 (8 steps):   x(2) ≈ 5.9605

true value:  e² ≈ 7.3891
```

Smaller steps get steadily closer to the true value — exactly the trade-off a Neural ODE's solver can make automatically: more (smaller) steps where accuracy matters, fewer (larger) steps where it doesn't, rather than committing to one fixed number of "layers" for the whole network regardless of how complex the underlying transformation actually is.

## Bench

```bench
id: euler-steps
title: Solving a differential equation with more or fewer steps
fallback: A step-size slider for Euler's method solving dx/dt = x from x₀ = 1 to t = 2. See the approximation converge toward the true value as the step size shrinks (more steps).
```

**Try this**

1. Start with a large step size and compare the result to the true value.
2. Shrink the step size and watch the approximation steadily improve.
3. Think about what a plain ResNet is implicitly committing to by using one fixed step size, forever.

**What you should notice:** this is exactly the resemblance Neural ODEs exploit — a ResNet's depth is, numerically, a step-size (and step-count) choice baked into the architecture, which a continuous-time formulation can instead leave to an adaptive solver.

## Where it appears in AI

* **Memory efficiency** is a practical advantage: a Neural ODE's "depth" at inference is a solver choice, not a fixed number of stored layer weights, which can save memory during training via the adjoint method (not covered in depth here).
* **Irregularly-sampled time series** (medical records, sensor data with gaps) are a natural fit, since a Neural ODE can evaluate the hidden state at *any* continuous time, not just at fixed, evenly-spaced layer indices.
* **Normalizing flows** (see [[Normalizing Flows]]) have a continuous-time variant built on exactly this same differential-equation framing.

## Common pitfalls

* **Assuming Neural ODEs are always more efficient than a plain deep network.** Solving an ODE accurately can require many solver evaluations, sometimes costing more compute than a fixed-depth network for the same task.
* **Expecting Euler's method specifically to be used in practice.** It's the simplest solver (and the one that looks most like a plain residual block), but real Neural ODE implementations typically use far more accurate adaptive solvers.
* **Confusing "continuous depth" with "continuous input."** The continuity here is about how the *hidden state* evolves with depth, not necessarily about the kind of input data the network accepts.

## Quick check

<details><summary>1. What does a plain ResNet's residual update resemble, numerically?</summary>
One step of Euler's method, solving a differential equation with a fixed step size of 1.
</details>

<details><summary>2. In the worked example, why does a smaller Euler step size give a more accurate result?</summary>
Smaller steps better approximate the true, continuously changing rate, accumulating less error over the same total interval.
</details>

<details><summary>3. What does a Neural ODE replace a fixed number of residual blocks with?</summary>
A differential equation describing the hidden state's rate of change, solved by a numerical ODE solver that can choose its own step size (and count).
</details>

## Key terms

* **Neural ODE:** a network whose depth is treated as continuous time, with the hidden state's evolution defined by a differential equation.
* **Euler's method:** the simplest way to numerically solve a differential equation, taking fixed-size steps along the rate of change.
* **Adaptive step size:** letting a solver choose smaller steps where accuracy requires it and larger steps where it doesn't.

## Related

[[Residual and Skip Connections]] · [[Rate of Change]] · [[Normalizing Flows]] · [[Why Depth Helps]]
