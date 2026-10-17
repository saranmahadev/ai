Greedy and beam search both chase the highest-probability sequence, which makes open-ended text feel flat and repetitive — real writing isn't always the most predictable continuation. This note covers the two controls used to inject (and limit) randomness into generation instead.

**You need:** [[Greedy and Beam Search Decoding]], [[Softmax and Cross-Entropy in Practice]].

## The question it answers

"How do you make a model's output vary, without letting it wander into nonsense?" **Sampling** draws the next token randomly according to the model's probability distribution instead of always taking the most likely one. Two controls shape that distribution before sampling: **temperature** rescales how sharp or flat it is, and **nucleus (top-p) sampling** truncates it to only the most probable tokens that together make up a probability mass of `p`, so a long tail of implausible tokens never gets a chance to be picked at all.

## Intuition

Think of the model's probabilities as a bag of weighted lottery balls — one ball per possible next token. Temperature is how hard you shake the bag before drawing: shake it hard (high temperature) and the odds flatten, so unlikely balls get a real chance; barely shake it (low temperature) and the heaviest ball is drawn almost every time. Nucleus sampling, separately, is removing every ball past a certain combined weight from the bag entirely before you draw — so even with a hard shake, you can never draw one of the longshot balls that individually barely register.

## Definition and notation

```text
temperature scaling:  P'(i) = softmax(logits / T)
  T < 1: sharper distribution (more like greedy as T → 0)
  T > 1: flatter distribution (more uniform as T grows)
  T = 1: the model's own distribution, unchanged

nucleus (top-p): sort tokens by probability, descending; keep the
  smallest prefix whose cumulative probability ≥ p; renormalize
  the kept probabilities to sum to 1; sample only from those
```

## A worked example

The toy logits `[A: 1.0, B: 1.3, C: 0.1, <eos>: −5]` from [[Greedy and Beam Search Decoding]], at temperature 1.0:

```text
T = 1.0:  P(A)=0.3625  P(B)=0.4893  P(C)=0.1474  P(eos)=0.0009
```

Lowering the temperature sharpens the distribution toward B, the already-favored token; raising it flattens the gap between A, B and C:

```text
T = 0.5:  P(A)=0.3347  P(B)=0.6099  P(C)=0.0553  P(eos)≈0.0000
T = 2.0:  P(A)=0.3510  P(B)=0.4078  P(C)=0.2238  P(eos)=0.0175
```

At T = 1.0, nucleus sampling with different thresholds keeps different numbers of tokens:

```text
top-p = 0.9:  keeps {B: 0.4897, A: 0.3628, C: 0.1475}  — 3 of 4 tokens (excludes <eos>)
top-p = 0.5:  keeps {B: 0.5744, A: 0.4256}             — just 2 of 4 tokens
```

Dropping `p` from 0.9 to 0.5 removes C from consideration entirely — not because its probability changed, but because the cumulative-probability cutoff got stricter.

## Bench

```bench
id: temp-topp-sampling
title: Temperature and top-p shape a distribution
fallback: Adjust temperature and top-p and watch which tokens remain eligible to be sampled, then draw a sample.
```

**Try this**

1. Lower the temperature toward 0.2 and watch the distribution collapse toward the single most likely token.
2. Raise it toward 2.0 and watch the bars flatten out.
3. At temperature 1.0, lower top-p until only one or two tokens remain eligible.
4. Sample repeatedly at a few different settings and see how often each token comes up.

**What you should notice:** temperature reshapes every bar's height, while top-p simply removes bars past a cutoff without changing the relative heights of the ones that remain — they're independent, composable controls.

## Where it appears in AI

* **Chat and creative-writing models sample by default**, almost always with both a temperature and a top-p (or top-k) setting exposed as API parameters — "temperature 0.7, top-p 0.9" is a common default pairing.
* **Temperature near 0 approximates greedy decoding**, which is why some APIs let you set temperature to 0 directly for deterministic output instead of true sampling.
* **[[Self-Consistency and Best-of-N Sampling|sampling multiple candidates and combining them]] depends on this randomness existing in the first place** — greedy decoding would produce the same candidate every time.

## Common pitfalls

* **Setting temperature very high expecting "more creative" output.** Past a point it just produces incoherent text, because even implausible tokens start getting picked regularly.
* **Confusing top-p with top-k.** Top-p's cutoff adapts to the shape of the distribution (keeping more tokens when probability is spread out, fewer when it's concentrated); top-k always keeps a fixed number of tokens regardless of how the probability is distributed.
* **Forgetting top-p renormalizes.** The kept tokens' probabilities are rescaled to sum to 1 before sampling — they aren't sampled using their original (smaller) probabilities.

## Quick check

<details><summary>1. What happens to a probability distribution as temperature approaches 0?</summary>
It sharpens toward the single highest-probability token, approaching greedy decoding in the limit.
</details>

<details><summary>2. In the worked example, why does top-p = 0.5 exclude token C while top-p = 0.9 includes it?</summary>
Because C's probability (0.1474) isn't needed to reach a cumulative probability of 0.5 once B and A are included (0.4893 + 0.3625 already exceeds 0.5), but it is needed to reach 0.9.
</details>

<details><summary>3. How do temperature and top-p differ in what they do to a distribution?</summary>
Temperature rescales every token's probability, changing how sharp or flat the whole distribution is; top-p removes the lowest-probability tail entirely, without changing the relative probabilities of the tokens it keeps.
</details>

## Key terms

* **Sampling:** drawing the next token randomly according to its probability, rather than always taking the most likely one.
* **Temperature:** a scaling factor applied to logits before softmax that sharpens (T<1) or flattens (T>1) the resulting distribution.
* **Nucleus (top-p) sampling:** restricting sampling to the smallest set of highest-probability tokens whose combined probability reaches a threshold `p`.

## Related

[[Greedy and Beam Search Decoding]] · [[Repetition and Length Control]] · [[Self-Consistency and Best-of-N Sampling]]
