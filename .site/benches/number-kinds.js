// Bench: place numbers in the smallest family that contains them.
export default function mount(root, kit) {
  const { frame, sorter, live } = kit;
  const body = frame(root, { title: "Which family is it?" });
  const say = live(body);
  const items = [
    { id: "a", label: "7", why: "is a counting number." },
    { id: "b", label: "−3", why: "is negative, so an integer but not natural." },
    { id: "c", label: "0.75", why: "equals 3/4, a fraction of integers." },
    { id: "d", label: "√2", why: "never repeats or stops: irrational." },
    { id: "e", label: "π", why: "is irrational." },
    { id: "f", label: "22/7", why: "is a fraction, so rational (only close to π)." },
    { id: "g", label: "√9", why: "equals 3, a natural number." },
    { id: "h", label: "−1/4", why: "is a fraction of integers: rational." },
    { id: "i", label: "1,000", why: "is a counting number." },
    { id: "j", label: "0.333…", why: "repeats forever, and equals 1/3: rational." }
  ];
  const bins = [{ id: "n", label: "Natural" }, { id: "z", label: "Integer (not natural)" }, { id: "q", label: "Rational (not integer)" }, { id: "r", label: "Irrational" }];
  const answers = { a: "n", b: "z", c: "q", d: "r", e: "r", f: "q", g: "n", h: "q", i: "n", j: "q" };
  body.append(sorter({ items, bins, answers, onCheck: ({ correct, total }) => say(`${correct} of ${total} correct`) }).el);
  return () => {};
}
