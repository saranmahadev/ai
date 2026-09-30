// Bench: which steps of a project may look at which data.
export default function mount(root, kit) {
  const { frame, sorter, live } = kit;
  const body = frame(root, { title: "When may each step touch which data?" });
  const say = live(body);
  const items = [
    ["a", "Fix the metric and the baseline to beat", "b", "These are decisions about the goal, made before any model sees data."],
    ["b", "Remove duplicate rows", "b", "Duplicates left in place can land in both training and test sets, which leaks."],
    ["c", "Compute the mean and spread used to scale features", "t", "Statistics from the test set would leak information about it into the model."],
    ["d", "Fill missing values with the median", "t", "The fill value is learned from the training data only, then reused unchanged."],
    ["e", "Choose k or tree depth by cross-validation", "t", "Choices are made on validation folds carved out of the training data."],
    ["f", "Look through the mistakes for weak slices", "t", "Error analysis on the test set would turn it into a second validation set."],
    ["g", "Train the final model", "t", "The final fit uses the training (and validation) data, never the test set."],
    ["h", "Report accuracy on the test set", "e", "The test set is used once, at the very end, for an honest estimate."]
  ];
  const s = sorter({ items: items.map(([id, label, , why]) => ({ id, label, why })), bins: [{ id: "b", label: "Before the split" }, { id: "t", label: "Training data only" }, { id: "e", label: "Test data, once, at the end" }], answers: Object.fromEntries(items.map(([id, , a]) => [id, a])), onCheck: ({ correct, total }) => say(`${correct} of ${total} correct`) });
  body.append(s.el);
  return () => {};
}
