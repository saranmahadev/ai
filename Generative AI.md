Every generative model so far — the GANs, VAEs, normalizing flows and diffusion models of [[Deep Learning]], the decoder-only transformers of [[Transformers]] — already learned how to represent and produce data. This subject is what happens *after* that: how a trained model is actually turned into text, an image, a sound or a video at generation time, how that generation is steered, how the result is judged, and what can go wrong when the output is trusted too far. It needs [[Deep Learning]] (GANs, VAEs, diffusion, autoencoders) and [[Transformers]] (decoder-only architectures, cross-attention, KV-caching); where a topic here builds directly on one of those, it says so under **You need**. Nothing here re-derives how a GAN, VAE or diffusion model is trained — this subject is generation-time behavior, conditioning, modality-specific pipelines, evaluation and responsible use, not the training mechanics themselves.

Each topic asks one question, explains it in plain language with a small worked example, lets you experiment in a **bench**, and ends with where the idea shows up in practice.

## Topics

1. [[Decoding and Prompting]]: turning a trained model's raw probabilities into an actual sequence, and steering that process with the input you give it.
2. [[Conditioning and Guidance]]: pushing a generative model's output toward what you asked for, during generation itself.
3. [[Image Generation and Editing]]: text-to-image pipelines and the editing operations built on top of them.
4. [[Audio and Speech Generation]]: turning model output into sound — speech, voices and music.
5. [[Video, 3D and Code Generation]]: extending generation past still images and language into motion, three dimensions and source code.
6. [[Multimodal Generation]]: models that generate across more than one modality from a single shared representation.
7. [[Evaluating Generative Models]]: how to tell whether generated output is actually good, with no single ground truth to compare against.
8. [[Risks and Responsible Generation]]: what generative models get wrong, whose content they were trained on, and how misuse is detected and limited.
9. [[Generative AI in Practice]]: adapting and serving a generative model as a real product, ending with a capstone that assembles decoding and guidance into one small working generator.

From here, what comes next is [[LLMs]], [[RAG]] and [[Agents]].
