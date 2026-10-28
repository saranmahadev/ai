Every architecture in this subject was built to exploit some specific structure in its data: convolution exploits a grid, recurrence and attention exploit a sequence, graph networks exploit arbitrary connections. **Choosing an architecture** starts from asking what structure your actual data has — not from picking whatever is currently most popular.

**You need:** [[CNN Architectures: From LeNet to ResNet]] and [[Recurrent Neural Networks]].

## The question it answers

"Given a new problem, how do I even start deciding which architecture family to reach for?" Look at what structure the input actually has — a grid, a sequence, a graph, or none of those — and match it to the family built to exploit exactly that structure.

## Intuition: match the tool to the shape of the problem

A hammer is excellent for nails and useless for screws — not because hammers are bad, but because the tool and the task's shape need to match. A photograph's pixels have a 2D grid structure a convolution is built to exploit; a sentence's words have a sequential, order-sensitive structure that recurrence or attention is built to exploit; a social network's connections have neither — they need a graph-based approach instead. Reaching for the architecture that matches your data's actual shape, rather than the most hyped architecture of the moment, is most of the decision.

## Definitions

```text
data structure                architecture family (usually the starting point)
grid (images, spectrograms)    convolutional networks
sequence (text, audio, time series)   recurrent networks, or attention-based (transformer) models
graph (social networks, molecules)    graph neural networks
tabular, no spatial/sequential structure   a plain feedforward network (or often, a classic ML model
                                            from Machine Learning, which can be a stronger
                                            and cheaper baseline)
```

Dataset size and compute budget matter too: a small dataset with a big, attention-heavy architecture risks overfitting badly (see [[Overfitting and Double Descent]]) long before it risks underfitting.

## A worked example

Three short scenarios and the architecture each one points toward:

```text
scenario 1: classify X-ray images into "pneumonia" or "healthy," 5,000 labelled images
  → grid-structured input, moderate dataset size
  → a CNN, likely starting from a pretrained backbone via transfer learning (see
    Transfer Learning and Fine-Tuning), rather than training a huge model from scratch

scenario 2: predict next week's sales from the past two years of daily sales figures
  → sequential input, single long series, no obvious grid or graph structure
  → a recurrent network or a small attention-based model; given one single series (not
    thousands of independent sequences), model size and overfitting risk should stay modest

scenario 3: a few hundred rows of a spreadsheet: age, income, location, purchase history
  → tabular, no spatial or sequential structure to exploit, small dataset
  → likely best served by a classic ML model (see Machine Learning) or a small
    plain feedforward network at most — a large deep architecture here would be overkill,
    with a high risk of overfitting a dataset this small
```

None of these decisions required knowing the very latest architecture — they followed directly from the shape of each problem's data.

## Bench

```bench
id: architecture-match
title: Matching a problem to an architecture family
fallback: A handful of short problem descriptions. Pick one, and see which data structure it has and which architecture family that structure points toward, with a brief reason.
```

**Try this**

1. Read through several scenarios and guess the architecture family before checking the answer.
2. Try a scenario that seems to combine two structures (say, images with captions) and think about what that might call for.
3. Consider a scenario with a tiny dataset and think about whether a large deep model is actually the right call at all.

**What you should notice:** the data's structure narrows the choice dramatically before any architecture-specific tuning even begins — most of the decision is "grid, sequence, graph, or none of those," not a fine-grained comparison between dozens of specific architectures.

## Where it appears in AI

* **Multimodal problems** (see [[Deep Learning Across Modalities]]) often combine architecture families — a CNN or vision transformer for images alongside an attention-based model for accompanying text, say.
* **Dataset size is as important a factor as data structure.** A small dataset often calls for transfer learning, a simpler model, or a classic ML approach, regardless of which architecture family would otherwise seem to fit.
* **Starting from a well-known, pretrained architecture** (rather than designing one from scratch) is the practical default for most real problems today, reserving custom design for cases that genuinely need it.

## Common pitfalls

* **Reaching for the most complex or recent architecture by default.** Matching the architecture to the data's actual structure (and the dataset's actual size) matters far more than novelty.
* **Ignoring compute and data constraints.** An architecture that would be ideal with unlimited data and compute may be a poor practical choice given what's actually available.
* **Treating this as a one-time decision.** Starting with a reasonable, simple baseline and only reaching for something more complex if the baseline clearly falls short is usually the more efficient path.

## Quick check

<details><summary>1. What is the first question to ask when choosing an architecture for a new problem?</summary>
What structure does the data actually have — a grid, a sequence, a graph, or none of those — since that determines which architecture family was built to exploit it.
</details>

<details><summary>2. Why might a plain feedforward network (or even a classic ML model) be the right choice for a small tabular dataset?</summary>
There is no spatial or sequential structure for a more specialised architecture to exploit, and a large deep model risks overfitting badly on a small dataset.
</details>

<details><summary>3. In the worked example, why does the X-ray scenario suggest transfer learning rather than training a CNN from scratch?</summary>
5,000 labelled images is a comparatively modest dataset for training a deep CNN from random initialization; starting from a pretrained backbone reuses already-learned general visual features.
</details>

## Key terms

* **Data structure (for architecture choice):** whether the input is grid-shaped, sequential, graph-shaped, or none of these.
* **Baseline:** a simple, well-understood model used as a starting comparison point before trying something more complex.
* **Multimodal:** a problem combining more than one kind of data structure (such as images and text together).

## Related

[[CNN Architectures: From LeNet to ResNet]] · [[Recurrent Neural Networks]] · [[Transfer Learning and Fine-Tuning]] · [[Deep Learning Across Modalities]]
