Training a policy by trial and error means the early trials are, by construction, going to be bad — and letting an agent fail its way to a good policy on a real warehouse robot or a real production account is an expensive way to learn. A simulation gives an agent somewhere to be bad for free, as many times as it takes, before anything it does has a real consequence.

**You need:** [[Q-Learning]].

## The question it answers

"Why train or test an agent in a simulated or game environment instead of the real thing?" [[Q-Learning]] already covered *how* an agent learns from trial and error; this topic is about *where* those trials happen. A simulated environment lets an agent take an action, see the outcome, and reset — instantly and at near-zero cost — as many times as learning requires, something a real environment with real stakes almost never allows.

## Intuition

Teaching someone to parallel park, you'd rather they practice in an empty lot with cones standing in for other cars than learn by scraping real bumpers on a real street. The empty lot doesn't teach anything *false* — the geometry of parking is the same — but it lets failed attempts cost nothing while the skill is still being built.

## Definition and notation

```text
real-world trial:    costly, slow, risky; cannot be freely repeated
simulated trial:     cheap, fast, resettable; repeated as many times as needed
```

## A worked example

[[Q-Learning]]'s own grid-world example showed the agent's greedy policy first reaching the goal optimally after 8 training episodes. Costing those same 8 episodes in a real deployment versus in simulation:

```text
real-world:   8 episodes × $40 per costly mistake  = $320
              8 episodes × 5 minutes per episode    = 40 minutes
simulated:    8 episodes × negligible compute cost  ≈ $0
              8 episodes × 0.01 seconds per episode  = 0.08 seconds
```

The same 8 episodes that train the policy either cost $320 and 40 minutes of real-world risk, or run to completion in under a tenth of a second in simulation. The simulation doesn't change what's being learned — the same Q-learning update, the same 8 episodes to convergence — only what each attempt costs while learning happens.

## Bench

```bench
id: sim-training-cost
title: Training in the world, or training in a copy of it
fallback: Step through the 8 training episodes a grid-world agent needs, and compare real-world cost and time against simulated cost and time.
```

**Try this**

1. Step through all 8 episodes and watch the real-world cost climb to $320.
2. Compare that to the simulated time, which barely registers on the same scale.
3. Imagine a task where a real-world mistake can't be undone at any price (an experimental medical treatment) — does simulation's near-zero cost argument still fully apply?

**What you should notice:** simulation's advantage isn't about teaching anything different — it's entirely about the cost of the early, necessarily-bad attempts that any trial-and-error method has to make before it improves.

## Where it appears in AI

* **This is the practical justification for training the exact policy [[Q-Learning]] describes** in a simulated grid world rather than a real one — the 8-episode convergence figure doesn't change, only its cost does.
* **[[Action-Space Design and Its Failure Modes]], the next topic, matters more once simulation makes exploration cheap**: an agent that can try almost anything for free will find and exploit any gap in how its action space is designed.
* **A simulation is only as useful as it is representative of the real target environment** — a gap between the two (the "sim-to-real gap") can mean a policy that looks good in simulation still fails when deployed for real.

## Common pitfalls

* **Treating simulation as strictly a cost-saving trick with no caveats.** A simulation that doesn't match the real environment's dynamics closely enough can teach a policy that fails exactly where the simulation and reality diverge.
* **Assuming every task has a cheap, accurate simulation available.** Many real-world agent tasks (acting on live financial systems, real user accounts) have no safe simulated substitute at all, and trial-and-error training there needs a different approach entirely.
* **Forgetting that simulated training time still has to translate to real deployment performance.** Fast, cheap training episodes are worthless if the resulting policy doesn't generalize to the real environment it's eventually deployed in.

## Quick check

<details><summary>1. Why does the worked example use 8 episodes specifically?</summary>
It's the exact number of training episodes [[Q-Learning]]'s own grid-world example needed before the greedy policy first reached the goal optimally — reused here rather than invented, so the cost comparison is grounded in an already-verified number.
</details>

<details><summary>2. What is simulation's core advantage over real-world training, according to this topic?</summary>
It lets an agent repeat costly, risky or slow trial-and-error attempts at near-zero cost and in a fraction of the time, without changing what's actually being learned.
</details>

<details><summary>3. What's the risk of relying entirely on simulated training?</summary>
If the simulation doesn't accurately match the real environment's dynamics, a policy that performs well in simulation can still fail once deployed — a mismatch often called the sim-to-real gap.
</details>

## Key terms

* **Simulated environment:** a model of an environment an agent can act in and reset cheaply, standing in for a real one during training or testing.
* **Trial-and-error learning:** improving a policy by acting, observing the outcome, and adjusting — which necessarily includes early, bad attempts.
* **Sim-to-real gap:** the mismatch between a simulation's dynamics and the real environment's, which can make simulated training results not transfer.

## Related

[[Q-Learning]] · [[Action-Space Design and Its Failure Modes]] · [[Rewards, States and Policies]]
