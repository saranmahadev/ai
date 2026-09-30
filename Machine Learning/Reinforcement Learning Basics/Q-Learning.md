Value iteration needs to know how the world works. **Q-learning** learns without a model: it tries actions, sees the reward and the next state, and nudges its estimate of how good each (state, action) pair is. After many episodes the table of **Q-values** tells the agent the best action in every state.

**You need:** [[Value Functions]], [[Bandits and Exploration]] and [[The Learning Loop]].

## The question it answers

"How can an agent learn good behaviour just by experience?" It never sees the transition probabilities, only what happened. Each step provides a small piece of evidence that is blended into its running estimate.

## Intuition: a guess corrected by the next step

Suppose the agent believes taking action `a` in state `s` is worth 0. It tries it, receives −0.04 and lands in a state it currently values at 0.5. A better estimate of the action's worth is what it just received plus the discounted best it expects from there: `−0.04 + 0.9 × 0.5 = 0.41`. The old belief was too low, so it moves part of the way toward 0.41. Repeated over many steps, estimates near the goal become accurate first, and accuracy spreads backwards, just as in value iteration, but learned from samples.

## Definitions

```text
Q(s, a)   the expected return of taking action a in state s, then acting well
update    after (s, a, reward r, next state s′):
          Q(s, a) ← Q(s, a) + α · [ r + γ · max over a′ of Q(s′, a′) − Q(s, a) ]
          α = learning rate;  the bracket is the "temporal-difference error"
behaviour ε-greedy: mostly take the action with the highest Q, sometimes explore
```

Q-learning is **off-policy**: it learns the value of the best policy even while behaving exploratorily. On tables of states it converges given enough exploration. For huge state spaces the table is replaced by a neural network (deep Q-networks).

## A worked example

One update. `Q(s, a) = 0`, learning rate `α = 0.5`, reward `r = −0.04`, discount `γ = 0.9`, and the best Q-value of the next state is `0.5`.

```text
target = r + γ · max Q(s′, ·) = −0.04 + 0.9 × 0.5 = 0.41
new Q  = 0 + 0.5 × (0.41 − 0) = 0.205
```

On the 4×4 grid (goal +1, pit −1, step −0.04, γ = 0.9, α = 0.5, ε = 0.2, one fixed random seed):

```text
episodes played           1     3     10     30     100
best Q at the start     0.000 0.000 −0.082  0.426  0.427       (exact optimum: 0.427)
```

The start cell's estimate is stuck near zero for the first few episodes (the agent has barely reached the goal), then becomes correct. The greedy policy first reaches the goal in the optimal six steps after 8 episodes. Steps per episode stay somewhere between 6 and 13 because the agent still explores 20% of the time, so the number of steps in one episode is not the same as how good the learned policy is.

## Bench

```bench
id: q-learning
title: Learn by trying
fallback: An agent explores a grid world with a goal and a pit using Q-learning; buttons play 1, 10 or 100 episodes, sliders set the learning rate and exploration, and the grid shows the best value and best action the agent currently believes in each cell.
```

**Try this**

1. Play 1 episode a few times and watch which cells acquire values first.
2. Play 100 episodes and read the greedy path.
3. Set ε to 0 and start again.
4. Try a very small and a very large learning rate α.

**What you should notice:** values appear first next to the goal and spread backwards, ε = 0 may never find the goal in some starts, and a tiny α learns slowly while a huge one jitters.

## Where it appears in AI

* **Games:** deep Q-networks played Atari from pixels.
* **Robotics and control,** with simulators for cheap trial and error.
* **Resource allocation and scheduling** where the dynamics are complicated.
* **Ancestors of many modern RL methods** for tuning language models.

## Common pitfalls

* **Too little exploration,** so the agent never finds the rewards.
* **Sparse rewards:** the agent may wander for ages before seeing anything.
* **Unstable training with function approximation** (neural networks) unless carefully stabilised.
* **Reward hacking:** the agent optimises the score you wrote, not the goal you meant.

## Quick check

<details><summary>1. What does the Q-learning target r + γ · max Q(s′, ·) represent?</summary>
An improved estimate of the action's value: the reward received plus the discounted best value of the next state.
</details>

<details><summary>2. Why is Q-learning "model-free"?</summary>
It learns from sampled experience and never needs the transition probabilities.
</details>

<details><summary>3. What does ε control?</summary>
How often the agent explores by taking a random action.
</details>

## Key terms

* **Q-value:** the expected return of an action in a state.
* **Temporal-difference error:** target minus current estimate.
* **Off-policy:** learning about one policy while following another.
* **Episode:** one run from the start state to a terminal state.

## Related

[[Value Functions]] · [[Bandits and Exploration]] · [[Rewards, States and Policies]] · [[The Learning Loop]] · [[Policy Gradients]]
