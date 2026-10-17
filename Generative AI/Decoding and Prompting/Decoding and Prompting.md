A trained language model outputs a probability distribution over the next token, not a finished sentence. This district covers the algorithms that turn those probabilities into actual output, and the input-side counterpart: writing the prompt that shapes what those probabilities will look like in the first place.

Topics on this stretch of the road:

* [[Greedy and Beam Search Decoding]]: always taking the single most likely continuation, or tracking several at once.
* [[Temperature and Nucleus (Top-p) Sampling]]: injecting controlled randomness instead of always taking the most likely token.
* [[Repetition and Length Control]]: stopping a model from looping on itself, and controlling how long its output runs.
* [[Constrained and Structured Generation]]: forcing output into a required shape, like valid JSON or a fixed grammar.
* [[Self-Consistency and Best-of-N Sampling]]: generating several candidate answers and picking (or combining) the best one.
* [[Prompting and In-Context Learning]]: steering a model's behavior entirely through the input, with no retraining.
* [[Few-Shot and Zero-Shot Generation]]: how many examples a prompt needs before a model performs a new task well.
