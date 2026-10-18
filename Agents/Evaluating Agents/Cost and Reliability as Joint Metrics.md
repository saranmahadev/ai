A 95%-success-rate agent sounds better than an 85%-success-rate one, full stop — until the first one costs ten times as much per attempt. Cost per *successful* run, not success rate alone, is the number that actually decides which configuration is worth deploying.

**You need:** [[Success-Rate Metrics and Their Blind Spots]].

## The question it answers

"Is the agent configuration with the higher success rate automatically the better choice?" Not once cost enters the picture. An agent that retries heavily to squeeze out a higher success rate pays for every one of those retries, including the ones spent on runs that eventually succeed. **Cost per success** — total cost divided by success rate — is the joint metric that can flip which configuration actually looks better, compared to looking at either number alone.

## Intuition

A delivery service that reroutes every package through three backup routes gets a slightly higher on-time rate than one that just sends packages directly — but if the backup routes cost ten times as much to run, the "more reliable" service might be a much worse deal per package actually delivered on time.

## Definition and notation

```text
cost per success = cost per attempt / success rate
```

## A worked example

Two agent configurations for the same task, one using heavy retries and one running a single pass:

```text
heavy retries:  success rate 95%,  cost per attempt $0.50
  cost per success = $0.50 / 0.95 = $0.526

single pass:    success rate 85%,  cost per attempt $0.05
  cost per success = $0.05 / 0.85 = $0.059

heavy retries costs about 8.9× more per successful run than single pass
```

The heavy-retry configuration does succeed more often per attempt — but each of its attempts costs ten times as much as the single-pass configuration's, and that gap dwarfs the 10-percentage-point success-rate advantage. Judged by cost per success, single pass is the clearly better deal, even though it fails more often in raw terms.

## Bench

```bench
id: cost-per-success
title: Success rate alone isn't the whole story
fallback: Compare two agent configurations' cost per successful run, not just their raw success rates.
```

**Try this**

1. Compare the two configurations' cost per success.
2. Notice how much larger the gap is than the 10-percentage-point success-rate difference alone would suggest.
3. Imagine the single-pass configuration's cost per attempt rose to $0.45 instead of $0.05 — would it still win on cost per success?

**What you should notice:** success rate and cost per attempt can each look individually reasonable while the combined cost-per-success number tells a very different story about which configuration is actually worth deploying.

## Where it appears in AI

* **This reuses the task-cost reasoning from [[Cost and Latency of Agent Loops]]**, folding in success rate specifically to answer "worth it for what you actually get," not just "how much does one attempt cost."
* **Production agent deployments routinely report cost per successful task as a primary metric**, exactly because success rate and raw cost can each look fine individually while hiding a bad trade when combined.
* **[[Production Agent Architecture]], covered in the final district, puts this joint metric into a real deployment decision**, alongside latency and reliability requirements that a single success-rate number can't capture.

## Common pitfalls

* **Comparing agent configurations by success rate alone.** The worked example shows the "more reliable" configuration can still be the clearly worse deal once its cost per attempt is folded in.
* **Comparing by raw cost per attempt alone, ignoring success rate.** A cheaper configuration that fails much more often could still cost more per *successful* run than a pricier, more reliable one — the two numbers need to be combined, not compared separately.
* **Optimizing success rate without a cost budget in mind.** Heavier retries almost always raise success rate somewhat, but past some point the marginal cost of each additional percentage point of success rate outweighs what it's worth.

## Quick check

<details><summary>1. Why does the heavy-retry configuration lose on cost per success despite its higher success rate?</summary>
Its cost per attempt is ten times higher than the single-pass configuration's, and that gap outweighs its 10-percentage-point success-rate advantage once both are combined into cost per success.
</details>

<details><summary>2. What does "cost per success" actually divide?</summary>
Cost per attempt divided by success rate — it answers "how much does it cost, on average, to get one successful run," accounting for the attempts spent on runs that fail along the way.
</details>

<details><summary>3. Why isn't success rate alone enough to choose between two agent configurations?</summary>
A higher success rate can come at a cost (more retries, more compute) that outweighs the reliability gain once cost per successful run is actually computed — success rate alone says nothing about what that reliability costs to achieve.
</details>

## Key terms

* **Cost per success:** total cost per attempt divided by success rate — the cost of achieving one successful run, accounting for failed attempts.
* **Heavy retries:** a configuration that re-attempts a task multiple times to raise its success rate, at a proportional cost.
* **Joint metric:** a single number (like cost per success) that combines two individually incomplete metrics into one that reflects the actual trade-off.

## Related

[[Cost and Latency of Agent Loops]] · [[Production Agent Architecture]] · [[Success-Rate Metrics and Their Blind Spots]]
