// Bench: expected total cost (wasted progress + save overhead) across checkpoint intervals, with the minimum marked.
import { curve, clip, dot } from "./mathkit.js";

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "Finding a good checkpoint interval" });
  const say = live(body);
  let T = 10000, S = 10, C = 447;

  const cv = canvas(body, { aspect: 0.55, label: "Expected total cost vs checkpoint interval, with the minimum marked" });
  const st = stats([["opt", "optimal interval"], ["cost", "cost at the current interval"]]);
  const st2 = slider({ label: "total training steps (T)", min: 1000, max: 50000, step: 1000, value: T, onInput: (v) => { T = v; update(); } });
  const ss = slider({ label: "cost per save (S, in step-equivalents)", min: 1, max: 50, step: 1, value: S, onInput: (v) => { S = v; update(); } });
  const sc = slider({ label: "checkpoint interval (C)", min: 50, max: 3000, step: 10, value: C, onInput: (v) => { C = v; update(); } });
  body.append(cv.box, st.el, st2.el, ss.el, sc.el);

  const cost = (c) => c / 2 + (S * T) / c;

  cv.onDraw((ctx, w, hh, p) => {
    const maxC = 3000;
    const m = plot(w, hh, [50, maxC], [0, cost(50) * 1.1]);
    m.axes(ctx, p, { xlabel: "checkpoint interval C", ylabel: "expected cost" });
    curve(ctx, m, cost, 50, maxC, { color: p.accent, width: 3, clip: clip(m), steps: 300 });
    const optC = Math.sqrt(2 * S * T);
    dot(ctx, m.X(optC), m.Y(cost(optC)), 6, p.good);
    dot(ctx, m.X(C), m.Y(cost(C)), 6, p.warm);
  });

  function update() {
    const optC = Math.sqrt(2 * S * T);
    st.set("opt", optC.toFixed(0));
    st.set("cost", cost(C).toFixed(1));
    say(`optimal interval about ${optC.toFixed(0)} steps; cost at current interval ${cost(C).toFixed(1)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
