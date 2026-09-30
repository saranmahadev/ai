// Bench: place each system in the innermost circle it belongs to.
export default function mount(root, kit) {
  const { frame, sorter, h } = kit;
  const body = frame(root, {
    title: "AI, ML, DL and Generative AI"
  });
  const bins = [
    { id: "ai", label: "AI, but not learning from data" },
    { id: "ml", label: "Machine learning (not deep)" },
    { id: "dl", label: "Deep learning (not generative)" },
    { id: "gen", label: "Generative AI" }
  ];
  const items = [
    ["Rule-based expert system", "ai", "It follows hand-written if-then rules and learns nothing from data."],
    ["Route finder using A* search", "ai", "It searches a map with a fixed algorithm; nothing is learned."],
    ["Classic search-based chess program", "ai", "It searches moves with hand-tuned scoring rules."],
    ["Spam filter using word statistics", "ml", "It learns word weights from labelled emails, with no neural network."],
    ["Loan scoring with decision trees", "ml", "It learns rules from past cases, but a tree is not a deep network."],
    ["Recommendations from ratings patterns", "ml", "It learns patterns from data without a deep network."],
    ["Photo tagging with a deep neural network", "dl", "A deep network learns to recognise images, but it does not create new ones."],
    ["Speech-to-text with a neural network", "dl", "A deep network maps audio to words; it recognises rather than invents."],
    ["Fraud detector using a deep network", "dl", "A deep network scores transactions; it does not generate content."],
    ["Image generator that draws from a text prompt", "gen", "It creates new images."],
    ["Chatbot that writes essays", "gen", "A language model generates new text."],
    ["Music generator", "gen", "It creates new audio."]
  ].map(([label, bin, why], i) => ({ id: "i" + i, label, bin, why }));
  const s = sorter({ items, bins, answers: Object.fromEntries(items.map((i) => [i.id, i.bin])) });
  body.append(s.el);
}
