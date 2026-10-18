Before any alignment, reasoning, or instruction-following, an LLM starts as a plain next-token predictor, trained on a specific objective over a specific (and heavily engineered) pile of text. This district covers what goes into that first, largest training stage, and how much of a model's eventual behavior traces back to decisions made here.

Topics on this stretch of the road:

* [[Pretraining Corpora and Data Curation]]: what actually goes into the dataset a model sees first, and why that choice matters so much.
* [[Causal Language Modeling as a Pretraining Objective]]: the one task — predict the next token — that pretraining optimizes for.
* [[Data Deduplication and Quality Filtering]]: removing the content that would otherwise waste training compute or get memorized outright.
* [[Data Mixture and Domain Weighting]]: deciding how much of the training diet should come from each source.
* [[Multilingual Tokenization and Vocabulary Fairness]]: why the same tokenizer can treat different languages very differently.
* [[Continued Pretraining and Domain Adaptation]]: extending an already-trained model's knowledge without starting over.
* [[Synthetic Data for Pretraining]]: training on text a model generated, and what that can and can't substitute for.
