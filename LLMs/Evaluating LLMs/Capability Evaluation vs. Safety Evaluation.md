"Is this model good?" is really two separate questions wearing one trench coat: can it do the task, and will it behave safely while trying? A single alignment-training decision can push these two scores in opposite directions at once.

**You need:** [[LLM-as-Judge Evaluation]], [[Reinforcement Learning from Human Feedback (RLHF)]].

## The question it answers

"Can a model's capability and its safety be evaluated, and optimized, independently?" Not entirely — they're often linked through the same training decisions. **Capability evaluation** measures whether a model can perform a task well (solve problems, answer correctly, write competently). **Safety evaluation** measures whether it behaves appropriately — refusing genuinely harmful requests, avoiding unsafe outputs. Pushing alignment training harder in one direction (say, to improve safety refusals) can measurably reduce capability on ordinary tasks, and vice versa — the two scores aren't independent dials.

## Intuition

Teaching someone to be more cautious before answering any question at all — double-checking, hedging, sometimes declining to answer when genuinely unsure — makes them safer to rely on in borderline cases, but it can also make them slower and less willing to confidently tackle perfectly ordinary requests they'd have handled fine before. Dialing caution up or down doesn't just change one outcome; it shifts both how often they get things right *and* how often they refuse or hedge on things they didn't need to.

## Definition and notation

```text
capability(alignment_strength): tends to decrease as alignment
  training is pushed harder (more conservative, more refusals)

safety(alignment_strength): tends to increase as alignment
  training is pushed harder

→ the two scores move in roughly opposite directions as the same
  underlying knob (alignment training strength) is adjusted
```

## A worked example

Toy capability and safety scores across a range of alignment training strength:

```text
strength 0.00:  capability 0.850   safety 0.500
strength 0.25:  capability 0.813   safety 0.613
strength 0.50:  capability 0.775   safety 0.725
strength 0.75:  capability 0.738   safety 0.838
strength 1.00:  capability 0.700   safety 0.950
```

Pushing alignment strength from 0 to 1 raises safety by 0.45 (from 0.500 to 0.950) while lowering capability by 0.15 (from 0.850 to 0.700). Neither score moved independently of the other — the same training decision drove both changes simultaneously, in opposite directions.

## Bench

```bench
id: capability-safety-tradeoff
title: Two scores, one knob, opposite directions
fallback: Adjust alignment training strength and watch capability and safety scores move in opposite directions.
```

**Try this**

1. Set alignment strength to 0 and note both scores.
2. Raise it toward 1 and watch both move, in opposite directions.
3. Find a strength where you'd consider the trade-off acceptable, and justify why.

**What you should notice:** there's no single "right" point on this curve in the abstract — where to land depends entirely on how much the deployment context actually weighs capability against safety.

## Where it appears in AI

* **Production deployment decisions routinely involve explicitly choosing a point on exactly this kind of trade-off curve**, informed by what the model is actually being used for and what the real-world cost of each kind of failure is.
* **[[Reward Hacking and Sycophancy|a poorly calibrated safety signal]] can push this trade-off worse than necessary** — a model trained against an overly blunt safety metric might sacrifice more capability than the actual safety gain warrants.
* **Different deployments reasonably land in different places on this curve**: a coding assistant and a general-purpose consumer chatbot facing very different risk profiles might justify very different alignment strengths.

## Common pitfalls

* **Treating capability and safety scores as independently optimizable.** The worked example's own curves move together, in opposite directions, as a function of the same underlying training choice — improving one at this margin generally costs some of the other.
* **Assuming more alignment training is always better.** Past a point, the capability cost can outweigh the safety benefit for a given deployment's actual risk profile.
* **Reporting only one of the two scores.** A model's capability score alone says nothing about its safety behavior, and vice versa — both need reporting for an evaluation to be meaningful.

## Quick check

<details><summary>1. Why can't capability and safety generally be maximized independently in this setup?</summary>
Because both are driven by the same underlying training decision (alignment strength) — pushing that knob in one direction tends to move both scores, in opposite directions, rather than letting either be adjusted on its own.
</details>

<details><summary>2. In the worked example, what happened to capability and safety as alignment strength went from 0 to 1?</summary>
Capability dropped from 0.850 to 0.700, while safety rose from 0.500 to 0.950 — a genuine trade-off, not a free improvement in one without cost to the other.
</details>

<details><summary>3. Why might two different deployments reasonably choose different points on this trade-off curve?</summary>
Because the real-world cost of a capability failure versus a safety failure differs by context — a deployment where safety failures are especially costly might reasonably accept lower capability, and vice versa.
</details>

## Key terms

* **Capability evaluation:** measuring whether a model can perform a task well.
* **Safety evaluation:** measuring whether a model behaves appropriately, including refusing harmful requests.
* **Capability-safety trade-off:** the tendency for alignment training strength to move these two scores in opposite directions.

## Related

[[LLM-as-Judge Evaluation]] · [[Reinforcement Learning from Human Feedback (RLHF)]] · [[Adversarial and Jailbreak Evaluation]]
