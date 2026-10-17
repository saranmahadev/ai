Two LLMs with similar benchmark scores can offer radically different things to the people using them, depending on whether the weights themselves are published or only an API sits in front of them. That one choice shapes what's actually possible to do with a model, independent of its capability.

**You need:** [[A History of LLM Families (GPT, BERT, T5, Llama)]].

## The question it answers

"What's the practical difference between an open-weight model and a closed, API-only one?" Open-weight release publishes the model's parameters, so anyone can download, inspect, modify and run it themselves. Closed release keeps the weights on the provider's infrastructure; access goes through an API that can be updated, rate-limited or withdrawn at any time.

## Intuition

It's the difference between buying a car and leasing a ride-sharing service. Buying the car means you can modify the engine, drive it with no internet connection, and know it'll drive the same way next year. The ride-sharing service needs no garage or mechanic, and the company keeps the fleet maintained and updated — but you can't open the hood, and the car you ride in next month might not be the one you rode in today.

## Definition and notation

```text
Open-weight:  weights published  → download, inspect, modify, run offline, version is permanent
Closed/API:   weights withheld   → call an endpoint, provider controls updates, version can change
```

Open-weight does not necessarily mean the training data, code or license are also open — see [[Licensing and Model Governance]] for what a license on top of open weights actually permits.

## A worked example

Six concrete capabilities, checked against each access mode:

```text
capability                                          open-weight   closed/API
run fully offline                                        ✓            ✗
inspect/modify the weights                                ✓            ✗
fine-tune locally, any method                             ✓            ✗
guaranteed version never changes under you                ✓            ✗
use without any infrastructure of your own                 ✗            ✓
get provider-managed safety updates automatically          ✗            ✓
```

Open-weight access unlocks 4 of these 6 capabilities; closed access unlocks the other 2. Neither mode is a strict superset of the other — they trade one real set of freedoms for a different real set of conveniences.

## Bench

```bench
id: open-vs-closed-access
title: Different things are actually possible
fallback: Toggle between open-weight and closed access and see which capabilities become possible.
```

**Try this**

1. Switch between open-weight and closed/API-only and watch which capabilities flip from possible to impossible.
2. Notice that the two lists don't overlap — nothing is "possible under both."
3. Think about which of the six capabilities would matter most for a project with no internet access at deployment time.

**What you should notice:** the two access modes aren't "more open = strictly better" — each unlocks a disjoint set of capabilities the other can't offer at all.

## Where it appears in AI

* **A provider's choice between open-weight and closed release shapes who can build on a model** — a startup needing offline deployment or full fine-tuning control can only use open-weight models, regardless of a closed model's capability.
* **[[Licensing and Model Governance]] adds a further layer on top of open-weight release**: publishing weights doesn't by itself guarantee commercial-use rights or redistribution rights.
* **[[Responsible Scaling Policies and Frontier Safety]] treats open-weight release of a highly capable model as a one-way decision** — once weights are public, no later safety fix can be pushed to every downloaded copy.

## Common pitfalls

* **Assuming "open-weight" means "open-source" in the traditional software sense.** Weights, training code, training data and license can each be open or closed independently.
* **Assuming one mode is simply better.** The worked example shows each mode enables capabilities the other cannot offer, not that one is a strict upgrade of the other.
* **Forgetting that closed-model behavior can change without the user's action.** A provider can update, deprecate or restrict an API-only model; an open-weight model you've downloaded cannot change under you.

## Quick check

<details><summary>1. Why can't a closed, API-only model guarantee the same version forever?</summary>
The provider controls the weights and can update or withdraw the model behind the API at any time; nothing stops them from changing what the endpoint returns.
</details>

<details><summary>2. Does open-weight release automatically mean a model's training data is also public?</summary>
No — open-weight release is specifically about publishing the model's parameters; the training data, code and license terms are separate decisions, covered under [[Licensing and Model Governance]].
</details>

<details><summary>3. Name one capability each access mode has that the other categorically lacks.</summary>
Open-weight: running fully offline (impossible with an API-only model). Closed/API: using the model with no infrastructure of your own (impossible without downloading and serving an open-weight model yourself).
</details>

## Key terms

* **Open-weight model:** a model whose trained parameters are published for anyone to download and run.
* **Closed model:** a model accessible only through a provider-controlled API, with the weights never released.
* **Version permanence:** the guarantee that a downloaded model's behavior will not change later, which only open-weight release provides.

## Related

[[A History of LLM Families (GPT, BERT, T5, Llama)]] · [[Licensing and Model Governance]] · [[Model Cards and Responsible Release]]
