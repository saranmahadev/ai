Retrieval is a search over documents, and search has always needed access control — a public user's question shouldn't be able to pull an internal finance document into its retrieved context, however relevant that document's content happens to be to the question asked. Relevance and permission are two entirely separate checks, and retrieval has no reason to respect the second one unless it's explicitly told to.

**You need:** [[Metadata Filtering and Hybrid Indexes]], [[Adversarial and Jailbreak Evaluation]].

## The question it answers

"What does retrieval add to the list of ways a system can leak data it shouldn't?" Retrieval searches across a whole document collection by similarity — and similarity alone has no concept of who's allowed to see what. Without an explicit permission check applied as a filter (the same [[Metadata Filtering and Hybrid Indexes|pre-filtering mechanism]] already covered for freshness and other metadata), a sufficiently relevant internal document can end up in a public user's retrieved context, and from there, potentially in the generated answer itself.

## Intuition

A library's card catalog that ranks books purely by subject relevance, with no concept of which books are in the restricted archive, would just as happily point a general patron toward a sealed, access-controlled document as toward a public one — unless the catalog is specifically told to check access rights before returning anything at all.

## Definition and notation

```text
unfiltered retrieval:     ranks by similarity alone, permissions irrelevant to the ranking
permission-filtered:      only chunks matching the requesting user's roles are ever retrievable
```

## A worked example

Three chunks, one restricted to the finance team, retrieved for a public user's query:

```text
[public]       "Public FAQ: shipping takes 3-5 days."
[finance-team] "Internal: Q3 revenue was $4.2M."
[public]       "Public FAQ: refunds in 5 days."

unfiltered top-3: all three chunks returned, including the finance-team-only one
permission-filtered for a public user: only the two [public] chunks returned
```

Without a permission filter, the internal revenue figure sits right alongside the two public FAQ entries in the retrieved results, with nothing distinguishing it except metadata the system never actually checked. With filtering applied before retrieval returns anything, the restricted chunk never reaches this user's results at all.

## Bench

```bench
id: permission-filtered-retrieval
title: Relevant isn't the same as allowed
fallback: Toggle permission filtering and watch an internal, restricted chunk disappear from a public user's results.
```

**Try this**

1. Look at the unfiltered results and note the internal chunk is present.
2. Turn on permission filtering and watch it disappear.
3. Imagine a query specifically crafted to be unusually similar to the internal document's wording — would that make the leak more or less likely without filtering?

**What you should notice:** the restricted chunk's presence in unfiltered results has nothing to do with how relevant it is to the query — it's present simply because nothing checked whether this user was allowed to see it at all.

## Where it appears in AI

* **This reuses the exact pre-filtering mechanism from [[Metadata Filtering and Hybrid Indexes]]**, applied to access control instead of freshness or any other metadata dimension.
* **A retrieved document can also carry a second kind of risk**: a malicious or compromised document instructing the generating model to ignore its instructions — a retrieval-specific variant of the prompt-injection risks [[Adversarial and Jailbreak Evaluation]] already covers for direct user input.
* **[[Guardrails and Deployment-Time Safety Filters]] covers filtering a model's output independently of retrieval** — permission filtering at retrieval time and output guardrails are complementary layers, neither a substitute for the other.

## Common pitfalls

* **Assuming a model won't repeat sensitive content it was never supposed to see, even if it is retrieved.** Once something is in the model's context, nothing stops it from surfacing in the generated answer — the only reliable fix is keeping it out of the context in the first place.
* **Filtering by permission only at the final output stage, after retrieval already happened.** By the time an output filter runs, the sensitive content has already been processed by the model — pre-filtering at retrieval time (as the worked example shows) prevents the exposure earlier and more reliably.
* **Treating retrieved documents as inherently trustworthy instructions.** A document injected into a collection (deliberately or not) that contains text resembling an instruction can attempt to redirect the generating model, the same prompt-injection risk that applies to any untrusted text reaching a model's context.

## Quick check

<details><summary>1. In the worked example, why does the finance-team-only chunk appear in unfiltered results at all?</summary>
Unfiltered retrieval ranks purely by similarity to the query, with no check on who's allowed to see each chunk — the internal chunk's content happens to be relevant enough to rank among the top results regardless of permissions.
</details>

<details><summary>2. Why is filtering by permission before retrieval returns results more reliable than filtering the output afterward?</summary>
Filtering beforehand means the restricted content never enters the model's context at all; filtering only the final output still requires catching every possible way that content could leak into the generated answer, which is far less reliable than preventing exposure in the first place.
</details>

<details><summary>3. What's a retrieval-specific version of prompt injection?</summary>
A document in the retrieved collection containing text crafted to look like an instruction to the generating model, which could attempt to redirect its behavior when that document is retrieved and placed into context — a variant of the direct-input prompt-injection risk, but arriving through retrieved content instead.
</details>

## Key terms

* **Data leakage:** unauthorized content reaching a user through a system that wasn't supposed to grant them access to it.
* **Permission filtering:** restricting retrieval to only chunks a given user is authorized to see.
* **Prompt injection via retrieved content:** a retrieved document containing text designed to redirect the generating model's behavior.

## Related

[[Metadata Filtering and Hybrid Indexes]] · [[Adversarial and Jailbreak Evaluation]] · [[Guardrails and Deployment-Time Safety Filters]]
