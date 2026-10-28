This capstone traces one prompt through the two mechanisms this subject opened with — conditioning and guidance — and closes the loop by decoding the result back into a named concept, checking that the pieces this subject built compose into one working pipeline, exactly as the Transformers subject's own capstone did.

**You need:** [[Classifier-Free Guidance]], [[Text-to-Image Pipelines]], [[Any-to-Any Generative Models]].

## The question it answers

"Do conditioning, guidance and cross-modal decoding actually compose into one working generator?" This capstone builds the pipeline directly: take a text prompt naming a concept, run several classifier-free-guidance-steered denoising steps toward that concept's cluster (the exact mechanism from [[Classifier-Free Guidance]] and [[Text-to-Image Pipelines]]), and decode the resulting latent by finding its nearest concept in a small shared space (the exact idea from [[Any-to-Any Generative Models]]) — then check whether the decoded concept actually matches the prompt that was given.

## The pipeline

```text
1. Prompt: a concept name ("cat", "dog", or "bird")
2. Conditioning target: that concept's position in a toy 2D latent space
   (Text-to-Image Pipelines)
3. CFG-guided denoising: combine the unconditional score across all
   concepts with the conditional score toward the target, extrapolated
   past plain conditioning by a guidance scale
   (Classifier-Free Guidance)
4. Decode: find the nearest concept to the final latent position
   (Any-to-Any Generative Models)
```

## A worked walkthrough

Starting every prompt from the same neutral point `(0, 0)` and running 6 CFG-guided steps (guidance scale 3) toward each prompt's own target concept:

```text
prompt "cat":   target (-2, 2)    →   final latent (-1.970, 2.012)   →   decoded "cat"   (distance 0.033)
prompt "dog":   target (2, 2)     →   final latent (1.970, 2.012)    →   decoded "dog"   (distance 0.033)
prompt "bird":  target (0, -2.5)  →   final latent (0.000, -2.412)   →   decoded "bird"  (distance 0.088)
```

Every prompt decodes back to exactly the concept it named, each landing within a small fraction of a unit from its true target — confirming that conditioning, guidance and decoding, built and verified separately across this subject, genuinely compose into one working pipeline from a text prompt to a correctly recovered concept.

## Bench

```bench
id: ga-capstone-generator
title: One prompt, traced end to end
fallback: Pick a prompt and trace it through conditioning, guided denoising, and decoding back to a recovered concept.
```

**Try this**

1. Step through each of the three prompts and confirm each one decodes back to itself.
2. Compare the final distance-to-target across the three prompts.
3. Consider what a much larger distance would have suggested about the pipeline.

**What you should notice:** every stage's output here is exactly the same function, called with exactly the same code, as when each stage was introduced on its own earlier in this subject — nothing here is special-cased for this capstone.

## Where it appears in AI

* **This is, structurally, exactly what a real text-to-image or text-to-anything pipeline does**: encode a condition, run guided generation, and interpret the result — at a scale of millions of parameters and a far richer shared space than this toy example's three concepts.
* **It demonstrates this subject's central claim**: generation-time behavior (decoding, conditioning, guidance), modality-specific pipelines, and evaluation are each independently understandable pieces that combine into one system, not one monolithic mechanism.
* **From here, [[LLMs|training and scaling the models these mechanisms condition and guide]], grounding generation in retrieved documents, and building agents that call on generation as one tool among several are the next subjects' jobs** — this subject's job was generation-time behavior itself.

## Common pitfalls

* **Expecting a toy pipeline's exact distances to mean anything beyond this capstone.** The point is that every prompt recovered its own concept correctly, not the specific numeric distances, which depend on this toy setup's particular parameters (step size, guidance scale, step count).
* **Assuming a real generative pipeline differs structurally from this capstone.** It doesn't — far more dimensions, a far richer shared space, and trained (rather than fixed) conditioning are scale differences, not architectural ones.
* **Forgetting decoding depends on the shared space actually being meaningful.** This capstone's decode step works because the toy shared space was built so that each concept's position is distinct and well-separated — a poorly structured shared space would make decoding unreliable even with perfect conditioning and guidance.

## Quick check

<details><summary>1. What are the three stages this capstone traces a prompt through, in order?</summary>
Setting a conditioning target from the prompt, running classifier-free-guidance-steered denoising steps toward that target, and decoding the final latent position to the nearest concept in a shared space.
</details>

<details><summary>2. Why was the prompt "cat" specifically chosen as one of the worked example's three cases?</summary>
It's one of three concepts whose positions were fixed in the toy setup, letting the pipeline's result be checked directly against a known correct answer — the same verification approach used for every worked example in this subject.
</details>

<details><summary>3. What does this capstone's result demonstrate about the subject's topics as a whole?</summary>
That conditioning, guidance and cross-modal decoding — each verified independently earlier in this subject — genuinely compose into one working pipeline, taking a text prompt all the way to a correctly recovered concept.
</details>

## Key terms

* **Pipeline:** the ordered sequence of stages — conditioning, guided denoising, decoding — that turns a prompt into a generated, interpretable result.
* **End-to-end:** covering every stage from raw prompt to final decoded output, with no stage skipped or special-cased.
* **Recovered concept:** the concept a generated latent decodes to, checked against the concept originally named by the prompt.

## Related

[[Classifier-Free Guidance]] · [[Text-to-Image Pipelines]] · [[Any-to-Any Generative Models]]
