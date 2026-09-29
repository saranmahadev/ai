export const REPO = "https://github.com/saranmahadev/ai/blob/main/";

// status: "written" = note has content, "outlined" = note exists but is empty, "planned" = no note yet
export const stages = [
  {
    id: "01", title: "AI Fundamentals", kicker: "Start here", color: "#67e8f9",
    note: "Fundamentals.md", status: "written",
    blurb: "What AI is and how an intelligent system perceives, decides and acts: agents, rationality and the Perception → Decision → Action loop.",
    groups: [
      { name: "Core ideas", items: ["Intelligent agents", "Rationality", "PDA loop"] },
      { name: "The AI loop", items: ["Data", "Learning", "Representation", "Inference", "Output / action"] },
      { name: "Nesting", items: ["AI", "Machine Learning", "Deep Learning", "Generative AI"] }
    ]
  },
  {
    id: "02", title: "Math", kicker: "The language of models", color: "#a78bfa",
    note: "Math.md", status: "written",
    blurb: "Eight areas that every later stage leans on, from vectors and gradients to entropy and numerical stability.",
    groups: [
      { name: "Linear Algebra", items: ["Scalars", "Vectors", "Matrices", "Tensors", "Vector Spaces", "Eigenvalues & Eigenvectors", "Matrix Decompositions", "Dimensionality Reduction"] },
      { name: "Calculus", items: ["Limits", "Functions", "Derivatives", "Partial Derivatives", "Gradients", "Jacobian", "Hessian", "Optimization"] },
      { name: "Probability", items: ["Probability Fundamentals", "Conditional Probability", "Bayes Theorem", "Random Variables", "Probability Distributions", "Multivariate Probability", "Expectation & Moments"] },
      { name: "Statistics", items: ["Descriptive Statistics", "Data Distributions", "Sampling", "Estimation", "Confidence Intervals", "Hypothesis Testing", "Correlation & Covariance"] },
      { name: "Information Theory", items: ["Entropy", "Cross-Entropy", "KL Divergence", "Mutual Information", "Information Gain"] },
      { name: "Also", items: ["Optimization Theory", "Numerical Foundations", "ML-Specific Mathematical Concepts"] }
    ]
  },
  {
    id: "03", title: "Machine Learning", kicker: "Learn from data", color: "#fbbf24",
    note: "Machine Learning.md", status: "outlined",
    blurb: "Building systems that learn patterns from data instead of being handed every rule. Data plus correct answers go into a learning algorithm; a model comes out.",
    groups: [
      { name: "Shape of the idea", items: ["Data + correct answers", "Learning algorithm", "Model", "Prediction on new data"] },
      { name: "Typical models", items: ["Trees", "Regression", "SVM"] }
    ]
  },
  {
    id: "04", title: "Deep Learning", kicker: "Learn representations", color: "#fb7185",
    note: "Deep Learning.md", status: "outlined",
    blurb: "Machine learning with multi-layer neural networks that learn useful representations themselves, powerful on images, audio, video and language.",
    groups: [
      { name: "Key contrast", items: ["Hand-picked features (ML)", "Learned representations (DL)"] }
    ]
  },
  {
    id: "05", title: "Neural Networks", kicker: "The building block", color: "#34d399",
    status: "planned",
    blurb: "The multi-layer networks that deep learning is made of. Note not written yet.",
    groups: []
  },
  {
    id: "06", title: "Transformers", kicker: "Attention era", color: "#60a5fa",
    status: "planned",
    blurb: "The architecture behind modern generative models. Note not written yet.",
    groups: []
  },
  {
    id: "07", title: "Generative AI", kicker: "Create, don't just classify", color: "#f472b6",
    status: "planned",
    blurb: "AI that creates new content from patterns learned in existing data: text, images, audio, video and code.",
    groups: [
      { name: "Model families", items: ["Transformers", "Diffusion", "GANs"] }
    ]
  },
  {
    id: "08", title: "LLMs", kicker: "Language at scale", color: "#f97316",
    status: "planned",
    blurb: "Transformers that predict the next token, over and over, until a response is complete.",
    groups: []
  },
  {
    id: "09", title: "RAG", kicker: "Ground the model", color: "#2dd4bf",
    status: "planned",
    blurb: "Retrieval-augmented generation. Note not written yet.",
    groups: []
  },
  {
    id: "10", title: "Agents", kicker: "Put it all together", color: "#e879f9",
    status: "planned",
    blurb: "Systems that perceive, decide and act using everything before them. It closes the loop back to the Fundamentals.",
    groups: []
  }
];

export const statusLabel = {
  written: "Notes in the vault",
  outlined: "Note outlined, content coming",
  planned: "Planned"
};
