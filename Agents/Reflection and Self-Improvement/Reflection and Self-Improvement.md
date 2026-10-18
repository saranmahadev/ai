An agent that never looks back at its own work repeats the same mistake at every step that triggers it. Reflection is an agent, or a second pass over the same agent's work, checking whether a step actually succeeded and correcting course — without any weights ever being updated.

Topics on this stretch of the road:

* [[Self-Critique Loops in Agents]]: an agent generating a critique of its own last action, and using that critique to decide what to do next.
* [[Error Attribution Across a Trajectory]]: figuring out which step in a long chain of actions actually caused a failure that only showed up later.
* [[Learning from Feedback Without Weight Updates]]: an agent's behavior changing within a single run, purely from what it's observed so far, with no training step involved.
* [[Verifier-Guided Agent Loops]]: a separate checker that scores each step, steering the agent toward the steps that check out.
