A weather tool call that returns no exception isn't the same as a weather tool call that actually returned a usable result. Five calls, none of which raised an error, still include one that silently came back empty and one that came back missing the temperature field entirely — only three of the five actually have everything the agent needs to act on.

**You need:** [[Prompt Chaining]].

## The question it answers

"Is it enough to check that a tool call didn't error out?" No — a tool call can complete successfully by every signal the calling code checks (no exception, a 200 status, a non-null return value) while still returning a result that's empty, incomplete, or simply wrong for what the agent actually needs next. **Result verification** is a separate check, applied after the call returns successfully, confirming the result itself has the specific fields or properties the next step depends on — the same validation-gate idea already covered for chained workflows, now applied to a tool's output.

## Intuition

A vending machine that takes your money and makes the correct sounds and lights isn't actually a successful purchase if nothing drops into the tray. The machine reported no error — it just didn't deliver what you paid for. Checking that the transaction "went through" and checking that you actually got a snack are two different checks, and only the second one tells you whether you can eat lunch.

## Definition and notation

```text
no exception:              the call returned without raising an error
passes verification(result, requiredFields) = every required field is actually present in the result
```

## A worked example

Five calls to a weather tool, none of which raised an exception, checked against the three fields the agent actually needs:

```text
required fields: temperature, conditions, location

call 1: temperature, conditions, location  → ✓ has every required field
call 2: temperature, conditions, location  → ✓ has every required field
call 3: conditions, location               → ✗ missing temperature
call 4: (empty result)                     → ✗ missing everything
call 5: temperature, conditions, location  → ✓ has every required field

calls with no exception:        5 of 5
calls that pass verification:   3 of 5
```

Every single call "succeeded" by the only signal a bare try/catch would check. Verification is the only thing that catches that two of those five successes were actually unusable.

## Bench

```bench
id: tool-result-verification
title: No exception isn't the same as a usable result
fallback: Compare five tool calls that all completed without an exception against which of them actually pass result verification.
```

**Try this**

1. Look at which calls are missing a required field despite none of them raising an exception.
2. Compare the "no exception" count against the "passes verification" count.
3. Imagine a sixth call that returns a plausible-looking but factually wrong temperature — would field-presence verification catch that?

**What you should notice:** this verification check only catches *structural* problems (a field that's missing), which is why call 4's empty result and call 3's missing field both get caught — but it says nothing about whether a present value is actually correct, which the Quick check below asks you to notice.

## Where it appears in AI

* **This is the same validation gate from [[Prompt Chaining]], applied to a tool's output instead of a chained step's output** — the mechanism (check the fields the next step actually depends on) doesn't change.
* **[[Handling Tool Errors and Retries]] only catches failures the call itself signals** — an exception, a timeout, an error code. Result verification catches the failures that the call reports as a success.
* **[[Designing Tools for Agent Reliability]], later in this section, is about reducing how often a tool can silently return an incomplete result in the first place** — verification is the safety net for whatever still gets through.

## Common pitfalls

* **Trusting "no exception" as proof the result is usable.** The worked example shows two of five calls pass this bar while still being missing data the next step actually needs.
* **Verifying only that fields are present, not that their values make sense.** A result with a temperature field present but holding an absurd value (say, 400 degrees) passes a presence check while still being wrong — presence and correctness are different things to verify.
* **Skipping verification because a tool "usually" works.** The whole value of verification is catching the cases that don't — the worked example's rate (2 of 5 silently incomplete) would be exactly the kind of failure a skipped check lets through unnoticed.

## Quick check

<details><summary>1. Why do calls 3 and 4 both "succeed" by a bare exception check, yet fail verification?</summary>
Neither call raised an exception — by that signal alone, both completed successfully. But call 3's result is missing the temperature field and call 4's result is entirely empty, so neither actually has what the required-fields check needs.
</details>

<details><summary>2. What's the difference between checking that a call didn't error and verifying its result?</summary>
Checking for an exception only tells you the call mechanism itself didn't break (no timeout, no crash); verifying the result tells you whether what came back actually has the specific content the next step depends on — a call can pass the first check while failing the second.
</details>

<details><summary>3. Does the field-presence check in the worked example catch a result with a present but factually wrong value?</summary>
No — it only checks whether required fields exist in the result, not whether their values are correct. A temperature field holding an implausible number would pass this specific check while still being wrong.
</details>

## Key terms

* **Result verification:** checking that a tool call's returned result actually has the content the next step needs, beyond just confirming the call didn't raise an error.
* **Silent failure:** a tool call that reports success while returning an incomplete or empty result.
* **Validation gate:** a check applied to an intermediate result before letting it proceed to the next step.

## Related

[[Prompt Chaining]] · [[Handling Tool Errors and Retries]] · [[Designing Tools for Agent Reliability]]
