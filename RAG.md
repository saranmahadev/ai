A language model only knows what was baked into its weights during training — it can't read your company's internal wiki, last week's news, or a PDF you just uploaded. Retrieval-augmented generation (RAG) fixes that by searching a real collection of documents for relevant passages, and handing those passages to the model as context before it answers. This planet is about engineering that pipeline well: turning documents into searchable chunks, finding the right ones for a query, and getting a model to answer faithfully from what it's given.

**You need:** [[Embeddings and Similarity Search]], [[Long-Context Transformers]], [[Hallucination and Factuality]].

The road through RAG:

* [[Why Retrieval and Grounding]] — why a model's own weights aren't enough, and when retrieval is the right fix.
* [[Document Processing and Chunking]] — turning raw documents into retrievable pieces.
* [[Embeddings for Retrieval]] — the retrieval-specific layer on top of embeddings covered on Math: bi-encoders, cross-encoders, and adapting them to a domain.
* [[Vector Search and Indexing]] — finding the nearest chunks fast, at scale.
* [[Retrieval Strategies]] — sparse, dense, hybrid, and ways to improve what gets retrieved before it's ranked.
* [[Advanced RAG Patterns]] — re-ranking, self-correction, graphs, structured data and multiple modalities.
* [[Generation with Retrieved Context]] — turning retrieved passages into a grounded, attributable answer.
* [[Evaluating RAG Systems]] — measuring retrieval and generation quality separately and together.
* [[RAG in Practice]] — running a RAG system in production, ending in a capstone that traces one question from query to grounded answer.

From here the road leads on to [[Agents]].
