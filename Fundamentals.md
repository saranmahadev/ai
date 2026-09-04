Before Machine Learning, Deep Learning, or Generative AI, it helps to understand the **fundamental concepts that make up the broader field of AI**.

AI fundamentals are essentially about understanding 

- What intelligence means Computationally? 
- How an intelligent system represents information? 
- How it makes decisions?
- How it interacts with its environment?

---
## Intelligent Agents

The most fundamental concept in AI is an **agent**.

An agent is a system that:

1. **Perceives** its environment
2. **Processes** what it perceives
3. **Makes decisions**
4. **Takes actions**

```text
Environment
     ↓
  Perception
     ↓
    Agent
     ↓
  Decision
     ↓
    Action
     ↓
Environment
```

Examples:

* Chess AI → observes board → chooses move
* Robot → observes surroundings → decides movement
* Voice assistant → receives speech → determines response → speaks
* Autonomous vehicle → observes road → decides steering/braking → acts

This [[PDA Loop |Perception → Decision → Action loop]] is foundational to AI.

---

# Rationality

AI often isn't defined as "thinking like a human."

A more useful concept is **rational behavior**.

A rational agent chooses the action that is expected to produce the **best outcome according to its objective**, given the information available to it.

For example:

```text
Goal: Reach destination safely

Possible actions:
    A → Drive faster
    B → Drive slower
    C → Stop
```

The AI evaluates the situation and chooses an action based on its objective.

This introduces the concept of an **objective or goal**.

---

# Goals and Objectives

An AI system needs some definition of what it is trying to accomplish.

Examples:

```text
Chess AI
Goal → Win the game

Navigation AI
Goal → Reach destination efficiently

Recommendation system
Goal → Recommend relevant content

Robot
Goal → Complete a task safely
```

This becomes particularly important later when you study:

* Optimization
* Loss functions
* Reward functions
* Reinforcement learning

---

# State

An AI needs some representation of **the current situation**.

That situation is called a **state**.

For a chess system:

```text
State =
Board position
+ Pieces
+ Whose turn
+ Castling rights
+ Other game information
```

For a robot:

```text
State =
Location
+ Speed
+ Obstacles
+ Battery
+ Environment
```

The agent uses the current state to determine what to do next.

---

# Environment

An AI doesn't exist in isolation.

It operates within an **environment**.

```text
Agent ↔ Environment
```

The environment could be:

* A chess board
* A road
* A game
* The internet
* A database
* A physical room
* A conversation

AI problems can therefore be understood as:

> **Given an environment, a current state, and a goal, what action should the agent take?**

---
# Knowledge Representation

An AI needs a way to **represent information internally**.

For example, we might represent:

```text
Dev → works_at → Company
Company → located_in → India
India → continent → Asia
```

Or:

```text
Car
 ├── has_engine
 ├── has_wheels
 ├── has_driver
 └── can_move
```

Knowledge representation asks:

> **How should knowledge about the world be represented so that a machine can use it?**

Historically this included:

* Logic
* Rules
* Ontologies
* Knowledge graphs
* Semantic networks

> Modern AI heavily relies on **Vector Representations / Embeddings**

---

# Reasoning

Once information is represented, an AI needs to be able to **derive conclusions from it**.

Example:

```text
All humans are mortal.
Socrates is human.

Therefore:
Socrates is mortal.
```

This is reasoning.

AI reasoning can involve:

* Deduction
* Induction
* Abduction
* Probabilistic reasoning
* Constraint reasoning
* Logical inference

Modern AI systems also perform forms of **learned reasoning**, although this differs from classical symbolic reasoning.

---

# Search

Many AI problems can be formulated as:

> **Search through possible states to find a good solution.**

Chess is a classic example.

```text
Current position
       ↓
Possible moves
   ↙    ↓    ↘
State  State  State
 ↓      ↓      ↓
Moves  Moves  Moves
 ↓      ↓      ↓
...
       ↓
Best move
```

Classic AI algorithms include:

* Breadth-First Search
* Depth-First Search
* Uniform-Cost Search
* Greedy Search
* A*
* Minimax

Search is one of the foundational ideas behind classical AI.

---

# Planning

**Search** explores possibilities.

**Planning** uses those possibilities to construct a sequence of actions to achieve a goal.

Example:

```text
Goal:
Make coffee

Plan:

1. Get cup
2. Get coffee
3. Boil water
4. Add coffee
5. Pour water
6. Stir
```

In AI:

```text
Current State
      ↓
Goal State
      ↓
Planning
      ↓
Sequence of Actions
```

Planning becomes extremely important in:

* Robotics
* Autonomous systems
* Game AI
* AI agents

---

# Uncertainty

The real world is rarely completely known.

An AI may have incomplete or noisy information.

For example:

```text
Camera sees:
    Object = 70% pedestrian
              20% sign
              10% other
```

AI therefore needs to reason under **uncertainty**.

Important concepts include:

* Probability
* Conditional probability
* Bayesian reasoning
* Probabilistic models
* Uncertainty estimation

This is a major foundation for modern AI.

---

# Learning

This is where we begin approaching **Machine Learning**.

Instead of explicitly programming every rule:

```text
Rules → Behavior
```

we can allow the system to learn patterns:

```text
Data → Learning → Model → Behavior
```

The important distinction is:

**Classical AI:**

> Human specifies much of the knowledge/rules.

**Machine Learning:**

> System learns patterns from data.

Machine Learning is therefore **one major approach within AI**, rather than being synonymous with AI.

---

# Optimization

AI frequently needs to choose the **best solution according to some objective**.

For example:

```text
Goal:
Minimize delivery time
```

There may be thousands of possible routes.

Optimization asks:

> Which solution gives the best result?

Mathematically, this often becomes:

```text
Minimize / Maximize
        ↓
Objective function
        ↓
Find optimal parameters / solution
```

Optimization becomes absolutely central when you reach:

* Machine Learning
* Neural networks
* Deep Learning
* Model training

---

# Feedback

An intelligent system can improve its behavior based on feedback.

For example:

```text
Action
  ↓
Outcome
  ↓
Feedback
  ↓
Adjust behavior
  ↓
New action
```

A game-playing agent might receive:

```text
Win  → Positive feedback
Lose → Negative feedback
```

This concept leads directly toward **Reinforcement Learning**.

---

# Language

Humans communicate primarily through language, so AI needs ways to process:

* Text
* Speech
* Meaning
* Context
* Intent
* Semantics

This created the field of **Natural Language Processing (NLP)**.

Modern LLMs are part of this broader evolution.

---
# Adaptation

An intelligent system should ideally be able to **adapt to changing conditions**.

For example:

```text
Environment changes
       ↓
New information
       ↓
Update understanding
       ↓
Change behavior
```

This becomes important in:

* Online learning
* Reinforcement learning
* Autonomous systems
* Adaptive AI
* Continual learning

---

# Human-AI Interaction

AI systems increasingly need to interact with humans.

This involves:

* Natural language
* Speech
* Vision
* User intent
* Feedback
* Explainability
* Trust

For example:

```text
Human
  ↓
Instruction
  ↓
AI
  ↓
Interpretation
  ↓
Reasoning
  ↓
Action / Response
  ↓
Human
```

This is particularly important for modern **AI assistants and agents**.

---
