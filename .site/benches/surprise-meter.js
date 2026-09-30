// Bench: information (surprise) in bits, and how independent surprises add.
import { curve, clip, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "How surprising is it?" });
  const say = live(body);
  let p = 0.5, q = 0.25;
  const sp = slider({ label: "probability of event A", min: 0.01, max: 1, step: 0.01, value: p, format: (v) => fmt(v, 2), onInput: (v) => { p = v; update(); } });
  const sq = slider({ label: "probability of an independent event B", min: 0.01, max: 1, step: 0.01, value: q, format: (v) => fmt(v, 2), onInput: (v) => { q = v; update(); } });
  const cv = canvas(body, { aspect: 0.5, label: "Surprise in bits as a function of probability" });
  const st = stats([["a", "surprise of A (bits)"], ["n", "surprise of A in nats"], ["q", "surprise of B (bits)"], ["ab", "surprise of A and B together"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sp.el, sq.el));
  cv.onDraw((ctx, w, hh, pc) => { const m = plot(w, hh, [0, 1], [0, 7]); m.axes(ctx, pc, { xlabel: "probability", ylabel: "surprise (bits)" }); curve(ctx, m, (x) => -Math.log2(x), 0.008, 1, { color: pc.accent, width: 4, clip: clip(m), steps: 300 }); dot(ctx, m.X(p), m.Y(-Math.log2(p)), 7, pc.warm); dot(ctx, m.X(q), m.Y(-Math.log2(q)), 6, pc.good); });
  function update() { const a = -Math.log2(p), b = -Math.log2(q); st.set("a", fmt(a, 3)); st.set("n", fmt(-Math.log(p), 3)); st.set("q", fmt(b, 3)); st.set("ab", `${fmt(a, 2)} + ${fmt(b, 2)} = ${fmt(a + b, 3)} bits  (probability ${fmt(p * q, 4)})`); say(`Surprise of A is ${fmt(a, 2)} bits`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
