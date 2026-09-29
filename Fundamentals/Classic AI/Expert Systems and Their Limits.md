An **expert system** captures the knowledge of human specialists as a set of if-then **rules** and applies them with an **inference engine**. In the 1980s they powered a commercial AI boom. They also hit hard limits: they were **brittle** outside their rules, expensive to build and update, and the boom ended in the second AI winter.

**You need:** [[Logic and Knowledge Representation]] and [[Rules vs Learning]].

## The question it answers

If rules work so well in narrow domains, why did the rule-writing approach to AI stall?

## Intuition: a very thorough checklist

An expert system is a checklist written by specialists. Interview an expert on how they diagnose a fault, turn the answers into rules, and let a machine apply them tirelessly and consistently. It has two main parts:

* A **knowledge base**: the rules and facts, written down by people.
* An **inference engine**: the general-purpose machinery that applies rules to the facts of a case, often by chaining (see [[Logic and Knowledge Representation]]).

The idea has a long history. MYCIN, a 1970s research system, used rules to recommend treatments for blood infections. In 1980, Digital Equipment Corporation put XCON into use, a rule-based system that configured computer orders, and it became the flagship of a wave of commercial expert systems.

## Why they hit a ceiling

| Limit | What it means |
| --- | --- |
| **Knowledge acquisition bottleneck** | Experts find it hard to put their skill into rules, and interviews are slow and expensive. |
| **Brittleness** | Outside the situations its rules cover, the system does not degrade gracefully. It just has nothing to say, or gives a wrong answer. |
| **Conflicts** | Rules can contradict each other, and someone must decide which wins. |
| **Maintenance** | Every change to the world means changing rules, and rules interact in ways that grow hard to predict. |
| **No learning** | The system never improves from experience. |

By the late 1980s these costs, together with cuts in funding, contributed to the second AI winter (see [[A Short History of AI]]).

## A worked example: a lamp troubleshooter

The bench has four rules for a lamp that will not work:

1. If the lamp is dead **and** the plug is out, plug it in.
2. If the lamp is dead **and** the bulb looks broken, replace the bulb.
3. If the lamp is dead **and** the switch is loose, replace the switch.
4. If the cord looks frayed, unplug it and replace the cord (a fire risk).

Try three situations:

* *Dead lamp with the plug out*: rule 1 fires. The system works.
* *Lamp flickers when the washing machine starts*: **no rule matches.** Nobody thought of it, so the system is silent.
* *Dead lamp, plug out and cord frayed*: rules 1 **and** 4 both fire with different advice ("plug it in" against "unplug it now"). The rules cannot tell which matters more.

Fixing either problem needs a person to write a new rule or set a priority.

## Bench

```bench
id: lamp-troubleshooter
title: A lamp troubleshooter built from rules
fallback: A rule-based lamp troubleshooter. You tick what you observe, and it fires every matching rule. It falls silent on unfamiliar situations, gives conflicting advice when rules clash, and lets you teach it new rules.
```

**Try this**

1. Tick "The lamp does not light" and "The plug is not in the socket". Read the advice.
2. Untick those and tick "It flickers when the washing machine starts". What happens?
3. Tick dead, plug out and frayed cord together. What does the system say?
4. Teach it a rule for the flicker case, then test it again. Then think about how many such rules a real product would need.

**What you should notice:** the system is helpful inside its rules and useless outside them. Each gap needs a human to fill it.

## Where they went

Rule engines did not disappear: business rules, tax software, configuration tools and safety checks still use them. But for the messy, open-ended problems in perception, language and prediction, [[Machine Learning]] took over, by learning patterns from data instead of waiting for people to write them down. Today's best systems often mix the two, with a learned model doing the fuzzy work and a few rules guarding the edges.

## Common pitfalls

* **Thinking rules are obsolete.** They are excellent when cases are few and the reasoning must be checked.
* **Confusing "explainable" with "complete".** The system can explain what it says but not what it lacks.
* **Assuming experts can articulate everything they know.** Much expertise is intuition.
* **Believing more rules solve everything.** Each addition raises the chance of clashes.

## Quick check

<details><summary>1. What are the two main parts of an expert system?</summary>
A knowledge base of rules and facts, and an inference engine that applies them.
</details>

<details><summary>2. What is "brittleness"?</summary>
Failing badly, or having nothing to say, when a case falls outside the situations the rules were written for.
</details>

<details><summary>3. Why is knowledge acquisition a bottleneck?</summary>
It depends on experts putting their skill into explicit rules, which is slow, expensive and often incomplete.
</details>

## Key terms

* **Knowledge base:** the collection of rules and facts written by people.
* **Inference engine:** the general machinery that applies the rules to a case.
* **Knowledge acquisition bottleneck:** the difficulty of getting experts' skill into explicit rules.
* **Brittleness:** failing badly outside the situations the rules cover.

## Related

[[Logic and Knowledge Representation]] · [[Rules vs Learning]] · [[A Short History of AI]] · [[Machine Learning]]
