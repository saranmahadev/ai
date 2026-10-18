Remove the supervisor from a star topology and every specialist loses its only connection to the rest of the system at once. A swarm avoids that single point of failure by connecting agents directly to each other, with no central hub — at the cost of needing far more connections to manage as the group grows.

**You need:** [[Supervisor-Orchestrator Patterns|Supervisor/Orchestrator Patterns]].

## The question it answers

"What's the alternative to routing every piece of coordination through one central agent?" A swarm (peer-to-peer) system connects agents directly to each other through shared state, with no central router deciding who talks to whom. Any agent can read or write what another has produced. The trade is connections: a full peer mesh of n agents needs n(n−1)/2 links, compared to a star's n — but no single agent's failure disconnects the rest of the group from each other.

## Intuition

A team that only ever communicates through one project manager loses all internal coordination the instant that manager is unavailable — nobody else knows who's doing what. A team that also talks directly to each other keeps functioning even if one member drops out; the remaining members were never dependent on routing everything through a single point.

## Definition and notation

```text
star:  n links (supervisor to each specialist); hub fails → 0 links remain among specialists
mesh:  n(n−1)/2 links (every pair of agents); one peer fails → remaining (n−1) agents keep all (n−1)(n−2)/2 links among themselves
```

## A worked example

4 agents, comparing what survives when one participant fails under each topology:

```text
star (supervisor pattern):
  before:  4 links (supervisor ↔ each specialist)
  supervisor fails → 0 links remain: every specialist loses its only connection

peer mesh (swarm):
  before:  4×3/2 = 6 links (every pair of the 4 agents)
  one peer fails → the remaining 3 agents keep all 3×2/2 = 3 links among themselves
```

The star's 4 links all pass through one agent, so losing that agent loses all of them at once. The mesh's 6 links are spread across every pair, so losing any single peer only removes that peer's own 3 links — the other 3 agents keep coordinating with each other exactly as before.

## Bench

```bench
id: swarm-mesh-resilience
title: One hub going down, or one peer going down
fallback: Compare a peer mesh's connectivity before and after one agent fails, against a star topology's single point of failure.
```

**Try this**

1. Set the topology to star and watch what happens to the link count after a failure.
2. Switch to mesh and compare how many links the survivors keep among themselves.
3. Slide the agent count up on the mesh — how fast does the link count grow compared to the star's?

**What you should notice:** the mesh's resilience to any one agent failing comes at a real, growing cost — the number of connections to manage climbs quadratically with agent count, while the star's climbs only linearly.

## Where it appears in AI

* **This is the direct alternative to [[Supervisor-Orchestrator Patterns|supervisor/orchestrator patterns]]**: no central hub, trading simplicity and fewer connections for resilience against any single agent's failure.
* **A swarm's shared state is exactly [[Shared State Across a Multi-Step Task|a blackboard]]**, now read and written by multiple independent agents instead of multiple steps of one task.
* **[[Coordination Failures and Deadlock]] covers what specifically goes wrong when several agents read and write that shared state inconsistently** — a risk the mesh's lack of central coordination makes more likely, not less.

## Common pitfalls

* **Choosing a swarm for its resilience without budgeting for its connection cost.** The worked example's 6-vs-4 link count is already more at just 4 agents — that gap only widens, and at a large enough agent count a full mesh's connections become impractical to maintain.
* **Assuming "no central hub" means "no coordination problems."** Removing the supervisor removes the single point of failure, but doesn't remove the need for agents to agree on shared state consistently — if anything, it makes that problem harder, since there's no one place enforcing consistency.
* **Using a full mesh when a partial one would do.** Not every pair of agents actually needs a direct link — a sparser peer topology can keep most of the resilience benefit without paying for every single pairwise connection.

## Quick check

<details><summary>1. In the worked example, why does the star lose all 4 links when the supervisor fails, but the mesh only loses 3 when one peer fails?</summary>
Every one of the star's 4 links passes through the single supervisor, so losing it removes all of them at once; the mesh's 6 links are spread across different pairs, so losing one peer only removes that peer's own links, leaving the other agents' links to each other intact.
</details>

<details><summary>2. What's the real cost a swarm pays for its resilience to single-agent failure?</summary>
A much larger number of connections to maintain — a full mesh needs n(n−1)/2 links for n agents, growing quadratically, compared to a star's n links growing linearly.
</details>

<details><summary>3. Does removing the central supervisor eliminate coordination problems?</summary>
No — it removes the single point of failure, but agents still need to agree on shared state consistently, and with no central hub enforcing that consistency, coordination failures like inconsistent reads and writes can become more likely, not less.
</details>

## Key terms

* **Swarm (peer-to-peer):** a multi-agent system where agents coordinate directly through shared state, with no central router.
* **Full mesh:** a topology where every pair of agents has a direct link.
* **Single point of failure:** a component whose failure disconnects every participant that depended solely on it — present in a star, absent in a mesh.

## Related

[[Supervisor-Orchestrator Patterns|Supervisor/Orchestrator Patterns]] · [[Shared State Across a Multi-Step Task]] · [[Coordination Failures and Deadlock]]
