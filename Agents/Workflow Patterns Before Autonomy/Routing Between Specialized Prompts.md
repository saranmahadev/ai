One generic handler answering every kind of request is simpler to build than several specialists — and noticeably worse at any one of them. Routing classifies an incoming request first, then sends it to whichever specialized prompt is actually built for that category, instead of asking one prompt to be good at everything at once.

**You need:** [[Prompt Chaining]].

## The question it answers

"Is it better to build one prompt that handles everything, or several specialists plus a router?" Routing classifies each request into a category, then dispatches it to a prompt built and tuned specifically for that category. A billing question goes to a prompt that knows the billing system; a technical question goes to one that knows the product's failure modes. A single generic handler, by contrast, has to do reasonably well at every category at once, which in practice means doing noticeably worse at each one than a specialist would.

## Intuition

A hospital's general triage desk doesn't try to perform every patient's treatment itself — it identifies what kind of problem the patient has and sends them to the specialist actually trained for it. A single doctor trying to be equally expert at cardiology, dermatology and orthopedics all at once would be worse at each than any one specialist.

## Definition and notation

```text
routed accuracy  = Σ (requests of category c) × (specialist_c's accuracy) / total requests
generic accuracy = one flat accuracy, the same for every request regardless of category
```

## A worked example

Three incoming requests (two billing, one technical), compared under routing versus a single generic handler:

```text
billing specialist accuracy:     95%
technical specialist accuracy:   90%
generic handler accuracy:        55% (flat, regardless of category)

routed overall accuracy:   (95% + 95% + 90%) / 3 = 93.3%
generic overall accuracy:                            55.0%
```

Routing each request to the specialist that matches its category lifts overall accuracy from 55% to 93.3% — not because any individual specialist is dramatically better than the generic handler at everything, but because each specialist is genuinely good at exactly the category it actually receives.

## Bench

```bench
id: routing-specialists
title: The right specialist, or one handler for everything
fallback: Compare accuracy when requests are routed to the matching specialist against one generic handler taking everything.
```

**Try this**

1. Check the routed accuracy and note it's close to the weighted average of the two specialists' own accuracy.
2. Switch to the generic handler and see the large drop.
3. Imagine a request that doesn't clearly fit any existing specialist category — what should the router do with it?

**What you should notice:** routing's accuracy gain comes entirely from matching each request to the specialist actually built for its category — the mechanism is simple, but it depends on the classification step itself being accurate.

## Where it appears in AI

* **Routing depends on an accurate classification step**, the same task-classification problem that shows up throughout this subject — a misrouted request gets the wrong specialist's accuracy, not the one it should have received.
* **[[Supervisor-Orchestrator Patterns|Supervisor/Orchestrator Patterns]] is the multi-agent version of the same idea**: instead of routing to a specialized *prompt*, a supervisor routes to a specialized *agent*.
* **[[Tool Selection Among Many Candidates]] is a closely related problem one level down**: picking the right tool out of many is routing applied to actions instead of to whole requests.

## Common pitfalls

* **Building one generic handler for a domain with clearly distinct request categories.** The worked example shows this isn't a minor inefficiency — it's a nearly 40-percentage-point accuracy gap, for a mechanism (a classification step plus separate prompts) that isn't especially complex to add.
* **Assuming the router's own classification step is perfect.** Routing's entire benefit depends on correctly identifying each request's category — a router that frequently misclassifies requests pushes accuracy back toward the generic handler's level or worse.
* **Over-splitting into too many narrow specialist categories.** Each additional category needs its own prompt built and maintained, and makes the router's classification job harder — there's a real cost to adding specialists beyond what the request distribution actually calls for.

## Quick check

<details><summary>1. In the worked example, why is the routed accuracy (93.3%) closer to the specialists' own accuracy than to the generic handler's?</summary>
Routing sends each request to the specialist that matches its category, so each request gets scored at that specialist's own accuracy (95% or 90%) rather than at the flat 55% the generic handler would have given it.
</details>

<details><summary>2. What's the one additional step routing needs that a single generic handler doesn't?</summary>
A classification step that determines which category an incoming request belongs to, before deciding which specialized prompt to dispatch it to.
</details>

<details><summary>3. What happens to routing's accuracy advantage if the classification step itself is unreliable?</summary>
Misclassified requests get sent to the wrong specialist, whose accuracy for that mismatched category is likely no better (and could be worse) than the generic handler's flat accuracy — routing's benefit shrinks as classification accuracy drops.
</details>

## Key terms

* **Routing:** classifying an incoming request and dispatching it to a specialized prompt built for that category.
* **Specialist prompt:** a prompt built and tuned for one specific category of request.
* **Classification step:** the part of routing that determines which category a request belongs to.

## Related

[[Prompt Chaining]] · [[Supervisor-Orchestrator Patterns|Supervisor/Orchestrator Patterns]] · [[Tool Selection Among Many Candidates]]
