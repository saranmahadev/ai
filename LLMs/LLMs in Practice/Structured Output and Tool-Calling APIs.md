Code that calls an LLM usually needs the response in a specific shape — valid JSON with particular fields, or a specific function call with typed arguments — not free-flowing prose. Hoping the model's free-form text happens to parse correctly is a weaker guarantee than making invalid output structurally impossible.

**You need:** [[Constrained and Structured Generation]].

## The question it answers

"How does an application reliably get a model's output into a shape its code can actually use?" One approach prompts the model to produce JSON (or a tool call) in free-form generation and hopes it's well-formed; parsing then sometimes fails. The more reliable approach, already derived on the Generative AI planet as [[Constrained and Structured Generation|grammar-constrained decoding]], masks out every token that would violate the required schema at each decoding step, so a malformed result is never produced in the first place.

## Intuition

Asking someone to fill out a form freehand on blank paper, in the hope they follow the requested format, will occasionally get you a form you can't process. Handing them a form with labeled boxes — one box per field, the right size for each — makes an invalid submission structurally much harder to produce, because the shape itself constrains what they can write.

## Definition and notation

```text
free-form:        generate text  →  attempt to parse  →  sometimes fails
grammar-masked:    at each step, zero out every token not allowed by the schema  →  always parses
```

## A worked example

Simulating 1,000 free-form generation attempts at a 23% per-attempt malformed-output rate (seed 1):

```text
free-form:        765 of 1,000 attempts parse successfully → 76.5% success rate
grammar-masked:   1,000 of 1,000 (always valid by construction) → 100% success rate
```

A pipeline relying on free-form generation at this failure rate needs to handle roughly 1 in 4 responses failing to parse — retry logic, fallback prompts, or dropped requests. Grammar-masked decoding removes that failure mode entirely, at the cost of needing a schema defined up front.

## Bench

```bench
id: structured-output-success
title: Guaranteed valid, instead of hopefully valid
fallback: Slide the free-form malformed-output rate and compare it against grammar-masked decoding's guaranteed success.
```

**Try this**

1. Set the malformed-output rate low (under 5%) and notice free-form generation still occasionally fails.
2. Raise it toward 50% and watch free-form success collapse while grammar-masked stays at 100%.
3. Consider what it would cost a real pipeline to retry on every one of those free-form failures.

**What you should notice:** grammar-masked decoding's success rate doesn't depend on the slider at all — it's not measuring the same kind of risk, because the failure mode it removes can't occur by construction.

## Where it appears in AI

* **This reuses the exact masking mechanism derived in [[Constrained and Structured Generation|grammar-constrained decoding]] on the Generative AI planet** — a tool-calling API's JSON schema is just another grammar to mask against.
* **A system prompt ([[System Prompts and Prompt Templates]]) often carries the schema or tool definitions a model is meant to follow**, whether or not decoding is actually constrained to match it.
* **An application choosing between free-form and schema-constrained generation is itself part of [[Choosing a Model for a Task]]** — not every provider or model supports constrained decoding equally well.

## Common pitfalls

* **Assuming a well-written prompt alone guarantees well-formed output.** The worked example's free-form case is already being prompted to produce JSON; the gap between 76.5% and 100% is the residual risk even with a good prompt.
* **Treating a parse failure as rare enough to ignore.** At a realistic malformed rate, a high-volume pipeline will see parse failures constantly; the cost of handling them (retries, fallbacks) is real and ongoing.
* **Assuming grammar-masked decoding guarantees the *content* is correct, not just well-formed.** It guarantees the output matches the schema's shape — it says nothing about whether the values inside that shape are accurate.

## Quick check

<details><summary>1. In the worked example, what does the 76.5% free-form success rate actually measure?</summary>
The fraction of free-form generation attempts, at a given per-attempt malformed-output rate, that happen to parse successfully as valid structured output.
</details>

<details><summary>2. Why does grammar-masked decoding's success rate stay at 100% regardless of the malformed-output-rate slider?</summary>
Because grammar-masking removes the possibility of producing an invalid token at each decoding step entirely — there's no failure mode left for a "malformed rate" to apply to.
</details>

<details><summary>3. Does guaranteed-valid structure mean the tool-calling arguments a model produces are guaranteed to be correct?</summary>
No — grammar-constrained decoding only guarantees the output's *shape* matches the schema; whether the specific argument values are accurate is a separate question entirely.
</details>

## Key terms

* **Structured output:** a model's response in a specific, machine-parseable shape (JSON, a function call) rather than free-form prose.
* **Tool-calling API:** an interface where a model's output specifies a function name and typed arguments for the application to execute.
* **Grammar-constrained decoding:** masking decoding so that only schema-valid tokens can ever be produced, removing parse failures by construction.

## Related

[[Constrained and Structured Generation]] · [[System Prompts and Prompt Templates]] · [[Choosing a Model for a Task]]
