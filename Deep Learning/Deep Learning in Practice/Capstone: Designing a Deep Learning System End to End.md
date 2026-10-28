This capstone walks one project through every stage this subject covered: choosing an architecture, initializing and training it soundly, regularising it, checking it honestly, and shrinking it for deployment — citing the actual, verified numbers this subject's own benches produced along the way, not fresh claims.

**You need:** [[Choosing an Architecture for a Problem]], [[Weight Initialization]], [[Overfitting and Double Descent]], [[Debugging a Training Run]] and [[Edge and On-Device Deep Learning]].

## The question it answers

"Do all these separate topics — initialization, regularization, attention, pruning — actually fit together into one coherent process?" Yes: a real project visits most of them, in roughly this order, each decision informed by evidence this subject already produced.

## The project

A small image classifier, trained on a modest labelled dataset, destined to run on a phone. Each stage below is a real decision point, backed by a number this subject's own benches already computed.

## The design walkthrough

```text
1. Architecture        Image input → grid-structured data → a CNN
                        (see Choosing an Architecture for a Problem)

2. Initialization       Signal scale after 10 layers:
                        scale=1 (too big):      3.3 billion   (exploded)
                        scale=1/√n (just right): 0.334        (stable)
                        → initialize at roughly 1/√(fan-in)

3. Regularization       At the model's interpolation threshold (parameters ≈ training
                        examples), test error spiked to 160+ in the double-descent
                        bench; dropout and data augmentation push well clear of that
                        danger zone, not just "add some regularization vaguely"

4. Training             Per-block gradient factor 0.25 (sigmoid-like) over 10 layers
                        shrinks a gradient to ~0.0000009 of its start; warmup + cosine
                        decay and gradient clipping (cap size, don't change direction)
                        keep training stable through the early, least-reliable steps

5. Debugging            Gradient norm jumping from 1.8 to 15.3 in one step (worked
                        example in Debugging a Training Run) is caught and clipped
                        before it reaches the NaN the next step would otherwise produce

6. Interpretation       A saliency map (Feature Visualization) shows the model
                        attending to the third column of a toy input — exactly where
                        its convolution kernel was weighted +1 — confirming it is
                        reading the signal it was meant to, not something spurious

7. Robustness check     A 0.1-magnitude adversarial nudge to every pixel dropped a
                        0.7311 prediction to 0.4800 (Adversarial Examples and
                        Robustness) — a reminder that high ordinary accuracy alone
                        says nothing about robustness to deliberate attacks

8. Compression          Structured pruning (2× smaller) combined with 8-bit
                        quantization (4× smaller) gives an 8× smaller model overall
                        (Edge and On-Device Deep Learning) — the actual size the
                        phone app needs to ship

9. Safety review        A large gap between training loss and held-out loss is a
                        membership-inference risk, not just an accuracy one (Ethics
                        and Safety of Deep Systems) — checked before shipping,
                        especially if the training data is at all sensitive
```

## Bench

```bench
id: dl-capstone
title: One project, every stage
fallback: Step through all nine stages of a real deep learning project, from choosing an architecture to a pre-deployment safety check, with the evidence number behind each decision.
```

**Try this**

1. Step through every stage in order and note which earlier topic each decision traces back to.
2. Pick any one stage and go reread that topic's own worked example for the full derivation.
3. Think about what would change if the deployment target were a data-centre server instead of a phone — which stages would still apply, and which would change?

**What you should notice:** none of these nine decisions are independent — initialization affects how training behaves, regularization affects both accuracy and the privacy risk in stage 9, and the stages earlier in training determine how much work compression in stage 8 has to do.

## Where it appears in AI

* **This is, in miniature, what a real applied deep learning project actually looks like** — fewer surprises and more checklist than the architecture diagrams alone might suggest.
* **Different projects weight these stages differently**: a research project might spend most of its effort on stage 1 (architecture) and little on stage 8 (compression); a production mobile app is often the reverse.
* **What comes next** — Neural Networks, Transformers, Generative AI, LLMs, RAG and Agents — builds on every one of these same foundations, applied to ever larger and more specialised models.

## Common pitfalls

* **Treating any one stage as optional.** Skipping initialization care, skipping a robustness check, or skipping the safety review each individually risks a failure that is easy to avoid by the time you've reached this capstone.
* **Doing the stages in isolation, with no feedback between them.** A regularization change can require revisiting the training schedule; a compression step can require re-checking robustness and accuracy, not just size.
* **Assuming a model that passes every stage once is finished forever.** New data, a new deployment target, or a newly discovered attack can all require revisiting stages already thought complete.

## Quick check

<details><summary>1. Why does stage 2 (initialization) matter before any training has even happened?</summary>
A poorly scaled initialization can cause activations (and later, gradients) to explode or vanish within the first few layers, regardless of how good the training procedure afterward is.
</details>

<details><summary>2. How does stage 7 (the robustness check) differ from simply measuring ordinary test accuracy?</summary>
It specifically measures how much a small, deliberately constructed perturbation can damage the prediction — a property ordinary accuracy on natural data says nothing about.
</details>

<details><summary>3. Why does stage 9 (the safety review) come after stage 3 (regularization) in this walkthrough, not independently of it?</summary>
The same overfitting that regularization addresses for accuracy is also the root cause of the membership-inference privacy risk checked in stage 9 — the two are connected, not separate concerns.
</details>

## Key terms

* **Design walkthrough:** working through a project's decisions in the order they naturally arise, each backed by evidence.
* **End-to-end:** covering a project from initial architecture choice through to a deployable, checked result.
* **Pre-deployment safety review:** checking a model's privacy, robustness and fairness properties before it ships, not only its accuracy.

## Related

[[Choosing an Architecture for a Problem]] · [[Weight Initialization]] · [[Overfitting and Double Descent]] · [[Debugging a Training Run]] · [[Edge and On-Device Deep Learning]] · [[Ethics and Safety of Deep Systems]]
