Speech has to be intelligible; music, rather famously, has to sound *right* in a way that's much harder to pin down — but at least one piece of that is concrete and checkable: whether the notes played actually belong to the key the piece is in.

**You need:** [[Constrained and Structured Generation]].

## The question it answers

"How do you generate a melody that stays in a given musical key?" The same [[Constrained and Structured Generation|grammar masking]] used to force valid arithmetic can force valid *scale membership*: at every step, mask out every note that doesn't belong to the chosen scale before sampling the next one, exactly the way an invalid arithmetic token was masked out earlier on this planet. The underlying note-to-note preferences (a toy model favoring small, stepwise melodic motion) stay exactly the same — only which notes are *available* to express that preference over changes.

## Intuition

A jazz musician improvising over a chord progression isn't choosing from all twelve notes with equal freedom — they're choosing from whichever subset fits the current harmony, and the *feel* of the solo comes from how they move within that restricted set. Masking a generative model's output to a musical scale is the same restriction: it doesn't change what the model finds melodically interesting (stepwise motion, in this toy setup), it changes which notes count as valid choices in the first place.

## Definition and notation

```text
12 chromatic notes, indices 0-11 (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
C major scale = {0, 2, 4, 5, 7, 9, 11}        (7 of the 12 notes)

toy melodic preference: logit(next | prev) = −0.5 · |next − prev|
  (favors notes close in pitch to the previous one)

scale-constrained generation: mask out every note not in the scale,
  exactly as in grammar-masked decoding, then sample as usual
```

## A worked example

Generating a 10-note melody from the same starting note and the same stepwise-motion preference, with and without a C-major scale mask:

```text
unconstrained:  C D E D# E C# D D# D F# F
  notes outside C major:  D#, C#, D#  (3 off-scale notes)

scale-masked:   C D E E F D D E E G F
  notes outside C major:  (none)
```

Both sequences follow the same underlying preference for small melodic steps — that's why they look similar overall — but the unconstrained version drifts onto chromatic notes (D#, C#) that don't belong to C major whenever they happen to be the closest-pitch option, while the masked version is guaranteed to never do that, regardless of what the underlying preference would otherwise pick.

## Bench

```bench
id: scale-constrained-music
title: Keeping a melody in key
fallback: Toggle a scale mask on and off and see how many notes in a generated melody fall outside the chosen musical scale.
```

**Try this**

1. With the mask off, count how many generated notes fall outside C major.
2. Turn the mask on and confirm that count drops to zero.
3. Notice the overall melodic "shape" — mostly small steps — doesn't change between the two.

**What you should notice:** the mask doesn't change the model's underlying melodic taste, only which notes it's allowed to express that taste through — the exact same relationship between a model's preferences and a grammar mask seen earlier with arithmetic generation.

## Where it appears in AI

* **Real symbolic music generation models (predicting notes or chords, not raw audio) commonly use exactly this kind of scale or chord-tone masking** as a hard constraint layered on top of a learned model's preferences.
* **Audio-domain music generation (producing a waveform directly, rather than symbolic notes) can't apply this mask as cleanly** — a raw audio sample doesn't have a discrete "note" to mask, which is part of why symbolic and audio-domain music generation remain fairly separate approaches.
* **[[Vocoders and Neural Audio Synthesis|turning a generated symbolic melody into actual sound]] still needs a synthesis step afterward** — generating the right notes and generating a pleasant-sounding performance of them are different problems.

## Common pitfalls

* **Assuming a scale mask guarantees "good" music.** It only guarantees the notes belong to the chosen scale — rhythm, harmony, phrasing and structure are entirely separate concerns a note-level mask says nothing about.
* **Forgetting a mask changes what's available, not what's preferred.** The underlying stepwise-motion preference in this worked example is unaffected by the mask — it simply can no longer act on now-forbidden notes.
* **Treating "off-scale" as always wrong in real music.** Deliberate chromaticism (brief excursions outside the home scale) is a normal and expressive part of real composition — a hard mask is a simplification useful for a toy demonstration, not a rule real music always follows.

## Quick check

<details><summary>1. What's being masked in scale-constrained melody generation, and what stays unmasked?</summary>
The available next notes are masked down to only those belonging to the chosen scale; the underlying preference for which of the remaining notes to pick (here, favoring small melodic steps) is unchanged.
</details>

<details><summary>2. In the worked example, which notes appeared in the unconstrained melody that the scale mask would have forbidden?</summary>
D#, C#, and D# again — three notes that fall outside the C major scale.
</details>

<details><summary>3. Why is this the same underlying technique as grammar-masked arithmetic generation?</summary>
Both work by setting the logits of disallowed options to −∞ before sampling, guaranteeing the output can never include anything outside the allowed set — only what counts as "allowed" differs between the two domains.
</details>

## Key terms

* **Scale:** a fixed subset of notes (here, 7 of 12) that a piece of music is considered to be "in."
* **Scale masking:** forcing generated notes to belong to a chosen scale by masking out every note that doesn't.
* **Symbolic music generation:** generating discrete musical events (notes, chords) rather than a raw audio waveform directly.

## Related

[[Constrained and Structured Generation]] · [[Vocoders and Neural Audio Synthesis]] · [[Code Generation and Program Synthesis]]
