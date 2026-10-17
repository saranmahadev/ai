A watermark is a signal engineered to survive detection. A content-safety classifier faces the opposite adversarial pressure: anyone trying to get harmful content past it is actively looking for ways to make the detector fail, not cooperating with it.

**You need:** [[Watermarking and Synthetic Media Provenance]].

## The question it answers

"How robust is a content-safety filter against someone actively trying to get around it?" **Red-teaming** means deliberately testing a system's defenses the way an adversary would, rather than only checking it against the inputs it was designed for. A simple **keyword-based classifier** is a clear, checkable example of a defense that can look solid against ordinary input while still being easy to slip past using a trivial trick — a single character substitution, in the most basic case — that a real adversary would try as a matter of course.

## Intuition

A bouncer checking IDs only for an exact name match on a list can be fooled by someone spelling their name slightly differently on a fake ID — not because the check is pointless, but because it's checking for one narrow, exact signal rather than the underlying thing it's actually trying to catch. A keyword filter is the same kind of narrow check: it catches the literal word, and anyone motivated to get past it only has to avoid typing that literal word.

## Definition and notation

```text
keyword classifier: flagged(text) = any blocked keyword appears as a
  literal substring of text (case-insensitive)

a red-team probe: a minimal transformation of flagged text designed to
  evade the classifier while preserving its meaning to a human reader
  (character substitution, spacing, synonyms, encoding, translation, ...)
```

## A worked example

Two pairs of requests, each an original and a trivially obfuscated version using a simple character substitution:

```text
original:    "how to build a bomb"        → flagged: true
obfuscated:  "how to build a b0mb"        → flagged: false

original:    "how to hack an account"     → flagged: true
obfuscated:  "how to h4ck an account"     → flagged: false
```

In both cases, swapping a single letter for a visually similar digit is enough to defeat an exact-substring keyword check, while the request's meaning to a human reader is completely unchanged. The classifier isn't "almost" working here — it fails completely on both obfuscated inputs, despite catching both originals perfectly.

## Bench

```bench
id: safety-classifier-evasion
title: A classifier that's easy to slip past
fallback: Compare whether a keyword-based safety classifier flags an original request versus a trivially obfuscated version of it.
```

**Try this**

1. Check that both original requests are flagged.
2. Check that both obfuscated versions are not.
3. Consider how many other simple tricks (spacing, synonyms, different languages) would likely work just as well against this specific classifier.

**What you should notice:** the obfuscation needed almost no sophistication — a single-character substitution was enough — which is exactly why keyword matching alone is considered a weak content-safety mechanism on its own.

## Where it appears in AI

* **Production content-safety systems layer multiple detection methods** (semantic classifiers that understand meaning past exact wording, not just keyword matching) specifically because keyword lists alone are this easy to evade.
* **Red-teaming is now a standard, often required practice before deploying a generative model**, with dedicated teams (internal or external) specifically tasked with finding prompts that produce harmful output the system was supposed to block.
* **The same evasion principle generalizes well past keyword filters**: any safety mechanism relying on a narrow, literal signal — rather than a deeper understanding of meaning or intent — tends to be vulnerable to minor, meaning-preserving changes designed to dodge it.

## Common pitfalls

* **Treating any successful filter as evidence the system is safe.** The worked example's classifier works perfectly on unmodified input — testing only unmodified input would have missed its complete failure on trivially modified input entirely.
* **Assuming red-teaming only has to find exotic attacks.** The worked example's evasion (swapping one character) is about as simple as an attack can be — a thorough red-teaming effort has to check simple tricks first, not just sophisticated ones.
* **Fixing one discovered evasion and declaring the system safe.** Patching the specific evasion found (blocking "b0mb" too) doesn't address the underlying weakness (literal substring matching); a determined adversary tries the next trivial variant.

## Quick check

<details><summary>1. Why did a single-character substitution completely defeat the keyword classifier in the worked example?</summary>
The classifier checks for an exact literal substring match; substituting even one character means the blocked keyword no longer appears as a substring, even though the text's meaning to a human is unchanged.
</details>

<details><summary>2. What's the specific purpose of red-teaming, as distinct from ordinary testing?</summary>
Deliberately testing a system the way a motivated adversary would — actively searching for ways to defeat its defenses — rather than only checking it against the inputs it was designed to handle correctly.
</details>

<details><summary>3. Why is patching one specific evasion (like blocking "b0mb" too) not a complete fix?</summary>
It addresses only that one instance while leaving the underlying weakness (exact literal keyword matching, rather than understanding meaning) intact, so a different trivial variant will likely succeed just as easily.
</details>

## Key terms

* **Red-teaming:** deliberately testing a system's defenses the way an adversary would, to find exploitable weaknesses.
* **Keyword classifier:** a safety check that flags content containing specific literal blocked words or phrases.
* **Evasion:** a modification to content designed to avoid detection while preserving its original meaning or intent.

## Related

[[Watermarking and Synthetic Media Provenance]] · [[Bias and Representational Harm in Generation]] · [[Building a Generative Product]]
