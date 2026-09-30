**Machine learning** is building a program by showing it examples instead of writing its rules. You choose a family of possible programs, define what "good" means with a **loss**, and let an algorithm search for the member of the family that does best on the examples, hoping it does well on new cases too.

**You need:** [[Rules vs Learning]], [[A Model Is a Function]] and [[Loss Functions]].

## The question it answers

"How can a computer do something nobody knows how to write down as rules?" Nobody can list the rules for recognising a handwritten 7, but there are millions of labelled examples of 7s. Learning turns that pile of examples into a working program.

## Intuition: a rule with knobs

Start with a rule that has adjustable numbers, such as "call an email spam if it has more than `t` spammy words". The number `t` is a knob. Writing the rule by hand means guessing `t`. Learning means trying many settings of the knob and keeping the one that makes the fewest mistakes on labelled emails. Real models have millions of knobs instead of one, but the recipe is the same.

## The four ingredients

```text
data          examples the model learns from
model         a family of functions with adjustable parameters   f(x; θ)
loss          a number saying how wrong the model is on the data
optimiser     a procedure that adjusts θ to make the loss smaller
```

Learning is the loop of predicting, measuring loss, and adjusting parameters (see [[The Learning Loop]]). What comes out is a **trained model**: the same family of functions with the best parameters found.

## A worked example

Twelve emails, counted by spammy words. Ham (not spam): 0, 1, 2, 2, 3, 4. Spam: 3, 5, 6, 7, 8, 9. The rule is "spam if count > t".

```text
t = 2.5:  ham right 4 of 6, spam right 6 of 6  → 10 of 12
t = 3.5:  ham right 5 of 6, spam right 5 of 6  → 10 of 12
t = 4.5:  ham right 6 of 6, spam right 5 of 6  → 11 of 12   ← best
t = 5.5:  ham right 6 of 6, spam right 4 of 6  → 10 of 12
```

Trying every candidate threshold and keeping the best is a tiny learning algorithm. It reaches 92% on these twelve emails. Nobody had to know that 4.5 was the right cut. The catch: 92% describes these twelve emails, not tomorrow's mail.

## Bench

```bench
id: rules-vs-learning
title: A hand-set rule versus a learned one
fallback: A threshold rule separates spam from normal messages by their count of spammy words; you set it by hand or let the bench learn it from the examples, and compare accuracy on the examples and on fresh messages.
```

**Try this**

1. Set the threshold by hand and note the accuracy on the examples.
2. Press **Learn the threshold** and compare.
3. Draw several fresh samples and watch the fresh-message accuracy move.
4. Compare the learned threshold's accuracy on examples with its accuracy on fresh messages.

**What you should notice:** the learned threshold beats most hand guesses on the examples, but fresh data usually scores a little lower, because the threshold was fitted to those particular examples.

## Where it appears in AI

* **Every trained model**: spam filters, recommenders, speech recognition and language models are all a model family plus data plus loss plus optimiser.
* **Hyperparameters and architecture** choose the family; training chooses the parameters.

## Common pitfalls

* **Thinking the computer "understands".** It finds parameters that reduce loss on the data.
* **Judging only on the training data.** Fresh data is the real test (see [[Train, Validation and Test Sets]]).
* **Bad data in, bad model out.** Learning copies patterns, including mistakes and biases in the examples.
* **Using ML when a simple rule works.** If the rules are known and stable, write them.

## Quick check

<details><summary>1. What are the four ingredients of machine learning?</summary>
Data, a model family with parameters, a loss, and an optimiser.
</details>

<details><summary>2. What is the "knob" in the spam example?</summary>
The threshold t, a parameter that learning sets.
</details>

<details><summary>3. Why is 92% on twelve emails not a promise for new emails?</summary>
The threshold was chosen to fit those twelve; new emails may fall differently.
</details>

## Key terms

* **Model:** a function with adjustable parameters.
* **Parameters:** the numbers learning sets, such as the threshold.
* **Loss:** a number measuring how wrong the model is.
* **Training:** searching for parameters that reduce the loss on the data.

## Related

[[Rules vs Learning]] · [[A Model Is a Function]] · [[Kinds of Learning]] · [[The Learning Loop]] · [[Generalization]]
