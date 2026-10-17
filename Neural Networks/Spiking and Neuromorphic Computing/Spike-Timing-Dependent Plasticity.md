[[Hebbian Learning|Hebb's rule]] says neurons that fire together wire together, but says nothing about *order*. Spike-timing-dependent plasticity (STDP) fills in exactly that gap: whether a connection strengthens or weakens depends on which neuron fired first, and by how much time.

**You need:** [[Hebbian Learning]], [[Rate and Temporal Coding]].

## The question it answers

"If two connected neurons spike close together in time, should the connection between them get stronger or weaker — and does it matter which one fired first?" Biological synapses answer this with a strikingly consistent rule: if the **presynaptic** (sending) neuron fires shortly *before* the **postsynaptic** (receiving) neuron — a pattern consistent with the first neuron having helped cause the second to fire — the connection strengthens. If the order is reversed, it weakens.

## Intuition

Think of it as evidence for causation, measured in milliseconds. A spike arriving just before the receiving neuron fires looks like it might have contributed to that firing — reward the connection that delivered it. A spike arriving just *after* the receiving neuron already fired could not possibly have caused it — penalize that connection instead, since it is clearly not the one driving this particular output. The closer in time the two spikes are, the stronger the effect in either direction; spikes far apart in time barely affect the connection at all.

## Definition and notation

With `Δt = t_post − t_pre` (positive when the presynaptic spike comes first):

```text
Δt > 0 (pre before post, causal):      Δw = A₊ · exp(−Δt / τ₊)     (strengthen)
Δt < 0 (post before pre, anti-causal): Δw = −A₋ · exp(Δt / τ₋)     (weaken)
```

`A₊` and `A₋` set the maximum strengthening and weakening; `τ₊` and `τ₋` set how quickly the effect fades as the two spikes move further apart in time. This is Hebb's rule made temporally precise: "fire together" becomes "fire within this time window," and "wire together" gets a sign that depends on the order.

## A worked example

With `A₊ = 0.1`, `A₋ = 0.12`, `τ₊ = τ₋ = 20` ms:

```text
Δt = +10 ms (pre fires 10ms before post, causal):  Δw = 0.1 · exp(−10/20) ≈ +0.0607
Δt = −10 ms (post fires 10ms before pre, anti-causal): Δw = −0.12 · exp(−10/20) ≈ −0.0728
Δt = +40 ms (pre fires 40ms before post):  Δw = 0.1 · exp(−40/20) ≈ +0.0135
```

Ten milliseconds in the "right" causal order strengthens the connection by about 0.061; the same ten milliseconds in the wrong order weakens it by about 0.073 — slightly more, since `A₋ > A₊` here, a common asymmetry in real STDP measurements. Stretch the causal gap to 40 ms and the strengthening shrinks to about a fifth of its value at 10 ms — the window is narrow, not an all-or-nothing effect.

## Bench

```bench
id: stdp-window
title: The STDP learning window
fallback: Set the time gap between a presynaptic and postsynaptic spike, in either order, and see how much the connection strengthens or weakens as a result.
```

**Try this**

1. Try several positive (causal) gaps and watch the strengthening shrink as the gap grows.
2. Try the same gaps in the anti-causal direction and compare the sign and size of the change.
3. Find the gap size beyond which the weight change becomes negligible in either direction.

**What you should notice:** the effect is sharply peaked near zero time gap and in the causal order, and fades quickly — STDP rewards tight, causally-ordered timing, not just "close enough."

## Where it appears in AI

* **It is the biologically-grounded answer to the training-signal question** raised all the way back in [[Why This Planet Looks Different from Deep Learning]]: a genuinely different, local, timing-based learning rule, needing no global error signal at all.
* **It is one of the main learning rules implemented directly in neuromorphic hardware** (see [[Neuromorphic Hardware]]), since it is cheap to compute locally at each synapse using only the timing of the two spikes it connects.
* **It gives a mechanistic account of causal learning**: wiring strengthens exactly where timing is consistent with one neuron's spike contributing to another's, without ever computing an explicit notion of "cause."

## Common pitfalls

* **Treating STDP as just a timing-free version of Hebb's rule.** The sign of the update genuinely depends on spike order — Hebb's original rule has no notion of order at all.
* **Assuming the window is symmetric.** Real synapses, and the worked example above, often show different magnitudes (and sometimes different time constants) for strengthening versus weakening.
* **Forgetting the effect decays with the time gap.** Two spikes hundreds of milliseconds apart are treated as essentially unrelated, not as still "firing together."

## Quick check

<details><summary>1. What determines whether STDP strengthens or weakens a connection?</summary>
The order of the two spikes — presynaptic before postsynaptic strengthens the connection; the reverse order weakens it.
</details>

<details><summary>2. In the worked example, why was the weakening at Δt = −10ms slightly larger in magnitude than the strengthening at Δt = +10ms?</summary>
Because `A₋ = 0.12` was set larger than `A₊ = 0.1` — a real, commonly observed asymmetry between the strengthening and weakening amplitudes.
</details>

<details><summary>3. What happens to the size of the weight change as the time gap between the two spikes grows?</summary>
It shrinks exponentially toward zero in either direction — STDP's effect is concentrated in a narrow window around a zero time gap.
</details>

## Key terms

* **Presynaptic / postsynaptic:** the sending neuron and the receiving neuron of a given connection, respectively.
* **Causal (pre-before-post) window:** the time range where the presynaptic spike precedes the postsynaptic one, where STDP strengthens the connection.
* **Learning window:** the shape of weight change as a function of the time gap between two spikes, typically peaked near zero and decaying exponentially.

## Related

[[Hebbian Learning]] · [[Rate and Temporal Coding]] · [[Neuromorphic Hardware]] · [[Why This Planet Looks Different from Deep Learning]]
