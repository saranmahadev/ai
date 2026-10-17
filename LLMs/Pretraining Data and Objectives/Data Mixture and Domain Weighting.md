Even after filtering, the raw amount of available text differs wildly by domain — there's vastly more web text than there is code or curated books. Training on raw proportions means training almost entirely on whichever domain happens to be most abundant, whether or not that's actually what you want.

**You need:** [[Data Deduplication and Quality Filtering]].

## The question it answers

"How much of each surviving data source should actually end up in training?" **Domain weighting** samples training tokens from each domain in different proportions than their raw availability — typically **upweighting** smaller, higher-value domains (code, curated text) relative to their tiny raw share, and **downweighting** the enormous but lower-value web domain relative to its overwhelming raw share. The training mixture is a deliberate choice, not simply "whatever's there."

## Intuition

If you had a library with 900 random magazines, 60 well-edited novels, and 40 textbooks, reading strictly in proportion to how many of each you own would mean spending the overwhelming majority of your time on magazines. Deciding instead to read, say, five pages of a textbook for every one page of a magazine — upweighting the textbooks relative to their actual share of the shelf — changes what you'd learn, without changing what's physically on the shelf at all.

## Definition and notation

```text
raw proportion of domain d = tokens(d) / Σ tokens(all domains)

weighted proportion of domain d = [tokens(d) × weight(d)] / Σ [tokens(d') × weight(d')]

sampled tokens for domain d, given a training budget B:
  B × weighted proportion(d)
```

## A worked example

Three domains with very different raw token counts — web vastly outweighs books and code:

```text
raw tokens:  web 900   books 60   code 40
raw proportions:  web 90.0%   books 6.0%   code 4.0%
```

Upweighting code by 5× and books by 3× (leaving web at its raw weight of 1×), then sampling a budget of 1,000 tokens:

```text
weighted proportions:  web 70.3%   books 14.1%   code 15.6%
sampled (of 1,000):    web 703     books 141     code 156
```

Code's share of the sampled training data nearly quadrupled — from 4.0% to 15.6% — purely from the weighting choice, with no change at all to how much code text actually exists in the raw corpus.

## Bench

```bench
id: domain-weighting
title: Upweighting a small domain
fallback: Adjust code's sampling weight and watch its share of a fixed training budget change, despite its raw token count staying fixed.
```

**Try this**

1. Set code's weight to 1× and note its small share, matching its raw proportion.
2. Raise the weight and watch its sampled share grow.
3. Compare the sampled count against code's small raw token count, which never changes.

**What you should notice:** the weighting changes only how often a domain is *sampled* relative to the others — it has no effect on how much raw material that domain actually contains.

## Where it appears in AI

* **Published training recipes for major LLMs routinely report heavily upweighting code, reference text, and other curated sources** relative to their small raw share of the overall crawl, specifically because downstream capability benefits from more exposure to those domains than their natural abundance would provide.
* **Domain weighting composes directly with [[Data Deduplication and Quality Filtering|filtering and deduplication]]**: filtering decides what's eligible to sample from at all, weighting decides how often each eligible domain is actually drawn from.
* **Getting the mixture wrong in either direction has a real, measurable training cost** — too much low-value text wastes capacity on content that was there in the first place because it was abundant, not because it was especially useful.

## Common pitfalls

* **Confusing "more raw tokens" with "more training influence."** The worked example's own numbers show a domain's final training share can be almost quadrupled by weighting alone, completely independent of its raw size.
* **Assuming equal weighting is neutral.** Equal weights (1× across domains) still produce a training mixture dominated by whichever domain has the most raw tokens — "equal" weighting is not the same as "equal influence."
* **Treating domain weights as fixed, universal constants.** The right weighting depends on what capabilities actually matter for the model being trained — there's no single correct mixture that applies to every use case.

## Quick check

<details><summary>1. What does domain weighting change, and what does it leave unchanged?</summary>
It changes how often each domain's tokens are sampled during training (its share of the training budget); it leaves the domain's actual raw token count in the corpus completely unchanged.
</details>

<details><summary>2. In the worked example, by roughly what factor did code's training share grow after upweighting?</summary>
From 4.0% to 15.6% — nearly a 4× increase — purely from applying a 5× sampling weight, with no change to code's small raw token count.
</details>

<details><summary>3. Why might a model trainer deliberately upweight a domain that's a small fraction of the raw corpus?</summary>
Because the value of training on a domain for downstream capability (like code ability) doesn't have to match how abundant that domain happens to be in a raw crawl — upweighting lets small but valuable domains get proportionally more training influence than their raw size alone would give them.
</details>

## Key terms

* **Domain weighting:** sampling training tokens from different domains in different proportions than their raw availability.
* **Upweighting:** increasing a domain's sampling frequency relative to its raw share of the corpus.
* **Training budget:** the fixed number of tokens a model will be trained on, allocated across domains by their weighted proportions.

## Related

[[Data Deduplication and Quality Filtering]] · [[Multilingual Tokenization and Vocabulary Fairness]] · [[Continued Pretraining and Domain Adaptation]]
