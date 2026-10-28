"What else did the director of Movie X direct?" can't be answered by one search. The first search has to find who directed Movie X; only then does the question "what else did *that person* direct" even exist to search for. One retrieval pass physically cannot answer a question whose second half depends on the first half's answer.

**You need:** [[Anatomy of a RAG Pipeline]].

## The question it answers

"What happens when a single retrieval pass isn't enough to answer a question?" Some questions require chaining facts across documents that don't mention each other directly — no single passage says both "Movie X's director also directed Film A and Film B." **Multi-hop retrieval** runs retrieval more than once: a first search finds an intermediate fact (who directed Movie X), and a second search, using that intermediate answer as its new query, finds the fact that actually answers the original question.

## Intuition

Finding out what else your new neighbor's old roommate does for a living takes two separate lookups: first find out who the old roommate was, then look *that person* up — there's no single directory entry that already connects "your neighbor" to "their old roommate's job." Each lookup only becomes possible once the previous one's answer is in hand.

## Definition and notation

```text
single-hop:  retrieve(question) → answer, if one document directly contains it
multi-hop:   hop1 = retrieve(question)              → intermediate fact
             hop2 = retrieve(question using hop1)    → final answer
```

## A worked example

The question "What else did the director of Movie X direct?":

```text
single-hop retrieval: finds "Movie X was directed by Director Y" —
  answers "who directed Movie X," but not the actual question asked

multi-hop retrieval:
  hop 1 — retrieve: "Movie X" was directed by "Director Y"
  hop 2 — retrieve, using hop 1's answer as the new query: "Director Y" also directed "Film A" and "Film B"
```

A single retrieval pass finds the fact connecting Movie X to its director — useful, but it's not the question that was actually asked. Only the second hop, searching specifically for *Director Y's* other work using the name the first hop just supplied, reaches an answer to the original question.

## Bench

```bench
id: multi-hop-retrieval
title: The second question only exists after the first is answered
fallback: Step through a single-hop retrieval versus a two-hop chain that uses the first hop's answer to retrieve a second fact.
```

**Try this**

1. Step through hop 1 and notice it answers a different, simpler question than the one asked.
2. Step through hop 2 and see it uses hop 1's own answer as its search query.
3. Think of another two-part question that would require the same kind of chaining.

**What you should notice:** the second hop's query didn't exist until the first hop produced an answer — multi-hop retrieval isn't just "search twice," it's specifically using one search's output as the next search's input.

## Where it appears in AI

* **This is the retrieval-side counterpart to [[Tree-of-Thought and Search-Based Reasoning]] in LLMs** — both break a hard problem into intermediate steps, here applied to retrieval queries rather than reasoning steps.
* **[[Chunk Overlap and Size Trade-offs]] mentioned multi-hop retrieval as an alternative fix for a split fact** — sometimes the better answer to "this fact doesn't fit in one chunk" is to retrieve twice rather than widen overlap.
* **[[Common RAG Failure Modes]] includes "question requires combining facts from multiple documents" as a specific failure category** that single-hop retrieval, by design, can never solve.

## Common pitfalls

* **Trying to answer a genuinely multi-hop question with a single retrieval pass.** No amount of better ranking fixes this — the second half of the question doesn't exist as a search target until the first half is answered.
* **Assuming every multi-part-sounding question actually requires multiple hops.** Some questions only sound complex but are directly answered by a single passage — multi-hop retrieval's extra cost (another full retrieval round) should be reserved for questions that genuinely need it.
* **Letting errors in the first hop silently propagate.** If hop 1 retrieves the wrong director, hop 2 will confidently search for the wrong person's other films — multi-hop retrieval has no built-in way to catch a wrong intermediate answer.

## Quick check

<details><summary>1. Why can't a single retrieval pass answer "what else did the director of Movie X direct"?</summary>
No single document is likely to state both facts together; the question requires first finding who directed Movie X, then searching specifically for that person's other work — two separate facts that single-hop retrieval has no way to chain together.
</details>

<details><summary>2. What does the second hop's query consist of?</summary>
The first hop's own answer (the director's name), used as the new search query — the second hop's query literally couldn't be formed until the first hop produced a result.
</details>

<details><summary>3. What happens if the first hop retrieves an incorrect intermediate fact?</summary>
The second hop will search using that incorrect fact, likely producing a confidently wrong final answer — multi-hop retrieval has no mechanism of its own to detect or correct an error introduced at an earlier hop.
</details>

## Key terms

* **Multi-hop retrieval:** chaining multiple retrieval passes, where a later search uses an earlier search's result as its query.
* **Intermediate fact:** a piece of information retrieved not because it directly answers the question, but because it's needed to form the next search.
* **Hop:** one retrieval pass within a multi-hop chain.

## Related

[[Anatomy of a RAG Pipeline]] · [[Chunk Overlap and Size Trade-offs]] · [[Tree-of-Thought and Search-Based Reasoning]]
