BLEU and ROUGE work by comparing a generation directly against *one specific* reference. Images, audio and video usually don't have one "correct" reference to compare against at all — a generated photo of a cat doesn't need to match any particular real photo, just be a *plausible* one. This note covers metrics built for exactly that situation: comparing whole distributions, not individual outputs.

**You need:** [[n-gram Overlap Metrics (BLEU and ROUGE)]].

## The question it answers

"How do you score a generative model when there's no single correct output to compare against?" **Distributional metrics** compare the *statistics* of a set of generated samples against the statistics of real data, rather than matching individual outputs one to one. The **Fréchet distance** (the core of FID, "Fréchet Inception Distance") measures how far apart two distributions' means and (co)variances are. **CLIP score** takes a completely different approach for text-conditioned generation: measuring the cosine similarity between a generated image's embedding and its prompt's embedding directly, via the same kind of shared embedding space from [[Any-to-Any Generative Models]].

## Intuition

You can't check whether a generated photo of a cat "matches" reality by comparing it pixel-for-pixel against any single real cat photo — there's no one right answer. What you *can* check is whether a whole batch of generated cat photos, as a group, has roughly the same statistical "shape" (how varied they are, what the average features look like) as a batch of real cat photos. That's the Fréchet-distance idea: compare two clouds of points by their center and spread, not point by point.

## Definition and notation

```text
Fréchet distance (diagonal-covariance simplification), between real features R and generated features G:
  d = ‖mean(R) − mean(G)‖² + Σᵢ [ var(R)ᵢ + var(G)ᵢ − 2·√(var(R)ᵢ · var(G)ᵢ) ]
  → 0 only when both the means and the variances match exactly, dimension by dimension

CLIP score: cosine(embed(generated image), embed(prompt))
  → high when the image and its prompt land near each other in a shared embedding space
```

## A worked example

Four small 2D "real" feature points clustered near `(1, 2)`, compared against two different generated sets:

```text
real features:         (1, 2), (1.2, 2.1), (0.9, 1.9), (1.1, 2.05)

close match:            (1.05, 1.95), (1.15, 2.08), (0.95, 1.92), (1.0, 2.0)
  distributional distance: 0.0024    ← very close

shifted distribution:   (5, 5), (5.2, 5.1), (4.8, 4.9), (5.1, 5.05)
  distributional distance: 24.8019   ← very far
```

Both generated sets have roughly the same *internal spread* as the real set (each has similar variance among its own four points) — the huge difference between the two scores comes almost entirely from the *mean* term, since the "shifted distribution" set sits in a completely different region of feature space than the real data, despite looking internally just as consistent as the close match.

## Bench

```bench
id: fid-distributional
title: How far apart are two feature distributions?
fallback: Compare two generated feature sets against the same real feature set using a Fréchet-distance-style metric.
```

**Try this**

1. Compare the "close match" generated set's distance against the real set.
2. Switch to the "shifted distribution" set and watch the distance grow sharply.
3. Notice both generated sets have a similar internal spread — the difference is almost entirely about where their mean sits.

**What you should notice:** a distributional metric can't tell you anything about any *individual* generated sample's quality — it's purely a statement about the whole set's statistics compared to the whole real set's statistics.

## Where it appears in AI

* **FID (using real neural network features, not toy 2D points, and full covariance matrices, not just the diagonal) is the standard image-generation benchmark metric**, reported by nearly every major image-generation paper.
* **Inception Score** is a related, older distributional metric that instead measures how confidently and diversely a pretrained classifier labels the generated images — two complementary ways of asking "do these look like real, varied examples of something?"
* **CLIP score directly checks text-image alignment**, answering a different question entirely from FID: not "do generated images look realistic as a group," but "does *this* generated image actually match *this* prompt?"

## Common pitfalls

* **Using a distributional metric to judge a single generated sample.** These metrics are only meaningful computed over a reasonably large set of samples — a "distance" computed from one generated image and one real image doesn't mean what FID normally means.
* **Assuming a low distributional distance guarantees individually high-quality samples.** A generator that reproduces the right overall statistics while still occasionally producing broken individual samples can still score well, since the metric only sees aggregate statistics.
* **Forgetting CLIP score and FID measure different things.** A generated image can match its prompt extremely well (high CLIP score) while still looking statistically different from real images overall (worse FID), or vice versa.

## Quick check

<details><summary>1. Why can't BLEU-style, single-reference comparison work for most image generation tasks?</summary>
There's usually no single "correct" reference image a generated image needs to match — many very different images could all be equally valid, so comparing to one specific reference doesn't make sense.
</details>

<details><summary>2. In the worked example, why was the distance so much larger for the "shifted distribution" set despite its internal spread looking similar to the "close match" set?</summary>
The mean term in the distance dominated — the shifted set's average position was far from the real data's average position, even though both generated sets had comparable variance among their own points.
</details>

<details><summary>3. What does CLIP score measure that FID does not?</summary>
How well a specific generated image matches its specific text prompt (via embedding similarity), rather than how statistically similar a whole set of generated images is to a whole set of real images.
</details>

## Key terms

* **Distributional metric:** a score comparing the statistics of a set of generated samples to a set of real samples, rather than comparing individual outputs.
* **Fréchet distance:** a measure of how far apart two distributions' means and (co)variances are.
* **CLIP score:** the cosine similarity between a generated image's embedding and its prompt's embedding in a shared space.

## Related

[[n-gram Overlap Metrics (BLEU and ROUGE)]] · [[Diversity and Mode Collapse in Generation]] · [[Any-to-Any Generative Models]]
