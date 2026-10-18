The basic retrieve-then-generate loop has limits: it trusts whatever came back from a single search, treats every document the same whether it's prose or a spreadsheet, and has no way to notice when retrieval itself failed. This district covers the patterns that address each of those gaps.

Topics on this stretch of the road:

* [[Re-Ranking Retrieved Results]]: a second, more careful pass over what a fast search already found.
* [[Self-RAG and Reflective Retrieval]]: a model that decides for itself whether it needs to retrieve, and whether what it retrieved was good enough.
* [[Corrective RAG]]: catching and recovering from a bad retrieval before it reaches generation.
* [[Graph-Based RAG]]: retrieving from a knowledge graph instead of, or alongside, a flat document collection.
* [[Retrieval over Structured Data]]: answering questions against tables and databases instead of prose.
* [[Multimodal RAG]]: retrieving images, audio or other non-text content alongside, or instead of, text.
