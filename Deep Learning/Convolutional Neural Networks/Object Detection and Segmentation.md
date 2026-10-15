Plain image classification answers one question per image: "what is the main thing here?" **Object detection** asks a richer question — "what objects are here, and where, exactly?" — answered with a box around each one. **Segmentation** goes further still: a label for *every pixel*, so an object's exact outline, not just a box around it, is known.

**You need:** [[Receptive Fields and Depth]] and [[Filters, Feature Maps and Channels]].

## The question it answers

"Classifying a whole image tells me what's in it, but not where — how does a network localise things, not just name them?" By predicting coordinates (a box, or a per-pixel label) alongside — or instead of — a single class label for the whole image.

## Intuition: naming, boxing, and outlining

Imagine three increasingly detailed answers to "what's in this photo?": *classification* says "a dog" (one label for the whole image); *detection* says "a dog, here" and draws a rectangle around it (a label plus a location, possibly for several objects at once); *segmentation* says, for every single pixel, "this one is dog, this one is grass, this one is sky" — the full outline, not just a box.

## Definitions

```text
bounding box:          (x1, y1, x2, y2) — the box's top-left and bottom-right corners
Intersection over Union (IoU):  how well a predicted box matches a true box

IoU = (area of overlap) / (area of union)
```

IoU is the standard way to score a predicted box against the correct one: 1.0 means a perfect match, 0 means no overlap at all. It is also used to decide, during training and evaluation, whether a predicted box counts as a correct detection of a given object.

## A worked example

Two boxes, `A = (1, 1, 5, 4)` and `B = (3, 2, 7, 5)`:

```text
overlap region:   x from max(1,3)=3 to min(5,7)=5   →  width 2
                  y from max(1,2)=2 to min(4,5)=4   →  height 2
                  overlap area = 2 × 2 = 4

area A = (5−1)(4−1) = 12        area B = (7−3)(5−2) = 12
union = 12 + 12 − 4 = 20

IoU = 4 / 20 = 0.2
```

An IoU of 0.2 is a poor match — most detection benchmarks require an IoU of 0.5 or higher to count a prediction as correct — even though the two boxes clearly overlap somewhat.

## Bench

```bench
id: iou-box
title: How well do two boxes overlap?
fallback: Two adjustable rectangles on a grid. See the overlap region highlighted, and the computed IoU, as you move either box's corners.
```

**Try this**

1. Slide the two boxes until they fully coincide and watch IoU reach 1.0.
2. Pull them apart until they no longer touch and watch IoU reach exactly 0.
3. Find roughly where IoU crosses the common 0.5 "counts as correct" threshold.

**What you should notice:** IoU drops off quickly once boxes stop being nearly identical — even boxes that clearly overlap a human eye would call "close" often score well under 0.5.

## Where it appears in AI

* **Self-driving perception, photo organisation, and medical imaging** all rely on detection or segmentation rather than plain classification, since knowing *where* something is matters as much as what it is.
* **Non-maximum suppression**, a step not covered in depth here, removes near-duplicate predicted boxes for the same object, using IoU to decide which overlap enough to be "the same" detection.
* **Segmentation models** typically reuse a classification backbone's convolutional layers (see [[CNN Architectures: From LeNet to ResNet]]), replacing the final classification layer with one that outputs a label for every pixel.

## Common pitfalls

* **Treating a 0.5 IoU threshold as universal.** Different benchmarks and applications use different thresholds depending on how precise a match is required.
* **Confusing detection with segmentation.** A detector's output is a handful of boxes; a segmenter's output is a full-resolution map, one label per pixel.
* **Forgetting IoU only scores one predicted box against one true box.** A real image can have many objects, and matching predictions to the right ground-truth boxes is a separate step.

## Quick check

<details><summary>1. What extra information does object detection provide beyond plain classification?</summary>
The location (a bounding box) of each detected object, not just a single label for the whole image.
</details>

<details><summary>2. In the worked example, why is the union area 20 and not 24 (12 + 12)?</summary>
The overlap area of 4 is counted once in each box's area, so it must be subtracted once to avoid double-counting it in the union.
</details>

<details><summary>3. What does segmentation provide that detection does not?</summary>
A label for every individual pixel, giving an object's exact outline rather than just a rectangular box around it.
</details>

## Key terms

* **Bounding box:** a rectangle, usually given by two corner coordinates, marking where a detected object is.
* **Intersection over Union (IoU):** the overlap area between two boxes divided by their combined (union) area.
* **Segmentation:** labelling every pixel of an image, rather than the image as a whole.

## Related

[[Receptive Fields and Depth]] · [[Filters, Feature Maps and Channels]] · [[CNN Architectures: From LeNet to ResNet]] · [[Image Classification End to End]]
