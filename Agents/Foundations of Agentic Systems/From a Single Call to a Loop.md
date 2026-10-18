A single call to a model follows exactly one link in a chain of facts, no matter how the chain continues from there. Asking "what department is Alice's manager's manager in?" in one call gets back Alice's manager — the model answered the first thing it could, not the actual question, because nothing told it to keep going once that first answer wasn't the department.

**You need:** [[Agents and Environments]], [[PDA Loop]].

## The question it answers

"What's the one structural change that turns a single model call into an agent?" A loop: after producing a result, check whether the goal is actually satisfied, and if it isn't, feed that result back in and call the model again. A single call stops after one step regardless of whether the goal was reached; a loop keeps going — following manager after manager, in this example — until it actually lands on the department, or runs out of steps trying.

## Intuition

Asking someone "who manages Alice?" gets an immediate, complete answer — Bob. Asking "what department does Alice's manager's manager work in?" and only getting as far as "Bob" back is a half-finished answer to a question that needed two more hops. A loop is the difference between stopping after the first hop and continuing until the actual question is answered.

## Definition and notation

```text
single call:  result = step(state)
loop:         result = step(state); while (goal_not_met(result)): result = step(result)
```

## A worked example

A tiny organization chart, and the question "what department is Alice's manager's manager in?":

```text
Alice → manager: Bob
Bob   → manager: Carol
Carol → department: Engineering

single call: step(Alice) = "Bob"              (Alice's manager — not the department)
loop:        step(Alice) = "Bob"   (not done, "Bob" has no department)
             step(Bob)   = "Carol" (not done, "Carol" has no department either — wait, it does)
             step(Carol) = "Engineering"  (done — this is a department)
             → 3 steps to reach "Engineering"
```

The single call's answer ("Bob") isn't wrong in isolation — it correctly reports Alice's manager — it's just not an answer to the question that was actually asked. The loop keeps applying the same one-hop lookup, checking after each hop whether it's reached a department yet, until it has.

## Bench

```bench
id: single-call-vs-loop
title: One lookup answers the wrong question
fallback: Step a multi-hop lookup and compare a single call's answer against a looped agent's.
```

**Try this**

1. Compare the single-call answer against the full lookup chain.
2. Step through the loop and watch it stop exactly when it reaches a department.
3. Imagine a four-level-deep organization — would a single call still only get through one hop?

**What you should notice:** the single call and the first step of the loop produce the exact same result — the loop isn't a different kind of lookup, it's the same lookup, repeated and checked.

## Where it appears in AI

* **This is exactly the [[PDA Loop|perceive-decide-act loop]] already covered on the Fundamentals planet**, now specifically framed around *when* that loop needs more than one iteration to reach a goal.
* **[[Goal Decomposition into Subtasks]] is the planning-side version of the same idea** — recognizing in advance that a question needs multiple hops, rather than discovering it only after the first hop falls short.
* **[[Anatomy of an Agent Architecture]] names the specific component (the controller) responsible for deciding whether to loop again** — this topic is about why that component exists at all.

## Common pitfalls

* **Assuming a bigger or better model fixes a problem that's actually about looping.** No amount of model quality changes the fact that a single call only performs one step — the fix is architectural, not a better model.
* **Looping forever when a goal genuinely can't be reached.** A loop needs a step budget or another stopping condition — without one, an agent that can't find a department would keep looking indefinitely.
* **Assuming every task needs a loop.** A question answerable in one real step doesn't benefit from looping — it's specifically multi-hop goals where the difference matters.

## Quick check

<details><summary>1. Why isn't the single call's answer ("Bob") simply wrong?</summary>
It correctly answers "who is Alice's manager" — it's a true fact, just not an answer to the actual two-hop question that was asked; the call itself didn't fail, it just never continued past the first hop.
</details>

<details><summary>2. What has to happen after each step of the loop for it to know whether to continue?</summary>
A check against the goal — in the worked example, whether the current result is a department yet — determines whether the loop stops or feeds the result back in for another step.
</details>

<details><summary>3. What would happen if the loop had no step budget and the organization chart had a cycle (A reports to B, B reports to A)?</summary>
The loop would run forever, alternating between A and B and never reaching a department — exactly why a real loop needs a stopping condition beyond just "goal not yet met."
</details>

## Key terms

* **Single call:** one request to a model, producing one result, with no further iteration.
* **Loop:** repeatedly feeding a result back in and calling again until a goal is met or a budget runs out.
* **Multi-hop goal:** a goal that can't be reached in one step because each step's result is needed to determine the next step.

## Related

[[PDA Loop]] · [[Anatomy of an Agent Architecture]] · [[Goal Decomposition into Subtasks]]
