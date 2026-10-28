Not every multi-step task needs a fully autonomous agent deciding what to do next. A fixed sequence of LLM calls, wired together by code the developer controls, solves most well-defined tasks more predictably and more cheaply than letting a model improvise the whole plan. This section covers those structured patterns, which stay the right choice right up until a task is genuinely open-ended.

Topics in this section:

* [[Prompt Chaining]]: splitting one task into a fixed sequence of smaller LLM calls.
* [[Routing Between Specialized Prompts]]: sending a request to whichever of several specialized prompts actually fits it.
* [[Parallelization: Sectioning and Voting]]: running several LLM calls at once, either on different pieces of a task or on the same piece for a better answer.
* [[Orchestrator-Workers]]: one call that plans the work, several calls that do it, and one call that combines the results.
* [[Evaluator-Optimizer Loops]]: one call that produces an answer, another that critiques it, looping until the critique is satisfied.
