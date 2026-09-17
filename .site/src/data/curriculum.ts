export type LearningStage = {
  id: string;
  title: string;
  kicker: string;
  description: string;
  tone: "sage" | "apricot" | "lilac" | "butter" | "sky";
};

export const learningStages: LearningStage[] = [
  {
    id: "01",
    title: "Math Foundations",
    kicker: "Start here",
    description: "Build the language behind models: vectors, calculus, probability, and optimization.",
    tone: "sage",
  },
  {
    id: "02",
    title: "Machine Learning",
    kicker: "Find patterns",
    description: "Learn how data, objectives, and evaluation become useful predictive systems.",
    tone: "apricot",
  },
  {
    id: "03",
    title: "Deep Learning",
    kicker: "Learn representations",
    description: "See how neural networks transform signals, images, language, and structure.",
    tone: "lilac",
  },
  {
    id: "04",
    title: "Language Models",
    kicker: "Work with language",
    description: "Understand transformers, retrieval, prompting, and the systems around them.",
    tone: "butter",
  },
  {
    id: "05",
    title: "Agent Systems",
    kicker: "Put it together",
    description: "Design AI systems that reason, use tools, and operate with clear constraints.",
    tone: "sky",
  },
];
