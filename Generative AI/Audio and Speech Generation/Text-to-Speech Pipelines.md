Turning text into speech means answering several questions at once: how long should each sound last, how should pitch rise and fall, how loud should each part be — and only then, what should the waveform itself look like. This note covers the pipeline that answers them in order.

**You need:** [[Vocoders and Neural Audio Synthesis]].

## The question it answers

"How does written text become spoken audio?" A text-to-speech pipeline breaks a word into **phonemes** (its individual sound units), predicts a **duration**, **pitch** and **amplitude** for each one (together, the *prosody*), assembles those into a sequence of acoustic frames, and finally hands that sequence to a [[Vocoders and Neural Audio Synthesis|vocoder]] to produce the actual waveform. Every stage before the vocoder is deciding *what* should be said and *how* — the vocoder is the only stage that actually produces sound.

## Intuition

Reading a word aloud for the first time, you don't consciously plan "which sound unit, how long, what pitch, how loud" and then separately "now move my vocal cords accordingly" — but a TTS pipeline is forced to make all those decisions explicit and in sequence, because nothing about raw text specifies any of it. "Hello" contains no information at all about how long to hold the "oh" sound or how the pitch should rise on "eh" — a model has to predict all of that from scratch (or, in modern systems, learn to predict it from data).

## Definition and notation

```text
text → phonemes                          (how is it pronounced, as discrete sound units?)
phonemes → duration, pitch, amplitude    (prosody: how long, how high, how loud, per phoneme)
prosody → acoustic frames                (a sequence of per-frame acoustic targets)
acoustic frames → waveform               (the vocoder: the only stage that produces sound)
```

## A worked example

The word "hello" broken into four phonemes, each with its own predicted duration, pitch and amplitude:

```text
phoneme:    h      eh      l      oh
duration: 0.05   0.12    0.06   0.15   (seconds)
pitch:      0    180     170    160    (Hz; 0 = unvoiced)
amplitude: 0.3   0.8     0.6    0.9
```

```text
total duration:  0.05 + 0.12 + 0.06 + 0.15 = 0.380 seconds
```

The "h" phoneme is unvoiced (pitch 0 — it's mostly noise, not a tone) and quiet; "oh" is the longest, loudest, and lowest-pitched of the voiced sounds. None of these four numbers per phoneme came from the text itself — "hello" doesn't say how long the "oh" should last — they're the predictions a TTS pipeline has to make before any audio can be synthesized at all.

## Bench

```bench
id: tts-pipeline
title: Phonemes → duration, pitch and amplitude
fallback: Pick a word and see its phoneme sequence's predicted duration, pitch and amplitude, laid out over time.
```

**Try this**

1. Look at "hello" and note how the four phonemes' durations sum to the total.
2. Switch to "hi" and compare its pitch contour (notice "ai" is both longer and higher-pitched than any phoneme in "hello").
3. Notice the unvoiced "h" phoneme has no pitch bar at all.

**What you should notice:** every phoneme carries its own independent duration, pitch and amplitude — nothing about the word as a whole directly determines any one phoneme's prosody.

## Where it appears in AI

* **Modern TTS systems (Tacotron, FastSpeech, VITS and similar) predict duration, pitch and amplitude jointly from text**, usually without hand-built phoneme lookup tables, though the underlying stages are the same ones shown here.
* **[[Voice Cloning and Speaker Adaptation|voice cloning]] works by adapting exactly this prosody**, rather than by changing the vocoder or the text analysis — a cloned voice typically uses the same pipeline with shifted pitch and timing statistics.
* **Prosody prediction is where most of a synthetic voice's "naturalness" (or lack of it) comes from** — a vocoder reproducing an unnatural prosody faithfully still sounds unnatural.

## Common pitfalls

* **Assuming the vocoder is responsible for how natural speech sounds.** Most of what makes speech sound robotic or flat comes from the duration/pitch/amplitude predictions upstream of the vocoder, not from the waveform synthesis itself.
* **Forgetting unvoiced sounds have no pitch.** Sounds like "h", "s", or "f" are largely noise rather than a tone at a specific frequency — a pitch of exactly 0 (or undefined) is the correct, expected value for them, not a bug.
* **Treating phoneme duration as fixed per phoneme.** The same phoneme's duration varies by context (a stressed syllable, the end of a sentence) — real TTS duration models predict this per occurrence, not from a fixed lookup table.

## Quick check

<details><summary>1. What are the four main stages of a text-to-speech pipeline, in order?</summary>
Text to phonemes, phonemes to prosody (duration, pitch, amplitude), prosody to acoustic frames, and acoustic frames to waveform (via a vocoder).
</details>

<details><summary>2. In the worked example, why does the "h" phoneme have a pitch of 0?</summary>
Because "h" is an unvoiced sound — mostly noise rather than a tone at a specific frequency — so it has no meaningful pitch value.
</details>

<details><summary>3. Which stage of the pipeline is the only one that actually produces sound?</summary>
The vocoder — every earlier stage only decides what the eventual sound should contain (phonemes, duration, pitch, amplitude), without producing any actual waveform.
</details>

## Key terms

* **Phoneme:** a discrete unit of sound that makes up spoken language.
* **Prosody:** the duration, pitch and amplitude pattern of speech — how long, how high, and how loud each sound is.
* **Acoustic frame:** one time-slice of the intermediate representation a vocoder converts into sound.

## Related

[[Vocoders and Neural Audio Synthesis]] · [[Voice Cloning and Speaker Adaptation]] · [[Music Generation]]
