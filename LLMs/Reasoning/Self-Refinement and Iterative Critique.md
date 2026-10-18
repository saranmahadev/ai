Exploring several reasoning branches at once, as in [[Tree-of-Thought and Search-Based Reasoning]], is one way to improve on a single first attempt. A different, often cheaper way: keep the same single answer, but have the model check its own work and revise it, more than once if needed.

**You need:** [[Tree-of-Thought and Search-Based Reasoning]].

## The question it answers

"Can a model improve its own answer just by reviewing and revising it?" **Self-refinement** has a model critique its own draft response, then produce a revised version addressing that critique, repeated for several rounds. Each round tends to close part of the remaining gap to a genuinely good answer — but with **diminishing returns**: later rounds improve the answer by less than earlier ones did, since the most obvious, easiest-to-catch flaws tend to get fixed first.

## Intuition

A writer who reads their own first draft aloud usually catches the most glaring problems immediately — an awkward sentence, a missing point. A second read-through catches somewhat subtler issues; a third catches fewer still. Each additional pass still helps, but there's less and less left to catch each time, because the easiest problems to spot were already fixed in the earlier passes.

## Definition and notation

```text
quality after round r, starting from quality 0.5 and closing half
the remaining gap to perfect quality (1.0) each round:
  quality(r) = 1 − 0.5^(r+1)
```

## A worked example

Quality tracked across five rounds of critique and revision:

```text
round 0:  quality 0.5000
round 1:  quality 0.7500
round 2:  quality 0.8750
round 3:  quality 0.9375
round 4:  quality 0.9688
```

The first round closes half the initial gap (from 0.5 to 0.75 — a gain of 0.25). The fourth round, starting much closer to perfect quality already, only closes the gap from 0.9375 to 0.9688 — a gain of just 0.03. Every round still helps, but each one buys less improvement than the one before it.

## Bench

```bench
id: self-refine-rounds
title: Each revision closes half the remaining gap
fallback: Step through critique-and-revise rounds and watch quality climb with steadily shrinking gains.
```

**Try this**

1. Step through the first couple of rounds and note the size of each gain.
2. Keep stepping and watch each subsequent round's gain shrink.
3. Consider how many rounds it would take to meaningfully close the remaining gap at round 4.

**What you should notice:** the *shape* of the improvement — large gains early, smaller gains later — is the real signature of self-refinement; it's rarely a flat, steady rate of improvement per round.

## Where it appears in AI

* **Self-refinement composes naturally with [[Reward Modeling|a reward or verifier model]] deciding when to stop** — rather than running a fixed number of rounds, a verifier can signal once further revision is unlikely to help enough to be worth the extra cost.
* **It's a comparatively cheap technique**: unlike [[Tree-of-Thought and Search-Based Reasoning|exploring several parallel branches]], self-refinement follows one answer through several sequential improvements, at roughly the cost of a few extra generation passes rather than a multiplicative search cost.
* **It has real limits**: a model's self-critique is only as good as its own judgment, which can share the same blind spots as whatever produced the original draft — self-refinement doesn't introduce genuinely new information, only a second (and third, and fourth) look with the same underlying capability.

## Common pitfalls

* **Expecting unlimited rounds to keep producing meaningful gains.** The worked example's own numbers show returns shrinking sharply — running many more rounds than a task warrants wastes compute for little benefit.
* **Assuming self-critique catches every kind of flaw.** A model's critique of its own answer draws on the same capabilities (and the same gaps) that produced the original draft — it's not an independent check from a different source of judgment.
* **Treating this as equivalent to exploring multiple independent attempts.** Self-refinement follows one evolving answer sequentially; it's a different mechanism from (and often cheaper than) generating several independent candidates and picking the best.

## Quick check

<details><summary>1. What's the general shape of quality improvement across self-refinement rounds?</summary>
Large gains in the earliest rounds, with each subsequent round producing a smaller gain than the one before — diminishing returns, not a steady, flat rate of improvement.
</details>

<details><summary>2. In the worked example, how much did quality improve between round 0 and round 1, versus between round 3 and round 4?</summary>
Round 0 to round 1 gained 0.25 (0.5 to 0.75); round 3 to round 4 gained only about 0.03 (0.9375 to 0.9688) — a much smaller improvement despite being the same kind of critique-and-revise step.
</details>

<details><summary>3. Why doesn't self-refinement introduce genuinely new information into the answer?</summary>
The critique and the revision both come from the same underlying model's capability — it's a repeated second (and third) look using the same judgment that produced the original draft, not an independent source of new knowledge.
</details>

## Key terms

* **Self-refinement:** having a model critique and revise its own answer, repeated across several rounds.
* **Diminishing returns:** each additional round producing a smaller improvement than the round before it.
* **Critique-revise cycle:** one round of a model generating feedback on its own draft and then producing a revised version.

## Related

[[Tree-of-Thought and Search-Based Reasoning]] · [[Reward Modeling]] · [[Distilling Reasoning into Smaller Models]]
