Every technique in this section so far — longer chains, wider search, more refinement rounds, tool calls — shares something in common: none of them change the model's weights. They all spend more computation *after* training, at the moment of answering, in exchange for a better answer.

**You need:** [[Tree-of-Thought and Search-Based Reasoning]], [[Self-Consistency and Best-of-N Sampling]].

## The question it answers

"Can spending more compute at answer time substitute for a better-trained model?" Within real limits, yes. **Test-time compute scaling** is the general principle behind every technique in this section: holding the trained model fixed, spend more inference-time computation — more samples, deeper search, more verification — to reliably push accuracy higher. A **verifier-scored best-of-N** search makes this concrete: sample N candidate answers, score each with a verifier (a model or rule that estimates correctness, noisily but usefully correlated with the truth), and keep whichever scored highest.

## Intuition

Asked a hard trivia question once, you might get it wrong. Asked to write down fifteen independent attempts and then have someone who's pretty good (but not perfect) at spotting correct-looking answers pick the best one from your fifteen, your odds of the selected answer being right go up substantially — not because you got any smarter between attempt one and attempt fifteen, but because more tries, filtered by an imperfect-but-useful judge, reliably beats one try alone.

## Definition and notation

```text
verifier-scored best-of-N:
  for each of N samples: draw a candidate, correct with probability p
  score(candidate) = noisy signal correlated with correctness
  keep the candidate with the highest score

→ as N grows, the kept candidate's probability of being correct
  rises, approaching 1 as N → ∞ (bounded by how good the verifier is)
```

## A worked example

A toy setup where a single pass is correct 40% of the time, and a noisy verifier scores each sampled candidate (correlated with, but not perfectly revealing, correctness):

```text
N =  1:  accuracy 38.6%
N =  2:  accuracy 62.7%
N =  4:  accuracy 85.6%
N =  8:  accuracy 98.0%
N = 16:  accuracy 99.9%
N = 32:  accuracy 100.0%
```

Starting from a base accuracy of under 40%, spending enough inference-time compute (32 samples, each checked by the same imperfect verifier) drives accuracy to effectively 100% — with no change at all to the underlying model that generated each of those 32 candidates.

## Bench

```bench
id: test-time-compute
title: Spending more compute at answer time
fallback: Adjust how many samples a verifier-scored search draws at inference time and watch accuracy climb toward certainty.
```

**Try this**

1. Compare N=1's accuracy to the base model's raw single-pass rate.
2. Raise N and watch accuracy climb sharply at first.
3. Push N high and notice how close to 100% it gets.

**What you should notice:** the climb is steep at first and then flattens — much like [[Self-Consistency and Best-of-N Sampling|self-consistency's own accuracy curve]], because the same underlying statistical effect (more independent tries, filtered by an imperfect but useful signal) is doing the work in both cases.

## Where it appears in AI

* **Modern "reasoning" models (trained to generate much longer chains of thought before answering) are, in effect, spending far more test-time compute per query than earlier models did**, directly trading inference cost for accuracy on hard reasoning tasks.
* **It's a genuinely different lever from pretraining-time scaling** ([[Compute-Optimal Scaling (Chinchilla)|covered earlier in this subject]]): one invests compute once, during training, to make the model itself better; the other spends compute repeatedly, every time a question is asked, to get a better answer from the same model.
* **It composes with [[Tree-of-Thought and Search-Based Reasoning|search]] and [[Self-Refinement and Iterative Critique|refinement]]** — all three are different concrete mechanisms for spending more inference-time compute, and real systems often combine more than one.

## Common pitfalls

* **Assuming test-time compute scaling is free accuracy.** Every additional sample, search branch, or refinement round costs real inference compute (and, on most APIs, real money) — the accuracy gain has a direct, proportional cost.
* **Confusing it with training-time scaling.** Test-time compute makes a *fixed* model answer better by trying harder at answer time; it doesn't change the model's weights, unlike pretraining or fine-tuning.
* **Expecting it to overcome a verifier that's not actually correlated with correctness.** The worked example's gains depend on the verifier's score meaningfully tracking true correctness — a verifier no better than random would gain nothing from more samples.

## Quick check

<details><summary>1. What does test-time compute scaling trade for better accuracy?</summary>
More inference-time computation — more samples, deeper search, more refinement — spent after training, with the underlying model's weights held completely fixed.
</details>

<details><summary>2. In the worked example, what happened to accuracy as the number of verifier-scored samples grew from 1 to 32?</summary>
It rose from under 40% to effectively 100%, purely from drawing more independent samples and keeping whichever one the verifier scored highest.
</details>

<details><summary>3. How does test-time compute scaling differ from the pretraining-time scaling covered earlier in this subject?</summary>
Pretraining-time scaling spends compute once, during training, to produce a better model; test-time compute scaling spends compute repeatedly, every time a question is answered, using a model whose weights never change.
</details>

## Key terms

* **Test-time compute scaling:** trading more inference-time computation for higher accuracy, without changing the model's weights.
* **Verifier:** a model or rule that scores a candidate answer's likely correctness, used to select among several samples.
* **Verifier-scored best-of-N:** sampling N candidates and keeping the one the verifier scores highest.

## Related

[[Tree-of-Thought and Search-Based Reasoning]] · [[Self-Consistency and Best-of-N Sampling]] · [[Self-Refinement and Iterative Critique]]
