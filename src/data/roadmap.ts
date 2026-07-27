export type StageStatus = "planned" | "in-progress" | "complete";

export interface Stage {
  id: string;
  slug: string;
  tag: string;
  title: string;
  subtitle: string;
  blurb: string;
  topics: string[];
  status: StageStatus;
}

export const STAGES: Stage[] = [
  {
    id: "01",
    slug: "math",
    tag: "stage-01.math",
    title: "MATH",
    subtitle: "Foundations",
    blurb: "The language everything else is written in — build it once, use it forever.",
    topics: ["Linear Algebra", "Calculus", "Probability & Statistics", "Optimization"],
    status: "planned",
  },
  {
    id: "02",
    slug: "ml-fundamentals",
    tag: "stage-02.ml",
    title: "ML FUNDAMENTALS",
    subtitle: "Core Concepts",
    blurb: "Supervised and unsupervised learning, evaluation, and the classic algorithms.",
    topics: ["Regression & Classification", "Feature Engineering", "Model Evaluation", "Classical Algorithms"],
    status: "planned",
  },
  {
    id: "03",
    slug: "deep-learning",
    tag: "stage-03.dl",
    title: "DEEP LEARNING",
    subtitle: "Neural Systems",
    blurb: "Neural networks from first principles through CNNs, RNNs, and transformers.",
    topics: ["Neural Networks", "CNNs & RNNs", "Transformers", "PyTorch / TensorFlow"],
    status: "planned",
  },
  {
    id: "04",
    slug: "generative-ai",
    tag: "stage-04.genai",
    title: "GENERATIVE AI",
    subtitle: "LLMs & Beyond",
    blurb: "Large language models, prompting, retrieval, and fine-tuning in practice.",
    topics: ["LLMs", "Prompt Engineering", "RAG", "Fine-tuning"],
    status: "planned",
  },
  {
    id: "05",
    slug: "agent-engineering",
    tag: "stage-05.agents",
    title: "AGENT ENGINEERING",
    subtitle: "Autonomous Systems",
    blurb: "Tool use, orchestration, memory, and multi-agent systems that act on their own.",
    topics: ["Tool Calling", "MCP", "Multi-Agent Systems", "Orchestration Frameworks"],
    status: "planned",
  },
  {
    id: "06",
    slug: "capstone-projects",
    tag: "stage-06.capstone",
    title: "CAPSTONE PROJECTS",
    subtitle: "Applied Builds",
    blurb: "End-to-end projects that pull every prior stage into one shipped system.",
    topics: ["End-to-End Builds", "Production Deployment", "Portfolio Projects"],
    status: "planned",
  },
];
