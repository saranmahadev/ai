[[Embeddings and Similarity Search]] described what an embedding is: a vector placing similar things near each other in space. **word2vec** and **GloVe** are the two classic recipes for actually *learning* word embeddings — not hand-designed, but trained from nothing but which words tend to appear near which other words in ordinary text.

**You need:** [[Embeddings and Similarity Search]] and [[Sequence-to-Sequence Models]].

## The question it answers

"Embeddings put similar words near each other — but how does a model ever learn *which* words are similar, with no labels telling it so?" From context alone: train the model to predict a word's neighbours, and words that tend to share neighbours end up with similar vectors, purely as a side effect of getting good at that prediction task.

## Intuition: you are the company you keep

"Cat" and "dog" show up near words like "pet," "feed," and "walk" far more often than "car" and "truck" do — and "car" and "truck" show up near "drive" and "engine" far more often than "cat" and "dog" do. **Skip-gram** (word2vec's main variant) trains a model to predict a word's nearby context words directly from its own vector; words that need similar context predictions end up needing similar vectors, and the embedding geometry falls out of that requirement, not out of any hand-coded rule about meaning. **GloVe** reaches a similar destination by a different route, directly factoring a table of how often each pair of words co-occurs.

## Definitions

```text
skip-gram objective (schematically):
  for a center word c with embedding vector v_c, and every real nearby context word w:
     score(w | c) = v_c · v_w
     train v_c and every v_w to make P(w | c) = softmax(score(w | c)) large for true neighbours
```

In practice, computing a full softmax over an entire vocabulary (which can be millions of words) is far too slow, so word2vec uses **negative sampling**: instead of scoring every possible word, it scores the true context word against just a handful of randomly sampled "negative" words, and only needs the true word to score higher than those few.

## A worked example

Four toy word vectors, already placed to reflect two semantic clusters:

```text
cat   = (1.0, 1.0)      dog   = (1.2, 0.8)
car   = (−1.0, 1.0)     truck = (−1.2, 0.9)
```

Scoring `dog`, `car` and `truck` as context-word candidates for the center word `cat` (dot product, then softmax):

```text
score(dog | cat)   = 1.0(1.2) + 1.0(0.8) =  2.000
score(car | cat)   = 1.0(−1.0) + 1.0(1.0) =  0.000
score(truck | cat) = 1.0(−1.2) + 1.0(0.9) = −0.300

softmax → P(dog | cat) = 0.8093,  P(car | cat) = 0.1095,  P(truck | cat) = 0.0811
```

`cat` and `dog`'s vectors happen to be close together (by construction here, but the point of training is to *make* this true for real semantically related words) and the skip-gram objective rewards exactly that: it predicts `dog` as `cat`'s most likely context word with over 80% of the probability mass.

## Bench

```bench
id: skipgram-score
title: Scoring a word's likely neighbours
fallback: Four adjustable word vectors in 2D. Pick a centre word and see the skip-gram score and probability for each other word as a context-word candidate, and watch how moving a vector changes its predicted neighbours.
```

**Try this**

1. Move `dog`'s vector further from `cat`'s and watch `P(dog | cat)` fall.
2. Move `car`'s vector closer to `cat`'s and watch it start to compete with `dog` for predicted-context probability.
3. Pick a different centre word and compare which other words it predicts most strongly.

**What you should notice:** the predicted probability for a candidate word depends entirely on the dot product between the two vectors — nothing else about the words' "meaning" is involved at all; the geometry alone drives the prediction.

## Where it appears in AI

* **word2vec and GloVe embeddings** were, for years, the standard starting point for almost any text-processing pipeline, often reused via [[Transfer Learning and Fine-Tuning]] rather than trained from scratch each time.
* **Modern transformer-based models** (see [[Attention and the Road to Transformers]]) learn embeddings as part of training the whole model end to end, rather than as a separate pretraining step — but the underlying idea, that context shapes a word's vector, carries over directly.
* **The classic "king − man + woman ≈ queen" analogy result** is a famous (if sometimes overstated) demonstration that these learned geometries capture more than pairwise similarity alone.

## Common pitfalls

* **Assuming embeddings capture a word's meaning directly, with nothing else going on.** They capture distributional patterns — what tends to appear near what — which strongly correlates with meaning but is not meaning itself.
* **Forgetting a word has only one embedding in this scheme**, regardless of which sense is meant ("bank" the river's edge and "bank" the financial institution share one vector) — a limitation that contextual embeddings from transformers later addressed.
* **Expecting negative sampling to change what the model learns, rather than just how fast it trains.** It is primarily a computational shortcut around scoring the entire vocabulary every step.

## Quick check

<details><summary>1. How does skip-gram decide a word's embedding, with no hand-labelled meaning given to it?</summary>
By training the vector to be good at predicting that word's actual nearby context words, using nothing but raw text — similar context requirements push similar words toward similar vectors.
</details>

<details><summary>2. Why does word2vec use negative sampling instead of a full softmax over the whole vocabulary?</summary>
A full softmax requires scoring every word in a (potentially huge) vocabulary at every training step; negative sampling scores only the true context word against a handful of random alternatives, which is far cheaper.
</details>

<details><summary>3. In the worked example, why does cat predict dog as a context word with much higher probability than truck?</summary>
Their vectors have a much larger dot product (2.0 for dog versus −0.3 for truck), because they were placed closer together in the embedding space.
</details>

## Key terms

* **word2vec:** a family of methods (including skip-gram) that learn word embeddings by predicting context words.
* **Negative sampling:** approximating the full softmax by scoring the true context word against a small set of random negative examples.
* **GloVe:** an alternative method learning embeddings directly from word co-occurrence statistics.

## Related

[[Embeddings and Similarity Search]] · [[Sequence-to-Sequence Models]] · [[Transfer Learning and Fine-Tuning]] · [[Attention and the Road to Transformers]]
