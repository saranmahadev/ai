// Bench: sort common symbols by the role they play.
export default function mount(root, kit) {
  const { frame, sorter, live } = kit;
  const body = frame(root, { title: "Sort the symbols" });
  const say = live(body);
  const items = [
    { id: "s", label: "Σ", why: "adds a list of terms: an operation." },
    { id: "p", label: "Π", why: "multiplies a list of terms: an operation." },
    { id: "g", label: "∇", why: "takes the gradient: an operation." },
    { id: "u", label: "∪", why: "joins two sets: an operation." },
    { id: "pi", label: "π", why: "names a constant, 3.14159…" },
    { id: "th", label: "θ", why: "commonly names parameters or an angle." },
    { id: "et", label: "η", why: "commonly names the learning rate." },
    { id: "ep", label: "ε", why: "names a tiny number or an error." },
    { id: "in", label: "∈", why: "says an element belongs to a set: a relation." },
    { id: "ap", label: "≈", why: "says two things are approximately equal: a relation." },
    { id: "le", label: "≤", why: "compares two values: a relation." },
    { id: "pr", label: "∝", why: "says proportional to: a relation." }
  ];
  const bins = [{ id: "op", label: "An operation" }, { id: "nm", label: "A name for a quantity" }, { id: "rl", label: "A relation (compares)" }];
  const answers = { s: "op", p: "op", g: "op", u: "op", pi: "nm", th: "nm", et: "nm", ep: "nm", in: "rl", ap: "rl", le: "rl", pr: "rl" };
  body.append(sorter({ items, bins, answers, onCheck: ({ correct, total }) => say(`${correct} of ${total} correct`) }).el);
  return () => {};
}
