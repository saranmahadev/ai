Giving an agent one distinct action per object it might ever need to pick seems safe — until the number of objects grows and a correct first guess becomes a lottery ticket. Giving it one generic "do something" action avoids that explosion but can't express which object was meant at all. The fix isn't choosing a side; it's giving the action a parameter.

**You need:** [[Kinds of Environments]].

## The question it answers

"How does the shape of an agent's action space itself cause failures, independent of how good its decision-making is?" Two opposite mistakes show up repeatedly: an **enumerated** action space (one distinct action per possible target) that works for small numbers of targets but collapses as they grow, and a **coarse** action space (one generic action with no way to specify a target) that never works no matter how many targets there are. A **parameterized** action — one action type that takes a target as an argument — avoids both failure modes at once.

## Intuition

A vending machine with one button per exact snack works fine with ten snacks and becomes unusable with a thousand — you'd need a thousand buttons, and finding the right one by chance gets harder every time a new snack is added. A vending machine with a single "dispense" button and no way to say *which* snack never works at all, for any number of snacks. A machine where you type in a snack's code and press one "dispense" button scales to any number of snacks without adding buttons or losing the ability to pick exactly one.

## Definition and notation

```text
enumerated action space:     one action per candidate; space size = k; random first-try success = 1/k
coarse action space:         one action, no target parameter; space size = 1; success = 0% (can't express the choice)
parameterized action space:  one action type + a target parameter; space size = 1; success depends only on picking the right parameter
```

## A worked example

Random, uninformed first-try success rate as the number of candidate objects (k) grows, under each design:

```text
k = 5:    enumerated 20.0%     coarse 0%     parameterized 100%*
k = 10:   enumerated 10.0%     coarse 0%     parameterized 100%*
k = 50:   enumerated  2.0%     coarse 0%     parameterized 100%*
k = 200:  enumerated  0.5%     coarse 0%     parameterized 100%*

*assuming the correct target id is identified correctly — a separate perception/selection problem
```

The enumerated design's success rate falls directly out of 1/k and craters as k grows — this is the combinatorial-explosion failure mode. The coarse design's success rate is flatly 0% at every k, because the action simply cannot express which object was meant — this is the expressiveness failure mode. The parameterized design keeps the action space itself at a constant size of 1 regardless of k, pushing the actual difficulty into a separate problem (identifying the right id) that doesn't force the action space to grow.

## Bench

```bench
id: action-space-granularity
title: One action per object, one action total, or one parameterized action
fallback: Slide the number of candidate objects and compare success rate across enumerated, coarse and parameterized action-space designs.
```

**Try this**

1. At k=5, compare all three designs' success rates.
2. Slide k up to 200 and watch the enumerated design's success rate approach zero.
3. Notice the coarse design never improves and the parameterized design never degrades, regardless of k.

**What you should notice:** two very different-looking failures — one that gets worse with scale, one that's uniformly broken at every scale — both trace back to the same root cause: the action space's shape didn't match the task's actual structure.

## Where it appears in AI

* **This generalizes the lesson from [[Web-Browsing Agents]] and [[Computer-Use Agents and GUI Grounding]]**: index-based web actions and raw pixel clicks are both, in effect, enumerated or coarse designs with their own specific failure patterns — naming an element by stable identity is the parameterized fix in both cases.
* **[[Tool Selection Among Many Candidates]], covered in the tool-use district, is the enumerated failure mode applied specifically to tool choice** — picking the right one of many near-identical tools degrades the same way as k grows.
* **[[Hierarchical Task Planning]]'s branching-factor problem is a close relative**: both topics show that how a space (of actions, or of plans) is structured determines how hard search or choice becomes, independent of how capable the chooser is.

## Common pitfalls

* **Enumerating actions because it seems simpler to implement.** The worked example shows this design choice has a real, quantifiable cost that gets worse exactly as a system scales up — the moment it starts succeeding, it's also the moment it starts failing more.
* **Building a coarse action "to keep things simple" and then wondering why the agent can never do what's asked.** A generic action with no way to specify a target isn't a simpler version of the task — it's a different, unsolvable one.
* **Confusing a parameterized action's success with having solved the whole problem.** Giving the action a parameter doesn't make picking the right parameter value easy — it just stops the action space itself from being the bottleneck.

## Quick check

<details><summary>1. Why does the enumerated design's success rate fall as k grows, while the coarse design's stays at 0% regardless of k?</summary>
The enumerated design's random first-try success is exactly 1/k, so it necessarily shrinks as more candidates are added; the coarse design can't express which candidate is meant at any k, so it fails uniformly rather than degrading with scale.
</details>

<details><summary>2. What problem does a parameterized action space solve that the other two don't?</summary>
It keeps the action space itself at a constant size (one action type) regardless of how many candidates exist, while still being able to express a choice among all of them via the parameter — avoiding both the enumerated design's explosion and the coarse design's inability to specify a target.
</details>

<details><summary>3. Does making an action space parameterized guarantee high success?</summary>
No — it only prevents the action space's own size or shape from being the bottleneck; success still depends on a separate problem, correctly identifying which parameter value (which target) to use.
</details>

## Key terms

* **Enumerated action space:** one distinct action per candidate target, whose size grows with the number of candidates.
* **Coarse action space:** a generic action with no parameter to specify a target, unable to express which one is meant.
* **Parameterized action space:** one action type that takes a target as an argument, keeping the space's size constant regardless of candidate count.

## Related

[[Kinds of Environments]] · [[Tool Selection Among Many Candidates]] · [[Hierarchical Task Planning]]
