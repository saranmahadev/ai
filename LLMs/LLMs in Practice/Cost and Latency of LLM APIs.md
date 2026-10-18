A request to an LLM API has two separate costs that don't move together: how much it costs in money, and how long it takes to come back. Understanding what drives each one separately — not just "bigger request, more expensive" — is what lets a product actually control both.

**You need:** [[KV-Caching for Autoregressive Inference]].

## The question it answers

"What actually determines how much an LLM API request costs, and how long it takes?" Cost is priced per token, input and output, and simply adds up: more tokens in either direction means more money, roughly linearly. Latency is different: a request's input tokens are processed largely in parallel (quick), but output tokens are generated one at a time, each waiting on the last (slow) — so latency is dominated by how many tokens come *out*, almost independent of how many went in.

## Intuition

Reading a long letter takes a fixed, short glance per page — a human (or a model's prefill step) can skim input quickly because it's all there at once. Writing a reply, though, has to happen one word at a time, in order, each one waiting for the last. A very long letter to read barely slows down how fast you can start replying; a very long reply to write takes however long it takes, word by word.

## Definition and notation

```text
cost(request)    = (input_tokens × price_in + output_tokens × price_out) / 1000
latency(request) = fixed_overhead + input_tokens × prefill_per_token + output_tokens × decode_per_token
```

with `prefill_per_token ≪ decode_per_token` — input tokens are processed far faster per token than output tokens are generated.

## A worked example

Illustrative pricing (price_in $0.003/1K tokens, price_out $0.015/1K tokens) and timing (prefill 0.0005s/token, decode 0.02s/token, 0.1s fixed overhead):

```text
short input (50 in, 150 out):   cost = $0.00240   latency = 3.125s
long input  (4000 in, 150 out):  cost = $0.01425   latency = 5.100s
```

Multiplying the input length 80× (50 → 4000 tokens) multiplies cost nearly 6× — but latency only grows from 3.125s to 5.1s, a 1.6× increase. Cost tracks total tokens almost linearly; latency barely notices input length and is dominated by the 150 output tokens both requests share.

## Bench

```bench
id: api-cost-latency
title: Cost scales with tokens, latency with output length
fallback: Slide input and output token counts and watch cost and latency respond very differently.
```

**Try this**

1. Hold output tokens fixed and slide input tokens from 50 to 8000; watch cost climb steadily while latency barely moves.
2. Hold input tokens fixed and slide output tokens up instead; watch latency climb sharply this time.
3. Find a combination where cost and latency move by roughly the same proportion — notice how narrow that range is.

**What you should notice:** cost and latency are driven by different things (total tokens vs. output length specifically) — a request can be expensive but fast, or cheap but slow, depending on the input/output split.

## Where it appears in AI

* **Output-token latency being sequential is a direct consequence of decode-time attention ([[KV-Caching for Autoregressive Inference]])**: each new token's generation depends on every previous one, which is exactly why it can't be parallelized the way prefill can.
* **[[System Prompts and Prompt Templates]] adds to the input-token count on every single request** — mostly a cost lever (since input is cheap per-token but adds up at volume), much less a latency one.
* **Picking a smaller or larger model ([[Choosing a Model for a Task]]) changes both price-per-token and decode speed**, so the same cost/latency trade-off shows up again one level up, at the model-selection stage.

## Common pitfalls

* **Assuming a longer prompt makes a request noticeably slower.** The worked example shows an 80× input increase barely moves latency — the real latency lever is output length.
* **Assuming cost and latency always move together.** They're driven by different factors (total tokens vs. output length specifically), so optimizing one doesn't automatically optimize the other.
* **Ignoring the fixed overhead term.** Even a tiny request pays the fixed_overhead cost; for very short exchanges, that overhead can dominate the total latency.

## Quick check

<details><summary>1. In the worked example, why does multiplying input tokens 80× multiply cost by nearly 6× but latency by only 1.6×?</summary>
Cost adds input and output token costs roughly linearly, so an 80× bigger input term still moves the total noticeably; latency's input (prefill) term is tiny per token compared to its output (decode) term, which stayed fixed at 150 tokens in both cases, so the big input increase barely shows up in the total.
</details>

<details><summary>2. If a product wants to reduce latency specifically, which lever matters most: shortening the prompt, or shortening the expected reply?</summary>
Shortening the expected reply (output tokens) — the worked example shows output length is what latency is dominated by, while input length (prompt) barely affects it.
</details>

<details><summary>3. Why are input tokens processed faster per-token than output tokens are generated?</summary>
Input tokens can be processed largely in parallel during prefill, since the whole input is available at once; output tokens must be generated sequentially, each one depending on every token generated before it.
</details>

## Key terms

* **Prefill:** processing a request's input tokens, done largely in parallel and so relatively fast per token.
* **Decode:** generating a request's output tokens one at a time, each depending on all previous ones, so comparatively slow per token.
* **Per-token pricing:** charging separately, and usually at different rates, for input and output tokens.

## Related

[[KV-Caching for Autoregressive Inference]] · [[System Prompts and Prompt Templates]] · [[Choosing a Model for a Task]]
