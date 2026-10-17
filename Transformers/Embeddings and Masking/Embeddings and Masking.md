A token id is just an index. This short district covers the two things that happen before attention ever runs: turning that index into a vector the rest of the network can use, and deciding which positions a given token is even allowed to attend to.

Topics on this stretch of the road:

* [[Token Embeddings and Embedding Scaling]]: looking up a vector for each token id, and the scaling factor applied to it.
* [[Weight Tying]]: sharing the same matrix between the input embedding and the output projection.
* [[Attention Masks: Padding and Causal Masking]]: controlling what each position can and can't see.
