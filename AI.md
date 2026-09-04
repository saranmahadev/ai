> **[[Fundamentals|AI Fundamentals]] → [[Math]] → [[Machine Learning|ML]]  → [[Deep Learning|DL]] → [[Neural Networks]] → [[Transformers]] → [[Generative AI]] → [[LLMs]] → [[RAG]] → [[Agents]]**


Systems that learn patterns from information and use those patterns to make predictions, decisions, generate outputs, or take actions.

```
DATA
  ↓
LEARNING
  ↓
PATTERN / REPRESENTATION
  ↓
INFERENCE
  ↓
OUTPUT / ACTION
```

```text
Artificial Intelligence (AI)
└── Machine Learning (ML)
    └── Deep Learning (DL)
        └── Generative AI
```

### [[Machine Learning]] (ML)

**Machine Learning is a way of building systems that learn patterns from data instead of being explicitly programmed with every rule.**

Instead of:

```text
Data → Hand-written rules → Prediction
```

ML does:

```text
Data + Correct answers
        ↓
   Learning algorithm
        ↓
     ML model
        ↓
New data → Prediction
```

**Example:**
Give a model historical customer data:

* Age
* Income
* Usage
* Complaints
* Whether they cancelled

The model learns patterns and predicts:

> "This customer has an 82% probability of cancelling."

---
### Deep Learning (DL)

**Deep Learning is a subset of Machine Learning that uses multi-layer neural networks to learn complex representations from data.**

Think:

```text
Artificial Intelligence
└── Machine Learning
    └── Deep Learning
        └── Neural Networks
```

Traditional ML often requires humans to decide which useful features to give the model.

For example, for predicting house prices:

```text
Raw data
   ↓
Human selects features
   ↓
Area, bedrooms, location, age...
   ↓
ML algorithm
   ↓
Prediction
```

Deep learning can learn useful representations itself:

```text
Raw data
   ↓
Neural Network
   ↓
Learned representations
   ↓
Prediction
```

This becomes particularly powerful with **images, audio, video, language and other high-dimensional data**.

---

### Generative AI

**Generative AI is AI that can create new content based on patterns learned from existing data.**

Instead of primarily asking:

> "What class does this belong to?"

we ask:

> **"What can I generate?"**

Examples:

```text
Text     → ChatGPT
Images   → Image generation models
Audio    → Music / speech generation
Video    → Video generation
Code     → Code generation
```

A simplified example:

```text
Training data
     ↓
Generative model
     ↓
Learn distribution/patterns
     ↓
Prompt
     ↓
Generate new content
```

For an LLM:

```text
"You are a..."
       ↓
   Transformer
       ↓
Predict next token
       ↓
Generate token
       ↓
Predict next token
       ↓
...
       ↓
Complete response
```

Modern Generative AI is heavily based on **deep learning**, particularly Transformer architectures, diffusion models and related neural architectures.

---

# ML vs DL vs GenAI

| Dimension               | Machine Learning                        | Deep Learning                            | Generative AI                         |
| ----------------------- | --------------------------------------- | ---------------------------------------- | ------------------------------------- |
| **What is it?**         | Learning from data                      | ML using deep neural networks            | AI that generates new content         |
| **Primary goal**        | Prediction / classification / decisions | Learn complex patterns & representations | Generate content                      |
| **Typical input**       | Structured + unstructured data          | Large unstructured datasets              | Usually large-scale multimodal data   |
| **Feature engineering** | Often important                         | Often learned automatically              | Mostly learned automatically          |
| **Models**              | Trees, regression, SVM, etc.            | Neural networks                          | Transformers, diffusion, GANs, etc.   |
| **Output**              | Prediction / class / score              | Prediction / representation              | Text, image, audio, video, code, etc. |
| **Data requirement**    | Often moderate                          | Usually large                            | Usually very large                    |
| **Compute requirement** | Low → moderate                          | Moderate → extremely high                | Often extremely high                  |
| **Example**             | Fraud detection                         | Image recognition                        | Image generation                      |
| **Example question**    | "Will this transaction be fraudulent?"  | "What is in this image?"                 | "Generate an image of a Ferrari."     |

---


