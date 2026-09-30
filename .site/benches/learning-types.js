// Bench: sort scenarios into supervised, unsupervised and reinforcement learning.
export default function mount(root, kit) {
  const { frame, sorter, live } = kit;
  const body = frame(root, { title: "Which kind of learning is it?" });
  const say = live(body);
  const items = [
    ["a", "Predict house prices from past sales with known prices", "s", "Every example has a known answer (the price)."],
    ["b", "Group customers by buying habits with no labels given", "u", "No answers are given; the goal is to find structure."],
    ["c", "A robot learns to walk by trying, falling and being rewarded for distance", "r", "It learns from rewards after actions, not from labelled answers."],
    ["d", "Flag emails as spam using thousands of hand-labelled emails", "s", "The labels spam and not spam are the answers."],
    ["e", "Find unusual card transactions without knowing which are fraud", "u", "With no fraud labels, it looks for what does not fit."],
    ["f", "A program learns chess by playing itself and winning or losing", "r", "The only feedback is the game result, arriving after many moves."],
    ["g", "Translate sentences using pairs of sentences and their translations", "s", "Each input has a known target output."],
    ["h", "Compress photos into a few numbers that capture their look", "u", "It learns a summary of the data with no target."]
  ];
  const s = sorter({ items: items.map(([id, label, , why]) => ({ id, label, why })), bins: [{ id: "s", label: "Supervised" }, { id: "u", label: "Unsupervised" }, { id: "r", label: "Reinforcement" }], answers: Object.fromEntries(items.map(([id, , a]) => [id, a])), onCheck: ({ correct, total }) => say(`${correct} of ${total} correct`) });
  body.append(s.el);
  return () => {};
}
