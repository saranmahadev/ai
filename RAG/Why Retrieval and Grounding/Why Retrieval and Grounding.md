A model's weights are a fixed snapshot of what it learned during training — they can't be updated with this morning's news or a document it's never seen. This section is about why that limitation matters, and when searching a document collection at answer-time is the right fix for it.

Topics in this section:

* [[Parametric vs. Non-Parametric Knowledge]]: two different places a model's "knowledge" can live.
* [[Hallucination and Knowledge Cutoff]]: what happens when a model is asked about something its weights don't cover.
* [[RAG vs. Fine-Tuning vs. Long-Context]]: three different fixes for the same underlying gap, and when each one actually fits.
* [[Anatomy of a RAG Pipeline]]: the stages every retrieval-augmented system has, end to end.
