[[Relative Position and RoPE|RoPE]] builds relative position into attention through rotation. ALiBi (Attention with Linear Biases) takes an even more direct route to a related goal: skip rotating anything, and just subtract a penalty from each attention score, proportional to how far apart the two tokens are.

**You need:** [[Relative Position and RoPE]], [[Multi-Head Attention]].

## The question it answers

"Can a model trained only on short sequences still behave sensibly on much longer ones it never saw during training?" [[Learned Positional Embeddings|A learned positional table]] clearly cannot — there's no row for a position past its trained maximum. ALiBi's answer is to make distance penalization the *entire* mechanism: subtract a bias proportional to distance directly from each attention score, with a different penalty steepness (slope) per head. Because that formula is defined for any distance at all, it keeps producing sensible, well-behaved scores far past any sequence length seen during training — this is **length extrapolation**.

## Intuition

Instead of telling a token "you are at position 47," or rotating vectors to encode distance mathematically, ALiBi takes the plainest possible approach: just make attention scores naturally prefer nearby tokens, by subtracting more from the score the farther away a token is. Different attention heads use different penalty steepnesses — some heads have a steep penalty and effectively only look at very nearby tokens, while others have a shallow penalty and can still attend fairly broadly. Because "subtract a number proportional to distance" works identically whether the distance is 5 or 5,000, nothing about the mechanism breaks down on sequences far longer than training ever included.

## Definition and notation

```text
bias(query_pos, key_pos) = −slope × |query_pos − key_pos|
masked score = raw attention score + bias       (added before the softmax)

slopes for h heads: slope_i = 2^(−8(i+1)/h),  for i = 0, …, h−1
```

Each head gets its own fixed, never-trained slope, geometrically spaced from steep (heavily penalizing distance) to shallow (barely penalizing it).

## A worked example

Eight attention heads' slopes, following the standard geometric spacing:

```text
slopes: 0.500, 0.250, 0.125, 0.0625, 0.0313, 0.0156, 0.00781, 0.00391
```

The bias applied at a few distances, for the steepest head (slope 0.5) and the shallowest (slope 0.00391):

```text
distance   steep-head bias   shallow-head bias
   1            −0.500            −0.0039
   5            −2.500            −0.0195
  20           −10.000            −0.0781
 100           −50.000            −0.3906
```

The steep head's penalty grows harsh very quickly — by distance 20, it's already subtracting 10 points from the raw score, likely pushing that position's attention weight toward zero after the softmax. The shallow head's penalty barely registers even at distance 100. Crucially, this same formula computes a sensible bias at distance 2,000, or 20,000, exactly as easily as at distance 5 — there is no "table" to run out of, and no retraining needed to handle a longer sequence than the model ever saw.

## Bench

```bench
id: alibi-slopes
title: A distance penalty, different per head
fallback: Compare the ALiBi bias at a chosen distance across several attention heads with different slopes, and see how the penalty scales to very long distances.
```

**Try this**

1. Compare the bias at a short distance across heads with steep and shallow slopes.
2. Push the distance far beyond anything a model would realistically train on and confirm the bias still computes a sensible number.
3. Compare how quickly a steep-slope head's bias grows versus a shallow-slope head's.

**What you should notice:** the bias formula never runs out of range — unlike a learned positional table, there is no maximum distance beyond which it stops being defined.

## Where it appears in AI

* **It is specifically designed for length extrapolation** — running a trained model on sequences longer than anything in its training data, a real, practical need for long-document and long-context use cases.
* **It removes positional information from the vectors entirely**, unlike every other scheme on this planet — ALiBi adds nothing to queries, keys or embeddings; it only modifies the attention scores directly, alongside the masks from [[Attention Masks: Padding and Causal Masking]].
* **The different slopes across heads give the model a built-in range of "attention spans"** for free, without any slope ever being trained — a structural choice baked into the architecture rather than learned.

## Common pitfalls

* **Confusing ALiBi's bias with a mask.** A mask sets a score to negative infinity (fully blocking a position); ALiBi's bias is a graded, finite penalty that reduces — but doesn't necessarily eliminate — attention to a distant position.
* **Assuming the slopes are trained.** They are fixed by the geometric formula before training ever starts, the same for every model using this scheme at a given head count.
* **Expecting arbitrary extrapolation with zero cost.** Length extrapolation under ALiBi is dramatically better than under a fixed-table scheme, but extremely long distances still eventually push attention weights toward negligible, which is in fact the intended, graceful behaviour.

## Quick check

<details><summary>1. What does ALiBi add to a transformer's queries, keys or embeddings?</summary>
Nothing — ALiBi only modifies attention scores directly, by subtracting a distance-proportional bias before the softmax.
</details>

<details><summary>2. In the worked example, why did the steep-slope head's bias grow so much faster than the shallow-slope head's?</summary>
Because the bias is the slope multiplied by the distance, and a larger slope value scales that penalty up much more steeply as distance increases.
</details>

<details><summary>3. Why does ALiBi handle sequences longer than anything seen in training, unlike a learned positional table?</summary>
Its bias is a simple formula (slope times distance) defined for any distance at all, with no maximum length built in — unlike a learned table, which has no entry past its trained size.
</details>

## Key terms

* **Length extrapolation:** a model's ability to behave sensibly on sequences longer than anything seen during training.
* **Slope:** a fixed, per-head constant controlling how steeply ALiBi's bias penalizes distance.
* **Linear bias:** a penalty that grows proportionally with distance, subtracted directly from an attention score.

## Related

[[Relative Position and RoPE]] · [[Learned Positional Embeddings]] · [[Attention Masks: Padding and Causal Masking]]
