Plain multi-head attention gets expensive fast: its cost grows with the square of sequence length, and its memory traffic during inference grows with every token generated. This district covers the engineering responses to both problems.

Topics on this stretch of the road:

* [[Multi-Query and Grouped-Query Attention]]: sharing key and value projections across heads to shrink memory traffic.
* [[KV-Caching for Autoregressive Inference]]: avoiding recomputation by storing keys and values as generation proceeds.
* [[Sparse and Local (Windowed) Attention]]: letting each token attend to only a limited neighbourhood.
* [[Linear Attention Approximations]]: reformulating attention to scale linearly instead of quadratically.
* [[IO-Aware Attention Computation]]: computing exact attention faster by minimizing slow memory traffic, not by approximating it.
