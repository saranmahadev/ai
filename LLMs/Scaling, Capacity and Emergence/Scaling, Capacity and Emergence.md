Make an LLM bigger, train it on more data, or give it more compute, and its capability doesn't grow in some simple, uniform way — it follows surprisingly predictable curves overall, punctuated by capabilities that seem to appear suddenly rather than gradually. This section covers both halves of that picture.

Topics in this section:

* [[Compute-Optimal Scaling (Chinchilla)]]: splitting a fixed compute budget between model size and data for the best result.
* [[Scaling Laws Beyond Chinchilla: Data-Constrained and Overtrained Regimes]]: what happens when the clean trade-off runs into a limited dataset or a model meant to run cheaply after training.
* [[Emergent Abilities and Capability Jumps]]: capabilities that seem absent below a scale threshold and present above it.
* [[Grokking and Delayed Generalization]]: a model that keeps training long after memorizing, and then generalizes all at once.
* [[The Bitter Lesson: Scale vs. Hand-Engineering]]: why general methods that scale have repeatedly beaten hand-crafted, domain-specific cleverness.
