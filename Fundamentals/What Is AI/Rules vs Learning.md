There are two ways to make a machine behave well: **write the rules by hand**, or **show it examples and let it work the rules out**. Hand-written rules are clear but brittle. Learned rules cope with messy real data but need examples, and are harder to explain.

**You need:** [[What Counts as AI]] and [[AI, ML, DL and Generative AI]].

## The question it answers

If you want a program to spot spam, why not just write down what spam looks like? The answer explains why most modern AI is built by learning from data.

## Intuition: a recipe versus an apprenticeship

* **Rules** are a recipe. A person writes each step: "if the email contains *prize*, mark it as spam."
* **Learning** is an apprenticeship. You show the machine thousands of emails already labelled spam or not, and it works out for itself which clues matter and how much.

Rules break in two ways. There are too many cases to write down, and the world changes: spammers switch words as soon as you block them. A learner can be retrained on fresh examples, while rules need a person to rewrite them.

## How a learned filter thinks

Take the clue "prize". Suppose that among 100 spam emails, 30 contain it, and among 100 normal emails, only 2 do. Then "prize" is 15 times more common in spam:

```text
30 / 100  ÷  2 / 100  =  15
```

A learner measures this for every word, and it combines all the clues into one score, the same idea as in [[Bayes Theorem]]. A word that is common in spam and rare in normal mail pushes the score towards spam. A word like "meeting" pushes it the other way. Nobody wrote "meeting is a good sign"; the data showed it.

## A worked example: two ways to catch "free"

Here are 10 test emails with true labels and one rule.

| | Spam emails | Normal emails |
| --- | --- | --- |
| Contain "free" | 4 | 1 |
| Do not | 1 | 4 |

The rule "flag anything with *free*" is right on 4 spam and 4 normal emails: 8 of 10, or **80%**. It also catches one innocent email ("free time this weekend") and misses one spam email that avoids the word. A learner would add more clues and weight them, and would find that "free" alone is weaker than "free" together with "claim".

## Bench

```bench
id: spam-duel
title: Spam filter duel: your rules vs a learned filter
fallback: A made-up set of emails. You tick words for your own spam rules, and a second filter learns word weights from labelled examples. The page shows each filter's accuracy on fresh emails, and what happens when spammers change their words.
```

**Try this**

1. Tick a few obvious spam words. How accurate are your rules? Then raise the threshold to 2 words. What happens to false alarms and to missed spam?
2. Slide the learned filter's training emails from 2 up to 400. How much data does it need before it beats you?
3. Switch on **Spammers change their words**. What happens to both filters?
4. Then switch on **retrains on new-wave emails**. What does each side need to recover?

**What you should notice:** learning is not magic. With too little data it guesses, and when the world shifts it fails just like the rules do. The difference is what it takes to fix it: fresh examples instead of a programmer.

## When rules still win

* **Few, clear cases:** tax thresholds, safety interlocks, "never allow a negative balance".
* **No data yet,** or data too costly to label.
* **You must explain every decision** and be able to audit each rule.

Many real systems mix both: learned models make the fuzzy judgement, and hand-written rules add hard limits around them.

## Where it appears in AI

This split runs through the whole field. Early AI leaned on hand-written knowledge; modern AI leans on learning from data. See [[Expert Systems and Their Limits]] for how the rule-writing approach hit its ceiling, and [[Machine Learning]] for how learning works.

## Common pitfalls

* **"Learned" does not mean "correct".** A learner is only as good as its examples.
* **More rules do not fix a moving target.** Each new rule adds interactions to manage.
* **A learner needs labels.** Someone has to say which emails were spam.
* **Do not treat it as either-or.** The strongest systems combine learning with rules.

## Quick check

<details><summary>1. Why do spammers make a fixed set of rules stop working?</summary>
They see which words are blocked and switch to others. The rules must be rewritten by hand, again and again.
</details>

<details><summary>2. A word appears in 30 of 100 spam emails and 2 of 100 normal emails. How much more common is it in spam?</summary>
15 times more common (30 ÷ 2), which makes it a strong clue for spam.
</details>

<details><summary>3. Name a situation where hand-written rules are the better choice.</summary>
When the cases are few and clear, or when each decision must be explained and audited. A safety limit such as "never allow a negative balance" is one.
</details>

## Related

[[What Counts as AI]] · [[AI, ML, DL and Generative AI]] · [[Expert Systems and Their Limits]] · [[Machine Learning]] · [[Bayes Theorem]]
