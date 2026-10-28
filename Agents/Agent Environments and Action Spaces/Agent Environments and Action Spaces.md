What an agent can actually do depends entirely on what it's acting inside — clicking around a web page needs a different action space than running shell commands in a terminal. This section covers the concrete environments agents operate in today, and how each one shapes the actions available.

Topics in this section:

* [[Web-Browsing Agents]]: acting on a live web page by clicking, typing and navigating.
* [[Computer-Use Agents and GUI Grounding]]: acting on a full desktop, and the specific problem of mapping an intended click onto real screen coordinates.
* [[Code-Execution Agents]]: writing and running code as the primary way of getting something done.
* [[Hybrid Code-and-GUI Action Spaces]]: an agent that can both click through an interface and write code, choosing whichever fits the step.
* [[Simulated and Game Environments]]: testing and training agents in a world built specifically to be safe to fail in.
* [[Action-Space Design and Its Failure Modes]]: how the specific set of actions an agent is given shapes what it tends to get wrong.
