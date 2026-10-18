A web agent that can read a page's DOM knows exactly where the Submit button is, by name. A computer-use agent looking at a plain screenshot has no such luxury — it has to turn "click Submit" into an actual pixel coordinate, purely by looking at the image. That translation step, from a described target to a point on screen, is **grounding**, and the same small aiming error that a big button shrugs off can be a complete miss on a small icon.

**You need:** [[Web-Browsing Agents]], [[Deep Learning Across Modalities]].

## The question it answers

"What's different about controlling a whole desktop instead of a web page?" A computer-use agent isn't limited to one page's structure — it can act on any application, which means it generally has no equivalent of a DOM to read element identities from. Its observation is a screenshot (or a stream of them), and its actions are raw mouse and keyboard events at pixel coordinates. **Grounding** is the step of mapping an intended target, described in words or inferred from the image, onto the actual (x, y) location to click — and it inherits all the usual limits of visual perception: a model's click prediction is only ever approximately right.

## Intuition

Pointing at a photo and saying "click there" is easy to do accurately for a large button that takes up a good chunk of the screen. Pointing at the same photo and trying to hit a tiny 16-pixel close icon with the same hand-steadiness is a much less forgiving task — the margin for error shrinks with the target, even though your aim didn't get any worse.

## Definition and notation

```text
grounding: target description → predicted (x, y) pixel coordinate
hit test:  |predicted_x − target_center_x| ≤ target_half_width
           AND |predicted_y − target_center_y| ≤ target_half_height
```

## A worked example

The same predicted click, off by exactly 15 pixels (a 9–12–15 right-triangle offset) from the true center, checked against two different target sizes:

```text
click error: dx = 12px, dy = 9px  (euclidean distance = 15px exactly)

Submit button (120×40px, half-size 60×20): |12|≤60 and |9|≤20 → hit
Close icon (16×16px, half-size 8×8):       |12|≤8  is false    → miss
```

The exact same aiming error — 15 pixels off, in the exact same direction — lands inside the button's generous margin but outside the icon's tight one. Nothing about the model's perception changed between the two cases; only the target's size relative to a fixed error budget did.

## Bench

```bench
id: gui-grounding-click
title: The same pixel error, two target sizes
fallback: Adjust a click's pixel error and watch it hit a large button but miss a small icon at the same distance.
```

**Try this**

1. At the default 12,9 error, confirm the button is hit and the icon is missed.
2. Reduce the error sliders until the icon starts registering hits — how small does the error need to be?
3. Increase the error until even the button starts missing — compare that threshold to the icon's.

**What you should notice:** a fixed click-error budget doesn't fail uniformly — it fails exactly on the smallest, most precision-demanding targets, which are often the ones (close buttons, checkboxes, small icons) where a miss matters most.

## Where it appears in AI

* **This is the same perception-to-action gap [[Web-Browsing Agents]] mostly avoids** by having a DOM to target identities in — computer-use agents give that up for the ability to act on any application, at the cost of needing grounding at all.
* **The underlying visual localization problem draws on [[Deep Learning Across Modalities]]'s vision-language grounding**, applied here specifically to turning a description into a click target rather than a caption or a bounding box for its own sake.
* **[[Hybrid Code-and-GUI Action Spaces]], the next topic but one, often routes around this exact fragility** by using code-level APIs where they exist and only falling back to pixel-level clicking where they don't.

## Common pitfalls

* **Treating a small aiming error as negligible.** The worked example shows the same 15-pixel error is harmless on one target and a complete miss on another — "small" is only meaningful relative to the target's own size.
* **Assuming grounding accuracy is uniform across an interface.** Real interfaces mix large buttons with small icons and dense toolbars; a single accuracy number for "click success" hides which elements are actually at risk.
* **Confusing a grounding failure with a planning failure.** The agent may have correctly decided to click the close icon and still miss it purely on the pixel-targeting step — the two are separate sources of error.

## Quick check

<details><summary>1. Why does a 15-pixel click error hit the button but miss the icon in the worked example?</summary>
The button's half-size (60×20) comfortably exceeds the 12×9 error in both directions, while the icon's half-size (8×8) is smaller than the 12-pixel horizontal error — the same absolute error is well within one target's margin and outside the other's.
</details>

<details><summary>2. What is grounding, in this context?</summary>
The step of mapping an intended or described target into an actual pixel coordinate to click, based on perceiving the screen rather than reading a structured representation like a DOM.
</details>

<details><summary>3. Why do computer-use agents need grounding at all, when web-browsing agents often don't?</summary>
Computer-use agents generally lack a DOM or accessibility tree for the application they're controlling, so there's no stable identity to target directly — the only information available is the pixels of a screenshot.
</details>

## Key terms

* **Grounding:** mapping a described or inferred target onto an actual pixel coordinate to act on.
* **Hit test:** checking whether a predicted click falls within a target's bounding box.
* **Click error:** the distance between a predicted click location and the target's true center.

## Related

[[Web-Browsing Agents]] · [[Deep Learning Across Modalities]] · [[Hybrid Code-and-GUI Action Spaces]]
