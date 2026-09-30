A **Markov chain** is a sequence of random states where the next state depends only on the current one, not on how you got there. A table of transition probabilities describes it completely, and over time the chain often settles into a steady long-run pattern.

**You need:** [[Conditional Probability]], [[Matrix Multiplication]] and [[Sequences and Series]].

## The question it answers

"If things move randomly from state to state, where do they end up, and how often are they in each state?" Web browsing, weather, text generation and reinforcement learning all evolve step by step in this way.

## Intuition: a random walk with a short memory

Imagine weather with two states, Sunny and Rainy. Tomorrow's weather depends only on today's:

```text
from Sunny:  stays Sunny 0.8,  turns Rainy 0.2
from Rainy:  turns Sunny 0.4,  stays Rainy 0.6
```

Store this as a **transition matrix** whose rows are "from" states and sum to 1:

```text
P = [ 0.8  0.2 ]
    [ 0.4  0.6 ]
```

A distribution over states is a row vector `π`. One step later it is `π P` (a vector-matrix product, see [[Matrix Multiplication]]).

## Stationary distribution

Often the distribution stops changing: `π P = π`. That is the **stationary distribution**, the long-run fraction of time in each state, and it does not depend on where you started (for well-behaved chains).

## A worked example

Start sure to be Sunny: `π₀ = (1, 0)`.

```text
day 1:  (0.8, 0.2)
day 2:  (0.8·0.8 + 0.2·0.4,  0.8·0.2 + 0.2·0.6)  = (0.72, 0.28)
day 3:  (0.72·0.8 + 0.28·0.4, 0.72·0.2 + 0.28·0.6) = (0.688, 0.312)
```

The Sunny share falls toward a limit. To find it, solve `π_S = 0.8 π_S + 0.4 π_R` with `π_S + π_R = 1`:

```text
0.2 π_S = 0.4 π_R   →   π_S = 2 π_R   →   π_S = 2/3,   π_R = 1/3
```

In the long run two days out of three are sunny, whatever the start. Check: `(2/3)(0.8) + (1/3)(0.4) = 0.5333 + 0.1333 = 0.6667` ✓.

## Bench

```bench
id: random-walker-chain
title: A two-state Markov chain
fallback: Sliders set the chance of switching from sunny to rainy and back; bars show the distribution over states step by step, starting from one state, next to the stationary distribution; a walker simulates one path.
```

**Try this**

1. Step through and watch the bars approach the stationary values.
2. Change the starting state. Does the destination change?
3. Make switching very unlikely and see how slowly it settles.
4. Compare the simulated fraction of time with the stationary values.

**What you should notice:** the distribution converges to the same limit from any start, and sticky chains take longer to get there.

## Where it appears in AI

* **PageRank** is the stationary distribution of a random surfer.
* **Language generation** predicts the next token from the current context (a Markov chain in the simplest models).
* **Reinforcement learning** models environments as Markov decision processes.
* **MCMC sampling** designs chains whose stationary distribution is the one you want to sample from.

## Common pitfalls

* **Assuming the past matters** in a chain; by definition only the present does.
* **Rows that do not sum to 1.**
* **Expecting convergence** for chains that cycle or split into disconnected parts.
* **Confusing the transition matrix's rows and columns.**

## Quick check

<details><summary>1. What must each row of a transition matrix sum to?</summary>
1.
</details>

<details><summary>2. With P as above, starting Rainy, what is the distribution after one day?</summary>
(0.4, 0.6).
</details>

<details><summary>3. What does the stationary distribution tell you?</summary>
The long-run fraction of time spent in each state.
</details>

## Key terms

* **Markov chain:** a random sequence where the next state depends only on the current state.
* **Transition matrix:** the table of probabilities of moving between states.
* **Stationary distribution:** a distribution unchanged by a step.
* **Markov property:** the future depends on the present, not the past.

## Related

[[Conditional Probability]] · [[Matrix Multiplication]] · [[Eigenvalues and Eigenvectors]] · [[Sequences and Series]] · [[Embeddings and Similarity Search]]
