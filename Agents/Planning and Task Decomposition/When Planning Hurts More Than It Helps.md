Planning ahead only pays off if the plan is still good by the time it's executed. In a stable environment that barely changes, one upfront plan beats reacting fresh at every single step. In a volatile environment that changes every step, that same upfront plan goes stale almost immediately — by the time step 5 runs, the world it was planned for may no longer exist, and all the planning spent getting there was wasted.

**You need:** [[Plan-and-Execute Agents]].

## The question it answers

"Is planning ahead always worth its cost?" Planning has a real upfront cost — time spent deciding a sequence of steps before acting on any of them. That cost pays for itself only across however many steps the resulting plan stays valid for. In a stable environment, a plan stays valid for a long stretch, so the upfront cost is amortized over many cheap execution steps. In a volatile environment, the plan goes stale fast, forcing frequent re-planning, and a purely reactive policy that never plans at all can end up cheaper overall.

## Intuition

Planning a grocery store trip aisle by aisle before walking in saves time, as long as the store's layout doesn't change mid-trip. If the store's layout were reshuffled every few minutes, re-planning the whole route over and over would cost more time than it saves — at that point, just reacting to whatever's in front of you, aisle by aisle, as you go, would actually be faster.

## Definition and notation

```text
planning total time(horizon, volatility)  = ⌈horizon / volatility⌉ × Tplan + horizon × Texec
reactive total time(horizon)              = horizon × Treactive
    volatility = steps between environment changes (bigger = more stable)
```

## A worked example

A 12-step horizon, with a planning cost of 400ms, a 20ms cost to execute a step that's already planned, and a 150ms cost to reason fresh at every step with no plan at all, compared across three volatilities:

```text
volatility = 12 (stable, never changes):  planning = 640ms   reactive = 1800ms   → planning wins
volatility = 4  (changes every 4 steps):  planning = 1440ms  reactive = 1800ms   → planning wins (barely)
volatility = 3  (changes every 3 steps):  planning = 1840ms  reactive = 1800ms   → reactive wins
volatility = 1  (changes every step):     planning = 5040ms  reactive = 1800ms  → reactive wins (by a lot)
```

The crossover sits between a change every 4 steps and a change every 3 steps. Nothing about reactive execution got cheaper as volatility increased — what changed is how many times planning's 400ms upfront cost had to be paid again, and at high enough volatility, that repeated cost outweighs the entire benefit planning was supposed to provide.

## Bench

```bench
id: planning-vs-reactive
title: Plan ahead, or just react
fallback: Compare total time spent re-planning as the environment changes against a reactive policy that never plans.
```

**Try this**

1. Set the slider to its most stable setting and note how much planning beats reactive.
2. Slide toward more frequent changes and watch for the point where reactive takes over.
3. Imagine Tplan were much cheaper (a smaller upfront planning cost) — would the crossover point move toward more or less volatility?

**What you should notice:** the crossover isn't a fixed property of planning or reacting in general — it depends on the actual numbers (how expensive planning is, how expensive reacting is, how fast the environment changes), so the right choice is an empirical question about the specific environment, not a universal rule.

## Where it appears in AI

* **[[Re-Planning on Failure]] already showed one case where replanning pays for itself** — this topic generalizes that to a spectrum, asking not "should the agent replan when something fails" but "how often is replanning worth it at all, given how often things change."
* **[[Plan-and-Execute Agents]]'s savings assumed a plan stays valid long enough to execute** — this topic makes that assumption explicit and shows what happens when it stops holding.
* **This is the planning-side version of a bias–variance-style trade-off**: more upfront planning reduces per-step decision cost but increases the cost of being wrong when the world changes underneath the plan.

## Common pitfalls

* **Assuming planning is always worth its cost because it "looks more thorough."** The worked example shows a concrete regime (volatility 3 or lower here) where a cheaper, dumber reactive policy actually finishes faster in total.
* **Assuming reactive policies are always worth it because they're simpler.** In the stable regime, reactive execution costs nearly 3× more total time than planning — simplicity isn't free either.
* **Treating the crossover point as universal.** It depends entirely on the actual costs involved (Tplan, Texec, Treactive) for the specific system and environment — a different cost structure moves the crossover to a different volatility.

## Quick check

<details><summary>1. In the worked example, why does planning's total time grow so much faster than reactive's as volatility drops?</summary>
Lower volatility means more frequent environment changes, which means more replans within the same 12-step horizon — each replan adds another full 400ms planning cost, while reactive's cost per step (150ms) never changes regardless of volatility.
</details>

<details><summary>2. Why doesn't reactive's total time change across the four volatility settings in the worked example?</summary>
A reactive policy never plans at all — it reasons fresh at every step regardless of how often the environment changes, so its total cost is always horizon × Treactive, independent of volatility.
</details>

<details><summary>3. What determines where the crossover between planning and reactive sits, in general?</summary>
The relative sizes of the planning cost, the plan-execution cost, and the reactive-reasoning cost, together with how often the environment actually changes — change any of those numbers and the crossover point moves.
</details>

## Key terms

* **Volatility:** how often the environment changes, measured here as steps between changes (lower volatility means more frequent change).
* **Amortized planning cost:** a plan's one-time cost spread across however many cheap execution steps it stays valid for.
* **Crossover point:** the volatility at which planning and reactive execution cost the same total time.

## Related

[[Plan-and-Execute Agents]] · [[Re-Planning on Failure]] · [[Hierarchical Task Planning]]
