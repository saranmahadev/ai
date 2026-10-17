[[Long-Context Transformers|solving the raw compute cost]] of attention is only half the problem. A model trained with positions only ever reaching up to some maximum also has to handle positions it never saw during training at all — and simply feeding it longer sequences doesn't automatically go well.

**You need:** [[Long-Context Transformers]], [[Relative Position and RoPE]].

## The question it answers

"How do you let a model handle sequences longer than whatever it was trained on?" [[Relative Position and RoPE|RoPE]] encodes position as a rotation whose angle grows with position — a model trained with positions up to some maximum `TRAINED_MAX` has only ever seen rotation angles up to a corresponding maximum. **Extrapolation** simply uses raw position indices beyond that range, producing rotation angles the model never encountered during training. **Position interpolation** instead rescales the longer sequence's positions down so they fit back within the range the model actually trained on — trading some precision in position for staying within familiar territory.

## Intuition

A musician trained on a piano with 88 keys has calibrated their sense of pitch across exactly that range. Hand them a hypothetical 176-key instrument and ask them to play the same piece using the raw, unfamiliar upper keys (extrapolation), and their trained intuition about pitch relationships may not transfer cleanly to a register they've never practiced in. Alternatively, have them play the same piece but with every note compressed down into the 88 keys they know well (interpolation) — they lose some of the instrument's true range, but every note they play lands somewhere they have real, practiced intuition about.

## Definition and notation

```text
extrapolation: use raw positions 0, 1, 2, ..., up to the new, longer
  sequence length — directly, with no rescaling

interpolation: rescale positions by TRAINED_MAX / NEW_LENGTH, so the
  longest position in the new sequence maps to TRAINED_MAX instead
  of exceeding it
```

## A worked example

A model trained with a maximum context of 2048 tokens, now handling a 4096-token document:

```text
trained max relative distance seen during training:  2047
document length: 4096

extrapolated max relative distance in this document:  4095   — exceeds the trained range
interpolated max relative distance (scale factor 0.5): 2047.5 — stays within the trained range
```

Looking directly at the rotation angle this produces, for one representative frequency:

```text
trained max angle (position 2047):       1.0235 radians
extrapolated max angle (position 4095):  2.0475 radians   — roughly double, never seen in training
interpolated max angle (position 2047.5): 1.0237 radians  — essentially matches the trained max
```

Extrapolation produces a rotation angle at the far end of the document that the model's training simply never covered. Interpolation, by rescaling, keeps the maximum angle almost exactly at the edge of what training did cover — at the cost of effectively compressing how far apart distant tokens "feel" to the model, relative to their true distance.

## Bench

```bench
id: context-extension-rope
title: Staying inside the angles the model actually learned
fallback: Adjust a document's length and compare the maximum rotation angle reached under extrapolation versus interpolation.
```

**Try this**

1. Set the document length close to the trained maximum and compare the three angles.
2. Increase the document length and watch the extrapolated angle pull further away from the trained range.
3. Confirm the interpolated angle stays close to the trained maximum regardless of document length.

**What you should notice:** interpolation's advantage isn't that it's somehow "more accurate" about true position — it's that it trades positional precision for staying within rotation angles the model has actual trained experience with.

## Where it appears in AI

* **Position interpolation (and related methods like NTK-aware scaling and YaRN) are widely used to extend an already-trained model's usable context length** without retraining it entirely from scratch on much longer sequences.
* **Simple extrapolation without any rescaling tends to degrade noticeably past a model's trained context length**, which is exactly why these rescaling techniques were developed in the first place.
* **Models can also be explicitly fine-tuned on longer sequences afterward**, which directly extends what counts as "trained range" rather than working around a fixed one.

## Common pitfalls

* **Assuming interpolation is free.** Compressing positions means two tokens that are genuinely far apart can end up producing an attention pattern similar to tokens that are actually closer together — a real, if often acceptable, cost.
* **Expecting raw extrapolation to fail completely rather than degrade gracefully.** In practice, performance often degrades progressively past the trained range rather than breaking outright — but it does measurably degrade.
* **Treating context extension as solving the same problem as [[Long-Context Transformers|reducing attention's raw compute cost]].** They're separate concerns — one is about whether the model's positional understanding generalizes past its training range, the other is about whether the computation itself is affordable at that length at all.

## Quick check

<details><summary>1. What's the key difference between extrapolation and interpolation for extending context length?</summary>
Extrapolation uses raw position indices directly, even beyond what the model trained on; interpolation rescales longer sequences' positions down so they fit back within the model's originally trained range.
</details>

<details><summary>2. In the worked example, why was the extrapolated rotation angle considered risky?</summary>
It reached roughly double the maximum angle the model ever encountered during training, putting the model in a regime it has no trained experience with.
</details>

<details><summary>3. What does position interpolation trade away to stay within the trained range?</summary>
Positional precision — tokens that are genuinely far apart in the real sequence get compressed into rotation angles that make them seem closer together than they actually are.
</details>

## Key terms

* **Extrapolation:** using position indices beyond what a model was trained on, without rescaling.
* **Position interpolation:** rescaling a longer sequence's positions to fit within a model's originally trained range.
* **Trained range:** the span of positions (and corresponding rotation angles, under RoPE) a model actually encountered during training.

## Related

[[Long-Context Transformers]] · [[Relative Position and RoPE]] · [[Context Rot and Lost-in-the-Middle Effects]]
