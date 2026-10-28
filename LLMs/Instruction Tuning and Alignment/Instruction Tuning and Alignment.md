A model pretrained purely to predict the next token has no particular reason to follow an instruction, refuse a harmful request, or prefer a helpful answer over a merely plausible one. This section covers the training stages that turn raw next-token prediction into a model that behaves like an assistant — and the specific ways that process can go wrong.

Topics in this section:

* [[Supervised Fine-Tuning (SFT)]]: the first step toward an assistant — training directly on examples of good responses.
* [[Instruction Dataset Construction]]: where the examples SFT trains on actually come from.
* [[Reward Modeling]]: training a separate model to score how good a response is.
* [[Reinforcement Learning from Human Feedback (RLHF)]]: using a reward model's scores to push a language model's behavior toward what it rewards.
* [[Direct Preference Optimization (DPO)]]: getting RLHF's effect without training a separate reward model or running reinforcement learning at all.
* [[Constitutional AI and RLAIF]]: replacing human preference judgments with an AI's own, guided by a written set of principles.
* [[Rejection Sampling and Best-of-N Fine-Tuning]]: using a reward model to pick the best of several samples, then training on those picks.
* [[Reward Hacking and Sycophancy]]: what happens when a model learns to satisfy the reward signal instead of the intent behind it.
