Even once a model can technically process a very long context without breaking — no quadratic-cost wall hit, no positions outside its trained range — there's still a separate, surprising problem: it doesn't use every part of that context equally well.

**You need:** [[Context Window Extension Techniques]].

## The question it answers

"Does a model actually use every part of a long context equally reliably?" No. A well-documented effect, often called **lost-in-the-middle**, shows that retrieval accuracy for information placed in a long context tends to be highest near the very **start** and very **end** of the context, and lowest for information buried in the **middle** — a U-shaped accuracy curve across position, not a flat one.

## Intuition

Reading a long document once and then being quizzed on a specific fact somewhere inside it, most people recall details from the opening (which set the stage, got full attention while everything was still novel) and the closing (freshest in memory) better than details buried in an undifferentiated middle stretch that all started to blur together. Models trained on real text show a strikingly similar pattern — not because they're bored, but because of how attention patterns and training data distributions happen to shape what gets reliably "noticed" at each position.

## Definition and notation

```text
accuracy(position) as a function of relative position in context (0 = start, 1 = end):
  high near position 0 and position 1
  low near position 0.5

→ a U-shaped curve, not a flat or monotonic one
```

## A worked example

A toy retrieval-accuracy curve across relative positions in a long context:

```text
position   0%:  95.0% accuracy
position  25%:  69.1% accuracy
position  40%:  58.6% accuracy
position  50%:  55.0% accuracy    ← the low point
position  60%:  58.6% accuracy
position  75%:  69.1% accuracy
position 100%:  95.0% accuracy
```

Information placed exactly at the start or end of the context is retrieved correctly 95% of the time; information placed right in the middle drops to 55% — barely better than a coin flip, for information that's objectively no harder to retrieve in principle than information near either edge.

## Bench

```bench
id: lost-in-middle
title: Easiest to recall at the edges
fallback: Slide through positions in a long context and watch retrieval accuracy dip toward the middle.
```

**Try this**

1. Check accuracy right at the start of the context.
2. Slide toward the middle and watch accuracy drop.
3. Slide past the middle toward the end and watch it recover.

**What you should notice:** the curve's shape — high, dropping, then recovering — is the real signature of this effect; a model doing uniformly well (or uniformly worse) across every position would look completely different.

## Where it appears in AI

* **This effect was directly measured using "needle in a haystack" tests**: placing a specific, easily-checkable fact at a controlled position within a long context and measuring whether the model retrieves it correctly, repeated across many positions.
* **It has real practical implications for how prompts should be structured**: critical information is often better placed near the start or end of a long context than buried in the middle, where retrieval is least reliable.
* **It's a genuinely different failure mode from [[Context Window Extension Techniques|running out of positional range]] or [[Long-Context Transformers|hitting the compute wall]]** — this effect shows up even well within a model's supported context length, on information it's technically fully capable of processing.

## Common pitfalls

* **Assuming longer context always means proportionally better use of all of it.** A longer context window doesn't guarantee uniform retrieval reliability across its full length — this U-shape effect can persist (or worsen) even within a supported context length.
* **Treating this as an engineering bug to patch away entirely.** It's a measured, documented behavioral tendency across many models, not a simple implementation error with a one-line fix.
* **Forgetting this is about retrieval reliability, not raw capacity.** The model can technically process the middle content just fine — the effect is specifically about how reliably it surfaces and uses that information when answering.

## Quick check

<details><summary>1. What shape does retrieval accuracy typically follow across positions in a long context?</summary>
A U-shape — high accuracy near the start and end of the context, and a noticeable dip for information placed near the middle.
</details>

<details><summary>2. In the worked example, roughly how much lower was accuracy at the middle compared to the edges?</summary>
About 40 percentage points lower — 55% in the middle versus 95% at either edge.
</details>

<details><summary>3. How is this effect measured in practice?</summary>
"Needle in a haystack" tests: placing a specific, checkable fact at a controlled position within a long context and measuring how reliably the model retrieves it, repeated across many different positions.
</details>

## Key terms

* **Lost-in-the-middle:** the tendency for retrieval accuracy to be lower for information near the middle of a long context than near its edges.
* **Needle in a haystack test:** a method for measuring position-dependent retrieval accuracy by placing a specific fact at a controlled position.
* **U-shaped accuracy curve:** the characteristic high-low-high pattern of accuracy across context position.

## Related

[[Context Window Extension Techniques]] · [[Multi-Turn Conversation State and Memory]] · [[Benchmark Suites (MMLU, HELM, BIG-bench)]]
