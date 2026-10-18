Every architectural choice this road has walked through — encoder-only, decoder-only, encoder-decoder, RoPE, gated feed-forward sublayers — shows up somewhere in a real, named model family. Tracing those choices through a handful of landmark models turns an abstract menu of options into an actual history.

**You need:** [[Architectural Families|Choosing an Architecture Family for a Task]], [[Compute-Optimal Scaling (Chinchilla)]].

## The question it answers

"How do today's major LLM families trace back to the architectural decisions covered earlier on this road?" A small number of landmark models mark the major turns: **BERT** (2018) established encoder-only masked-language-model pretraining; **GPT-2** (2019) showed decoder-only causal language modeling could scale into genuinely fluent, general-purpose generation; **T5** (2019) unified many NLP tasks under one encoder-decoder, text-to-text framing; **GPT-3** (2020) showed that scaling a decoder-only model further unlocked few-shot, in-context capabilities; **Llama 2** (2023) combined a decoder-only architecture with RoPE and other efficiency refinements, at a far smaller parameter count than GPT-3, trained on far more tokens.

## Intuition

Looking at a family tree of cars — the first mass-produced model, the first with a specific safety feature everyone later adopted, the first widely available at a dramatically lower price — tells a clearer story about how the industry got to today's vehicles than reading a list of abstract engineering principles ever could. Tracing a handful of actual LLMs, in order, through the specific architectural and scaling choices that defined each one, does the same for this road's more abstract coverage of tokenization, architecture and scaling.

## Definition and notation

```text
BERT-base (2018):    110M params,   encoder-only
GPT-2 (2019):         1.5B params,  decoder-only
T5-11B (2019):        11B params,   encoder-decoder
GPT-3 (2020):        175B params,   decoder-only
Llama 2 70B (2023):   70B params,   decoder-only
```

## A worked example

Parameter counts across these five landmark models, spanning five years:

```text
2018  BERT-base      1.10 × 10⁸
2019  GPT-2          1.50 × 10⁹
2019  T5-11B         1.10 × 10¹⁰
2020  GPT-3          1.75 × 10¹¹
2023  Llama 2 70B    7.00 × 10¹⁰
```

From BERT-base to GPT-3, parameter count grew by a factor of roughly 1,591× in just two years. Notably, Llama 2 70B (2023) is *smaller* than GPT-3 (2020) despite coming three years later — a direct, concrete instance of [[Compute-Optimal Scaling (Chinchilla)|the Chinchilla-era shift toward training smaller models on relatively more data]], rather than simply scaling parameter count ever upward.

## Bench

```bench
id: llm-family-timeline
title: From millions to hundreds of billions
fallback: Step through major LLM families in order and watch parameter count and architecture family evolve.
```

**Try this**

1. Step through from BERT-base to GPT-3 and watch parameter count climb.
2. Step to Llama 2 70B and notice it's smaller than GPT-3, not larger.
3. Compare each model's architecture family against what you've already covered on this road.

**What you should notice:** parameter count doesn't climb monotonically across this history — Llama 2's smaller size than GPT-3 despite being newer reflects a real, deliberate shift in scaling philosophy, not a step backward.

## Where it appears in AI

* **Each family in this timeline is covered architecturally on [[Architectural Families|Choosing an Architecture Family for a Task]]** on the Transformers planet — this note is specifically about the historical sequence, not re-deriving the architectures themselves.
* **The shift from GPT-3-era scaling to Llama-era scaling is a direct, real-world instance of [[Compute-Optimal Scaling (Chinchilla)|compute-optimal scaling]] changing how the field allocates training budgets.**
* **Later model families (not covered in this small sample) continue evolving along axes this road has covered**: mixture-of-experts routing, longer context windows, multimodal input — each an extension of mechanisms already derived earlier.

## Common pitfalls

* **Assuming parameter count always increases over time.** The worked example's own numbers show this isn't true — Llama 2 70B is smaller than the three-years-older GPT-3.
* **Treating this timeline as exhaustive.** It's a small, illustrative sample of landmark models, not a complete history of every significant LLM family.
* **Confusing a model family's *architecture* with its *training recipe*.** Two models can share an architecture family (decoder-only) while differing enormously in data, scale, and alignment training — the architecture alone doesn't determine the model's capabilities.

## Quick check

<details><summary>1. What architectural choice did BERT establish, and how does that differ from GPT-2's?</summary>
BERT used encoder-only masked-language-model pretraining; GPT-2 used decoder-only causal language modeling, predicting the next token rather than filling in masked ones.
</details>

<details><summary>2. In the worked example, why is Llama 2 70B smaller than GPT-3 despite being released three years later?</summary>
It reflects a deliberate shift toward compute-optimal (and often overtrained, cheaper-to-serve) scaling philosophy, training a smaller model on relatively more data rather than simply maximizing parameter count.
</details>

<details><summary>3. What did GPT-3 demonstrate that GPT-2 hadn't, at a smaller scale?</summary>
That scaling a decoder-only model further unlocked genuinely useful few-shot, in-context learning capabilities, without any additional training specific to those tasks.
</details>

## Key terms

* **Model family:** a lineage of models sharing a common architectural approach and naming convention.
* **Landmark model:** a model whose release marked a significant architectural or capability turning point.
* **Scaling philosophy:** the deliberate choices about how much to invest in parameter count versus training data for a given compute budget.

## Related

[[Architectural Families|Choosing an Architecture Family for a Task]] · [[Compute-Optimal Scaling (Chinchilla)]] · [[Open-Weight vs. Closed Models]]
