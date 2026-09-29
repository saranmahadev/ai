Classic AI stored what it knew as **facts** and **rules**, and used **inference** to work out new facts from them. Writing knowledge in a form a machine can reason with is called **knowledge representation**. It gives exact, explainable answers, as long as every fact and rule was written down by someone.

**You need:** [[State and Representation]].

## The question it answers

If a machine is told a few things about the world, how can it work out things it was never told?

## Intuition: reasoning by chaining

Suppose you know two things: "Asha is Bala's parent" and "Bala is Dev's parent". You can conclude "Asha is Dev's grandparent" without anyone saying so. You applied a **rule**: *if X is Y's parent and Y is Z's parent, then X is Z's grandparent.*

A logic-based system does the same in a fixed, checkable way:

* **Facts** are statements taken to be true: `parent(Asha, Bala)`.
* **Rules** say what follows from what: `grandparent(X, Z)` if `parent(X, Y)` and `parent(Y, Z)`.
* **Inference** applies the rules to the facts and adds the conclusions to the knowledge base.

The simplest kind of step is *modus ponens*: from "A is true" and "if A then B", conclude "B".

## Forward chaining

One way to reason is **forward chaining**: keep applying every rule to the known facts, add whatever new facts result, and repeat until nothing new appears. Each derived fact can point to exactly the facts and rule that produced it, which is why classic systems can **explain** their conclusions.

## Facts as a graph

Facts often take the form *thing – relation – thing*. Drawn as a network they become a **knowledge graph**:

```text
Dev → works_at → Company
Company → located_in → India
India → part_of → Asia
```

Knowledge graphs still power many search and question-answering systems. The grouping of things into categories (a "car" is a "vehicle") is called an **ontology**.

## A worked example: a family

Start with four facts: `parent(Asha, Bala)`, `parent(Asha, Chitra)`, `parent(Bala, Dev)`, `parent(Chitra, Esha)`. Switch on all four rules on the bench and run inference until nothing new appears:

| Round | New facts | How |
| --- | --- | --- |
| 1 | `grandparent(Asha, Dev)` and `grandparent(Asha, Esha)` | the grandparent rule |
| 1 | `sibling(Bala, Chitra)` and `sibling(Chitra, Bala)` | both children of Asha |
| 1 | four `ancestor` facts, one per `parent` fact | ancestor rule 1 |
| 2 | `ancestor(Asha, Dev)` and `ancestor(Asha, Esha)` | ancestor rule 2, building on round 1 |

Four given facts produced ten derived ones. The last two needed an earlier round to finish first, which is what "chaining" means.

## Bench

```bench
id: rule-engine
title: Facts, rules and inference
fallback: Four facts about parents and four switchable rules. Running inference derives new facts such as grandparent, sibling and ancestor, and each one lists the facts it follows from. You can add new facts.
```

**Try this**

1. With only the grandparent rule on, run one round. Which facts appear?
2. Switch on all four rules and press **Run until nothing new**. How many rounds did it take, and why was more than one needed?
3. Add the fact `parent(Dev, Farid)` and run again. What new conclusions appear, and which rule produced each one?
4. Switch every rule off and run inference. What happens?

**What you should notice:** the system knows *nothing* that its facts and rules do not imply, and everything it derives comes with a reason. It never guesses.

## Strengths and limits

| Strength | Limit |
| --- | --- |
| Exact and explainable | Every fact and rule must be written by a person |
| Conclusions are guaranteed if the knowledge is right | One wrong or missing rule can break a chain |
| No training data needed | Struggles with vagueness ("about", "usually") |
| Easy to audit | The real world has too many exceptions to list |

## Where it appears in AI

Facts, rules and knowledge graphs remain in use in search, databases and business rules. The modern alternative is to represent things as learned numbers, **embeddings**, that capture meaning without hand-written rules (see [[Dot Product]] and [[LLMs]]). Some current systems combine the two: a learned model proposes, and a rule or knowledge graph checks.

## Common pitfalls

* **Treating the knowledge base as complete.** If a fact is missing, the system cannot tell "false" from "unknown".
* **Rules that clash.** Two rules can lead to opposite conclusions.
* **Expecting common sense.** The system knows only what was written.
* **Confusing logic with truth.** A valid chain from a wrong fact gives a wrong conclusion.

## Quick check

<details><summary>1. From parent(Ann, Bo) and parent(Bo, Cy), what does the grandparent rule conclude?</summary>
grandparent(Ann, Cy).
</details>

<details><summary>2. What is forward chaining?</summary>
Repeatedly applying rules to known facts, adding the conclusions, until nothing new can be derived.
</details>

<details><summary>3. Why can a rule-based system explain its answers?</summary>
Each derived fact traces back to the specific facts and rule that produced it.
</details>

## Key terms

* **Fact:** a statement taken to be true.
* **Rule:** an if-then statement saying what follows from what.
* **Inference:** deriving new facts from known facts and rules.
* **Forward chaining:** applying rules repeatedly to known facts until nothing new appears.
* **Knowledge graph:** facts stored as things linked by relations.
* **Ontology:** a structured description of categories and how they relate.

## Related

[[State and Representation]] · [[Planning]] · [[Expert Systems and Their Limits]] · [[Rules vs Learning]] · [[Dot Product]]
