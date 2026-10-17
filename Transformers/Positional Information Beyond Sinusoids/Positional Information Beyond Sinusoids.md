The fixed sinusoidal encoding from [[Deep Learning]] was the original transformer's answer to "where is this token in the sequence?" — but it was never the only answer, and modern models mostly use something else. This district covers the alternatives and why they displaced it.

Topics on this stretch of the road:

* [[Learned Positional Embeddings]]: treating position like any other token, with a vector learned from data.
* [[Relative Position and RoPE]]: encoding how far apart two tokens are instead of their absolute positions.
* [[ALiBi and Length Extrapolation]]: biasing attention directly by distance, to generalize past the training sequence length.
