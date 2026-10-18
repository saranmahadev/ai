A single LLM call's cost and latency already has its own math, covered on the LLMs planet. An agent loop doesn't just repeat that call n times at a flat price — the transcript each call reasons over grows every iteration, so later calls cost more than earlier ones, and the total runs well past "one call's cost times n."

**You need:** [[Cost and Latency of LLM APIs]], [[Production Agent Architecture]], [[Memory Compression and Forgetting]].

## The question it answers

"Why does an agent's total cost run past what a single call's price would suggest?" Each iteration of a loop appends the previous step's result to the growing transcript, so the input-token count — and therefore the per-call cost — climbs every iteration, the same growth [[Memory Compression and Forgetting|already covered]] for raw transcript size. A loop's total cost is the *sum* of a series of increasingly expensive calls, not a flat per-call price multiplied by the number of steps.

## Definition and notation

```text
input_tokens(step i) = base_input + (i − 1) × tokens_per_turn
cost(step i), latency(step i) = apiCostLatency(input_tokens(step i), output_tokens, pricing)
total = Σ cost(step i)  for i = 1..n
```

## A worked example

A 5-step agent loop, base input 500 tokens, 150 tokens added to the transcript per completed step, 120 output tokens per call, using the exact pricing from [[Cost and Latency of LLM APIs]] (price_in $0.003/1K, price_out $0.015/1K):

```text
step 1: 500 tokens in   → $0.00330
step 2: 650 tokens in   → $0.00375
step 3: 800 tokens in   → $0.00420
step 4: 950 tokens in   → $0.00465
step 5: 1100 tokens in  → $0.00510
total loop cost: $0.02100

flat estimate (step-1 cost × 5): $0.01650
ratio: 1.27× the flat estimate
```

A naive "just multiply one call's cost by the number of steps" estimate undercounts the real total by 27% here — and that gap only widens as the loop runs longer, since each additional step is strictly more expensive than the last.

## Bench

```bench
id: agent-loop-cost
title: One loop, growing transcript, compounding cost
fallback: Watch an agent loop's per-step cost climb as its transcript grows, and compare the running total to a flat per-call estimate.
```

**Try this**

1. Look at the per-step cost list and note that step 5 costs more than step 1.
2. Slide the loop length up to 10 and watch the ratio to the flat estimate grow further.
3. Imagine periodically compressing the transcript (the previous topic's mechanism) instead of letting it grow unbounded — would the ratio stay closer to 1.0?

**What you should notice:** the gap between the real total and a flat "cost × n" estimate isn't a rounding error — it's the direct, growing cost of a transcript that never shrinks, and it compounds the longer the loop runs.

## Where it appears in AI

* **This reuses [[Cost and Latency of LLM APIs]]'s exact cost model**, applied once per iteration instead of once per request.
* **[[Memory Compression and Forgetting]] is the direct fix for this growth**: capping or summarizing the transcript keeps each iteration's input tokens from climbing without bound, which keeps this cost curve from compounding.
* **[[Production Agent Architecture]]'s reason stage is exactly the call being priced here**, iteration by iteration.

## Common pitfalls

* **Estimating an agent loop's cost as "one call's price times the number of steps."** The worked example shows this undercounts the real total by over a quarter even at just 5 steps — and the gap only grows with longer loops.
* **Ignoring that cost and latency both grow from the same cause.** A longer transcript means both a higher per-call price *and* a longer prefill time each iteration — the same growth drives both numbers up together.
* **Letting a loop run indefinitely without ever compressing its transcript.** Left unchecked, this growth is unbounded; [[Memory Compression and Forgetting]]'s capped-budget approach exists specifically to stop it.

## Quick check

<details><summary>1. Why does step 5 cost more than step 1 in the worked example, even though both calls ask the model to do similarly complex reasoning?</summary>
Step 5's input includes the accumulated transcript from the four previous steps, so it has more input tokens than step 1's — and more input tokens means a higher per-call cost under the same per-token pricing.
</details>

<details><summary>2. Why does a flat "single-call cost × n steps" estimate undercount an agent loop's real total cost?</summary>
It assumes every step costs the same as the first one, but each later step's input has grown with the accumulated transcript, so every step after the first actually costs more than that flat estimate assumes.
</details>

<details><summary>3. What's the direct fix for an agent loop's compounding cost growth?</summary>
Periodically compressing or summarizing the transcript, as covered in [[Memory Compression and Forgetting]], which caps how large the input can grow instead of letting it climb every single iteration.
</details>

## Key terms

* **Compounding cost:** a loop's total cost growing faster than linearly because each iteration's own cost is higher than the last.
* **Growing transcript:** the accumulated history an agent's reasoning call includes with every new iteration.
* **Flat cost estimate:** the (inaccurate) assumption that every iteration of a loop costs the same as the first one.

## Related

[[Cost and Latency of LLM APIs]] · [[Memory Compression and Forgetting]] · [[Production Agent Architecture]]
