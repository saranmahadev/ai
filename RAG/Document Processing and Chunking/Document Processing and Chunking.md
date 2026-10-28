Before anything can be retrieved, raw documents — PDFs, web pages, spreadsheets, code — have to become a collection of individually retrievable pieces. How that split happens shapes everything downstream: too coarse and irrelevant text gets dragged along with what's useful; too fine and a passage loses the context it needs to make sense on its own.

Topics in this section:

* [[Parsing Documents for Retrieval]]: turning PDFs, HTML and other formats into clean, retrievable text.
* [[Fixed-Size and Recursive Chunking]]: the simplest ways to split a document into pieces.
* [[Semantic and Structure-Aware Chunking]]: splitting by meaning and document structure instead of a fixed character count.
* [[Chunk Overlap and Size Trade-offs]]: how chunk size and overlap change what gets found and what gets missed.
* [[Metadata Extraction and Enrichment]]: attaching the information a chunk can't carry in its own text.
* [[Handling Tables, Code and Structured Content]]: chunking strategies for content that isn't ordinary prose.
