Generative models fail in ways discriminative models mostly don't: confidently wrong output, reproduced training data, content nobody consented to be trained on, and output that's hard to tell from something real. This district covers those failure modes and the mitigations built around them.

Topics on this stretch of the road:

* [[Hallucination and Factuality]]: generated output that's fluent and confident but not true.
* [[Bias and Representational Harm in Generation]]: how training data imbalances surface as unfair or stereotyped generated content.
* [[Copyright and Training Data Provenance]]: what it means for a model to have learned from copyrighted or unconsented data.
* [[Memorization and Training Data Leakage]]: when a generative model reproduces specific training examples instead of generalizing.
* [[Watermarking and Synthetic Media Provenance]]: marking or detecting generated content so it can be told apart from the real thing.
* [[Content Safety and Red-Teaming]]: testing a generative model deliberately for harmful output before it ships.
