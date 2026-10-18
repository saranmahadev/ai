Every planet before this one covered a model answering one request at a time: a prompt goes in, an answer comes out. An agent is different — it's a model given a goal, a loop, and a way to act on the world, which keeps calling itself (and its tools) until the goal is actually done, or it gives up. This planet is about everything that loop needs: planning what to do, using tools reliably, remembering across steps, coordinating with other agents, checking its own work, and being safe to actually run unsupervised.

**You need:** [[Agents and Environments]], [[Structured Output and Tool-Calling APIs]], [[Prompting and In-Context Learning]].

The road through Agents:

* [[Foundations of Agentic Systems]] — what actually turns a single model call into an agent, and what that buys you.
* [[Workflow Patterns Before Autonomy]] — structured, predictable patterns that solve most tasks before you need a fully autonomous loop.
* [[Planning and Task Decomposition]] — breaking a goal into steps, and re-planning when a step doesn't go as expected.
* [[Tool Use and Function Calling]] — picking, calling and trusting the right tool, reliably, at scale.
* [[Memory and State Management]] — what an agent remembers across steps, and what it has to let go of.
* [[Multi-Agent Systems]] — when one agent becomes several, and how they actually coordinate.
* [[Reflection and Self-Improvement]] — an agent checking and correcting its own work, without retraining.
* [[Agent Environments and Action Spaces]] — the browsers, terminals, codebases and simulations an agent actually acts inside.
* [[Evaluating Agents]] — measuring whether an agent actually finished the job, and at what cost.
* [[Agent Safety and Governance]] — how much autonomy is safe to grant, and what has to contain the rest.
* [[Agents in Practice]] — running an agent in production, ending in a capstone that traces one goal from decomposition to a verified result.
