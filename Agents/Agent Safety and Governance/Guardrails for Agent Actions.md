A text guardrail scores free-form output for risk and has to guess at intent from wording alone. An action guardrail doesn't have to guess — a proposed tool call has structured parameters, so checking whether it matches a high-risk pattern (a table name, a dollar amount, a destination account) can be exact instead of a probabilistic judgment call.

**You need:** [[Guardrails and Deployment-Time Safety Filters]], [[Tool Result Verification]].

## The question it answers

"How do you stop a specific proposed action before it runs, rather than filtering the text around it?" An **action guardrail** sits between an agent's decision and its execution, checking the proposed action's actual parameters against a policy — block anything matching a known high-risk pattern, let everything else through. Unlike the text classifier covered in [[Guardrails and Deployment-Time Safety Filters|the earlier, LLMs-planet guardrail]], which scores ambiguous free text on a continuous threshold, an action guardrail can often match exactly: a `DROP TABLE` statement or a `wire_transfer` call either matches a rule or it doesn't.

## Intuition

A bank's wire transfer system doesn't try to guess the customer's *intent* from how politely they phrased the request — it checks the actual transfer amount and destination against a fixed set of rules (amounts over a threshold need extra verification, transfers to new destinations get flagged) before the money moves. The check runs on the structured transaction, not on free-form reasoning about what the customer probably meant.

## Definition and notation

```text
without guardrail:  every proposed action executes
with guardrail:     action executes only if it matches no rule in the high-risk pattern set
```

## A worked example

Six proposed database and transfer actions, two of which match a high-risk pattern set (`DROP TABLE`, `wire_transfer`):

```text
SELECT * FROM users                      — not high-risk
UPDATE profile SET name='x'              — not high-risk
DROP TABLE orders                        — high-risk  ⛔
wire_transfer(5000, 'external_acct')     — high-risk  ⛔
search('refund policy')                  — not high-risk
send_email(summary)                      — not high-risk

without guardrail: 6 of 6 actions execute
with guardrail:     4 of 6 actions execute, 2 blocked
```

Without a guardrail, the destructive table drop and the outbound transfer run exactly like the four harmless actions around them — nothing distinguished them at execution time. With the guardrail in place, the same two actions are caught by matching their actual parameters against the rule set, with no ambiguity about whether they qualify.

## Bench

```bench
id: action-guardrail-block
title: Checking the action, not the explanation
fallback: Toggle an action-level guardrail and watch it block proposed actions matching a high-risk pattern.
```

**Try this**

1. Look at the ungated list and note all six actions execute, including the destructive ones.
2. Turn the guardrail on and watch the table drop and wire transfer get blocked.
3. Imagine an action phrased differently but with the same effect (say, a stored procedure that internally drops the table) — would this specific rule set still catch it?

**What you should notice:** the guardrail's reliability comes from checking the action's actual effect on structured data (a table name, a function call) rather than from understanding the agent's stated reasoning for taking it.

## Where it appears in AI

* **This directly extends [[Guardrails and Deployment-Time Safety Filters]]** from a continuous risk score on free text to an exact match on an action's structured parameters — the same deployment-time-filter idea, applied where it can be more precise.
* **[[Autonomy Levels and Human Oversight Tiers]]'s irreversible/reversible split is a natural rule set for an action guardrail to encode** — routing irreversible actions through extra checks is one concrete policy this mechanism can enforce automatically.
* **[[Prompt Injection in Agent Contexts]], next in this district, shows exactly why this matters**: an action guardrail still blocks a high-risk action even when the *instruction* asking for it came from somewhere the agent never should have trusted.

## Common pitfalls

* **Writing a rule set that only catches today's known high-risk patterns.** Like a text classifier, an action guardrail is only as good as its rule set — a new destructive action phrased differently from anything in the rules passes through unchecked.
* **Relying on an action guardrail alone, with no scope limits underneath it.** A guardrail is a second layer, not a replacement for the first one; [[Excessive Agency and Scope Limits]] removing an unneeded tool entirely is a stronger guarantee than hoping every risky call through it gets caught.
* **Assuming structured-parameter matching means zero false positives.** A rule like "block anything containing DROP TABLE" can also block a legitimate, reviewed migration script — exact matching removes ambiguity about whether a rule fired, not about whether the rule itself is well-calibrated.

## Quick check

<details><summary>1. Why can an action guardrail check with exact matching where a text guardrail needs a probabilistic score?</summary>
A proposed action has structured parameters (a table name, a function call, a dollar amount) that either match a rule or don't, unlike free-form text, which has no fixed structure to match against and has to be scored for how risky it sounds.
</details>

<details><summary>2. In the worked example, why do exactly 2 of the 6 actions get blocked?</summary>
Only the table-drop and the wire-transfer call match the high-risk pattern set used by the guardrail; the other four actions (a read query, a routine update, a search, and sending an email) don't match any rule in that set.
</details>

<details><summary>3. Why isn't an action guardrail alone a complete safety solution?</summary>
It only catches actions matching its existing rule set — a destructive action phrased in a way the rules don't anticipate passes through unchecked, which is why it's paired with scope limits that remove unneeded capabilities entirely rather than relying only on catching misuse after the fact.
</details>

## Key terms

* **Action guardrail:** a check that matches a proposed action's structured parameters against a policy before it executes.
* **High-risk pattern:** a rule identifying action parameters (a command, a table, an amount) that should be blocked or flagged.
* **Structured parameters:** the specific, checkable fields of a proposed action, as opposed to unstructured free text.

## Related

[[Guardrails and Deployment-Time Safety Filters]] · [[Excessive Agency and Scope Limits]] · [[Prompt Injection in Agent Contexts]]
