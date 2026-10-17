Nothing in how a language model generates text requires what it says to be true — it only requires the next token to be a plausible continuation. This note covers the gap that opens up between "sounds right" and "is right," and the specific danger of a model that sounds right while being wrong.

**You need:** [[Human Evaluation of Generated Content]].

## The question it answers

"Why does a model sometimes state false things with the same fluent confidence as true ones?" **Hallucination** is generated content that's fluent and often stated confidently, but doesn't correspond to fact. It's not the same failure as low confidence or obvious gibberish — the dangerous case is specifically when a false claim is delivered with the same tone, structure and apparent certainty as a true one, because nothing about *how* it's phrased distinguishes the two.

## Intuition

A student who's memorized the shape and rhythm of a confident answer, without actually knowing the material, can produce something that sounds exactly like genuine expertise — right up until the content is checked against reality. A language model trained to predict plausible continuations of text has learned the shape of confident, fluent claims extremely well; it has no separate, built-in mechanism that specifically tracks whether each claim is actually true.

## Definition and notation

```text
a claim is a hallucination when:
  it is stated with no hedging (confidently, fluently)
  AND it does not match a known, checkable fact

→ fluency and confidence of phrasing say nothing, by themselves,
  about whether a claim is checkable-true or checkable-false
```

## A worked example

Four claims, each generated with a stated confidence, checked against a small fact base:

```text
"Paris is the capital of France"                       conf 0.97   TRUE   → correct
"The Great Wall of China is visible from the Moon"      conf 0.89   FALSE  → HALLUCINATION
"Water boils at 100°C at sea level"                      conf 0.95   TRUE   → correct
"Napoleon was extremely short for his era"               conf 0.80   FALSE  → HALLUCINATION
```

Two of the four claims are a well-known myth and a long-debunked piece of trivia (Napoleon's height was, in fact, roughly average for his era) — both stated with high confidence, phrased no differently from the two true claims right alongside them. Nothing about *how* any of the four claims were stated distinguishes the true ones from the false ones; only checking each one against an outside source does.

## Bench

```bench
id: hallucination-confidence
title: Confident, and wrong
fallback: Step through generated claims and see which ones, despite sounding equally confident, turn out to be false.
```

**Try this**

1. Step through each claim and track how many turn out to be hallucinations.
2. Notice the stated confidence values don't obviously separate the true claims from the false ones.
3. Consider how you'd have told them apart without a fact base to check against.

**What you should notice:** fluency and confidence of phrasing carry essentially no information about truth on their own — the only way to catch a hallucination is to check the content against something outside the generation itself.

## Where it appears in AI

* **Retrieval-augmented generation (grounding a model in retrieved documents) is one of the main practical mitigations**, specifically because it gives the model something to check claims against, rather than relying purely on parametric memory.
* **Hallucination rates are a standard evaluation axis for LLMs**, usually measured by checking generated claims against a trusted source, exactly as this worked example does by hand.
* **It's distinct from low-confidence uncertainty**: a well-calibrated model that says "I'm not sure" about something it doesn't know is behaving correctly; hallucination specifically means confident, fluent, and wrong.

## Common pitfalls

* **Assuming fluent, confident-sounding text is more likely to be true.** The worked example shows fluency and confidence are present in both the true and false claims — they're not a reliable signal either way.
* **Treating hallucination as a rare edge case.** It's a direct, structural consequence of how generation works (predicting plausible continuations, not verified facts), not an occasional bug limited to unusual inputs.
* **Assuming hallucination only happens on obscure facts.** Models can hallucinate about well-known topics too, particularly ones involving commonly repeated myths (like the Great Wall claim here) that appear confidently stated throughout their training data.

## Quick check

<details><summary>1. What makes a generated claim a hallucination, specifically?</summary>
It's stated fluently and with confidence, but it doesn't match a known, checkable fact — the key failure is confident, plausible-sounding falsehood, not obvious uncertainty or gibberish.
</details>

<details><summary>2. In the worked example, what did the two false claims have in common with the two true claims?</summary>
Both pairs were phrased with similar fluency and comparably high stated confidence — nothing about their phrasing distinguished the true claims from the false ones.
</details>

<details><summary>3. Why doesn't a model's confident tone tell you anything reliable about whether a claim is true?</summary>
A model is trained to produce plausible, fluent continuations of text, not to separately track or verify the truth of what it states — confident phrasing reflects learned patterns of how confident claims typically sound, not a checked fact.
</details>

## Key terms

* **Hallucination:** fluent, often confidently stated generated content that doesn't match fact.
* **Grounding:** connecting a model's output to retrieved or verified external sources, to reduce hallucination.
* **Calibration:** how well a model's stated confidence matches its actual correctness — hallucination is a specific, severe failure of calibration.

## Related

[[Human Evaluation of Generated Content]] · [[Bias and Representational Harm in Generation]] · [[Memorization and Training Data Leakage]]
