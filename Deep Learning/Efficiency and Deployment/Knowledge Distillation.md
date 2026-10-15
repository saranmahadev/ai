A large, accurate **teacher** network's final prediction is one number per class — but its *full* output, before being squashed into near-certainty, carries far more information: how confident it was, and how it ranked the classes it got wrong. **Knowledge distillation** trains a small **student** network to mimic that fuller picture, not just the teacher's single correct answer.

**You need:** [[Model Pruning]] and [[Softmax and Cross-Entropy in Practice]].

## The question it answers

"A big, accurate model is too slow or large to deploy — can a much smaller model learn almost as much, directly from the big one, rather than from raw labels alone?" Yes — train the small student to match the teacher's *softened* output distribution, which reveals relative confidence across all classes, not just which one "won."

## Intuition: learning from a tutor's full reasoning, not just their final answer

A teacher's ordinary softmax output is usually extremely confident — one class near 100%, everything else near 0% — which hides almost all of the teacher's more nuanced judgement about which *wrong* answers were still plausible. **Temperature** softens that peak: dividing the logits by a temperature `T > 1` before the softmax flattens the distribution, revealing the teacher's relative ranking of all the classes — information a hard 0-or-1 label could never have conveyed on its own.

## Definitions

```text
softened softmax:   P_i = softmax(z / T)_i        (T = 1 is ordinary softmax; T > 1 softens it)

distillation loss:  cross-entropy between the student's softened output and the teacher's softened output
                     (often averaged with an ordinary loss against the true hard labels)
```

## A worked example

Teacher logits `(3.0, 1.0, 0.5)` for 3 classes, compared at ordinary temperature and a softened one:

```text
T = 1 (ordinary):  P = (0.8214, 0.1112, 0.0674)     — very peaked, almost all weight on class 1
T = 4 (softened):  P = (0.4669, 0.2832, 0.2499)     — reveals class 2 is a noticeably closer runner-up than class 3
```

A student with its own logits `(2.0, 1.2, 0.8)`, softened the same way, gives `(0.3907, 0.3199, 0.2894)` at `T = 4`. Comparing the two softened distributions with cross-entropy gives a distillation loss of about `1.0714` — a loss that specifically rewards the student for matching the teacher's *relative* ranking of all three classes, not merely picking the same top class.

## Bench

```bench
id: distill-temp
title: Softening a teacher's output with temperature
fallback: Adjustable teacher logits and a temperature slider. See the teacher's softmax distribution flatten as temperature rises, and compare a student's distillation loss against the softened teacher target.
```

**Try this**

1. Set temperature to 1 and note how sharply the teacher's distribution favours one class.
2. Raise the temperature and watch the distribution flatten, revealing the relative order of the other classes more clearly.
3. Adjust the student's logits to better match the teacher's ranking and watch the distillation loss fall.

**What you should notice:** at a high temperature, a student is rewarded for matching the teacher's *entire* ranking of classes, not just its top pick — which is exactly the extra signal ordinary hard labels don't provide.

## Where it appears in AI

* **Deploying a smaller, faster model** that approximates a larger one's behaviour, when the larger model is too slow or large for the deployment target (see [[Edge and On-Device Deep Learning]]).
* **Distillation is often combined with [[Model Pruning]] and [[Quantization]]** as part of a broader model-compression pipeline.
* **Self-distillation**, a variant not covered in detail here, uses a model to distill into a smaller or even same-sized version of itself, sometimes improving results beyond ordinary training.

## Common pitfalls

* **Forgetting to also use the true hard labels, where available.** Distillation loss alone, with no grounding in the actual correct answers, can let a student learn the teacher's mistakes just as readily as its correct judgements.
* **Using too low a temperature.** Near `T = 1`, the teacher's output is almost as peaked as a hard label, losing much of the extra signal distillation is meant to provide.
* **Assuming the student can match the teacher at any size.** A sufficiently small student may lack the capacity to capture everything the teacher's full output is conveying, however good the distillation signal.

## Quick check

<details><summary>1. What extra information does a softened teacher output provide beyond a hard label?</summary>
Its relative confidence across every class, not just which one it predicted — including how it ranked the classes it got wrong.
</details>

<details><summary>2. What happens to a softmax distribution as temperature increases?</summary>
It flattens, spreading probability more evenly across classes and revealing finer distinctions in relative confidence.
</details>

<details><summary>3. Why is distillation loss often combined with an ordinary loss against the true hard labels?</summary>
Relying only on the teacher's output risks the student learning the teacher's mistakes as faithfully as its correct judgements; grounding in true labels helps avoid that.
</details>

## Key terms

* **Teacher / student:** the large, already-trained model and the smaller model being trained to mimic it.
* **Temperature:** a scaling factor that softens (or sharpens) a softmax distribution.
* **Distillation loss:** cross-entropy between a student's and teacher's softened output distributions.

## Related

[[Model Pruning]] · [[Softmax and Cross-Entropy in Practice]] · [[Quantization]] · [[Edge and On-Device Deep Learning]]
