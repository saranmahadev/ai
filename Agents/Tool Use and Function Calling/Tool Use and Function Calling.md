Calling one tool correctly is a solved problem, already covered on the LLMs planet. An agent calling from a toolbox of fifty tools, across dozens of steps, with some of those calls failing or returning something unexpected, is a different and harder problem — this district is about keeping that reliable at scale.

Topics on this stretch of the road:

* [[Tool Selection Among Many Candidates]]: picking the right tool out of a large toolbox, not just the right arguments for one.
* [[Parallel vs. Sequential Tool Calls]]: when an agent can fire off several tool calls at once, and when one call has to wait for another's result.
* [[Handling Tool Errors and Retries]]: what an agent does when a tool call fails, times out, or returns garbage.
* [[Tool Result Verification]]: checking a tool's output before trusting it, instead of feeding it straight into the next step.
* [[Designing Tools for Agent Reliability]]: what makes a tool's interface easy for an agent to use correctly, versus one it keeps misusing.
* [[Code as a Tool-Calling Interface]]: writing and running a snippet of code as the action itself, instead of calling one fixed tool at a time.
