[[Constrained and Structured Generation|a grammar mask]] guarantees generated arithmetic is syntactically valid — but valid syntax and a program that actually does what you want are two different guarantees entirely. This note covers the second one, and a method that can check it directly: generating candidates and testing whether they actually compute the right thing.

**You need:** [[Constrained and Structured Generation]].

## The question it answers

"How do you generate a program that doesn't just parse, but actually produces a desired result?" **Program synthesis** adds a layer on top of grammar-constrained generation: don't just mask out invalid syntax, also *run* each candidate and check whether it produces the target output. Unlike natural-language generation, code has an unusually sharp advantage here — it's directly executable, so "is this candidate correct?" can often be answered exactly, by running it, rather than only estimated.

## Intuition

Guessing a sentence that correctly describes a situation has no simple check beyond human judgment. Guessing a short arithmetic expression that evaluates to exactly 7, on the other hand, can be checked by literally running the expression and comparing the result — no judgment call required. Program synthesis leans hard into that asymmetry: search (or generate many candidates) and keep only the ones that pass an automatic, exact test.

## Definition and notation

```text
grammar-valid candidate programs: generated (or enumerated) under a syntax
  constraint, as in grammar-masked decoding

program synthesis: additionally keep only candidates c such that
  execute(c) == target
```

## A worked example

Every grammar-valid 5-token postfix (reverse Polish) arithmetic program built from digits `{1, 2, 3}` and operators `{+, -, *}`, in the fixed shape `a b op1 c op2`:

```text
total grammar-valid candidates:  3 × 3 × 3 × 3 × 3 = 243
candidates that evaluate to 7:   10

first few matches:
  1 3 + 3 +  =  7     (1+3=4, 4+3=7)
  2 2 + 3 +  =  7     (2+2=4, 4+3=7)
  2 2 * 3 +  =  7     (2*2=4, 4+3=7)
  2 3 + 2 +  =  7     (2+3=5, 5+2=7)
  2 3 * 1 +  =  7     (2*3=6, 6+1=7)
```

Every one of the 243 grammar-valid candidates is syntactically fine — none would be rejected by a grammar mask. But only 10 of them actually compute 7, and finding those 10 required *executing* each candidate and checking its output, something a grammar mask alone has no way to do.

## Bench

```bench
id: program-synthesis-search
title: Searching for a program that computes a target
fallback: Pick a target value and see how many grammar-valid toy programs, out of all the candidates searched, actually evaluate to it.
```

**Try this**

1. Try a few different target values and compare how many candidates match each one.
2. Notice some targets have many matching programs, while others may have very few.
3. Look at the matching programs' structures — some use `+`, some `*`, in different combinations.

**What you should notice:** every candidate searched is already guaranteed syntactically valid (that's what the grammar enforces); it's execution — not syntax checking — that separates a merely-valid program from a correct one.

## Where it appears in AI

* **Real code-generation models rely on exactly this execution-based check wherever it's available**: running generated code against test cases, compiling it, or checking a unit test, is a far sharper correctness signal than anything available for free-form natural language.
* **This worked example's brute-force search doesn't scale to real programs** — the number of grammar-valid candidates explodes combinatorially with program length, which is exactly why real program synthesis uses a learned model to propose promising candidates rather than enumerating every possibility.
* **[[Self-Consistency and Best-of-N Sampling|best-of-N sampling]] combines naturally with this idea**: generate many candidate programs from a model, execute each one, and keep whichever actually passes.

## Common pitfalls

* **Assuming grammar validity implies correctness.** The worked example's own numbers make this concrete: all 243 candidates are grammar-valid, but only 10 are correct — syntax and correctness are entirely separate properties.
* **Forgetting execution-based checking requires the program to be safely runnable.** Toy arithmetic is trivially safe to execute; real code-generation systems need sandboxing and resource limits before running arbitrary generated code.
* **Treating brute-force search as a real synthesis method.** It works here because the candidate space is tiny (243 programs); real-world code has far too large a space to enumerate, which is why practical synthesis guides the search with a learned model instead.

## Quick check

<details><summary>1. What's the key advantage code generation has over natural-language generation, for checking correctness?</summary>
Code is directly executable, so a candidate's correctness can often be checked exactly by running it and comparing the output to a target, rather than only estimated.
</details>

<details><summary>2. In the worked example, why were all 243 candidates "valid" but only 10 "correct"?</summary>
All 243 satisfied the grammar (correct token types in the correct positions); only 10 of them, when actually executed, happened to evaluate to the target value of 7.
</details>

<details><summary>3. Why doesn't brute-force enumeration scale to real program synthesis?</summary>
The number of grammar-valid candidates grows combinatorially with program length, making exhaustive enumeration infeasible for anything beyond very short toy programs — real systems need a model to propose likely candidates instead of checking every possibility.
</details>

## Key terms

* **Program synthesis:** generating a program that satisfies a target behavior, not just valid syntax.
* **Execution-based checking:** verifying a candidate's correctness by actually running it and comparing its output to a target.
* **Postfix (reverse Polish) notation:** writing an expression with operators after their operands, avoiding the need for parentheses.

## Related

[[Constrained and Structured Generation]] · [[Self-Consistency and Best-of-N Sampling]] · [[Building a Generative Product]]
