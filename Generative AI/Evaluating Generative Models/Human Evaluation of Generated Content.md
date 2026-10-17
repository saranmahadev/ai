Every metric so far on this planet is automatic — computed from numbers, with no judgment involved. For plenty of generated content, that's exactly the problem: whether a joke is funny, a summary reads naturally, or an image "feels right" doesn't reduce cleanly to an automatic formula. This note covers collecting human judgment directly, and combining many small, noisy opinions into a reliable ranking.

**You need:** [[Distributional Metrics (FID, Inception Score and CLIP Score)]].

## The question it answers

"How do you turn a pile of individual human opinions into one reliable quality ranking?" Asking people to compare two outputs directly ("which is better, A or B?") is usually easier and more reliable than asking them to rate one output on an absolute scale. An **Elo rating system** (the same one used for chess rankings) takes a stream of such pairwise comparisons and updates a running score for each item: beating a highly-rated competitor earns more than beating a weak one, and the ratings converge toward a consistent ranking as more comparisons accumulate.

## Intuition

Asking "is this a 7 out of 10?" invites very different internal scales from different people — one person's 7 is another's 5. Asking "is A better than B?" sidesteps that entirely: it's a much easier, more consistent judgment to make, even for people with wildly different absolute standards. Elo takes a whole stream of these easy, relative judgments and reconstructs a global ranking from them, the same way chess ratings emerge from nothing but a long history of "who beat whom."

## Definition and notation

```text
expected win probability:  P(winner beats loser) = 1 / (1 + 10^((loser_rating − winner_rating)/400))

rating update after one comparison:
  winner_rating += k · (1 − expected)
  loser_rating  -= k · (1 − expected)
  (k controls how much one comparison can move a rating)
```

## A worked example

Three toy models A, B and C with true underlying quality 0.9, 0.6 and 0.3 respectively (used only to simulate which one "wins" a given comparison, with the better one winning more often but not always). Starting every model at rating 1000 and simulating 300 random pairwise comparisons:

```text
final ratings:  A: 1077.4   B: 1031.8   C: 890.9
ranking:        A > B > C
```

With no information given to the rating system except a stream of "which one won" outcomes, Elo recovered exactly the correct ranking (A better than B better than C) that matches the true underlying quality values used to simulate the comparisons — purely from relative, pairwise judgments, with no absolute score ever given to anything.

## Bench

```bench
id: human-eval-elo
title: Pairwise judgments converge to a ranking
fallback: Step through simulated pairwise comparisons and watch Elo ratings converge toward the correct quality ranking.
```

**Try this**

1. Step through a few rounds and watch the ratings start to separate.
2. Keep stepping and see whether the ranking stabilizes at A > B > C.
3. Reset and run again — the specific numbers will differ slightly (it's randomized), but the ranking should settle the same way.

**What you should notice:** with enough comparisons, the specific path each rating takes varies, but the final ranking reliably recovers the true underlying quality order, purely from relative outcomes.

## Where it appears in AI

* **LLM-arena-style leaderboards (where users vote on which of two anonymous model outputs is better) use exactly this Elo-based approach** to turn millions of pairwise human votes into a single ranked leaderboard.
* **Pairwise comparison is also the typical format for training preference-based models** (such as reward models for reinforcement learning from human feedback), for the same reason it's easier and more consistent to collect than absolute ratings.
* **It composes naturally with [[Self-Consistency and Best-of-N Sampling|automated judging]]**: an AI model asked "which of these two is better" can feed the exact same Elo machinery, a common (if imperfect) substitute when human judgment is too slow or expensive to collect at scale.

## Common pitfalls

* **Assuming a single comparison is reliable.** Any one pairwise judgment can go the "wrong" way just from noise (as the worked example's own probabilistic win model shows) — the ranking's reliability comes from aggregating many comparisons, not from any individual one.
* **Confusing Elo rating with an absolute quality score.** Ratings are only meaningful *relative to each other* within the same pool of compared items — an Elo rating of 1077 means nothing on its own, only in comparison to the other rated items.
* **Forgetting rating updates depend on the expected outcome.** Beating a much weaker opponent barely moves a rating; beating an opponent of similar or higher rating moves it more — flat, equal-sized updates regardless of opponent strength wouldn't converge the same way.

## Quick check

<details><summary>1. Why is pairwise comparison generally more reliable to collect than absolute ratings?</summary>
People tend to apply inconsistent personal scales when rating something in isolation (one person's 7 may be another's 5), but direct comparisons ("is A better than B?") are a simpler, more consistent judgment to make.
</details>

<details><summary>2. In the worked example, what information was the Elo system given, and what did it recover?</summary>
It was given only a stream of win/loss outcomes from pairwise comparisons, with no absolute quality scores provided at all, and it recovered a ranking that matched the true underlying quality order used to generate those comparisons.
</details>

<details><summary>3. Why does beating a stronger opponent increase a rating more than beating a weaker one?</summary>
The rating update is scaled by how unexpected the outcome was — beating an opponent you were "expected" to lose to moves your rating more than beating one you were already expected to beat.
</details>

## Key terms

* **Human evaluation:** collecting direct human judgments of generated content, used where automatic metrics fall short.
* **Pairwise comparison:** judging which of two outputs is better, rather than rating either one on an absolute scale.
* **Elo rating:** a system that converts a stream of pairwise win/loss outcomes into a consistent relative ranking.

## Related

[[Distributional Metrics (FID, Inception Score and CLIP Score)]] · [[Self-Consistency and Best-of-N Sampling]] · [[Content Safety and Red-Teaming]]
