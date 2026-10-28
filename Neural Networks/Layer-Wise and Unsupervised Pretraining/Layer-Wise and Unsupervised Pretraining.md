Before 2012's deep networks could be trained end to end by backpropagation alone, researchers found a workaround: train one layer at a time, unsupervised, stacking Restricted Boltzmann Machines into a network that already had useful weights before a single labelled example was seen. This section covers that training trick, and the historical moment it created.

Topics in this section:

* [[Contrastive Divergence]]: a fast, approximate way to train a Restricted Boltzmann Machine.
* [[Deep Belief Networks]]: stacking RBMs, one layer at a time, into a deep network.
* [[Stacked Autoencoders Before End-to-End Training]]: the autoencoder's own version of the same layer-wise trick.
