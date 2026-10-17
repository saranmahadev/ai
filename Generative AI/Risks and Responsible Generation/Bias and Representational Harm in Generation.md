A model's embeddings encode whatever statistical patterns were in its training data — including patterns nobody deliberately put there. This note covers a direct way to measure one specific kind: whether words associated with a social group sit systematically closer to some concepts than others, in a way that reflects stereotype rather than meaning.

**You need:** [[Any-to-Any Generative Models]].

## The question it answers

"How do you measure whether a model's representations encode a stereotyped association?" A **word embedding association test (WEAT-style)** measures the gap between how strongly one group's embeddings associate with a target concept versus how strongly another group's embeddings associate with that same concept. A consistent, sizeable gap — male-coded terms sitting systematically closer to "career," female-coded terms systematically closer to "family," say — reveals a learned statistical association that mirrors a social stereotype, independent of whether that association reflects anything true about any individual.

## Intuition

If you measured the average distance from "doctor" to a set of male names versus a set of female names in some embedding space, and found a consistent gap, that gap wouldn't mean anything about actual doctors — it would mean the training data the embeddings came from contained that pattern often enough for the model to encode it as a statistical regularity. The test doesn't diagnose any individual word's meaning; it measures a *systematic* gap across a whole set of related words, which is much harder to dismiss as coincidence.

## Definition and notation

```text
mean association of an attribute set A with target concept T:
  meanAssoc(A, T) = (1/|A|) · Σ cosine(a, T)   for a in A

WEAT-style differential:
  meanAssoc(A₁, T) − meanAssoc(A₂, T)
  → a large, consistent gap across target concepts indicates a learned association
```

## A worked example

Toy embeddings for two attribute groups (male-coded, female-coded) and two target concepts (career, family):

```text
male-coded   vs. career:  0.6999        female-coded vs. career:  −0.6255
male-coded   vs. family: −0.6255        female-coded vs. family:   0.6999

differential (male-career minus female-career):  1.3254
```

Male-coded embeddings associate strongly and positively with "career" while female-coded embeddings associate strongly and *negatively* with it — and the pattern flips exactly for "family." The two groups aren't just slightly different; they're near-mirror images of each other across both target concepts, exactly the kind of systematic, large gap the test is built to surface.

## Bench

```bench
id: bias-association-test
title: Which group associates more with which concept?
fallback: Switch between target concepts and compare how strongly two attribute-coded groups associate with each one.
```

**Try this**

1. Look at the association gap for "career."
2. Switch to "family" and watch the gap reverse direction.
3. Consider what a gap of exactly 0 at both concepts would mean.

**What you should notice:** the gap isn't just present for one concept — it shows up consistently, in opposite directions, for both concepts tested, which is what makes it a *systematic* association rather than noise from one arbitrary pair of words.

## Where it appears in AI

* **The real WEAT methodology (Caliskan et al., 2017) used this exact approach on word embeddings trained on ordinary web text**, and found measurable associations mirroring known social stereotypes, confirming such biases get encoded without anyone deliberately introducing them.
* **This generalizes to generative models directly**: a text-to-image model's generated outputs for occupation prompts, or a language model's completions for different demographic framings, can show the same kind of systematic, measurable skew.
* **It's a different question from [[Fairness Metrics|classification fairness]]**: that's about a specific decision's outcomes across groups; this is about whether a model's underlying representations encode a stereotyped association in the first place, which can manifest in generation even without any formal decision being made at all.

## Common pitfalls

* **Treating any single word pair's association as proof of bias.** Individual associations can be noisy; the test's real signal is a *systematic* gap holding across multiple related words and concepts, as in the worked example.
* **Assuming measuring bias is the same as fixing it.** This kind of test diagnoses whether an association exists; removing or correcting it is a separate, genuinely difficult problem — measurement and mitigation are not the same step.
* **Forgetting the test measures statistical association in representations, not intent.** No one has to deliberately encode a stereotype for it to appear — it's a direct consequence of what patterns were present, and how often, in the training data.

## Quick check

<details><summary>1. What does a WEAT-style test actually measure?</summary>
The gap between how strongly one group's embeddings associate with a target concept versus how strongly another group's embeddings associate with the same concept, aggregated across multiple related words rather than any single pair.
</details>

<details><summary>2. In the worked example, why is the flip between "career" and "family" significant?</summary>
It shows the association isn't a one-off coincidence for a single concept — the same two groups show a large, opposite-direction gap for a second, related concept, which is much stronger evidence of a systematic encoded pattern.
</details>

<details><summary>3. Does a measured association prove something true about any individual the attribute set represents?</summary>
No — it reveals a statistical pattern present in the training data the embeddings were derived from, not a fact about any individual person or group member.
</details>

## Key terms

* **WEAT (word embedding association test):** a method for measuring systematic association gaps between attribute-coded groups and target concepts in embeddings.
* **Representational harm:** harm arising from how a group is represented (stereotyped, underrepresented, or misrepresented) rather than from a specific denied outcome.
* **Differential association:** the gap between two groups' mean association with the same target concept.

## Related

[[Any-to-Any Generative Models]] · [[Hallucination and Factuality]] · [[Content Safety and Red-Teaming]]
