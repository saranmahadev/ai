[[Hopfield Networks|The previous topic]] claimed that asynchronous updates always stop. This topic proves it, with a single number that can only go down: the network's energy.

**You need:** [[Hopfield Networks]].

## The question it answers

"Why does a Hopfield network ever stop updating, instead of flipping units forever?" Because every single-unit update is guaranteed to never *increase* a specific quantity — the energy — and a quantity that only ever decreases (and is bounded below) cannot decrease forever.

## Intuition

Think of energy as a height on a landscape, and each unit's update as the ball checking its own slope and always stepping downhill or staying put, never uphill. If every step is downhill or flat, and the landscape has a lowest floor, the ball must eventually land somewhere and stop — that resting point is a **stable point**, or **attractor**. The stored patterns are built, by the Hebbian weight rule, to sit at the bottom of these dips.

## Definition and notation

The energy of a state `s` is:

```text
E(s) = −1/2 · Σᵢ Σⱼ W_ij · s_i · s_j
```

The **local field** at unit `i` is `h_i = Σⱼ W_ij · s_j` (the same sum the update rule uses). When a single unit `i` flips from `s_i^old` to `s_i^new = sign(h_i)`, the change in energy works out to:

```text
ΔE = E_new − E_old = −(s_i^new − s_i^old) · h_i
```

Because the update rule always sets `s_i^new` to have the *same sign* as `h_i`, the product `(s_i^new − s_i^old) · h_i` is always zero or positive — so `ΔE` is always zero or **negative**. Energy never increases.

## A worked example

Reusing [[Hopfield Networks|the previous topic's]] example — one stored pattern `p = [1, 1, −1, −1]`, starting state `s = [1, −1, −1, −1]`, updating unit 1:

```text
local field:   h_1 = Σⱼ W_1j s_j = 3
old state:     s_1^old = −1
new state:     s_1^new = sign(3) = 1

ΔE = −(s_1^new − s_1^old) · h_1 = −(1 − (−1)) · 3 = −2 × 3 = −6
```

Checking directly: `E(s)` before the update is `0`, and `E(s)` after is `−6` — a drop of exactly `−6`, matching the formula. The energy fell because the unit flipped to agree with its own local field, and it can never rise from here for this stored pattern and starting state.

## Bench

```bench
id: energy-descent
title: Watch energy fall, one update at a time
fallback: Step through single-unit updates on a small Hopfield network and watch the energy value after each one — it only ever goes down or stays the same, never up.
```

**Try this**

1. Step through updates one at a time and read the energy after each step.
2. Try to find an update that makes the energy go up — the rule itself will not let you pick one that does.
3. Compare the energy of a stored pattern against a random, unstored state.

**What you should notice:** the energy trace is monotonically non-increasing no matter which units update or in what order — that single fact is the entire reason the network is guaranteed to settle.

## Where it appears in AI

* **It is the reason Hopfield recall terminates** at all, which is what makes [[Content-Addressable Memory and Capacity|associative memory]] usable rather than an unpredictable, possibly-endless process.
* **The same "energy never increases" argument underlies [[Boltzmann Machines]]**, with randomness added so the network can occasionally climb a small hill to escape a bad dip.
* **It is a genuinely different notion of "training" from anything on [[Deep Learning]]**: there is no loss function being minimized by gradient descent here — the states themselves descend a fixed landscape at inference time.

## Common pitfalls

* **Confusing energy with loss.** A loss function is minimized over *weights* during training; this energy is minimized over *unit states* during recall, with the weights already fixed.
* **Assuming synchronous updates have the same guarantee.** Updating every unit simultaneously can cause oscillation between two states (energy alternating, not falling) — the monotonic-decrease proof only applies to one-unit-at-a-time updates.
* **Forgetting the landscape has more than one dip.** Energy only guarantees settling *somewhere* — not necessarily at the dip you intended, especially near a cue equidistant from two stored patterns.

## Quick check

<details><summary>1. What two facts about energy together guarantee that updates eventually stop?</summary>
Energy never increases on any update, and it is bounded below (there are only finitely many states, each with some energy) — so it cannot decrease forever.
</details>

<details><summary>2. In the worked example, why is ΔE negative rather than positive?</summary>
The update rule always flips the unit to match the sign of its own local field, so `(s_new − s_old)` and `h_i` always have the same sign, making their product non-negative and `ΔE = −(that product)` non-positive.
</details>

<details><summary>3. Does synchronous (all-at-once) updating have the same settling guarantee as asynchronous updating?</summary>
No — synchronous updates can cycle between two states instead of settling, so the classical energy-decrease guarantee is specific to one-unit-at-a-time updates.
</details>

## Key terms

* **Energy function:** a single number computed from a Hopfield network's current state, built so stored patterns sit at low values.
* **Local field:** the weighted sum a unit's own update rule uses, `h_i = Σⱼ W_ij s_j`.
* **Attractor:** a stable state that nearby states settle into; here, a local minimum of the energy function.

## Related

[[Hopfield Networks]] · [[Content-Addressable Memory and Capacity]] · [[Boltzmann Machines]]
