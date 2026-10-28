Decoding controls how output is assembled token by token; this section covers a different lever — how a generative model's output is pushed toward a specific condition, image, or structure during generation itself, most concretely in diffusion models.

Topics in this section:

* [[Classifier Guidance]]: using a separate classifier's gradients to steer a diffusion model's denoising steps.
* [[Classifier-Free Guidance]]: steering generation by contrasting a conditioned and unconditioned pass, with no separate classifier.
* [[Cross-Attention Conditioning for Generation]]: letting a text (or other) embedding directly attend into the generation process.
* [[ControlNet-Style Structural Conditioning]]: conditioning generation on a structural signal like an edge map or pose skeleton.
* [[Latent Space Interpolation and Manipulation]]: moving through a model's latent space to blend, edit or explore its outputs.
