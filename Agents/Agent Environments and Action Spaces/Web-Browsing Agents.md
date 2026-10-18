A web page an agent is clicking through doesn't hold still: an ad can load, a banner can appear, a list can re-sort, all between the moment the agent decides what to click and the moment the click lands. An agent that targets elements by their position in a list breaks the instant the page shifts; one that targets them by a stable identity — a role, an id, visible text — doesn't.

**You need:** [[Agents and Environments]], [[Kinds of Environments]].

## The question it answers

"What makes a web page a harder action space than it looks?" A browsing agent's actions are clicking, typing, navigating and scrolling, and its observation is some representation of the page — a screenshot, the DOM, or a cleaned-up accessibility tree. The page is **dynamic** in exactly the sense [[Kinds of Environments]] describes: it can change on its own, independent of the agent's own actions, so a plan made from one observation can be stale by the time it executes.

## Intuition

Telling someone "click the third button from the left" works until a new button gets added — now "third from the left" points at the wrong thing entirely. Telling them "click the button labeled Submit" keeps working no matter how many buttons get added around it, because the instruction refers to the button's identity, not its position.

## Definition and notation

```text
index-based targeting:    action refers to an element's position in a list snapshot
selector-based targeting: action refers to a stable identity (role, id, visible text)
```

## A worked example

Five sequential actions on a page, with a banner ad inserted before the third action — shifting every element's position from that point on:

```text
action:            1    2    3    4    5
index-based:        ✓    ✓    ✗    ✗    ✗    → 2 of 5 correct (40%)
selector-based:      ✓    ✓    ✓    ✓    ✓    → 5 of 5 correct (100%)
```

The index-based agent's first two clicks land correctly, because nothing has shifted yet. The moment the banner ad is inserted, "the element at position 2" stops meaning the same thing it meant a step ago — the index-based agent keeps clicking the position, landing on whatever happens to be there now. The selector-based agent, which never cared about position in the first place, is unaffected.

## Bench

```bench
id: web-action-targeting
title: Clicking by position, or by identity
fallback: Step through five actions on a page that shifts partway through, and compare index-based clicks against selector-based clicks.
```

**Try this**

1. Step through all five actions and watch when the index-based count stops climbing.
2. Notice the selector-based count never misses, regardless of when the page shifts.
3. Imagine the page shifted on every single action instead of just once — what would index-based accuracy drop to?

**What you should notice:** the failure isn't about the agent's decision being wrong — both agents "decided" to click the same logical target. It's that one of the two representations of "which element" survives a page change and the other doesn't.

## Where it appears in AI

* **This is [[Kinds of Environments|dynamic]] environments made concrete**: the world changing while the agent is mid-decision is exactly the property that chess (static) doesn't have and web browsing does.
* **[[Computer-Use Agents and GUI Grounding]], the next topic, faces a harder version of the same problem**: without a DOM at all, there's no selector to target by identity — only pixel coordinates on a screenshot.
* **[[Action-Space Design and Its Failure Modes]] generalizes this lesson**: how an action is represented shapes which failures become possible, independent of how smart the policy choosing the action is.

## Common pitfalls

* **Targeting elements by index or raw coordinates when a stable identity is available.** The worked example's 60-percentage-point gap isn't a tuning problem — it's a representation choice, and the more stable representation is usually available for free in a page's own DOM or accessibility tree.
* **Assuming a page is static between observing it and acting on it.** Any asynchronous content — ads, live data, lazy-loaded sections — can change the page in that gap, and plans that assume otherwise will occasionally act on stale information.
* **Treating "the agent clicked the wrong thing" as a reasoning failure.** Sometimes the decision was correct and the representation of "which element" was the part that broke.

## Quick check

<details><summary>1. Why does the index-based agent succeed on the first two actions but fail afterward?</summary>
The banner ad hasn't been inserted yet during the first two actions, so the element at a given position is still the one the agent intended; once the ad shifts every later position, "the element at position 2" points at something else.
</details>

<details><summary>2. What makes selector-based targeting immune to the page shift in this example?</summary>
It refers to a stable identity (a role, id or visible text) rather than a position in a list, so inserting a new element elsewhere on the page doesn't change what the selector resolves to.
</details>

<details><summary>3. Which property from Kinds of Environments does a web page's unpredictable content changes correspond to?</summary>
Dynamic — the world can change while the agent is deciding, independent of anything the agent itself does.
</details>

## Key terms

* **Index-based targeting:** referring to an element by its position in an observed list or DOM order.
* **Selector-based targeting:** referring to an element by a stable identity — a role, id, or visible text — that survives changes elsewhere on the page.
* **Staleness:** a plan or observation no longer matching the actual state of the world by the time an action executes.

## Related

[[Kinds of Environments]] · [[Computer-Use Agents and GUI Grounding]] · [[Action-Space Design and Its Failure Modes]]
