// Bench: solve a·x + b = c by doing the same operation to both sides.
export default function mount(root, kit) {
  const { h, frame, button, slider, rng, fmt, live } = kit;
  const body = frame(root, { title: "Keep the scale balanced" });
  const say = live(body);
  const r = rng(Date.now() % 1000 + 3);
  let L, R, moves, x0, n = 3;
  const show = h("div", { class: "stage", style: "font:800 1.9rem/1.3 Nunito,system-ui,sans-serif;text-align:center;padding:1.2rem 0" });
  const note = h("p", { class: "bench-verdict", "aria-live": "polite" });
  const term = (e) => {
    const cx = e.cx, k = e.k, parts = [];
    if (cx) parts.push(`${cx === 1 ? "" : cx === -1 ? "−" : fmt(cx, 3)}x`);
    if (k || !cx) parts.push(cx ? `${k < 0 ? "− " : "+ "}${fmt(Math.abs(k), 3)}` : fmt(k, 3));
    return parts.join(" ");
  };
  const draw = () => { show.textContent = `${term(L)}  =  ${term(R)}`; };
  function fresh() { const a = 2 + r.int(4), b = 1 + r.int(9); x0 = 2 + r.int(8); L = { cx: a, k: b }; R = { cx: 0, k: a * x0 + b }; moves = 0; note.textContent = "Choose an operation and a number; it is applied to both sides."; draw(); }
  function apply(op) {
    const f = { add: (v) => v + n, sub: (v) => v - n, mul: (v) => v * n, div: (v) => v / n }[op];
    for (const e of [L, R]) { e.cx = op === "add" || op === "sub" ? e.cx : f(e.cx); e.k = f(e.k); }
    moves++; draw();
    if (L.cx === 1 && L.k === 0 && R.cx === 0) { note.textContent = `Solved in ${moves} moves: x = ${fmt(R.k, 3)}. Check: the original equation holds.`; say(note.textContent); }
    else note.textContent = `${moves} move${moves > 1 ? "s" : ""}. Both sides changed together, so the scale stays balanced.`;
  }
  const sn = slider({ label: "n", min: 1, max: 12, step: 1, value: n, onInput: (v) => { n = v; } });
  body.append(show, note, h("div", { class: "bench-controls" }, sn.el), h("div", { class: "bench-row" }, button("+ n both sides", () => apply("add")), button("− n both sides", () => apply("sub")), button("× n both sides", () => apply("mul")), button("÷ n both sides", () => apply("div"))), h("div", { class: "bench-row" }, button("New equation", fresh)));
  fresh();
  return () => {};
}
