A single call to a language model, however good, still just returns one response to one prompt. This section is about the specific things added on top of that single call — a loop, tools, memory, a goal that persists across steps — that turn it into something that can actually get a multi-step job done on its own.

Topics in this section:

* [[From a Single Call to a Loop]]: the one structural change that separates an agent from a chatbot.
* [[Agents vs. Assistants vs. Workflows]]: three things that get called "AI agents," and what actually tells them apart.
* [[The Augmented LLM]]: tools, memory and retrieval, bolted onto a model, as the shared building block under almost every agent.
* [[Open-Loop vs. Closed-Loop Behavior]]: whether an agent ever checks if its actions actually worked.
* [[Anatomy of an Agent Architecture]]: the pieces every agent architecture has, named consistently, before this subject looks at each one separately.
