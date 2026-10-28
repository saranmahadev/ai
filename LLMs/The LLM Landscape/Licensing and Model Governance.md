Publishing a model's weights doesn't by itself say what anyone is actually allowed to do with them. The license attached to a release is a separate, legally binding layer on top of open-weight access, and real licenses differ sharply in what they permit.

**You need:** [[Open-Weight vs. Closed Models]].

## The question it answers

"Given a model's weights are available, what does its license actually let someone do with it?" Three common license styles permit different, specific things: permissive licenses (Apache/MIT-style) allow commercial use, modification and redistribution with no usage cap; open-with-restrictions licenses allow the same three but add a usage-based restriction (such as a user-count cap above which a separate commercial agreement is required); fully closed terms permit commercial use of the service but forbid modifying or redistributing the model itself.

## Intuition

It's the difference between a recipe you're free to cook, tweak, and hand out to anyone, a recipe you can cook and tweak freely but need to call the restaurant first if you plan to open your own restaurant with it above a certain size, and a restaurant meal you can eat and pay for but can't take home the recipe for at all. All three let you eat; only some let you cook, change, or share it yourself.

## Definition and notation

```text
permissive (Apache/MIT-style):        commercial ✓  modify ✓  redistribute ✓  no usage cap ✓
open-with-restrictions (community):    commercial ✓  modify ✓  redistribute ✓  usage cap ✗
fully closed (API terms only):         commercial ✓  modify ✗  redistribute ✗  no usage cap ✓
```

## A worked example

Checking four specific permissions against each license style:

```text
permissive:               4 of 4 freedoms permitted (commercial, modify, redistribute, no cap)
open-with-restrictions:    3 of 4 (commercial, modify, redistribute — but usage-capped)
fully closed:              2 of 4 (commercial use of the API, no usage cap — but no modify, no redistribute)
```

No license style permits exactly zero or exactly all freedoms in the same way as another — a team that needs to redistribute a fine-tuned version of the model can rule out "fully closed" terms immediately, regardless of how capable that model is.

## Bench

```bench
id: license-permission-matrix
title: What a license actually permits
fallback: Switch between license styles and see which freedoms are actually permitted.
```

**Try this**

1. Switch between the three license styles and watch which checkmarks flip.
2. Find the one freedom that "fully closed" terms permit but "open-with-restrictions" doesn't restrict either (no usage cap).
3. Identify which license style a project needing to redistribute a modified model would have to rule out.

**What you should notice:** the three license styles aren't simply more-to-less permissive in a single ordering — "fully closed" and "open-with-restrictions" each permit a different specific freedom the other doesn't.

## Where it appears in AI

* **A model's license is independent of whether its weights are published** ([[Open-Weight vs. Closed Models]]) — open weights under a usage-capped license still restrict large-scale commercial redistribution.
* **A model card ([[Model Cards and Responsible Release]]) documents capabilities and limitations, not legal permissions** — license terms are a separate, usually separately published, document.
* **Deploying a fine-tuned or merged model (covered in the LLMs in Practice section of this subject) inherits the license terms of every model that went into it** — governance isn't limited to the first release.

## Common pitfalls

* **Assuming "open-weight" and "permissively licensed" mean the same thing.** A model can have openly published weights under a restrictive, usage-capped license, which is the "open-with-restrictions" row in the worked example.
* **Reading "commercial use permitted" as "any commercial use permitted at any scale."** The open-with-restrictions style explicitly caps usage before a separate agreement is required — commercial use and unrestricted commercial use are different permissions.
* **Treating license terms as fixed across versions of the same model family.** A provider can (and often does) change license terms between releases of successive model versions.

## Quick check

<details><summary>1. Which of the three license styles in the worked example permits redistribution with no usage cap at all?</summary>
Only the permissive (Apache/MIT-style) license permits both redistribution and no usage cap simultaneously.
</details>

<details><summary>2. A team wants to redistribute a modified version of a model to their own customers. Which license style rules this out entirely?</summary>
Fully closed (API terms only) — it permits commercial use of the service but forbids both modifying and redistributing the model itself.
</details>

<details><summary>3. Does having access to a model's weights guarantee the right to redistribute a fine-tuned version of it?</summary>
No — that depends entirely on the attached license; open-weight access and redistribution rights are governed separately, as the worked example's three license styles show.
</details>

## Key terms

* **Permissive license:** terms allowing commercial use, modification and redistribution with no usage-based restriction.
* **Usage cap:** a license condition requiring a separate commercial agreement once usage (such as user count) crosses a threshold.
* **Model governance:** the combination of license terms, access mode and release policy that determines who may do what with a model.

## Related

[[Open-Weight vs. Closed Models]] · [[Model Cards and Responsible Release]] · [[Responsible Scaling Policies and Frontier Safety]]
