Every modern transformer is built from one mechanism — the scaled dot-product attention already derived on [[Math]] and [[Deep Learning]] — wrapped in the same handful of engineering decisions, over and over, at every scale from a research prototype to a frontier model. This planet is those decisions: how raw text becomes tokens, how attention becomes a full block with residuals, normalization and a feed-forward sublayer, how that block is arranged into encoder-only, decoder-only and encoder-decoder families, how it's made cheaper to run at scale, and where the same block shows up outside text entirely. It needs [[Deep Learning]] (the perceptron, backpropagation, attention, autoencoders) and [[Math]] (linear algebra, probability); where a topic here builds directly on one of those, it says so under **You need**. Nothing here re-derives the attention formula itself — [[Attention as Dot Products]], [[Multi-Head Attention]] and [[Modern Hopfield Networks and Attention]] already cover it from three different angles.

Each topic asks one question, explains it in plain language with a small worked example, lets you experiment in a **bench**, and ends with where the idea shows up in practice.

## The road

1. [[Tokenization]]: how raw text becomes the discrete symbols a transformer actually operates on.
2. [[Embeddings and Masking]]: turning tokens into vectors, and controlling what each position is allowed to see.
3. [[The Transformer Block]]: assembling attention into a full, repeatable layer — residuals, normalization and a feed-forward sublayer.
4. [[Positional Information Beyond Sinusoids]]: the alternatives to the fixed sinusoidal encoding that let modern models handle longer sequences.
5. [[Architectural Families]]: encoder-only, decoder-only and encoder-decoder as named patterns, and when to reach for each.
6. [[Efficient and Scaled Attention]]: the engineering variants that make attention cheaper to compute and serve.
7. [[Scaling the Block]]: routing, counting and splitting a transformer's cost across devices.
8. [[Transformers Beyond Text]]: the same block applied to images, graphs and more than one modality at once.
9. [[Transformers in Practice]]: serving a trained transformer efficiently, and a capstone that assembles one from the ground up.

From here the road leads on to [[Generative AI]], [[LLMs]], [[RAG]] and [[Agents]].
