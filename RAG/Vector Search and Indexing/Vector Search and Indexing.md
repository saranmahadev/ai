Once a collection has a few million chunks, each with its own embedding, finding the handful nearest to a query vector stops being a problem you can solve by checking every single one. This section is about the data structures and systems that make that search fast at scale.

Topics in this section:

* [[Exact Nearest Neighbor Search]]: finding the true closest vectors, and why it stops being affordable.
* [[Approximate Nearest Neighbor Search with HNSW]]: searching a graph of vectors instead of the whole collection.
* [[Approximate Nearest Neighbor Search with IVF and Product Quantization]]: narrowing the search first, then compressing what's left.
* [[Vector Databases and Index Management]]: what a vector database actually manages beyond the index structure itself.
* [[Metadata Filtering and Hybrid Indexes]]: combining a vector search with exact filters on other fields.
