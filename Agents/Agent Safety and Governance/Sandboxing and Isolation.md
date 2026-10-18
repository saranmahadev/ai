A code-execution agent running generated code with full access to the host machine can reach every file on it — including ones that have nothing to do with its task. Run that same code inside a sandbox limited to one working directory, and there's nothing *to* reach outside it, regardless of what the code tries to do.

**You need:** [[Code-Execution Agents]].

## The question it answers

"How do you limit the damage a tool call can do, independent of whether the agent 'decides' to misuse it?" A **sandbox** is an isolated execution environment — a container, a restricted filesystem view, a process with no network access — that constrains what a running piece of code can reach, regardless of what instructions produced that code or what the code itself attempts. Sandboxing doesn't make an agent's decisions more correct; it makes an incorrect decision's **blast radius** smaller, because the mistake has nowhere to spread.

## Intuition

A contractor doing renovation work inside one room of a house, with the rest of the house locked, can't accidentally (or deliberately) damage anything outside that room — not because they've been told not to, but because the other rooms are physically inaccessible to them. A contractor given keys to the whole house has to be trusted not to wander, which is a much weaker guarantee than a locked door.

## Definition and notation

```text
unsandboxed: reachable files = every file the process has permission to touch
sandboxed:   reachable files = only files under the sandbox's allowed path
```

## A worked example

Seven files on a host machine — two inside the agent's intended working directory, five outside it (SSH keys, system password file, a secrets file, another user's private document, cloud credentials):

```text
unsandboxed execution: 7 of 7 files reachable
sandboxed execution (restricted to /scratch/): 2 of 7 files reachable
```

Restricting execution to the one directory the task actually needs doesn't just make the five sensitive files harder to reach — it makes them unreachable to this process at all. No prompt, no generated code, and no injected instruction running inside that sandbox can touch a file the sandbox was never given access to.

## Bench

```bench
id: sandbox-reachable-files
title: What a sandbox keeps out of reach
fallback: Toggle sandboxing and watch how many host files a running piece of code can reach.
```

**Try this**

1. Look at the unsandboxed list and note every file, including the sensitive ones, is reachable.
2. Turn on sandboxing and watch the five files outside the scratch directory disappear from reach.
3. Imagine the generated code itself was specifically written (by a bug or an injected instruction) to try reading `/etc/shadow` — does sandboxing depend on that code behaving well?

**What you should notice:** sandboxing's guarantee doesn't depend on the running code's intentions at all — it's a property of what's physically reachable from inside the sandbox, which holds whether the code is buggy, careless, or actively malicious.

## Where it appears in AI

* **This is the complementary approach to [[Autonomy Levels and Human Oversight Tiers]]**: instead of a human catching a mistake before it runs, a sandbox limits how much damage the mistake can do even if nobody catches it in time.
* **[[Excessive Agency and Scope Limits]], next in this district, applies the identical idea to tool grants rather than filesystem access** — restricting what's reachable, whether that's files on disk or actions through an API.
* **This directly extends [[Code-Execution Agents]]**: that topic covers what a code-execution agent can do; this one covers containing what it can do when something goes wrong.

## Common pitfalls

* **Relying on the agent's own judgment instead of a sandbox boundary.** The worked example's whole point is that sandboxing works regardless of judgment — a boundary that depends on the code "choosing" not to misbehave isn't a boundary at all.
* **Sandboxing the filesystem but leaving network access open.** A sandbox that blocks file access but still allows outbound network calls can leak data a different way — isolation needs to cover every channel the running code could use, not just the obvious one.
* **Assuming a looser sandbox is "mostly fine" if nothing has gone wrong yet.** A sandbox's value is specifically in the case that hasn't happened yet — a wider boundary that has never been tested by a real mistake offers exactly the same false confidence as no boundary, until the day it is.

## Quick check

<details><summary>1. Why does restricting execution to one directory reduce reachable files from 7 to 2 in the worked example?</summary>
Only two of the seven files sit inside the sandbox's allowed path (the scratch directory); the other five, including the sensitive ones, are outside that path and so are never reachable from inside the sandbox, regardless of what the running code tries.
</details>

<details><summary>2. Does sandboxing require trusting the generated code to behave well?</summary>
No — a sandbox's guarantee comes from what is physically reachable from inside it, which holds whether the code is well-behaved, buggy, or deliberately malicious; it's a property of the boundary, not of the code's intentions.
</details>

<details><summary>3. Why would a sandbox that only restricts the filesystem still be incomplete?</summary>
If network access is left open, data can leak through that channel even with no file access at all — isolation needs to close off every channel a running piece of code could use, not just the filesystem.
</details>

## Key terms

* **Sandbox:** an isolated execution environment that restricts what a running process can reach.
* **Blast radius:** how much damage a mistake or attack can cause, bounded by what it can actually reach.
* **Isolation:** containing a process so its effects can't spread beyond an intended boundary.

## Related

[[Code-Execution Agents]] · [[Autonomy Levels and Human Oversight Tiers]] · [[Excessive Agency and Scope Limits]]
