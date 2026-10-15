[[Self-Supervised Learning]] can invent a pretext task besides "fill in the missing piece." **Contrastive learning** instead asks: given an **anchor** and several candidates, which one is really just another view of the same thing? Train embeddings to pull a true matching pair close together and push everything else apart, and the resulting geometry tends to capture real similarity structure — with no labels at all.

**You need:** [[Self-Supervised Learning]] and [[Embeddings and Similarity Search]].

## The question it answers

"Masked prediction isn't the only way to learn without labels — can a model instead learn directly from 'these two things are related, this other thing isn't'?" Yes: generate related pairs automatically (two different augmented crops of the same photo, say), treat everything else in a batch as unrelated, and train embeddings to reflect exactly that structure.

## Intuition: a lineup, not a fill-in-the-blank

Instead of hiding part of an input and guessing it, contrastive learning sets up a lineup: here is an anchor, here is its true match (a different crop, or augmentation, of the *same* underlying image), and here are several decoys (crops from *other* images). The model's job is to pick the true match out of the lineup — and it can only get consistently good at that by learning an embedding space where genuinely related things really do sit close together.

## Definitions

```text
anchor a, positive p (same source as a), negatives n₁, …, n_k (different sources)

similarity(x, y) = cosine similarity of their embeddings
score_i = similarity(a, candidate_i) / τ        (τ = temperature, a scaling constant)

P(positive | anchor) = softmax over all candidates' scores, read off at the positive's position
loss = −log P(positive | anchor)                (InfoNCE loss, in essence)
```

A lower temperature `τ` makes the softmax sharper — it punishes a near-miss on the positive more heavily, pushing training harder toward separating the true match from everything else.

## A worked example

2D (unit-normalized) embeddings: anchor `a`, a positive `p` (meant to represent another view of the same source), and three negatives, with temperature `τ = 0.5`:

```text
cosine similarity, divided by τ:    positive = 1.988     negative₁ = −2.000
                                     negative₂ = 0.000     negative₃ = −1.414

softmax →  P(positive) = 0.8411,  P(neg₁) = 0.0156,  P(neg₂) = 0.1152,  P(neg₃) = 0.0280

contrastive loss = −log(0.8411) ≈ 0.173
```

The positive, being genuinely close to the anchor, gets the overwhelming majority of the probability (84%) — and the loss is small precisely because the model is already doing a good job distinguishing it from the three negatives. A model whose embeddings didn't yet separate the positive from the negatives well would show a much higher loss here.

## Bench

```bench
id: contrastive-lineup
title: Picking the true match out of a lineup
fallback: An anchor, a positive and several negative embeddings in 2D. Move any point and watch the similarity scores, softmax probabilities and the resulting contrastive loss update.
```

**Try this**

1. Move the positive closer to the anchor and watch the loss fall.
2. Move one negative very close to the anchor instead and watch the loss rise, even with the positive unchanged.
3. Lower the temperature and see how much more sharply the probabilities concentrate on whichever candidate is closest.

**What you should notice:** the loss cares about *relative* closeness, not absolute distance — a positive that is close to the anchor but has a negative almost as close still produces a meaningfully higher loss than a positive that clearly stands out.

## Where it appears in AI

* **SimCLR and similar vision methods** generate positive pairs by applying two different random augmentations (crop, colour jitter, flip) to the same image, treating every other image in the batch as a negative.
* **CLIP-style models** apply the same contrastive principle across *different modalities* — pulling an image and its matching caption's embeddings together, pushing mismatched image-caption pairs apart.
* **The choice of negatives matters a great deal in practice**: "hard" negatives (similar but genuinely different) teach the model more than negatives that were already obviously dissimilar.

## Common pitfalls

* **Forgetting the loss is relative, not absolute.** A positive's raw similarity score alone doesn't determine the loss; how it compares to the negatives in the same batch does.
* **Using too small a batch (too few negatives).** Contrastive learning's negatives come from the batch itself in most implementations, so a small batch gives a much easier (and less informative) task.
* **Picking an augmentation strategy that destroys the thing you actually want the model to learn.** If augmentations are too aggressive, "same source" pairs may no longer share the structure you intended to teach.

## Quick check

<details><summary>1. What makes a pair "positive" in contrastive learning, typically?</summary>
Both members come from the same original source (such as two different augmented views of the same image), generated automatically with no human labelling.
</details>

<details><summary>2. What does lowering the temperature τ do to the softmax probabilities?</summary>
It sharpens them, concentrating probability more heavily on whichever candidate has the highest similarity score.
</details>

<details><summary>3. In the worked example, why is the loss low even though negative₂'s score isn't very negative?</summary>
The positive's score (1.988) is still comfortably the highest, so it captures the large majority of the softmax probability regardless of how the negatives compare to each other.
</details>

## Key terms

* **Anchor, positive, negative:** the reference example, its true match, and unrelated distractor examples in a contrastive training batch.
* **Temperature (τ):** a scaling constant controlling how sharply the softmax concentrates on the closest candidate.
* **InfoNCE loss:** the standard contrastive loss, a softmax cross-entropy over similarity scores against one true positive.

## Related

[[Self-Supervised Learning]] · [[Embeddings and Similarity Search]] · [[What Deep Networks Learn]] · [[Data Augmentation]]
