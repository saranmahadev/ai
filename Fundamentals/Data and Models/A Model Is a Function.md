A **model** is a function: give it inputs and it returns a prediction. What makes it a *model* is that the function has adjustable numbers, called **parameters**, and choosing good values for them is what learning means.

**You need:** [[Features and Labels]] and [[Functions]].

## The question it answers

People talk about "the model" as if it were a mysterious thing. What is it, concretely?

## Intuition: a machine with dials

Picture a machine with a slot for inputs, a chute for outputs and a few dials on the side. Feed it a house's size and it prints a price. The dials decide how the machine turns size into price. Set them badly and the prices are nonsense, and set them well and the prices are useful. The machine is the **model**, the dials are the **parameters**, and finding the best dial settings is **learning**.

The simplest such machine is a straight line:

```text
price = w × size + b
```

Here `w` and `b` are the two parameters: `w` says how much each extra square metre adds, and `b` is the base price.

## Small models and giant ones

A line has two parameters. Bigger models have more dials and can capture more complicated patterns. A modern large language model has billions of parameters or more. The idea does not change: a function whose behaviour is set by numbers that were learned from data.

## A worked example: pricing a house

Suppose dials `w = 2.2` (thousand dollars per square metre) and `b = 35` (thousand dollars). For a 90 square-metre house:

```text
price = 2.2 × 90 + 35 = 198 + 35 = 233   →   about $233,000
```

To judge the dials, compare predictions with real sales. If a house of that size actually sold for $260,000, the model missed by $27,000. The **average miss** across many houses tells you how good the dials are.

## Bench

```bench
id: function-machine
title: A model is a function with dials
fallback: A scatter plot of fourteen houses (size against price) with a line controlled by two sliders, w and b. The page shows the average miss and a price prediction for a new house.
```

**Try this**

1. Turn `w` up and down with `b` fixed. What happens to the line and to the average miss?
2. Now change `b` only. What does that dial do to the line?
3. Can you get the average miss below $30k by hand? Then press **Reveal the best-fitting dials** and compare.
4. Move the new-house slider. Read the arithmetic line to see the prediction being computed.

**What you should notice:** even the best dials do not reach zero error, because real data is noisy and a straight line cannot capture everything. A model gets *close*, not *perfect*.

## Functions you already use

You meet functions with dials all the time. What differs in AI is *how the dials get set*:

| System | Input | The function | Output | Where the dials come from |
| --- | --- | --- | --- | --- |
| Thermostat | room temperature | "heat if below the target" | on or off | a person sets the target |
| House-price line | size in m² | `w × size + b` | a price | learned from sales data |
| Spam filter | the words in an email | a weighted sum of word clues | a spam score | learned from labelled emails |
| Language model | the text so far | a very large network | the next word | learned from vast amounts of text |

The thermostat's dial is set by hand. The others are set by learning. That is the whole difference between a fixed program and a model.

## Shapes of model

A line is one *shape* of function. Others include decision trees (a chain of yes/no questions), and neural networks (many layers of simple units). Each shape can express different patterns, and choosing one is a design decision made before any learning happens. A straight line, for instance, can never capture a pattern that curves, however well its dials are set.

## Where it appears in AI

Everything in [[Machine Learning]] is a function with parameters, from lines to decision trees to the [[Neural Networks]] that power [[Deep Learning]]. The dials are set by [[Optimization]], as the next topic shows.

## Common pitfalls

* **A model is not a database.** It does not look up stored answers; it computes a prediction from its dials.
* **Parameters are not the same as settings you choose.** Parameters are learned from data. Settings such as "how many dials" are chosen beforehand.
* **The line is only a model.** The real relationship between size and price is more complicated.
* **More dials are not automatically better.** They can fit the noise as well as the pattern.

## Quick check

<details><summary>1. In price = 2.2 × size + 35, what are the parameters?</summary>
The two numbers, 2.2 and 35 (`w` and `b`).
</details>

<details><summary>2. What is the prediction for a 100-square-metre house with those parameters?</summary>
2.2 × 100 + 35 = 255, about $255,000.
</details>

<details><summary>3. What does "learning" mean here?</summary>
Finding parameter values that make the model's predictions match real examples well.
</details>

## Key terms

* **Model:** a function that turns inputs into a prediction.
* **Parameter:** an adjustable number inside a model, set by learning.
* **Prediction:** the output the model produces for an input.
* **Error (loss):** a number measuring how far predictions are from the true answers.

## Related

[[Features and Labels]] · [[Training vs Inference]] · [[Functions]] · [[Optimization]] · [[Machine Learning]]
