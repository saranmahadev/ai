[[Feature Visualization|Saliency]] measures how sensitive a prediction is to each input pixel — and that same sensitivity can be turned around and used *against* a model. An **adversarial example** is an input deliberately, minimally altered specifically to flip (or weaken) a prediction, often by a change too small for a human to even notice.

**You need:** [[Feature Visualization]] and [[Image Classification End to End]].

## The question it answers

"If a model is accurate on ordinary inputs, is it also robust to inputs someone has deliberately designed to fool it?" Not automatically — and the same gradient information that explains a prediction can be used, in reverse, to construct a small, targeted perturbation that meaningfully damages it.

## Intuition: nudging every pixel exactly the wrong way, a little

Saliency tells you, for each pixel, which direction nudging it would most *increase* a prediction's confidence. An adversarial attack does the opposite on purpose: nudge every pixel a small, fixed amount in whichever direction *decreases* that confidence instead — not a single dramatic change anywhere, but many small, carefully-aimed nudges across the whole input that add up to a real effect.

## Definitions

```text
Fast Gradient Sign Method (FGSM), schematically:

perturbation_i = −ε · sign(saliency_i)        (ε = a small step size, same for every pixel)
adversarial input = original input + perturbation
```

Using only the *sign* of each pixel's saliency (not its exact magnitude) means every pixel moves by the same small amount `ε`, in whichever direction hurts the prediction — a simple, fast, and often surprisingly effective attack.

## A worked example

Reusing [[Image Classification End to End|the toy CNN pipeline]]'s "corner" image and its class-0 probability (0.7311), apply an FGSM-style perturbation with `ε = 0.1`:

```text
original image:                 perturbed image (every pixel moved by ±0.1):
0 0 0 0                          0.1  −0.1  −0.1   0.1
0 0 0 0                          0.1  −0.1  −0.1   0.1
0 0 1 1                          0.1  −0.1   0.9   1.1
0 0 1 1                          0.1   0.1   0.9   0.9

new prediction: class-0 probability = 0.4800     (down from 0.7311)
drop = 0.2510
```

Every pixel moved by at most 0.1 — a small, uniform nudge — yet the predicted probability dropped by about 25 percentage points, enough to flip which class the model would report as its top prediction if the two classes were close to begin with.

## Bench

```bench
id: adversarial-attack
title: Nudging every pixel the wrong way
fallback: The toy CNN pipeline's image and prediction, with an adjustable attack strength ε. See the perturbed image and how far the predicted probability drops as ε grows.
```

**Try this**

1. Start with ε = 0 (no attack) and confirm the prediction is unchanged.
2. Increase ε gradually and watch the predicted probability fall.
3. Compare how large a perturbation is needed here against how large a change a human would actually notice in a real image.

**What you should notice:** the attack doesn't need to change any one pixel by very much — it needs to change *many* pixels, each a little, all in a coordinated direction computed from the model's own gradient.

## Where it appears in AI

* **Security-sensitive applications of deep learning** (fraud detection, content moderation, autonomous systems) must account for the possibility of deliberately adversarial inputs, not just naturally occurring errors.
* **Adversarial training**, not covered in full depth here, trains directly on adversarial examples generated during training, to make the model more robust to this kind of attack.
* **Robustness and accuracy are often in tension**: making a model more robust to adversarial perturbations can sometimes cost a little ordinary accuracy, a trade-off that is itself an active area of research.

## Common pitfalls

* **Assuming high ordinary accuracy implies robustness.** A model can be highly accurate on natural data and still be highly vulnerable to small, deliberately constructed perturbations.
* **Assuming adversarial perturbations must be visible to matter.** Many effective attacks use changes small enough to be imperceptible, or nearly so, to a human.
* **Treating one specific attack method (like FGSM) as covering all forms of adversarial vulnerability.** It's a simple, illustrative method; many more sophisticated attacks exist.

## Quick check

<details><summary>1. What information does FGSM use to decide how to perturb each pixel?</summary>
The sign of that pixel's saliency (how a small change there affects the prediction), moving every pixel by the same small step in the direction that most hurts the prediction.
</details>

<details><summary>2. In the worked example, how large was the change to any single pixel?</summary>
At most 0.1 — a small, uniform perturbation applied across the whole image, not a single large change to one pixel.
</details>

<details><summary>3. Does high accuracy on ordinary test data guarantee a model is robust to adversarial examples?</summary>
No — a model can be highly accurate on natural data while still being vulnerable to small, deliberately constructed perturbations.
</details>

## Key terms

* **Adversarial example:** an input deliberately, minimally perturbed to damage a model's prediction.
* **FGSM (Fast Gradient Sign Method):** a simple adversarial attack using the sign of the gradient to perturb every input dimension by a fixed small step.
* **Robustness:** a model's resistance to deliberately adversarial (as opposed to naturally occurring) input changes.

## Related

[[Feature Visualization]] · [[Image Classification End to End]] · [[Ethics and Safety of Deep Systems]] · [[Interpretability and Attribution]]
