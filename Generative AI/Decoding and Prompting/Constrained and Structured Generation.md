A model's raw next-token distribution has no idea your downstream code needs valid JSON, a specific grammar, or a well-formed arithmetic expression — it just assigns probabilities, and the most likely token at a given step can easily be an invalid one. This note covers forcing output into a required shape by editing the distribution itself, before a token is ever chosen.

**You need:** [[Greedy and Beam Search Decoding]].

## The question it answers

"How do you guarantee a model's output always matches a required structure?" Rather than generating freely and hoping the result parses, **constrained (or grammar-masked) decoding** tracks which tokens are valid at the current position according to some grammar or schema, and sets every other token's logit to `−∞` before choosing the next token. An invalid token can then never be selected — not because the model was discouraged from it, but because it was made literally impossible to pick.

## Intuition

It's the difference between asking someone to write only words from a given list and hoping they comply, versus physically removing every other page from the dictionary in front of them. Prompting a model to "please output valid JSON" is the first approach — it helps, but nothing stops an off-token from slipping through. Grammar masking is the second: whatever the model's draft impulse was, only the tokens that keep the output valid are ever actually available to pick.

## Definition and notation

```text
grammar mask at step t, given parser state s:
  allowed(s) = the set of tokens valid at state s
  logit'(i) = logit(i)   if i ∈ allowed(s)
  logit'(i) = −∞         otherwise
→ softmax(logit') assigns exactly 0 probability to every disallowed token
```

The parser state updates after each token is chosen, the same way a parser would track position while reading — so `allowed(s)` can change from one step to the next.

## A worked example

A toy model generating tokens from `{1, 2, 3, +, -, *, <eos>}`, meant to produce a simple arithmetic expression (a number, then alternating operators and numbers). Its *raw* logits happen to favor an operator as the very first token — which is invalid, since an expression can't start with `+`:

```text
unconstrained (raw argmax at every step):   + 1 + 1 +
```

That's not a valid expression: it starts with an operator and ends with one dangling. Applying a grammar mask — at the "need a number" state, only `{1, 2, 3}` are allowed; at the "need an operator or stop" state, only `{+, -, *, <eos>}` are allowed — changes what's even selectable at step one, and every step after:

```text
constrained (grammar-masked at every step):   1 + 1 + 1
```

Every step still picks whatever is highest-logit *among the allowed tokens* — the model's own preferences are respected as much as possible — but the result is guaranteed valid by construction, not by hoping the model cooperates.

## Bench

```bench
id: constrained-grammar
title: Masking out invalid tokens as you generate
fallback: Toggle a grammar mask on and off and watch whether the toy model's output is valid arithmetic.
```

**Try this**

1. With the mask off, check whether the raw output is valid arithmetic.
2. Turn the mask on and compare the new output.
3. Notice that the masked output still uses the model's own logit preferences — just restricted to what's currently valid.

**What you should notice:** the model's underlying preferences didn't change between the two runs — only which tokens it was *allowed* to express those preferences over.

## Where it appears in AI

* **"JSON mode" and function-calling features in production LLM APIs are grammar-constrained decoding** applied to a JSON-schema or function-signature grammar, guaranteeing parseable output.
* **[[Code Generation and Program Synthesis|code generation]] can use the same idea with a programming language's actual grammar**, so a model can never emit a syntactically invalid program.
* **It composes with sampling**: a grammar mask can be applied before temperature or top-p filtering, so the output is simultaneously varied *and* guaranteed valid.

## Common pitfalls

* **Assuming a good prompt is a substitute for a grammar mask.** A prompt can only make invalid output less likely; a mask makes it impossible — the difference matters whenever downstream code can't tolerate a parse failure.
* **Forgetting the mask can only enforce syntax, not meaning.** A grammar-masked arithmetic expression is guaranteed well-formed, but nothing stops it from being mathematically meaningless or wrong — syntax validity and correctness are different guarantees.
* **Not updating the allowed set as state changes.** A grammar mask has to track parser state and change what's allowed at every step — a single fixed allowed-token set for the whole generation wouldn't enforce much of anything.

## Quick check

<details><summary>1. How does grammar-masked decoding guarantee valid output, rather than just making valid output more likely?</summary>
It sets the logits of every invalid token to −∞ before sampling or taking the argmax, giving them exactly zero probability — an invalid token can never be selected, as opposed to merely being discouraged.
</details>

<details><summary>2. In the worked example, why did the unconstrained model produce an invalid expression?</summary>
Its raw logits simply favored an operator token as the most likely first token, and nothing stopped that invalid choice from being selected.
</details>

<details><summary>3. What does grammar masking guarantee, and what does it not guarantee?</summary>
It guarantees the output is syntactically valid according to the grammar; it does not guarantee the output is correct, meaningful, or the best possible completion.
</details>

## Key terms

* **Grammar (or schema) mask:** setting the logits of every token invalid at the current position to −∞ before sampling.
* **Parser state:** the tracked position within a grammar, used to determine which tokens are currently allowed.
* **Constrained decoding:** generation that guarantees structural validity by restricting which tokens can ever be chosen.

## Related

[[Greedy and Beam Search Decoding]] · [[Code Generation and Program Synthesis]] · [[Self-Consistency and Best-of-N Sampling]]
