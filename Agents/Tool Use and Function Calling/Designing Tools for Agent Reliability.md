A tool with a free-text date field lets an agent write "03/14/2025," "March 14, 2025," or "14/03/2025" — three formats, at least two of them genuinely ambiguous about which number is the month. Three of five realistic attempts fail to parse. The same tool with a schema that only accepts ISO-8601 (`2025-03-14`) and rejects anything else before it ever reaches the tool's logic has nowhere for that ambiguity to enter at all — all five attempts parse.

**You need:** [[Tool Result Verification]].

## The question it answers

"How much of an agent's unreliability comes from the agent, and how much comes from how its tools are built?" A tool's interface — its parameter types, how strictly it validates input, what it does when something's wrong — directly shapes how often an agent calling it succeeds. A loosely specified tool (free-text fields, silent failures, no schema) leaves room for an agent to produce something technically valid-looking but wrong; a tightly specified one (strict types, enums instead of free text, validation that rejects malformed input immediately) removes much of that room before the agent's own reasoning is even a factor.

## Intuition

A form that asks "when?" with a blank text box invites a dozen different answers for the same date. A form with separate year, month, and day dropdowns makes an ambiguous answer structurally impossible — not because whoever's filling it out got smarter, but because the form itself no longer accepts anything else.

## Definition and notation

```text
free-text field:    accepts any string; parsing ambiguity is discovered only when the tool tries to use it
strict schema:      accepts only a defined format; anything else is rejected before the tool's logic runs
```

## A worked example

The same "book an event" tool's date parameter, given five realistic values under each design:

```text
free-text field:
  "03/14/2025"      → ✗ fails to parse (month or day? ambiguous)
  "2025-03-14"      → ✓ parses
  "March 14, 2025"  → ✗ fails to parse (not the expected format)
  "14/03/2025"      → ✗ fails to parse (day-first, misread as month-first)
  "2025-03-14"      → ✓ parses
  → 3 of 5 calls fail to parse

strict ISO-8601 schema (anything else rejected before this point):
  "2025-03-14" × 5  → ✓ all 5 parse
  → 0 of 5 calls fail to parse
```

Nothing about the agent changed between the two columns — the same reasoning produced every attempt. What changed is whether the tool's own interface left room for an ambiguous or malformed value to reach it in the first place.

## Bench

```bench
id: tool-schema-reliability
title: A field that accepts anything, or a schema that doesn't
fallback: Compare a free-text date field's parse failures against a strict ISO-8601 schema's.
```

**Try this**

1. Look at the free-text attempts and identify which ones are genuinely ambiguous rather than simply wrong.
2. Switch to the strict schema and see every attempt already forced into the one accepted format.
3. Imagine a strict schema with an unreasonably narrow format real inputs rarely match — what new failure mode would that introduce?

**What you should notice:** a strict schema doesn't make the agent reason better — it narrows what the agent is even allowed to produce, so the ambiguity that caused 3 of 5 free-text failures simply has nowhere left to occur.

## Where it appears in AI

* **This directly reduces the permanent-error rate from [[Handling Tool Errors and Retries]]** — a malformed-argument failure caused by an ambiguous field design is exactly the kind of permanent error no amount of retrying fixes; a stricter schema prevents it from happening at all.
* **[[Tool Result Verification]] is the safety net for whatever reliability problems a tool's design doesn't prevent** — the two are complementary, not alternatives: design reduces how often bad calls happen, verification catches the ones that still get through.
* **[[Code as a Tool-Calling Interface]], next in this district, is itself a tool-interface design choice** at a larger scale — the same reliability questions (how much room is left for ambiguity or error) apply there too.

## Common pitfalls

* **Blaming the agent for failures that are actually the tool's design.** The worked example's free-text failures happen with identical reasoning to the strict-schema successes — the difference is entirely in what the tool accepts.
* **Making a schema so strict it rejects legitimate variation.** A schema that's too narrow for the task's actual range of valid inputs trades one reliability problem (ambiguity) for another (false rejections of correct input).
* **Assuming better prompting alone fixes an unreliable tool.** Asking the agent more clearly to "use ISO-8601 format" can reduce but not eliminate the ambiguity that a schema which simply doesn't accept anything else removes by construction.

## Quick check

<details><summary>1. Why does "14/03/2025" fail to parse under the free-text design but not necessarily under a schema?</summary>
As free text, it's genuinely ambiguous whether 14 is meant as the day or an invalid month depending on the reader's assumed format; a strict schema sidesteps the ambiguity entirely by only accepting one defined format (ISO-8601), so a value like this is simply rejected before any ambiguous interpretation is attempted.
</details>

<details><summary>2. What's the key difference between fixing this with a stricter schema versus fixing it by retrying failed calls?</summary>
A stricter schema prevents the ambiguous or malformed value from being accepted in the first place, reducing how often the failure happens at all; retrying (from the previous topic) only helps with failures that have some chance of not recurring, and a parsing failure caused by a genuinely ambiguous format will recur identically on every retry.
</details>

<details><summary>3. What's the trade-off of making a tool's schema stricter?</summary>
A stricter schema reduces ambiguity-driven failures but risks rejecting inputs that are actually valid if the schema is narrower than the real range of acceptable values — reliability gained on one side can cost false rejections on the other if the schema is miscalibrated.
</details>

## Key terms

* **Tool interface design:** the choices (parameter types, validation strictness, error behavior) that shape how a tool can be called.
* **Free-text field:** a parameter that accepts any string, leaving format ambiguity undetected until the tool tries to use the value.
* **Strict schema:** a parameter definition that only accepts a defined format, rejecting anything else before the tool's own logic runs.

## Related

[[Tool Result Verification]] · [[Handling Tool Errors and Retries]] · [[Code as a Tool-Calling Interface]]
