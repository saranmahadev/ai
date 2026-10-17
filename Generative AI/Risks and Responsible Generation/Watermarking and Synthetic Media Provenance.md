Detecting memorized training content means comparing a model's behavior against something it saw before. Telling generated content apart from real content is a related but different problem, and one a model's creator can actually engineer a solution for: deliberately biasing generation in a way invisible to a reader but detectable by anyone who knows the rule.

**You need:** [[Memorization and Training Data Leakage]].

## The question it answers

"How can generated text be marked as machine-generated without visibly changing how it reads?" A **green-list watermark** biases which tokens a model is likely to choose, using a rule invisible to a casual reader: the *previous* token deterministically seeds a pseudorandom split of the vocabulary into a "green" list (some fraction, γ) and the rest. Nudging the model to prefer green-list tokens, even slightly, produces text with a green-token fraction well above what random chance would produce — detectable by anyone who knows the seeding rule, without needing to see how the text was generated.

## Intuition

Imagine a secret rule: "whichever word was just said determines a specific, unpredictable-looking half of the dictionary that's temporarily 'preferred.'" Write normally while slightly favoring that preferred half whenever you have a free choice, and the result still reads completely naturally — nothing about any individual sentence looks unusual. But someone who knows the rule can walk through your text afterward, recompute which half was "preferred" at every point, and check: did you use far more preferred-list words than pure chance would predict? If yes, that's the watermark, detected with no need to have watched you write it.

## Definition and notation

```text
green-list rule: previous token's id seeds a pseudorandom split of the
  vocabulary into a green set (fraction γ) and a red set (fraction 1−γ)

generation: bias every green-list token's logit upward by δ before choosing
detection: recompute the green list at every position; measure the
  fraction of generated tokens that landed in their own green list
  → near γ under no watermark; well above γ if the bias was applied
```

## A worked example

200 toy tokens generated two ways — with and without the green-list bias (δ=4, γ=0.5, so about half the vocabulary is "green" at any position) — then checked against the exact same green-list rule used during generation:

```text
unwatermarked generation:  49.2% of tokens land in their own green list
  (matches the ~50% expected by pure chance, with no bias applied)

watermarked generation:    100.0% of tokens land in their own green list
  (far beyond chance — unmistakable evidence of the bias)
```

With no bias, the green-token fraction sits right where random chance predicts (about 50%, since half the vocabulary is green at any step). With the bias applied, every single token in this run happened to land in the green list — a result pure chance would essentially never produce, making the watermark trivially detectable by anyone running the same green-list rule over the text.

## Bench

```bench
id: watermark-detect
title: A hidden bias that's easy to detect, if you know the rule
fallback: Toggle a watermark bias on and off and watch how much the green-token fraction departs from the chance level.
```

**Try this**

1. Turn the watermark off and check the green-token fraction sits near 50%.
2. Turn it on and watch the fraction shoot up.
3. Lower the bias strength (δ) and see how weak the watermark can get before the fraction drops back toward chance.

**What you should notice:** detection doesn't require seeing the generation process at all — it only requires recomputing the same green-list rule over the finished text and checking whether the green fraction is implausibly high to have occurred by chance.

## Where it appears in AI

* **This is a real, deployed technique (closely following Kirchenbauer et al., 2023)**, used by some LLM providers specifically to let anyone with the detection rule check whether a piece of text came from their model.
* **Robustness is the open challenge**: paraphrasing, translation, or heavy editing of watermarked text can wash out the green-list signal, since those operations change which tokens actually appear.
* **It's a fundamentally different approach from [[Copyright and Training Data Provenance|overlap detection]]**: overlap detection looks for evidence a specific training example was reproduced; watermarking is a deliberate signal engineered in at generation time, present whether or not any training data is involved at all.

## Common pitfalls

* **Assuming a watermark is visible or changes the text's readability.** The entire point is that it doesn't — the bias operates purely at the level of which plausible-but-arbitrary token choice gets made, not on content or style.
* **Expecting watermark detection to work without the exact seeding rule.** Detection requires recomputing the same green-list function used during generation; without knowing that rule, the bias is statistically invisible.
* **Treating watermarking as unbreakable.** A sufficiently aggressive rewrite can degrade or destroy the signal, since the watermark lives in specific token choices that a rewrite can simply replace.

## Quick check

<details><summary>1. What determines whether a given token counts as "green" at a particular position?</summary>
The token immediately before it — that previous token deterministically seeds a pseudorandom split of the vocabulary into a green set and a red set.
</details>

<details><summary>2. In the worked example, why was 49.2% (unwatermarked) not considered suspicious, while 100.0% (watermarked) clearly was?</summary>
49.2% sits right at the chance level expected when half the vocabulary is green and no bias is applied; 100.0% is so far beyond what chance alone would produce that it's essentially impossible without a deliberate bias toward green tokens.
</details>

<details><summary>3. How does watermark detection differ from overlap-based provenance detection?</summary>
Watermark detection recomputes a known rule over the text and checks for a statistical excess of green tokens, requiring no access to any training data; overlap detection instead compares the text directly against a specific reference corpus to find verbatim matches.
</details>

## Key terms

* **Watermark (green-list):** a deliberate, invisible bias toward a pseudorandomly chosen subset of tokens, detectable by recomputing the same rule.
* **Green list:** the pseudorandomly selected subset of the vocabulary favored at a given generation step.
* **Detection:** checking a piece of text for an implausibly high fraction of green-list tokens under the known seeding rule.

## Related

[[Memorization and Training Data Leakage]] · [[Copyright and Training Data Provenance]] · [[Content Safety and Red-Teaming]]
