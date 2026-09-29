// Bench: match everyday problems to the type of task they are.
export default function mount(root, kit) {
  const { frame, sorter } = kit;
  const body = frame(root, {
    title: "What kind of task is it?",
    hint: "Choose a problem, then press the task type it belongs to (or drag it)."
  });
  const bins = [
    { id: "cls", label: "Classify: pick a category" },
    { id: "reg", label: "Predict a number" },
    { id: "clu", label: "Group similar things (no labels)" },
    { id: "gen", label: "Generate new content" },
    { id: "act", label: "Choose actions over time" }
  ];
  const items = [
    ["Is this email spam or not?", "cls", "The answer is one of a fixed set of categories."],
    ["What will this house sell for?", "reg", "The answer is a number on a scale."],
    ["Split customers into segments no one has defined yet", "clu", "There are no labels; the goal is to discover groups."],
    ["Write a product description", "gen", "The output is new text."],
    ["What will tomorrow's temperature be?", "reg", "The answer is a number."],
    ["Is this photo a cat or a dog?", "cls", "One category from a fixed set."],
    ["Draw a picture from a text prompt", "gen", "The output is a new image."],
    ["When should a robot arm close its gripper?", "act", "It is a decision that plays out over time, with feedback from the world."],
    ["Find clusters of similar news stories", "clu", "There are no labels; similarity defines the groups."],
    ["Choose the next move in a video game", "act", "A sequence of choices, each affecting the next."],
    ["How long will this delivery take?", "reg", "The answer is a number of minutes."],
    ["Is this card transaction fraudulent?", "cls", "One of two categories."]
  ].map(([label, bin, why], i) => ({ id: "t" + i, label, bin, why }));
  body.append(sorter({ items, bins, answers: Object.fromEntries(items.map((i) => [i.id, i.bin])) }).el);
}
