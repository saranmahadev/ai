Scoring a single generated answer is one problem; scoring a hundred-step trajectory of actions, any one of which could be the reason the whole task failed, is a different and harder one. This section covers measuring whether an agent actually finished the job, how it got there, and at what cost.

Topics in this section:

* [[Agent Benchmarks and Task Suites]]: the standardized tasks (browsing, coding, tool use) agents get measured against.
* [[Success-Rate Metrics and Their Blind Spots]]: what a simple pass/fail rate hides about how an agent actually performed.
* [[Trajectory-Level Evaluation]]: scoring the whole sequence of actions an agent took, not just whether the final answer was right.
* [[LLM-as-Judge for Agent Trajectories]]: using a model to read and score an agent's full run, not just its final output.
* [[Cost and Reliability as Joint Metrics]]: why an agent's success rate alone doesn't say whether it's actually worth deploying.
