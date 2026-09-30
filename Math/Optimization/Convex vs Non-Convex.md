A function is **convex** if it is bowl-shaped: the straight line between any two points on its graph never dips below the graph. A convex function has a single valley, so any downhill walk ends at the global minimum. **Non-convex** functions have several valleys and hills, and where you start decides where you end up.

**You need:** [[Minima, Maxima and Saddle Points]], [[Higher Derivatives and Curvature]] and [[Gradient Descent]].

## The question it answers

"Can I trust gradient descent to find the best answer?" For convex problems, yes. For non-convex ones, only sometimes, and the starting point matters.

## Intuition: does a taut string touch only the ends?

Pick any two points on the curve and stretch a string between them. On a **convex** curve the string lies on or above the curve everywhere. On a **non-convex** curve it dips below somewhere.

```text
convex:  f( (a + b)/2 )  ≤  ( f(a) + f(b) ) / 2       for all a, b (the midpoint test)
```

For smooth functions, convex means `f″(x) ≥ 0` everywhere (in many variables, the Hessian has no negative eigenvalues). A convex function's every local minimum is a global minimum.

## A worked example

Test the midpoint rule:

```text
f(x) = x²,    a = −1, b = 3:    f(1) = 1     (f(−1) + f(3))/2 = (1 + 9)/2 = 5      1 ≤ 5   ✓ convex
f(x) = x⁴ − 2x², a = −1, b = 1:  f(0) = 0     (f(−1) + f(1))/2 = (−1 + −1)/2 = −1    0 ≤ −1  ✗ not convex
```

The quartic has two valleys at `x = ±1` and a hill at 0. Start gradient descent at `x = 0.5` and it slides to the valley at `+1`; start at `−0.5` and it goes to `−1`. Here both valleys are equally deep, but in general they may differ, and descent can settle in a worse one.

**Convex** losses include squared error for linear models and logistic loss: training them has one answer. **Non-convex** losses include neural networks: many minima and saddles, yet in practice good minima are usually easy to reach.

## Bench

```bench
id: bowl-bumpy
title: One valley or many?
fallback: Choose a bowl or a bumpy curve; two sliders pick points a and b, the chord between them is drawn and the midpoint test is reported; a start-point slider runs gradient descent and shows where it settles.
```

**Try this**

1. On the bowl, place a and b anywhere. Does the chord ever go below the curve?
2. Switch to the bumpy curve and find a chord that dips below.
3. Run descent from several starts on the bumpy curve.
4. Compare where each run ends up and its final height.

**What you should notice:** on a convex curve the result never depends on the start, while on a non-convex one it does.

## Where it appears in AI

* **Linear and logistic regression** have convex losses.
* **Neural networks** are non-convex; different initialisations give different (but often similarly good) models.
* **Restarts and noise** (like SGD) help escape poor valleys.

## Common pitfalls

* **Assuming the minimum found is global** on a non-convex problem.
* **Testing convexity at one point only.**
* **Confusing convex with monotonic.** A convex function can fall then rise.
* **Assuming non-convex means hopeless.** Many are trainable in practice.

## Quick check

<details><summary>1. Is f(x) = x² convex?</summary>
Yes: f″ = 2 ≥ 0.
</details>

<details><summary>2. Can a convex function have two different local minima?</summary>
Not separate ones: any local minimum is global (a flat bottom is still one value).
</details>

<details><summary>3. Why does the start matter on non-convex functions?</summary>
Different starts roll into different valleys.
</details>

## Key terms

* **Convex function:** a chord never lies below the curve.
* **Non-convex:** having multiple valleys or hills.
* **Global minimum:** the lowest point overall.
* **Initialisation:** the starting parameter values.

## Related

[[Minima, Maxima and Saddle Points]] · [[Higher Derivatives and Curvature]] · [[Hessian]] · [[Gradient Descent]] · [[Stochastic Gradient Descent]]
