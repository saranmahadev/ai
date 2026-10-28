Text, audio and time series are sequences: order matters, and length varies. This section covers the networks built to read one step at a time while keeping a memory of what came before.

Topics in this section:

* [[Recurrent Neural Networks]]: a network with a memory that feeds back into itself at every step.
* [[Backpropagation Through Time]]: training a recurrent network by unrolling it into a long chain.
* [[Long Short-Term Memory]]: gates that let a recurrent network choose what to remember and what to forget.
* [[Gated Recurrent Units]]: a simpler gated memory that often works almost as well.
* [[Bidirectional and Stacked RNNs]]: reading a sequence both ways, and stacking recurrent layers.
* [[Sequence-to-Sequence Models]]: turning one sequence into another of a different length.
* [[Word Embeddings]]: learning a vector for every word from the company it keeps.
