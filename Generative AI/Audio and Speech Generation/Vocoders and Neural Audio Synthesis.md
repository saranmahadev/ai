Every generative model covered so far in this subject outputs some intermediate representation — a latent, a spectrogram-like set of frequencies and amplitudes — but none of that is sound yet. A speaker can't play a spectrogram. This note covers the last step: turning that representation into an actual waveform.

**You need:** [[Text-to-Image Pipelines]].

## The question it answers

"How does a model's intermediate audio representation become an actual sound wave?" A **vocoder** converts a compact acoustic representation (classically, a spectrogram of frequencies and amplitudes over time) into a raw waveform — a long sequence of sample values that, played back at the right rate, produces sound. The simplest version of this is **additive synthesis**: literally summing sine waves at the right frequencies and amplitudes. The hard part isn't the synthesis itself — it's making successive chunks of generated audio fit together without an audible click.

## Intuition

Imagine describing a song to someone only by sheet music — which notes, how loud, how long — and having them actually hum it. That's roughly what a vocoder does: it's handed "here are the frequencies and loudness over time," and has to produce actual sound pressure wiggling at those frequencies. The tricky part shows up if the humming is generated in separate short chunks: unless each chunk picks up exactly where the previous one's pitch wave left off, there's an audible "pop" at every seam — even though each chunk, played alone, sounds perfectly fine.

## Definition and notation

```text
a pure tone, sampled at rate SR, over n samples, starting at phase φ:
  sample[k] = amplitude · sin(φ + 2π · frequency · k / SR)
  (the phase at the end of this frame = φ + 2π · frequency · n / SR)

stitching two frames together smoothly means starting frame 2's phase
exactly where frame 1's phase left off -- not restarting at φ = 0
```

## A worked example

Two 40-sample frames of the same 440Hz tone, stitched together two different ways. Frame 1 ends mid-cycle, at a sample value of 0.7902:

```text
naive restart (frame 2 starts fresh at phase 0):
  frame 2's first sample: 0.0000   →   boundary jump of 0.7902  (a sharp click)

phase-continued (frame 2 starts where frame 1 left off):
  frame 2's first sample: 0.9511   →   boundary jump of 0.1609  (much smaller)
```

Both frames are, individually, a perfectly clean 440Hz tone. The difference is entirely about where in the wave's cycle the second frame *starts* — restarting at phase 0 every frame creates a large, audible discontinuity at every single boundary, while carrying the phase forward keeps the join far smoother.

## Bench

```bench
id: vocoder-phase
title: Stitching audio frames without a click
fallback: Toggle phase continuation on and off and watch the jump at the boundary between two synthesized frames.
```

**Try this**

1. Leave phase continuation off and note the size of the boundary jump.
2. Turn it on and compare.
3. Notice the dashed line marking exactly where the two frames meet.

**What you should notice:** the waveform within each frame doesn't change at all — only what happens exactly at the seam between them does.

## Where it appears in AI

* **Modern neural vocoders (WaveNet, WaveGlow, HiFi-GAN and similar) generate waveforms directly, trained end-to-end**, rather than using hand-built additive synthesis — but they still have to solve the same underlying continuity problem across any chunking of the output.
* **Classical vocoders (phase vocoders, Griffin-Lim reconstruction) explicitly track and reconstruct phase information** for exactly this reason — a magnitude spectrogram alone doesn't specify phase, and phase is what determines whether frames line up smoothly.
* **[[Text-to-Speech Pipelines|a TTS pipeline]] hands its acoustic output to a vocoder as the very last stage**, after duration, pitch and amplitude have already been decided.

## Common pitfalls

* **Assuming any audible artifact must come from an error in the synthesis math.** The worked example shows a technically "correct" tone at both frames still producing a loud click purely from a phase mismatch at the boundary.
* **Forgetting phase is invisible in a magnitude-only spectrogram.** A spectrogram typically records how loud each frequency is at each point in time, but not its phase — recovering or choosing a sensible phase is a separate problem a vocoder has to solve.
* **Treating vocoding as a trivial last step.** It's often the single largest factor in how natural or robotic a generated voice actually sounds, independent of how good the earlier pitch and duration predictions were.

## Quick check

<details><summary>1. What causes the audible click in the "naive restart" case of the worked example?</summary>
Frame 2 starts its sine wave at phase 0 regardless of where frame 1's wave actually ended, creating a sudden jump in the sample value right at the boundary.
</details>

<details><summary>2. What does phase continuation actually change between the two stitching methods?</summary>
Only the starting phase of the second frame — everything else about the tone (frequency, amplitude) is identical in both cases.
</details>

<details><summary>3. Why doesn't a magnitude-only spectrogram fully specify a waveform?</summary>
Because it records how loud each frequency is at each time step, but not the phase of each frequency component — and phase determines exactly how sample values line up from one moment to the next.
</details>

## Key terms

* **Vocoder:** a component that converts an acoustic representation (like a spectrogram) into a raw audio waveform.
* **Additive synthesis:** producing a waveform by summing individual sine tones at specified frequencies and amplitudes.
* **Phase continuity:** ensuring a waveform's phase carries forward correctly across chunk boundaries, avoiding audible clicks.

## Related

[[Text-to-Speech Pipelines]] · [[Music Generation]] · [[IO-Aware Attention Computation]]
