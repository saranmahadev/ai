Turning a chunk of text into a vector is already covered on the Math planet; this district is about the retrieval-specific engineering on top of that: which kind of model produces the vector, how to make it accurate for a narrow domain, and how to shrink it without losing what makes search work.

Topics on this stretch of the road:

* [[Bi-Encoders and Dense Embeddings]]: encoding queries and documents separately so they can be compared by a single vector each.
* [[Cross-Encoders and Re-Rankers]]: scoring a query and a document together, for accuracy a bi-encoder can't match.
* [[Domain-Adapting Embedding Models]]: fine-tuning a general-purpose embedding model for a specific collection.
* [[Multi-Vector and Late-Interaction Retrieval]]: representing a document as many vectors instead of one.
* [[Embedding Quantization for Retrieval]]: shrinking embeddings to fit a large index in memory.
