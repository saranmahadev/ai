A large language model is, mechanically, nothing more than the decoder-only transformer and the decoding, conditioning and evaluation machinery already covered on [[Transformers]] and [[Generative AI]]. What makes an LLM an *LLM* — a usable, instruction-following assistant rather than a raw next-token predictor — is everything this subject covers: the data and objective it's pretrained on, how its capabilities scale (and sometimes jump) with size, the training stages that turn raw prediction into aligned behavior, how it reasons rather than just completes, how it handles context beyond a single prompt, how the field actually evaluates and ships these systems, and the practical decisions involved in using one. It needs [[Transformers]] (decoder-only architecture, KV-caching, scaling a transformer) and [[Generative AI]] (decoding, conditioning, evaluation metrics); where a topic here builds directly on one of those, it says so under **You need**. Nothing here re-derives the transformer block itself or decoding algorithms — this subject is the training pipeline, the capabilities, and the ecosystem built on top of them.

Each topic asks one question, explains it in plain language with a small worked example, lets you experiment in a **bench**, and ends with where the idea shows up in practice.

## Topics

1. [[Pretraining Data and Objectives]]: what an LLM is actually trained to predict, and the data decisions that shape what it learns.
2. [[Scaling, Capacity and Emergence]]: how capability grows with size, data and compute — and why it sometimes jumps rather than creeps.
3. [[Instruction Tuning and Alignment]]: turning a raw next-token predictor into a model that follows instructions and prefers what people actually want.
4. [[Reasoning]]: getting a model to work through a problem step by step, rather than pattern-matching straight to an answer.
5. [[Context, Memory and Long-Range Behavior]]: handling more text, more turns, and more sessions than a single forward pass was built for.
6. [[Evaluating LLMs]]: how the field actually measures capability and safety, and where those measurements mislead.
7. [[The LLM Landscape]]: the models, licenses, and governance decisions that shape who can build on what.
8. [[LLMs in Practice]]: adapting, prompting, serving and choosing a model for a real task, ending with a capstone that traces pretraining to an aligned assistant end to end.

From here, continue on to [[RAG]] and [[Agents]].
