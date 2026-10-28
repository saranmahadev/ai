Guidance (as in [[Classifier-Free Guidance]]) steers generation toward a condition through the score itself; this note covers a completely different way a condition enters a generative model — directly inside its architecture, through [[Encoder-Decoder Architectures as a Pattern|cross-attention]], letting the generated content look at the condition at every layer.

**You need:** [[Encoder-Decoder Architectures as a Pattern]].

## The question it answers

"How does a text prompt's embedding actually influence pixel generation, mechanically?" In most modern text-to-image and text-to-video models, every position being generated (an image patch, say) acts as a cross-attention *query* against the prompt's token embeddings, which serve as the *keys and values*. Each generated position attends over the whole prompt and pulls in — weighted by relevance — whichever words matter most to it, the same cross-attention mechanism used in encoder-decoder transformers, just with "generated content" and "condition" standing in for decoder and encoder.

## Intuition

Picture painting a canvas while a sentence describing the scene is pinned to the wall beside you. Before placing each brushstroke, you glance at the sentence and focus on whichever word is most relevant to that particular patch of canvas — "red" might draw your eye for one patch, "cat" for another. Every patch gets its own glance, and its own personalized mix of which words mattered — nothing forces every patch to react to the whole sentence equally.

## Definition and notation

```text
queries:        one per position being generated (e.g. an image latent patch)
keys, values:   one per conditioning token (e.g. a word embedding from the prompt)

attention(Q, K, V) = softmax(QKᵗ / √d) · V
→ each query's output is a weighted blend of the condition's value vectors,
  weighted by how similar that query is to each conditioning token's key
```

## A worked example

Two image-latent positions attend over three text-conditioning tokens — "a", "cat", "red" — using identity projections so the raw similarity is easy to trace. The first latent is built to resemble "a", the second to resemble "cat":

```text
latent 0 (≈ "a"):    attention weights  a: 0.419   cat: 0.254   red: 0.327
latent 1 (≈ "cat"):  attention weights  a: 0.274   cat: 0.408   red: 0.318
```

Each latent's highest attention weight lands on the text token it's closest to — latent 0 on "a" (0.419), latent 1 on "cat" (0.408) — and its output becomes a blend of all three conditioning values, dominated by whichever one it attended to most. Nothing forced this; it falls directly out of the same dot-product similarity that drives every other attention computation in this knowledge base.

## Bench

```bench
id: cross-attn-conditioning
title: An image latent attends over the prompt
fallback: Pick an image-latent position and see which word in a text prompt it attends to most, and by how much.
```

**Try this**

1. Pick the latent built to resemble "a" and check that it attends most to "a".
2. Pick the one built to resemble "cat" and compare.
3. Pick the blended latent and notice its attention is more evenly split.

**What you should notice:** each latent's attention weights are its own — there's no single, shared "how much does the prompt matter" number; every generated position gets its own personalized read of the condition.

## Where it appears in AI

* **Stable Diffusion-style text-to-image models insert cross-attention layers between the image's spatial positions and the text encoder's token embeddings** at multiple resolutions throughout the network, exactly this mechanism, repeated many times.
* **It's why some words in a prompt visibly "attach" to specific regions of a generated image** — attention maps for individual prompt tokens can be visualized directly, showing which pixels attended most to which word.
* **It composes with [[Classifier-Free Guidance|guidance]]** rather than replacing it: cross-attention is how the condition gets *used* inside the network; guidance is a separate, sampling-time lever for how strongly to *weight* that condition's influence overall.

## Common pitfalls

* **Confusing this with [[Classifier-Free Guidance|guidance]].** Guidance operates on the score at sampling time and needs no architectural change; cross-attention conditioning is built into the model's layers and runs during every forward pass, with or without any guidance on top.
* **Assuming every generated position attends equally to the whole prompt.** The worked example shows the opposite — attention weights differ sharply from one position to the next, based on each one's own query.
* **Forgetting this is the exact same mechanism as encoder-decoder cross-attention.** Nothing about it is specific to generation — "queries from one sequence, keys and values from another" is the whole idea, wherever it shows up.

## Quick check

<details><summary>1. In cross-attention conditioning, what plays the role of queries, and what plays the role of keys and values?</summary>
The positions being generated (e.g. image patches) are the queries; the conditioning input's tokens (e.g. text embeddings) supply the keys and values.
</details>

<details><summary>2. In the worked example, why did latent 1 attend most strongly to "cat"?</summary>
Because latent 1's query vector was built to closely resemble the "cat" token's key vector, giving their dot-product similarity (and so their attention weight) the highest value among the three conditioning tokens.
</details>

<details><summary>3. How does cross-attention conditioning differ from guidance, mechanically?</summary>
Cross-attention is built into the model's architecture and runs on every forward pass regardless of any guidance setting; guidance is a separate adjustment applied to the model's output (its score) at sampling time, with no architectural change required.
</details>

## Key terms

* **Cross-attention conditioning:** using a condition's embeddings as the keys and values that generated positions attend over.
* **Attention map:** the per-position attention weights over a conditioning input, often visualized to see which words or regions influenced which output.
* **Query, key, value:** the three attention roles — here, generated positions supply queries, and the condition supplies keys and values.

## Related

[[Encoder-Decoder Architectures as a Pattern]] · [[Classifier-Free Guidance]] · [[Text-to-Image Pipelines]]
