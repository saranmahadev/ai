// Bench: match functions to their derivatives.
export default function mount(root, kit) {
  const { frame, sorter, live } = kit;
  const body = frame(root, { title: "Match each function to its derivative" });
  const say = live(body);
  const items = [
    { id: "a", label: "x³", why: "power rule: 3x²." },
    { id: "b", label: "5x", why: "the derivative of 5x is the constant 5." },
    { id: "c", label: "7", why: "a constant does not change: 0." },
    { id: "d", label: "x² + x", why: "sum rule: 2x + 1." },
    { id: "e", label: "1/x", why: "write it as x⁻¹, then the power rule gives −x⁻² = −1/x²." }
  ];
  const bins = [{ id: "3x2", label: "3x²" }, { id: "5", label: "5" }, { id: "0", label: "0" }, { id: "2x1", label: "2x + 1" }, { id: "inv", label: "−1/x²" }];
  const answers = { a: "3x2", b: "5", c: "0", d: "2x1", e: "inv" };
  body.append(sorter({ items, bins, answers, onCheck: ({ correct, total }) => say(`${correct} of ${total} correct`) }).el);
  return () => {};
}
