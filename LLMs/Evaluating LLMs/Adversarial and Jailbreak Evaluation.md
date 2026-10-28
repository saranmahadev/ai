[[Capability Evaluation vs. Safety Evaluation|safety evaluation]] on ordinary, well-behaved inputs only tells you how a model behaves when nobody's trying to break it. Adversarial evaluation asks the harder, more important question: how does it behave when someone specifically is?

**You need:** [[Capability Evaluation vs. Safety Evaluation]], [[Content Safety and Red-Teaming]].

## The question it answers

"How well do a model's safety guardrails hold up against someone actively trying to defeat them?" **Jailbreak evaluation** measures the **success rate** of specific adversarial strategies — a direct harmful request, a role-play framing that asks the model to "pretend," obfuscated or encoded phrasing, a long prompt priming the model with many examples of compliance — at getting a model to produce output its guardrails are supposed to block. Different strategies succeed at very different rates, and a model's safety can't be fairly judged by its response to direct requests alone.

## Intuition

A lock's resistance to a straightforward attempt at the front door says very little about how it holds up against someone specifically probing for weaknesses — testing the windows, trying a bump key, checking whether a side door was left unlocked. A guardrail's resistance to a plainly-stated harmful request is the lock's front door; jailbreak evaluation is testing every other way in that a motivated attacker would actually try.

## Definition and notation

```text
attack success rate(strategy) = fraction of adversarial attempts
  using that strategy that successfully bypass the model's guardrails

→ different strategies have very different success rates against
  the same model's same guardrails
```

## A worked example

Toy success rates for four attack strategies against the same model's guardrails:

```text
direct request:                    2%    (guardrails hold almost completely)
role-play framing:                35%    ("pretend you're a character who...")
multi-step encoding/obfuscation:   48%    (disguising the request's true content)
many-shot priming:                 55%    (many examples of compliance before the real ask)
```

A direct, plainly-stated harmful request is blocked almost every time — a model evaluated only against this strategy would look extremely safe. But more sophisticated strategies succeed at dramatically higher rates, more than half the time for the most effective one tested here, revealing guardrails that are far less robust than the direct-request number alone would suggest.

## Bench

```bench
id: jailbreak-attack-rates
title: Not every attack is equally effective
fallback: Compare success rates across several adversarial attack strategies against the same model's guardrails.
```

**Try this**

1. Look at the direct-request success rate.
2. Compare it to the most effective strategy tested.
3. Consider what a safety report based only on direct requests would miss.

**What you should notice:** evaluating safety using only the easiest-to-block attack strategy (a direct request) paints an overly optimistic picture — the real test is whether guardrails hold against the strategies most likely to actually succeed.

## Where it appears in AI

* **Red-teaming teams (internal or external) specifically develop and test strategies like these before a model's deployment**, precisely because direct-request testing alone would miss most real vulnerabilities.
* **New jailbreak strategies are continuously discovered as models and guardrails evolve** — adversarial evaluation is an ongoing process, not a one-time certification that stays valid forever.
* **[[Content Safety and Red-Teaming|the same obfuscation principle from earlier in Generative AI]] generalizes here**: a guardrail built around a narrow signal (blocking specific phrasing) is vulnerable to any input that evades that narrow signal while preserving the underlying harmful intent.

## Common pitfalls

* **Reporting safety performance using only direct-request testing.** The worked example shows this can dramatically overstate how robust a model's guardrails actually are.
* **Assuming a guardrail that resists one attack strategy resists all of them.** Different strategies exploit genuinely different weaknesses — resistance to one doesn't imply resistance to the others.
* **Treating adversarial evaluation as a one-time check.** New attack strategies are discovered continuously; a model evaluated as robust against today's known strategies isn't guaranteed to stay that way against tomorrow's.

## Quick check

<details><summary>1. Why is testing a model's guardrails only against direct requests insufficient for safety evaluation?</summary>
Because direct requests are typically the easiest for guardrails to block — more sophisticated strategies (role-play framing, obfuscation, priming) can succeed at much higher rates, which direct-request testing alone would never reveal.
</details>

<details><summary>2. In the worked example, which attack strategy was most effective, and by how much did it outperform a direct request?</summary>
Many-shot priming, at 55% success, compared to a direct request's 2% — more than 25 times as effective at bypassing the same guardrails.
</details>

<details><summary>3. Why is adversarial evaluation an ongoing process rather than a one-time check?</summary>
Because new jailbreak strategies are continuously discovered as models and their guardrails evolve — a model found robust against currently known strategies isn't guaranteed to remain robust against future ones.
</details>

## Key terms

* **Jailbreak:** a successful attempt to bypass a model's safety guardrails.
* **Attack success rate:** the fraction of adversarial attempts using a given strategy that successfully bypass guardrails.
* **Adversarial evaluation:** testing a model's safety specifically against strategies designed to defeat its guardrails, not just ordinary inputs.

## Related

[[Content Safety and Red-Teaming]] · [[Capability Evaluation vs. Safety Evaluation]] · [[Guardrails and Deployment-Time Safety Filters]]
