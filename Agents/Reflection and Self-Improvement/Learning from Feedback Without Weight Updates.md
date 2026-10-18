An agent that gets told "that approach was wrong, try this instead" and then keeps making the identical mistake on the next attempt hasn't actually used the feedback it was given. One that folds the correction into what it already knows — without anyone touching its weights — gets the next attempt right, and every attempt after that.

**You need:** [[Prompting and In-Context Learning]].

## The question it answers

"How does an agent change its behavior mid-run, with no training step involved?" An agent's weights are fixed once it's deployed — nothing about this run updates them. But its *behavior* can still change within that run, because its context window can carry what it's already observed: a correction, a failed attempt, an example of what worked. Folding feedback into context this way is exactly the in-context learning already covered on the Generative AI planet, applied here specifically to an agent incorporating its own feedback across repeated attempts at the same task.

## Intuition

Someone told "that's the wrong formula, use this one instead" doesn't need brain surgery to use the correction on their very next attempt — they just remember what they were told and apply it. An agent that reads its own prior feedback back into its next prompt is doing the same thing: carrying a correction forward without anything underneath it being retrained.

## Definition and notation

```text
without feedback carried forward:  every attempt repeats the same mistake
with feedback carried forward:     attempt 1 fails (no feedback exists yet)
                                    every attempt after the correction is appended succeeds
```

## A worked example

Five attempts at the same task, compared with and without the previous attempt's feedback folded into the next prompt:

```text
without feedback: ✗ ✗ ✗ ✗ ✗     (0 of 5 correct — the same mistake repeats every time)
with feedback:     ✗ ✓ ✓ ✓ ✓     (4 of 5 correct — attempt 1 fails, then the correction sticks)
```

Attempt 1 fails in both cases — there's no feedback yet for either agent to use. The difference is everything after that: without feedback carried forward, attempts 2 through 5 repeat the exact same mistake attempt 1 made, because nothing informed them otherwise. With the correction appended to context after attempt 1, every later attempt starts from a prompt that already contains what went wrong — and gets it right.

## Bench

```bench
id: feedback-without-weights
title: Repeating the mistake, or learning from it mid-run
fallback: Compare five attempts at a task with and without the previous attempt's feedback carried into the next one's context.
```

**Try this**

1. Look at the "no feedback carried forward" mode and notice every attempt fails identically.
2. Switch to "feedback appended to context" and see attempts 2 through 5 succeed.
3. Imagine a task where the first attempt's mistake was actually a lucky guess that happened to look wrong — would appending that "feedback" help or hurt attempt 2?

**What you should notice:** nothing about the model's weights changed between the two modes — the entire difference comes from what's sitting in the context window when the next attempt starts.

## Where it appears in AI

* **This is exactly [[Prompting and In-Context Learning|in-context learning]], already covered on the Generative AI planet** — what's new here is using it specifically to carry an agent's own feedback forward across repeated attempts at one task, rather than across unrelated few-shot examples.
* **[[Episodic Memory and Experience Logs]], covered earlier, is the longer-horizon version of the same idea** — carrying a lesson forward across many separate task instances rather than across attempts within one run.
* **This is the mechanism underneath [[Self-Critique Loops in Agents|self-critique]] and [[Verifier-Guided Agent Loops|verifier-guided loops]]**: once a mistake is detected, folding it into context is how the next attempt actually changes.

## Common pitfalls

* **Expecting a correction to help if it's never actually read back into the next prompt.** The worked example's gain only exists because attempt 2 onward includes attempt 1's feedback — a correction generated but never carried forward changes nothing.
* **Treating in-context behavior change as if it were permanent learning.** Nothing here updates any weights — the moment this run's context is gone (a new session, a cleared context window), the lesson is gone with it, and the next run starts from the same mistake all over again.
* **Assuming every piece of feedback is equally useful once appended.** Vague or incorrect feedback appended to context can mislead the next attempt just as easily as accurate feedback can correct it — the mechanism works in either direction.

## Quick check

<details><summary>1. Why does attempt 1 fail in both the "with feedback" and "without feedback" modes in the worked example?</summary>
There's no feedback from a prior attempt yet for either mode to use — the first attempt always starts from the same place.
</details>

<details><summary>2. What's actually different between the two agents in the worked example — their weights, or something else?</summary>
Nothing about their weights differs; the only difference is what's included in the context window for attempts 2 through 5, specifically whether it contains the correction from attempt 1.
</details>

<details><summary>3. Does this kind of behavior change survive into a new, separate run with a fresh context window?</summary>
No — because nothing was actually learned at the weight level, a new run with no memory of the previous context starts from the same mistake again, unless the feedback is carried forward some other way (such as the longer-horizon memory mechanisms covered elsewhere on this road).
</details>

## Key terms

* **In-context learning:** a model's behavior changing based on what's included in its current context, with no weight updates involved.
* **Feedback carried forward:** appending the result or correction from one attempt into the prompt for the next.
* **Weight update:** a change to a model's trained parameters — explicitly absent from everything in this topic.

## Related

[[Prompting and In-Context Learning]] · [[Episodic Memory and Experience Logs]] · [[Verifier-Guided Agent Loops]]
