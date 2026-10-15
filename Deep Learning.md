Deep learning is machine learning with many-layered neural networks: instead of hand-picking features, you stack simple units into layers and let training discover the representations itself. This planet covers how those networks are built and trained, the architectures that read images, sequences and graphs, how they learn to generate as well as recognise, and how to train, shrink and ship them for real. It needs [[Math]] (vectors, gradients, probability, optimization) and [[Machine Learning]] (the perceptron, loss functions, overfitting, generative vs discriminative models); where a topic here builds directly on one of those, it says so under **You need**.

Each topic asks one question, explains it in plain language with a small worked example, lets you experiment in a **bench**, and ends with where the idea shows up in practice.

## The road

1. [[Neural Network Foundations]]: from a single linear unit to a stack of layers, and why depth is powerful.
2. [[Training Deep Networks]]: the practical knobs — initialization, gradient pathologies, schedules and batch size — that decide whether a deep net trains at all.
3. [[Regularization and Generalization]]: keeping a deep net from memorising its training set.
4. [[Convolutional Neural Networks]]: networks built to read grids of pixels.
5. [[Sequence Models]]: networks built to read sequences, one step at a time.
6. [[Attention and the Road to Transformers]]: letting a model choose what to look at, and why that replaced recurrence.
7. [[Representation Learning]]: what a trained network actually learns, and how to reuse it.
8. [[Generative Deep Learning]]: networks that learn to generate rather than only recognise.
9. [[Graphs, Structure and Beyond Grids]]: architectures for data that is neither a grid nor a sequence.
10. [[Efficiency and Deployment]]: making a trained network smaller, faster and cheaper to run.
11. [[Training at Scale]]: the engineering of training on real hardware, not just a laptop.
12. [[Deep Learning in Practice]]: choosing an architecture, reading what it learned, where it breaks, and a capstone that ties the planet together.

From here the road leads on to [[Neural Networks]], [[Transformers]], [[Generative AI]], [[LLMs]], [[RAG]] and [[Agents]].
