An agent running for hundreds of steps can't keep everything it's ever seen in its context window — and some of what it learns along the way needs to survive past the current run entirely. This section is about what an agent actually keeps, for how long, and how it finds the right piece of it again later.

Topics in this section:

* [[Short-Term vs. Long-Term Agent Memory]]: what lives only in the current run's context, and what's meant to persist across runs entirely.
* [[Episodic Memory and Experience Logs]]: recording what an agent actually did and what happened, as a resource for later.
* [[Memory Retrieval as Agent-Time RAG]]: pulling the right remembered fact back out of a large memory store, mid-task.
* [[Memory Compression and Forgetting]]: what has to be summarized or dropped once memory itself grows too large to use directly.
* [[Shared State Across a Multi-Step Task]]: the working state a single long task keeps passing from one step to the next.
