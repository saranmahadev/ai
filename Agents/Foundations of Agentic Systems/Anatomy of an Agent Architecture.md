Every agent architecture covered in this subject, however different the application, is built from the same five named pieces: something that perceives the current request, something that remembers relevant state, something that plans, something that acts, and something that decides whether to loop again. Naming them consistently here means every later topic can refer to "the planner" or "the controller" without re-explaining what that is.

**You need:** [[The Augmented LLM]], [[Open-Loop vs. Closed-Loop Behavior]].

## The question it answers

"What are the standard named pieces of an agent architecture?" **Perceive** reads the current request and any new observations. **Memory** holds state relevant to the task, checked and updated as the agent works. **Planner** decomposes the goal into steps. **Tool executor** actually carries out a step, calling whatever tool that step requires. **Controller** checks the tool's result against the goal and decides whether to stop, continue to the next planned step, or loop back to the planner entirely.

## Intuition

A restaurant booking made by a competent personal assistant goes through the same five kinds of work every time, whoever's doing it: hearing the request, recalling any relevant preference, figuring out the steps, actually calling the restaurant, and checking whether the booking actually went through before reporting back. Naming these five parts doesn't change what the assistant does — it gives a vocabulary for talking about which part of the process something went wrong in.

## Definition and notation

```text
perceive  →  memory  →  planner  →  tool executor  →  controller  → (loop back to planner, or stop)
```

## A worked example

One request, walked through all five components:

```text
perceive:       reads "book a table for 4 at 7pm"
memory:         retrieves a stored preference, "prefers Italian food"
planner:        decomposes into: search restaurants → check availability → confirm booking
tool executor:  calls the booking tool with the restaurant, time and party size
controller:     checks the tool's result against the goal; loops back to the planner if it
                 didn't work, otherwise stops
```

Each component does one specific, named job. The planner's job is to decide *what* to do; the tool executor's job is to actually *do* it; the controller's job is to check whether it *worked* — three different responsibilities that could each, independently, be the reason a task succeeds or fails.

## Bench

```bench
id: agent-architecture-anatomy
title: The same five components, every time
fallback: Step through the named components of an agent architecture on one toy request.
```

**Try this**

1. Step through all five components and note what each one's job actually is.
2. Notice the controller's decision point: loop back, or stop.
3. Imagine the booking tool fails — which component is responsible for catching that, and what does it do next?

**What you should notice:** "the agent" isn't one undifferentiated thing — it's five components with five distinct responsibilities, and a failure can be isolated to exactly one of them rather than blamed on "the agent" in general.

## Where it appears in AI

* **This is the same shape as [[PDA Loop|the perceive-decide-act loop]] already covered in Fundamentals**, split into finer-grained, named pieces specific to how an agent built on an LLM actually works.
* **Every later section is a deep dive into one of these five components**: [[Planning and Task Decomposition]] is the planner, [[Tool Use and Function Calling]] is the tool executor, [[Memory and State Management]] is memory, and the controller's checking behavior is [[Open-Loop vs. Closed-Loop Behavior]].
* **[[Observability and Tracing for Agent Runs]] depends on being able to log which component produced which part of a run** — naming the components consistently is what makes a trace readable at all.

## Common pitfalls

* **Treating "the agent" as a single opaque thing when debugging a failure.** The worked example shows five distinct places a task can go wrong — a failed booking could be the planner choosing the wrong steps, the tool executor calling the tool incorrectly, or the controller failing to notice the call didn't work.
* **Skipping the controller and letting the tool executor's result flow straight to the final answer.** Without a controller checking the result, there's no mechanism to loop back on failure — this is exactly the open-loop problem from the previous topic, now located in a specific architectural component.
* **Assuming memory and the planner are the same component.** Memory holds state; the planner uses that state (among other things) to decide steps — conflating them makes it harder to reason about which one is responsible when a plan uses the wrong stored preference.

## Quick check

<details><summary>1. In the worked example, which component is responsible for deciding that the task needs three steps rather than one?</summary>
The planner — it's specifically responsible for decomposing the goal into an ordered sequence of steps.
</details>

<details><summary>2. If the booking tool call fails, which component notices and decides what to do next?</summary>
The controller — it checks the tool executor's actual result against the goal and decides whether to loop back to the planner or stop.
</details>

<details><summary>3. Why is it useful to give these five components separate names rather than just calling the whole thing "the agent"?</summary>
It lets a specific failure be isolated to one component's responsibility (a bad plan vs. a bad tool call vs. a missed check) instead of being a vague, undifferentiated "the agent didn't work," which makes debugging and improving the system far more tractable.
</details>

## Key terms

* **Perceive:** the component that reads the current request and any new observations.
* **Planner:** the component that decomposes a goal into an ordered sequence of steps.
* **Controller:** the component that checks a step's result against the goal and decides whether to loop again.

## Related

[[PDA Loop]] · [[Planning and Task Decomposition]] · [[Tool Use and Function Calling]]
