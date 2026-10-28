Training a large network is an engineering problem as much as a mathematical one: it runs on specific hardware, for hours or weeks, and can silently fail in ways a small model never would. This section covers that engineering.

Topics in this section:

* [[Why GPUs and Accelerators]]: what makes this hardware so much faster for a neural network than a CPU.
* [[Mixed Precision Training]]: computing in lower precision without losing the training signal.
* [[Distributed and Data-Parallel Training]]: splitting one training run across many devices.
* [[Hyperparameter Tuning for Deep Networks]]: searching a much larger, more expensive space of settings than a classic model's.
* [[Debugging a Training Run]]: reading loss curves and gradients to find out why training is failing.
* [[Checkpointing and Reproducibility]]: saving progress safely, and getting the same run twice.
