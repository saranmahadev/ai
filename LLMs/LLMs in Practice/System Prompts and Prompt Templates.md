Every request to a deployed LLM usually carries more than the user's own words: a system prompt sets the assistant's persona and rules, and a template arranges the system prompt, conversation history and user turn into the exact format the model was trained to expect. None of this is visible to the user, but all of it is sent — and paid for — on every single request.

**You need:** [[Instruction Dataset Construction]].

## The question it answers

"What actually gets sent to the model besides the user's own message?" A system prompt is a block of instructions (persona, rules, output format) prepended to every conversation. A prompt template is the specific arrangement — special tokens, role labels, ordering — that turns a system prompt plus a conversation into the single sequence of tokens the model actually sees, matching the format it was trained (specifically, instruction-tuned, see [[Instruction Dataset Construction]]) on.

## Intuition

A customer-service phone line plays the same recorded greeting and menu before every single call, no matter how short the caller's actual question is. That recording costs the same few seconds whether the call lasts thirty seconds or thirty minutes — and if the company lengthens the recording, every call gets longer and more expensive, even though the caller's own words didn't change at all.

## Definition and notation

```text
per-request tokens = system_tokens + user_tokens + assistant_tokens
system's share      = (system_tokens × n_requests) / (per-request tokens × n_requests)
                     = system_tokens / per-request tokens
```

The system prompt's token count is fixed per request; it's paid for on every request regardless of how short the conversation is.

## A worked example

With a 30-token user turn and a 60-token assistant reply, across 1,000 requests:

```text
short system prompt (20 tokens):
  per request = 20 + 30 + 60 = 110 tokens
  total tokens = 110,000;  system prompt's share = 18.2%

long system prompt (300 tokens):
  per request = 300 + 30 + 60 = 390 tokens
  total tokens = 390,000;  system prompt's share = 76.9%
```

Growing the system prompt 15× (20 → 300 tokens) didn't just add a fixed cost — it took the system prompt from a minor fraction of every request's tokens to the large majority of them, even though the user's and assistant's own turns never changed.

## Bench

```bench
id: system-prompt-overhead
title: A fixed instruction, paid for on every request
fallback: Slide the system prompt's length and the number of requests and watch its share of total tokens change.
```

**Try this**

1. Start at a short system prompt and slide it up toward 300+ tokens; watch its share of total tokens climb past 50%.
2. Hold the system prompt fixed and slide the number of requests up; notice the share doesn't change — only the absolute total does.
3. Imagine two products with identical system prompts but very different average conversation lengths; which one is hit harder by a longer system prompt?

**What you should notice:** the system prompt's *share* of tokens depends only on its length relative to the conversation, not on how many requests are sent — but the *absolute* extra cost from a longer system prompt scales directly with request volume.

## Where it appears in AI

* **A model only follows a prompt template reliably if it was instruction-tuned on data formatted the same way ([[Instruction Dataset Construction]])** — an unexpected template at inference time is a common, silent cause of poor instruction-following.
* **A long, elaborate system prompt directly inflates per-request cost and latency ([[Cost and Latency of LLM APIs]])**, since every token in it is priced and processed like any other input token.
* **[[Structured Output and Tool-Calling APIs]] often relies on instructions placed in the system prompt** (schema definitions, tool descriptions) — another reason system prompts tend to grow over a product's lifetime.

## Common pitfalls

* **Treating the system prompt as "free" because the user never sees it.** It's invisible to the user, but it's still tokenized, transmitted, and billed exactly like visible text.
* **Growing the system prompt indefinitely as a product accumulates more rules and edge cases.** The worked example shows this isn't a one-time cost — it's multiplied by every request, forever, until the prompt is trimmed or restructured.
* **Assuming the template's exact formatting (special tokens, role order) doesn't matter as long as the content is right.** A model instruction-tuned on one template format can behave unpredictably when served a differently formatted prompt at inference time.

## Quick check

<details><summary>1. In the worked example, why does the system prompt's share jump from 18.2% to 76.9% when its length only grows 15×?</summary>
The user and assistant turns stay fixed (90 tokens total), so as the system prompt grows, it comes to dominate an ever-larger fraction of a total that's growing almost entirely because of it.
</details>

<details><summary>2. Does increasing the number of requests change the system prompt's *share* of total tokens?</summary>
No — the share only depends on the ratio between system-prompt length and conversation length; increasing request volume scales the absolute totals but not that ratio.
</details>

<details><summary>3. Why might an unexpected prompt template cause a model to follow instructions worse, even if the instructions' content is unchanged?</summary>
Because the model was instruction-tuned on a specific template format; presenting the same content in a different arrangement of roles and special tokens can fall outside what the model reliably learned to follow.
</details>

## Key terms

* **System prompt:** instructions prepended to every conversation, setting the assistant's persona, rules or output format.
* **Prompt template:** the specific arrangement of roles, turns and special tokens that converts a conversation into the token sequence the model expects.
* **Per-request overhead:** the token cost incurred repeatedly on every single request, regardless of how short the user's own message is.

## Related

[[Instruction Dataset Construction]] · [[Cost and Latency of LLM APIs]] · [[Structured Output and Tool-Calling APIs]]
