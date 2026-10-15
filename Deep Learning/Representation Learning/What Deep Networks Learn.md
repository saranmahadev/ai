Looking at [[Feature Visualization|what individual units respond to]] across a whole trained network reveals a consistent pattern: early layers learn simple, generic detectors (edges, colours, basic textures); later layers combine those into increasingly complex, often task-specific patterns (parts, then whole objects). Depth, in practice, tends to build a **hierarchy** of features — each layer's output becoming raw material for the next layer to combine.

**You need:** [[Feature Visualization]] and [[Why Depth Helps]].

## The question it answers

"If early and late layers are both 'just' convolutions or dense layers, why do they end up learning such different kinds of things?" Because each layer's input is the *previous* layer's output — early layers see raw pixels and can only learn simple local patterns, while later layers see the combinations earlier layers already found, and can build on top of them.

## Intuition: letters, then words, then sentences

An early layer is like learning individual letters: a small, fixed set of simple shapes that recur constantly across every possible word. A middle layer is like learning common letter combinations — "th," "ing" — built *from* letters but more specific than any single letter alone. A later layer is like learning whole words and phrases, built from everything before it. No layer "decides" to specialise this way; it emerges because each layer can only combine what it's handed, and what it's handed gets progressively richer with depth.

## Definitions

```text
early layers:   detect simple, generic, local patterns (edges, colours, textures)
                — tend to be reusable across many different tasks

later layers:   detect complex, often task-specific combinations
                — built by composing earlier layers' outputs, progressively less reusable
```

This hierarchy is exactly why [[Transfer Learning and Fine-Tuning|transfer learning]] tends to freeze early layers and adapt later ones: early, generic features transfer well to new tasks; later, specific ones often need to be relearned.

## A worked example

Two small hand-built filters, a horizontal-edge detector and a vertical-edge detector, run (with ReLU) over a toy "corner" image:

```text
horizontal-edge feature map:      vertical-edge feature map:
0 0 0 0                           0 0 0 0
0 1 2 2                           0 1 0 0
0 0 0 0                           0 2 0 0
0 0 0 0                           0 2 0 0
```

Neither map alone marks the corner precisely — the horizontal map lights up along a whole row, the vertical map along a whole column. But combine them with a simple **"both must be active"** rule (the elementwise minimum of the two, after ReLU):

```text
combined ("corner") feature map:
0 0 0 0
0 1 0 0
0 0 0 0
0 0 0 0
```

Exactly one position survives: the single spot where *both* a horizontal and a vertical edge are present — the actual corner. Neither original filter detected "corner" on its own; the combination, built from both, does.

## Bench

```bench
id: feature-hierarchy
title: Combining two edge detectors into a corner detector
fallback: Two edge-detecting feature maps and a combined "both must be active" map. See how the combined map isolates the corner that neither individual map detects alone.
```

**Try this**

1. Look at each edge map alone and note how neither pinpoints the corner by itself.
2. Look at the combined map and see exactly one cell survive.
3. Switch to a different toy shape and see what the combined map picks out instead.

**What you should notice:** this tiny example is the same principle, in miniature, behind why depth builds a feature hierarchy — a later "layer" (the combination step) detects something neither earlier "layer" (the individual edge maps) could detect alone, purely by composing them.

## Where it appears in AI

* **Visualizing trained CNN filters** (Zeiler and Fergus's and others' well-known work) consistently finds this same pattern: edges and colours early, parts and textures in the middle, whole objects or object parts later.
* **This hierarchy is exactly why transfer learning works at all** (see [[Transfer Learning and Fine-Tuning]]) — the early, generic layers of a network trained on one large dataset are useful raw material for almost any related task.
* **Language models show an analogous pattern**, with early layers tending to capture more surface-level patterns and later layers capturing more abstract, task-relevant structure.

## Common pitfalls

* **Assuming every layer in every trained network neatly fits this story.** It is a strong, well-documented tendency, not an exact law that holds precisely for every layer of every architecture.
* **Thinking "generic" means "useless."** Generic early features are exactly what makes transfer learning possible — their lack of task-specificity is their strength for reuse.
* **Forgetting composition, not just depth itself, is doing the work.** It is specifically the fact that later layers operate on earlier layers' *outputs* (not raw input again) that builds the hierarchy.

## Quick check

<details><summary>1. Why do early CNN layers tend to learn generic features like edges, while later layers learn task-specific ones?</summary>
Early layers see only raw pixels and can only build simple, local, broadly applicable detectors; later layers build on top of earlier layers' already-detected patterns, allowing more specific, complex combinations.
</details>

<details><summary>2. In the worked example, why didn't either individual edge map detect the corner alone?</summary>
Each map only encodes one kind of edge (horizontal or vertical) and lights up along an entire row or column; only requiring both to be active at once isolates the single point where they intersect.
</details>

<details><summary>3. Why does this hierarchy matter for transfer learning?</summary>
Early, generic layers tend to transfer well to new, related tasks, while later, more task-specific layers often need to be retrained or fine-tuned for a new task.
</details>

## Key terms

* **Feature hierarchy:** the tendency for depth to progress from simple, generic features to complex, task-specific ones.
* **Composition (of features):** building a new detector by combining the outputs of earlier, simpler detectors.
* **Generic vs. task-specific features:** reusable low-level patterns versus patterns specialised to one particular task.

## Related

[[Feature Visualization]] · [[Why Depth Helps]] · [[Transfer Learning and Fine-Tuning]] · [[Self-Supervised Learning]]
