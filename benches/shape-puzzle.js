// Bench: do these tensor shapes fit? Broadcasting and matrix products.
export default function mount(root, kit) {
  const { h, frame, button, live } = kit;
  const body = frame(root, { title: "Do these shapes fit?" });
  const say = live(body);
  const Q = [
    ["(3, 4) + (4)", ["(3, 4)", "(4, 3)", "error"], "(3, 4)", "The last sizes match (4 and 4); the missing leading size stretches to 3."],
    ["(3, 1) + (1, 4)", ["(3, 4)", "(1, 1)", "error"], "(3, 4)", "Each size-1 dimension stretches to match the other shape."],
    ["(3, 4) + (3)", ["(3, 4)", "(3, 3)", "error"], "error", "Shapes are compared from the right: 4 and 3 differ and neither is 1."],
    ["(5, 1, 4) + (3, 1)", ["(5, 3, 4)", "(5, 1, 4)", "error"], "(5, 3, 4)", "Right to left: 4 vs 1 → 4, 1 vs 3 → 3, then the leading 5 remains."],
    ["(2, 3) @ (3, 5)  (matrix product)", ["(2, 5)", "(3, 3)", "error"], "(2, 5)", "The inner sizes match (3 and 3), leaving (2, 5)."],
    ["(2, 3) @ (2, 3)  (matrix product)", ["(2, 3)", "(3, 3)", "error"], "error", "The inner sizes are 3 and 2, which differ."],
    ["(32, 10) + (10)", ["(32, 10)", "(10, 32)", "error"], "(32, 10)", "A bias vector is added to every row of a batch."]
  ];
  let i = 0, score = 0, done = false;
  const claim = h("p", { class: "stage", style: "font:800 1.3rem/1.4 ui-monospace,monospace;min-height:3rem" }), opts = h("div", { class: "bench-row" }), msg = h("p", { class: "bench-verdict", "aria-live": "polite" }), cnt = h("p", { class: "bench-line" });
  const next = button("Next puzzle", () => { i = (i + 1) % Q.length; if (!i) score = 0; show(); });
  function show() { done = false; const [q, o] = Q[i]; claim.textContent = q + "  →  ?"; opts.textContent = ""; o.forEach((t) => opts.append(button(t, () => pick(t)))); msg.textContent = ""; cnt.textContent = `Puzzle ${i + 1} of ${Q.length}   ·   score ${score}`; }
  function pick(t) { if (done) return; done = true; const ok = t === Q[i][2]; if (ok) score++; msg.textContent = `${ok ? "Correct." : `Not quite: the answer is ${Q[i][2]}.`} ${Q[i][3]}`; say(msg.textContent); cnt.textContent = `Puzzle ${i + 1} of ${Q.length}   ·   score ${score}`; }
  body.append(claim, opts, msg, cnt, h("div", { class: "bench-row" }, next));
  show();
  return () => {};
}
