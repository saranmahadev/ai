A deep network has enough parameters to memorise its training set outright. This section covers the techniques that keep it from doing so — and the surprising modern finding that memorising is not always as fatal as classical theory predicts.

Topics in this section:

* [[Overfitting and Double Descent]]: why test error can fall, rise, then fall again as a network grows.
* [[Dropout]]: randomly silencing units during training so no single one is relied on.
* [[Batch Normalization]]: re-centring and re-scaling activations inside the network as it trains.
* [[Layer Normalization]]: normalizing across features instead of across a batch.
* [[Data Augmentation]]: manufacturing harmless variations of the training data so the network sees more of the input space.
* [[Early Stopping and Ensembling Deep Nets]]: stopping training on time, and combining several networks' answers.
