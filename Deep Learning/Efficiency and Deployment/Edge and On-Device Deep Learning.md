Running a model on a phone, a smartwatch, or a tiny embedded chip is a different problem from running it on a server: memory, compute, power and network connectivity are all far more constrained, and often there's no network connection to a server at all. **Edge deployment** combines everything from this section — pruning, quantization, distillation — to fit a model within those limits.

**You need:** [[Quantization]], [[Model Pruning]] and [[Knowledge Distillation]].

## The question it answers

"A model trained on a data centre's GPUs needs to run on a phone with a tiny fraction of that power — how do you get it to actually fit?" By stacking compression techniques together: a smaller architecture (via distillation or direct design), fewer non-zero weights (pruning), and lower-precision numbers (quantization) — each buying back some of the budget a server-sized model would otherwise need.

## Intuition: packing for a trip with a much smaller bag

A server can carry a huge, roomy suitcase. A phone's "bag" for a model is tiny by comparison — limited memory, a battery that drains with every computation, and often no cloud connection to lean on. Shrinking a model for the edge is exactly like packing for that much smaller bag: everything that isn't earning its keep (pruning), stored more compactly (quantization), and ideally designed smaller to begin with (distillation into a purpose-built small architecture) rather than crammed in as an afterthought.

## Definitions

```text
on-device inference:  running the model entirely on the local device, no network round-trip needed

benefits:  lower latency (no network delay), works offline, keeps data private (never leaves the device)
costs:     limited memory, compute and power compared to a server
```

## A worked example

A 100 MB model, compressed in stages:

```text
original (32-bit, dense):                        100 MB

structured pruning (removes 50% of channels):     50 MB     (2× smaller)
8-bit quantization (32-bit → 8-bit, 4× smaller):   50 MB / 4 = 12.5 MB

combined reduction:  2× (pruning) × 4× (quantization) = 8× smaller overall
final size:           100 MB / 8 = 12.5 MB
```

Pruning and quantization attack different kinds of redundancy (how many weights, versus how precisely each one is stored), so their size reductions multiply rather than merely add — an 8× total reduction from two techniques that individually only gave 2× and 4×.

## Bench

```bench
id: compression-stack
title: Stacking compression techniques
fallback: A starting model size, with pruning and quantization reduction factors as sliders. See each stage's resulting size and the combined reduction factor.
```

**Try this**

1. Apply pruning alone and note the resulting size.
2. Apply quantization alone (reset pruning) and compare.
3. Apply both together and confirm the combined reduction is the product of the two individual factors.

**What you should notice:** the two techniques compound multiplicatively because they reduce different things (weight count versus bits per weight) — stacking them is far more effective than relying on either alone.

## Where it appears in AI

* **On-device voice assistants, cameras and keyboards** run models locally specifically for latency and privacy — no round trip to a server, and raw data (what you said, what you typed) never has to leave the device.
* **Specialised mobile and embedded hardware** (neural processing units, dedicated low-power chips) often support only specific operations or precisions efficiently, which shapes which compression techniques are practical on a given device.
* **Federated learning**, a related but distinct idea not covered here, trains a shared model across many devices' local data without that data ever being centrally collected.

## Common pitfalls

* **Assuming compression techniques always compound as cleanly as the worked example.** Real combined effects on actual accuracy (not just size) can interact in less predictable ways, and need to be validated, not just assumed.
* **Forgetting hardware support matters as much as the compression technique itself.** A quantization scheme or pruning pattern a specific chip doesn't support efficiently may provide little real speedup despite the smaller file size.
* **Treating edge deployment as purely a size problem.** Latency, power consumption and thermal limits can matter just as much as how many megabytes a model occupies.

## Quick check

<details><summary>1. What are two advantages of running a model entirely on-device rather than on a server?</summary>
Lower latency (no network round trip) and keeping data private, since it never has to leave the device; it also works without a network connection at all.
</details>

<details><summary>2. In the worked example, why does the combined reduction (8×) equal the product, not the sum, of the two individual factors (2× and 4×)?</summary>
Pruning and quantization reduce different kinds of redundancy (how many weights versus how precisely each is stored), so applying both multiplies their effects rather than adding them.
</details>

<details><summary>3. Why might a compression technique that reduces file size not actually speed up inference on a given device?</summary>
The device's hardware may not efficiently support that particular precision or sparsity pattern, so the theoretical size reduction doesn't translate into a real compute speedup.
</details>

## Key terms

* **Edge deployment:** running a model directly on the end-user's device rather than a remote server.
* **On-device inference:** inference computed locally, with no network round trip.
* **Compression stack:** combining multiple size-reduction techniques (pruning, quantization, distillation) together.

## Related

[[Quantization]] · [[Model Pruning]] · [[Knowledge Distillation]] · [[Neural Architecture Search]]
