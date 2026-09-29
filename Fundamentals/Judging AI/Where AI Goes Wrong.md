AI systems fail in patterned ways: they learn from **unrepresentative or biased data**, they meet a **world that has changed** since training, they can be **brittle** to tiny changes, and they can be **confidently wrong**. Knowing these patterns lets you ask the right questions before relying on a system.

**You need:** [[Data as Raw Material]], [[Generalization]] and [[Measuring Performance]].

## The question it answers

A system passed its tests. Where might it still let people down?

## Intuition: a model is a mirror of its data

A model learns the patterns in whatever it was shown. If the examples were lopsided, the model is lopsided. If the world moves on, the model is out of date. It has no way of knowing what its data left out.

## Failure patterns

| Pattern | What happens | Example |
| --- | --- | --- |
| **Skewed or biased data** | The model serves the groups that dominate its examples better than those that do not | A system tuned mostly on one population works worse for another |
| **Distribution shift** | The world changes after training, so the model's patterns no longer hold | A fraud detector trained before a new scam appears |
| **Brittleness** | Tiny, sometimes invisible, changes to an input flip the answer | Researchers have shown that adding faint patterns to an image can make a classifier mislabel it |
| **Confident mistakes** | The system produces a fluent, sure-sounding wrong answer | A language model states an invented fact as if it were true |
| **Misspecified goals** | It optimises exactly what it was told, not what was meant | A feed that maximises clicks promotes outrage (see [[Goals, Utility and Rationality]]) |
| **Feedback loops** | Its outputs change the data it later learns from | A system that only shows popular items makes them more popular |

## A worked example: one cut-off for two groups

Imagine one number, a reading, that decides "yes" or "no". For group A the truth switches at 0.55. For group B, whose readings are calibrated differently, it switches at 0.40. The model must choose a single cut-off from its training data.

| Group B's share of the training data | Model's cut-off | Group A correct | Group B correct |
| --- | --- | --- | --- |
| 10% | 0.56 | **95%** | **82%** |
| 50% | 0.44 | 85% | 93% |

With little of group B in the data, the cut-off sits at group A's value and group B loses out. Rebalance the data and the cost simply moves to group A, because **one cut-off cannot suit two groups**. The real problem is missing context: the model does not know which group it is looking at. Tell it, so that it can set a cut-off for each group, and at 10% share both groups do well (A 95%, B 93%).

Then let the world shift. If group A's true switch-point later moves up by 0.2 while the model stays frozen, group A's accuracy falls from 95% to 79%, though nothing about the model changed. This is distribution shift.

## Bench

```bench
id: skewed-data
title: Whose data shaped the model?
fallback: Two groups of readings whose true cut-offs differ. A model picks one cut-off from training data, and sliders change how much of the data comes from group B and whether the world shifts after training. A toggle gives the model the group as extra context.
```

**Try this**

1. Start with group B at 10% of the training data. Which group does the model serve better?
2. Raise group B's share to 50%. Who gains, and who loses?
3. Turn on **Tell the model which group each example comes from**. What happens to both groups at 10% share?
4. Slide **the world changes after training** up. Which group's accuracy falls, and why?

**What you should notice:** balancing the data is not enough when the groups genuinely differ. The model needs the information that separates them, and it needs to be checked after the world moves.

## Habits that help

* **Look at results per group,** not just overall.
* **Ask who is missing from the data.**
* **Keep testing after deployment,** since the world changes.
* **Match the measure to the harm:** see [[Measuring Performance]].
* **Do not assume fluent means correct.**

The bench uses "groups" abstractly. In real systems the groups might be devices, regions, ages, languages or people. Later parts of the galaxy return to these questions in detail.

## Where it appears in AI

Every planet inherits these issues. [[Machine Learning]] adds tools to measure and reduce them. [[LLMs]] and [[Generative AI]] add new forms of confident error. [[Agents]] add the risk that a wrong decision is acted on.

## Common pitfalls

* **Assuming bias is only a data problem.** Goals, labels and how a system is used matter too.
* **Assuming more data always fixes it.** More of the same lopsided data changes little.
* **Treating an average as safe.** A high overall score can hide a poor result for a small group.
* **Assuming a tested system stays tested.** Change in the world breaks old guarantees.

## Quick check

<details><summary>1. Why can a model do worse for a group that is rare in its training data?</summary>
It learns the patterns of the dominant group, so a group with different patterns is served poorly.
</details>

<details><summary>2. What is distribution shift?</summary>
The data the system meets after deployment differs from the data it was trained on.
</details>

<details><summary>3. Why look at results group by group?</summary>
An overall average can hide a poor result for a smaller group.
</details>

## Key terms

* **Bias (in data):** a lopsided or unrepresentative sample that skews what a model learns.
* **Distribution shift:** new data differing from the data a model was trained on.
* **Adversarial example:** an input altered slightly, often invisibly, to make a model err.
* **Feedback loop:** a system's outputs changing the data it later learns from.
* **Hallucination:** a fluent output that is confidently wrong or invented.

## Related

[[Data as Raw Material]] · [[Generalization]] · [[Measuring Performance]] · [[Goals, Utility and Rationality]] · [[Machine Learning]]
