Text is the classic home of naive Bayes. Represent a message as the words it contains, count how often each word appears in spam and in ordinary mail, and classify a new message by multiplying those word frequencies. The one trick that makes it work is **smoothing**: giving every word a small pseudo-count so that an unseen word cannot zero out the answer.

**You need:** [[Naive Bayes]] and [[Datasets, Features and Labels]].

## The question it answers

"How do I turn words into a decision?" Counting words per class gives each word a weight of evidence, and a message's verdict is the sum of its words' evidence.

## Intuition: a bag of words

Ignore word order and grammar: a message is just a bag of words. From the training messages, count how often each word occurs in each class. A word like "prize" that appears mostly in spam is strong evidence for spam; "meeting" is evidence for ham; "now" appearing equally in both tells you nothing. To classify, add up the evidence of the words present. In practice one adds **logarithms** of likelihood ratios instead of multiplying tiny probabilities, which avoids numerical underflow (see [[Overflow and Underflow]]).

## Definitions

```text
P(word | class) = (count of word in class + α) / (total words in class + α · vocabulary size)
score           = log prior odds + Σ over words  log [ P(word | spam) / P(word | ham) ]
α               smoothing: α = 1 is "Laplace smoothing"; α = 0 is raw frequencies
```

Without smoothing, a word seen only in ham has `P(word | spam) = 0`, so any message containing it is declared impossible for spam no matter what else it says.

## A worked example

A tiny training set: spam messages "free prize now" and "free money"; ham messages "meeting now" and "lunch meeting tomorrow". The vocabulary has 7 words; spam has 5 word occurrences (free ×2, prize, now, money) and ham has 5 (meeting ×2, now, lunch, tomorrow). Priors are equal.

Classify **"free now"** with `α = 1`:

```text
P(free | spam) = (2 + 1) / (5 + 7) = 0.250       P(free | ham) = (0 + 1) / 12 = 0.083     ratio 3
P(now  | spam) = (1 + 1) / 12      = 0.167       P(now  | ham) = (1 + 1) / 12 = 0.167     ratio 1
posterior odds = 1 × 3 × 1 = 3      →  P(spam) = 3 / 4 = 75%
```

Now classify **"free meeting"** without smoothing (`α = 0`): `P(free | ham) = 0` and `P(meeting | spam) = 0`, so both classes score `0`: the model cannot decide. With `α = 1`: spam is `(3/12) × (1/12)` and ham is `(1/12) × (3/12)`: identical, so `P(spam) = 50%`, an honest "no idea".

## Bench

```bench
id: word-counts
title: Classify a message from word counts
fallback: Type a message and see per-word counts from eight spam and eight ordinary training messages, the evidence each word contributes, and the verdict; a slider turns Laplace smoothing on and off.
```

**Try this**

1. Classify "free prize now" and "meeting tomorrow".
2. Try "free lunch tomorrow", which mixes both.
3. Type a word the corpus never saw with smoothing at 0, then at 1.
4. Watch how the evidence column changes as smoothing rises.

**What you should notice:** each word adds its own evidence, mixed messages land near 50%, and without smoothing a single unseen word breaks the calculation.

## Where it appears in AI

* **Spam filtering:** the original big success of naive Bayes.
* **Topic and sentiment labelling,** and any quick text baseline.
* **Modern relatives:** bag-of-words features feed logistic regression and SVMs too; language models replace counting with learned representations.

## Common pitfalls

* **No smoothing,** so one novel word ruins a prediction.
* **Rare words dominating** a small vocabulary.
* **Word order ignored:** "not good" looks like "good".
* **Assuming the probabilities are calibrated,** when they are typically overconfident.

## Quick check

<details><summary>1. Why add α to every count?</summary>
So a word unseen in a class does not force that class's probability to zero.
</details>

<details><summary>2. Why sum logs of ratios rather than multiply probabilities?</summary>
Products of many small numbers underflow; sums of logs are stable.
</details>

<details><summary>3. A word appears equally often in both classes. What is its evidence?</summary>
None: the ratio is 1 and its log is 0.
</details>

## Key terms

* **Bag of words:** representing text by word counts, ignoring order.
* **Laplace smoothing:** adding a pseudo-count α to every word count.
* **Vocabulary:** the set of distinct words.
* **Log-odds:** the log of the odds; evidence adds in this scale.

## Related

[[Naive Bayes]] · [[Bayes Theorem]] · [[Overflow and Underflow]] · [[Generative vs Discriminative Models]] · [[Logistic Regression as a Classifier]]
