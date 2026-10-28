Gradient descent and backpropagation (see [[Gradient Descent]] and [[Backpropagation by Hand]] in Math) are the engine; this section covers the practical decisions that decide whether that engine actually trains a deep network — or stalls, explodes, or wanders for days.

Topics in this section:

* [[Weight Initialization]]: starting the weights so signal neither vanishes nor explodes before training begins.
* [[Vanishing and Exploding Gradients]]: why gradients shrink or blow up in deep networks, and what that does to training.
* [[Gradient Clipping]]: capping a gradient's size so one bad batch cannot wreck the weights.
* [[Learning Rate Schedules and Warmup]]: changing the step size over training instead of fixing it.
* [[Batch Size and Training Dynamics]]: how many examples per step changes the noise, speed and endpoint of training.
* [[Second-Order and Natural Gradient Ideas]]: what using curvature, not just slope, buys you, and why it is rarely used directly.
