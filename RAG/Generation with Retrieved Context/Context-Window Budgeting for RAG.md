Retrieved chunks don't get the entire context window to themselves — a running conversation's own history is sitting in there too, and the two are competing for the exact same limited space. The longer a conversation runs, the less room is left for the chunks retrieval just worked to find.

**You need:** [[Multi-Turn Conversation State and Memory]], [[Cost and Latency of LLM APIs]].

## The question it answers

"How many retrieved chunks actually fit once the rest of the context is accounted for?" A fixed context-window budget has to be split between conversation history (which grows as a chat continues, exactly as [[Multi-Turn Conversation State and Memory]] already covers) and newly retrieved chunks. Whatever conversation history claims first, chunk budget has to come out of what's left — there's no separate pool for each.

## Intuition

Packing a suitcase with a fixed size for both a trip's clothes and the souvenirs bought along the way means the more clothes already packed, the fewer souvenirs fit by the time you're deciding what else to bring home — the suitcase doesn't grow just because there's more to put in it.

## Definition and notation

```text
chunks_that_fit = max(0, floor((budget − conversation_tokens) / tokens_per_chunk))
```

## A worked example

A 2,000-token context budget, 150 tokens per retrieved chunk, at three points in a growing conversation:

```text
conversation history   200 tokens  →  12 chunks fit
conversation history   800 tokens  →   8 chunks fit
conversation history 1,500 tokens  →   3 chunks fit
```

As the conversation grows from 200 to 1,500 tokens — nearly the whole budget — the number of retrieved chunks that still fit drops from 12 down to just 3. By the time conversation history alone approaches the full budget, there's barely any room left for retrieval to contribute anything at all.

## Bench

```bench
id: context-budget-tradeoff
title: Conversation history and retrieved chunks compete for the same space
fallback: Slide conversation history length and watch how many retrieved chunks still fit in a fixed context budget.
```

**Try this**

1. Start with a short conversation and note how many chunks fit.
2. Slide conversation length up toward the budget's limit and watch the chunk count collapse.
3. Imagine a long-running support chat — at what point does retrieval stop being able to contribute meaningfully?

**What you should notice:** this isn't a RAG-specific problem invented from scratch — it's the same fixed-budget trade-off [[Multi-Turn Conversation State and Memory]] already covers for conversation history alone, with retrieved chunks now added as a second claimant on the same space.

## Where it appears in AI

* **This directly extends [[Multi-Turn Conversation State and Memory]]'s token-growth problem**, adding retrieved chunks as a second consumer of the same fixed budget conversation history was already competing for.
* **[[Context Window Extension Techniques]] (longer context windows) is one way to relax this trade-off**, though [[Context Rot and Lost-in-the-Middle Effects]] shows a bigger window doesn't automatically mean every chunk inside it gets used equally well.
* **A tighter budget makes [[Re-Ranking Retrieved Results]]'s shortlist size an even more consequential choice** — when only a handful of chunks fit at all, which ones make that handful matters more.

## Common pitfalls

* **Treating the context budget as infinite because "the context window is huge now."** Even a large window has a limit, and conversation history alone can consume a meaningful fraction of it in a long-running chat.
* **Summarizing conversation history to free up room without considering what gets lost.** The same trade-off [[Multi-Turn Conversation State and Memory]] covers (summarization saves tokens but drops detail) applies doubly here, since the freed room goes toward chunks instead of more conversation detail.
* **Keeping chunk count fixed regardless of conversation length, and silently truncating something else when the budget runs out.** Without an explicit allocation rule, running out of room can cut off conversation history, a retrieved chunk, or even part of the question itself in unpredictable ways.

## Quick check

<details><summary>1. In the worked example, why does the number of chunks that fit drop so sharply as conversation history grows?</summary>
The chunk budget is whatever's left over after conversation history's share is subtracted from the fixed total — as conversation history claims more of that fixed total, proportionally less remains for chunks, each of which still costs the same 150 tokens.
</details>

<details><summary>2. Does a larger context window eliminate this trade-off entirely?</summary>
It relaxes it by raising the total budget, but doesn't eliminate it — conversation history can still grow to consume a large fraction of any fixed window, and a bigger window introduces its own lost-in-the-middle risk for whatever does fit.
</details>

<details><summary>3. What are the two things competing for the same context-window budget in this topic?</summary>
Conversation history (the accumulated prior turns of the chat) and newly retrieved chunks (the context fetched for the current question) — both need space from the same fixed total.
</details>

## Key terms

* **Context budget:** the fixed total token capacity available for a single request's prompt.
* **Token allocation:** how a fixed budget is divided between competing consumers (conversation history, retrieved chunks).
* **Budget collapse:** the point at which growing conversation history leaves too little room for retrieved content to contribute meaningfully.

## Related

[[Multi-Turn Conversation State and Memory]] · [[Context Window Extension Techniques]] · [[Re-Ranking Retrieved Results]]
