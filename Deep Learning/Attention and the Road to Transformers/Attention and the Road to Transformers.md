[[Attention as Dot Products]] in Math already covers the core mechanism: compare a query with every key, weight by the result, and average the values. This section covers what you still need to turn that one idea into the architecture that replaced recurrence.

Topics in this section:

* [[Multi-Head Attention]]: running several attention mechanisms side by side, each free to focus on something different.
* [[Positional Encoding]]: telling a position-blind mechanism where each item sits in the sequence.
* [[Encoder-Decoder Architectures with Attention]]: letting a decoder attend back over an encoder's output.
* [[Why Attention Replaced Recurrence]]: what recurrent networks cost that attention does not.
