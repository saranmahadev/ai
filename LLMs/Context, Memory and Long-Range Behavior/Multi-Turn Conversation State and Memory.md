A conversation isn't one request — it's many, each one needing the context of everything said before. The naive way to handle that, replaying the entire conversation every single turn, runs straight into both the [[Long-Context Transformers|compute cost]] and the [[Context Rot and Lost-in-the-Middle Effects|retrieval reliability]] problems already covered, except now they get worse with every single message.

**You need:** [[Context Rot and Lost-in-the-Middle Effects]].

## The question it answers

"How do you keep a long conversation coherent without the context growing forever?" The simplest approach, **full replay**, resends the entire conversation history with every new turn — context length (and cost) grows linearly, without bound, as the conversation continues. **Summarization-based memory** instead periodically compresses older turns into a bounded summary, keeping only the summary plus the most recent turns in full — trading some detail from older turns for a context size that stops growing.

## Intuition

Replaying a conversation's full transcript every single time you want to respond is like re-reading an entire group chat from message one before typing every new reply — technically possible, but the amount you have to re-read just keeps growing, turn after turn, forever. Keeping a running mental summary of "here's roughly what's been discussed so far" plus the last few messages verbatim is how people actually manage long conversations — bounded effort per turn, at the cost of losing some of the fine detail from early on.

## Definition and notation

```text
full replay: context size at turn t = t × tokens_per_turn
  → grows linearly, without bound

summarized: context size at turn t = min(t × tokens_per_turn,
                                           summary_budget + tokens_per_turn)
  → grows linearly at first, then stays flat once the summary
    budget plus one turn's worth of tokens is reached
```

## A worked example

Token cost at several points in a growing conversation, at 150 tokens per turn and a 500-token summary budget:

```text
turn  1:  full replay 150 tokens     summarized ~150 tokens
turn  5:  full replay 750 tokens     summarized ~650 tokens
turn 10:  full replay 1,500 tokens   summarized ~650 tokens
turn 20:  full replay 3,000 tokens   summarized ~650 tokens
turn 40:  full replay 6,000 tokens   summarized ~650 tokens
```

Full replay's token cost keeps climbing without limit — by turn 40, it's 6,000 tokens and still growing with every message. The summarized approach caps out at 650 tokens (the summary budget plus one turn) by around turn 5, and stays there no matter how much longer the conversation continues.

## Bench

```bench
id: conversation-memory-cost
title: One grows forever, one doesn't
fallback: Slide through turn numbers and compare full-history replay's token cost against a bounded, summarized approach's.
```

**Try this**

1. Compare the two approaches' token cost at an early turn.
2. Move to a later turn and watch the gap widen.
3. Notice where the summarized line flattens out and stays flat.

**What you should notice:** the summarized approach isn't cheaper from the very first turn — it only pulls ahead once the conversation gets long enough that full replay's unbounded growth starts to matter.

## Where it appears in AI

* **Production chat systems routinely use some form of summarization or sliding-window truncation** once a conversation grows past a manageable size, precisely to avoid both [[Long-Context Transformers|unbounded compute cost]] and [[Context Rot and Lost-in-the-Middle Effects|degraded retrieval reliability]] from an ever-growing context.
* **Summarization necessarily loses information** — older turns are compressed, not preserved verbatim, so a detail from early in a very long conversation may no longer be recoverable from the summary alone.
* **This is a different concern from [[KV-Cache Reuse Across Sessions|KV-cache reuse]]**: caching avoids recomputing a prefix that's already been seen; summarization avoids ever having to *include* the full prefix in the first place.

## Common pitfalls

* **Assuming summarization has no cost.** Compressing older turns can lose exactly the kind of specific detail that later becomes relevant again — the trade-off is real, not free.
* **Expecting full replay to be impractical from turn one.** As the worked example shows, it's perfectly fine (and even cheaper) for short conversations — the problem is specifically its unbounded growth over a long conversation.
* **Confusing conversation memory with [[KV-Cache Reuse Across Sessions|cross-session KV-cache reuse]].** One is about how much context content gets included at all; the other is about whether already-seen content's computation can be skipped — they solve different parts of the same broader cost problem.

## Quick check

<details><summary>1. What's the key difference in how full replay's and summarization's token cost grow with conversation length?</summary>
Full replay's token cost grows linearly without bound as the conversation continues; summarization's token cost grows at first but then flattens out once it reaches the summary budget plus one turn's worth of tokens.
</details>

<details><summary>2. In the worked example, at roughly what point did summarization's token cost stop growing?</summary>
Around turn 5, where it reached about 650 tokens and stayed there for every later turn checked.
</details>

<details><summary>3. What does summarization trade away to keep context size bounded?</summary>
Fine-grained detail from older turns, which get compressed into a summary rather than kept verbatim — information not captured in the summary may no longer be recoverable.
</details>

## Key terms

* **Full replay:** resending a conversation's entire history with every new turn.
* **Summarization-based memory:** compressing older turns into a bounded summary, keeping only recent turns in full.
* **Summary budget:** the fixed token allowance set aside for a conversation's compressed history.

## Related

[[Context Rot and Lost-in-the-Middle Effects]] · [[KV-Cache Reuse Across Sessions]] · [[Long-Context Transformers]]
