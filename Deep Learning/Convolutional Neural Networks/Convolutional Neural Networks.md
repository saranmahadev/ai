A photograph has structure a plain feedforward network ignores: a cat's ear looks the same whether it is in the top-left or bottom-right corner. Convolutional networks build that structure in, and this section builds one up from a single filter to a full image classifier.

Topics in this section:

* [[The Convolution Operation]]: sliding a small filter over an image and what it computes.
* [[Filters, Feature Maps and Channels]]: what a filter learns to detect, and how many run side by side.
* [[Padding, Stride and Pooling]]: controlling the size of what comes out, and shrinking it on purpose.
* [[CNN Architectures: From LeNet to ResNet]]: how image networks grew from a handful of layers to over a hundred.
* [[Residual and Skip Connections]]: the trick that let networks keep getting deeper without getting worse.
* [[Receptive Fields and Depth]]: how much of the image a single output unit can "see".
* [[Object Detection and Segmentation]]: finding where things are, not just what they are.
* [[Image Classification End to End]]: putting the pieces together on a real dataset.
