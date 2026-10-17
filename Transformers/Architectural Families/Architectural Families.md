The same transformer block supports three very different overall shapes, depending on which direction information is allowed to flow. This district names those shapes, the famous models that popularized each one, and how to choose between them.

Topics on this stretch of the road:

* [[Encoder-Only Architectures]]: every position attends to every other position, built for understanding a fixed input.
* [[Decoder-Only Architectures]]: each position only attends to what came before it, built for generating one token at a time.
* [[Encoder-Decoder Architectures as a Pattern]]: a full encoder feeding a decoder through cross-attention.
* [[Choosing an Architecture Family for a Task]]: matching the shape of a problem to one of these three patterns.
