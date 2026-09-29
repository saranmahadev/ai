**Data** is recorded information about the world: measurements, text, images, sound, clicks, transactions. For an AI system it is the raw material that perception works on, and whatever its form, a computer stores it as numbers.

**You need:** [[Agents and Environments]] and [[State and Representation]].

## The question it answers

An agent has to perceive its world. What does that actually mean for a computer, and what does the "raw material" look like?

## Intuition: raw ingredients

A cook works from ingredients, and an AI system works from data. The quality of the meal depends on the ingredients, so data quality, meaning its accuracy, coverage and fairness, sets a ceiling on what any model built from it can do. The saying "garbage in, garbage out" is an old one because it stays true.

## Kinds of data

| Kind | Example | How it looks to the computer |
| --- | --- | --- |
| **Tabular** | customer records, sensor logs | rows and columns of numbers and categories |
| **Text** | emails, articles, chats | a sequence of characters, later broken into tokens |
| **Images** | photos, scans | a grid of brightness values per colour channel |
| **Audio** | speech, music | thousands of measurements per second |
| **Time series** | temperature by the hour, stock prices | an ordered list of numbers |

People often split data into **structured** (neat rows and columns, like a spreadsheet) and **unstructured** (free-form, like text, images and audio). Most of the world's data is unstructured, and deep learning became important partly because it copes with that.

## Everything becomes numbers

Whatever the form, the computer stores numbers, and a model can only work with numbers. Turning things into numbers has choices built in:

* Text can become one number per character, or per word or word-piece (a **token**).
* An image becomes a grid of numbers, one per pixel (three grids for colour).
* Sound is measured many times a second, and each measurement is a number.
* A category such as "city" must be coded as numbers, and the coding is a design decision.

## A worked example: a day of weather

A weather station records the temperature every hour for a day:

```text
12, 11, 11, 10, 10, 12, 15, 18, 21, 24, 26, 27, 28, 28, 27, 25, 22, 19, 17, 15, 14, 13, 12, 12
```

That is a list of 24 numbers, a **time series**. You could show it as a table, a chart, a sentence ("cool morning, warm afternoon") or even as a rising and falling tone. The list of numbers is what a model actually uses, and each form is only a view of it.

## Bench

```bench
id: same-data-different-form
title: Everything becomes numbers
fallback: Five kinds of data (text, image, sound, a table row and a time series), each shown as people see it beside the numbers a model receives.
```

**Try this**

1. In **Text**, type your name. What numbers does it become? What about a capital letter versus a lowercase one?
2. In **Image**, click some pixels to change their brightness. What do the numbers on the right do?
3. In **Sound**, change the pitch and watch the numbers. Play the tone.
4. Which kind of data was hardest to imagine as a list of numbers, and what information might be lost in the conversion?

**What you should notice:** the model never sees the picture, the word or the sound. It sees numbers, and every choice about how to turn things into numbers shapes what it can learn.

## Where it appears in AI

Data is the starting point of all of [[Machine Learning]] and [[Deep Learning]]. The idea of turning text into numbers grows into [[Transformers]] and [[LLMs]]. Data quality and fairness return in [[Where AI Goes Wrong]].

## Common pitfalls

* **More data is not always better.** Data that is wrong, unrepresentative or repetitive can make a model worse.
* **Data is not knowledge.** It is a record of what happened, which may leave out what matters.
* **Converting to numbers loses something.** Reducing a photo to a grid throws away context a person would use.
* **Someone chose how to record it.** Sensors, surveys and logs all embed decisions and blind spots.

## Quick check

<details><summary>1. Name three kinds of data.</summary>
Any of: tabular, text, images, audio, time series.
</details>

<details><summary>2. Why can a model only work with numbers?</summary>
A model performs arithmetic, so every input must be represented as numbers first, whatever it looked like originally.
</details>

<details><summary>3. What does "garbage in, garbage out" mean?</summary>
If the data going in is poor, the results coming out will be poor, however clever the model.
</details>

## Key terms

* **Data:** recorded information about the world.
* **Structured data:** data in neat rows and columns, like a spreadsheet.
* **Unstructured data:** free-form data such as text, images and audio.
* **Time series:** measurements recorded in order over time.
* **Token:** a chunk of text, such as a word or word piece, converted into a number.

## Related

[[Features and Labels]] · [[State and Representation]] · [[Machine Learning]] · [[Where AI Goes Wrong]]
