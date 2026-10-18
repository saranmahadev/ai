A RAG system can fail in two independent places — retrieval can find the wrong passages, or generation can answer badly even from the right ones — and a single end-to-end score can't tell you which. This district covers measuring each half separately, then together.

Topics on this stretch of the road:

* [[Retrieval Metrics: Precision, Recall, MRR and NDCG]]: scoring whether the right passages were found, and how high they ranked.
* [[Faithfulness and Answer Relevancy Metrics]]: scoring whether the generated answer actually uses, and actually answers, what was retrieved.
* [[End-to-End RAG Evaluation Frameworks]]: combining retrieval and generation scores into one evaluation pipeline.
* [[Common RAG Failure Modes]]: the handful of ways a RAG system typically breaks, and which stage each one points to.
* [[Synthetic Test-Set Generation for RAG]]: building an evaluation set without hand-writing every question.
* [[A-B and Online Evaluation of RAG]]: measuring a RAG system against real users instead of a fixed test set.
