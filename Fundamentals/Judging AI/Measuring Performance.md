To judge an AI system you have to **count its hits, misses and false alarms**, not just its overall accuracy. When the thing you are looking for is rare, a system that does nothing at all can score 99% accuracy while catching none of it.

**You need:** [[Types of Tasks]] and [[Training vs Inference]].

## The question it answers

"It is 99% accurate" sounds like a guarantee. What does it actually tell you, and what does it hide?

## Intuition: four kinds of outcome

Imagine a detector that flags cases as "real" or "not real". Each case ends in one of four ways:

| | Truly real | Truly not real |
| --- | --- | --- |
| **Flagged** | **True positive**: a hit | **False positive**: a false alarm |
| **Not flagged** | **False negative**: a miss | **True negative**: correctly ignored |

This table is called a **confusion matrix**. Three numbers come from it:

```text
accuracy  = (hits + correct ignores) / all cases      how often it is right overall
recall    = hits / (hits + misses)                    how many real cases it catches
precision = hits / (hits + false alarms)              how many of its alarms are real
```

They answer different questions, and the right one depends on what the mistakes cost. A cancer screening test wants high recall (do not miss real cases). A spam filter wants high precision (do not bury real mail).

## A worked example: 10,000 cases, 1% real

100 cases are real and 9,900 are not. Compare three detectors:

| Detector | Hits | Misses | False alarms | Accuracy | Recall | Precision |
| --- | --- | --- | --- | --- | --- | --- |
| **Lazy**: always says "no" | 0 | 100 | 0 | **99%** | 0% | n/a |
| **Careful**: catches 80%, 5% false alarms | 80 | 20 | 495 | 94.9% | 80% | 13.9% |
| **Jumpy**: catches 95%, 20% false alarms | 95 | 5 | 1,980 | 80.2% | 95% | 4.6% |

By accuracy, the lazy detector wins and the careful one looks worse. But the lazy detector is useless, since it finds nothing, and the careful one finds four in five real cases.

Notice the careful detector's **precision of 13.9%**: most of its alarms are false. That is the same effect as in [[Bayes Theorem]], where a good test on a rare condition still produces mostly false alarms. The rarer the real cases, the worse precision gets.

If the real cases were common (50%), the same careful detector would have an accuracy of 87.5% and a precision of 94%, while the lazy detector would score 50%, and accuracy would be a fair guide again.

## Bench

```bench
id: accuracy-trap
title: The 99% accurate system that catches nothing
fallback: Ten thousand cases with an adjustable share of real ones. Three detectors (lazy, careful, jumpy) are compared on accuracy, recall and precision, with bars for the chosen detector.
```

**Try this**

1. Start at 1% real cases. Which detector has the highest accuracy? Which has the highest recall?
2. Slide the share of real cases up towards 50%. When does the lazy detector stop looking good?
3. Watch the careful detector's precision as the real cases get rarer. Why does it fall?
4. Choose the jumpy detector. In what situation would you still prefer it?

**What you should notice:** accuracy rewards the majority. Whenever one outcome is rare, you must look at recall and precision as well, and decide which mistake costs more.

## Where it appears in AI

These measures return in [[Machine Learning]] with more detail (thresholds, curves, and more careful measures) and they matter for every deployed classifier. They also link to [[Generalization]]: you should measure on cases the system has never seen.

## Common pitfalls

* **Trusting accuracy on lopsided data.** Rare fraud, disease or defects are where it misleads most.
* **Treating all errors alike.** A missed fraud and a blocked honest customer have different costs.
* **Measuring on the training data.** That flatters the system (see [[Generalization]]).
* **Quoting one number.** Accuracy, recall and precision together tell the story.

## Quick check

<details><summary>1. A detector flags 50 cases; 30 are real. What is its precision?</summary>
30 ÷ 50 = 60%.
</details>

<details><summary>2. There are 200 real cases and the detector catches 150. What is its recall?</summary>
150 ÷ 200 = 75%.
</details>

<details><summary>3. Why can a useless system have high accuracy?</summary>
If nearly every case belongs to one class, always predicting that class is right almost every time, though it never finds the rare cases that matter.
</details>

## Key terms

* **Confusion matrix:** the table of hits, misses, false alarms and correct ignores.
* **Accuracy:** the share of all cases handled correctly.
* **Recall:** the share of real cases the system catches.
* **Precision:** the share of the system's alarms that are real.
* **Base rate:** how common the thing you are looking for is.

## Related

[[Types of Tasks]] · [[Training vs Inference]] · [[Generalization]] · [[Bayes Theorem]] · [[Machine Learning]]
