One agent can only hold one line of thought at a time. Splitting a task across several agents — each specialized, each potentially working in parallel — can get more done, but only if they're coordinated well enough that the pieces actually fit back together. This district is about the concrete patterns for wiring several agents together, and the specific ways that wiring can fail.

Topics on this stretch of the road:

* [[Supervisor/Orchestrator Patterns]]: one agent that routes work to specialists and never lets them talk to each other directly.
* [[Pipeline and Sequential Handoff]]: a fixed chain of agents, each one handing its output to the next.
* [[Swarm and Peer-to-Peer Coordination]]: agents that coordinate directly through shared state, with no central router.
* [[Debate and Adversarial Multi-Agent Setups]]: agents arguing opposite sides of a question to surface a better answer than either alone.
* [[Role Specialization in Agent Teams]]: giving each agent in a team a distinct job, instead of running identical copies of the same prompt.
* [[Coordination Failures and Deadlock]]: the specific ways a multi-agent system gets stuck, talks past itself, or duplicates work.
