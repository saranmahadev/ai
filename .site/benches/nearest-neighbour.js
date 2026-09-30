// Bench: similarity search among toy word embeddings.
import { view, grid, arrow, dot, label } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, choice, button, canvas, stats, dragHandles, fmt, live } = kit;
  const body = frame(root, { title: "Find the neighbours of a query" });
  const say = live(body);
  const W = [["cat", 0.75, 0.55], ["dog", 0.85, 0.35], ["kitten", 0.6, 0.65], ["puppy", 0.7, 0.25], ["car", -0.7, -0.35], ["truck", -0.85, -0.55], ["bus", -0.6, -0.65], ["apple", -0.05, 0.1], ["banana", 0.12, -0.05], ["man", 0.1, 0.9], ["woman", 0.1, -0.9], ["king", 0.9, 0.9], ["queen", 0.9, -0.9]].map(([n, x, y]) => ({ n, x, y }));
  let Q = { x: 0.7, y: 0.4 }, metric = "cos", ana = false, V = view(300, 200);
  const ch = choice("Rank by", [["cos", "cosine similarity"], ["dist", "closeness (distance)"]], metric, (v) => { metric = v; update(); });
  const cv = canvas(body, { aspect: 0.72, label: "Words as points in a plane with a draggable query point" });
  const st = stats([["top", "top three"], ["q", "query vector"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-row" }, button("Compute king − man + woman", () => { const g = (n) => W.find((w) => w.n === n); Q = { x: g("king").x - g("man").x + g("woman").x, y: g("king").y - g("man").y + g("woman").y }; ana = true; update(); })), h("p", { class: "bench-line" }, "Drag the orange query point around."));
  const score = (w) => (metric === "cos" ? (w.x * Q.x + w.y * Q.y) / ((Math.hypot(w.x, w.y) * Math.hypot(Q.x, Q.y)) || 1) : -Math.hypot(w.x - Q.x, w.y - Q.y));
  const rank = () => [...W].filter((w) => !(ana && ["king", "man", "woman"].includes(w.n))).sort((a, b) => score(b) - score(a));
  cv.onDraw((ctx, w, hh, p) => { V = view(w, hh, { scale: Math.min(w, hh) / 2.4 }); grid(ctx, V, w, hh, p, { step: 0.5, labels: false }); const top = rank().slice(0, 3).map((t) => t.n);
    W.forEach((t) => { const on = top.includes(t.n); dot(ctx, V.X(t.x), V.Y(t.y), on ? 7 : 5, on ? p.accent : p.muted); label(ctx, t.n, V.X(t.x) + 8, V.Y(t.y) + 4, on ? p.accent : p.muted, { size: 11 }); });
    arrow(ctx, V.X(0), V.Y(0), V.X(Q.x), V.Y(Q.y), p.warm, 3); dot(ctx, V.X(Q.x), V.Y(Q.y), 8, p.warm); });
  dragHandles(cv.cv, () => [{ x: V.X(Q.x), y: V.Y(Q.y) }], (_, px, py) => { Q = { x: Math.max(-1.1, Math.min(1.1, V.x(px))), y: Math.max(-1.1, Math.min(1.1, V.y(py))) }; ana = false; update(); });
  function update() { const r = rank().slice(0, 3); st.set("top", r.map((t) => `${t.n} (${fmt(score(t), 2)})`).join("   ")); st.set("q", `(${fmt(Q.x, 2)}, ${fmt(Q.y, 2)})`); say(`Nearest: ${r[0].n}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
