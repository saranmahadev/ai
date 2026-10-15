// Bench: composing the tent function k times doubles its linear pieces each time; compare the unit cost of depth vs a single wide layer.
import { curve, clip } from "./mathkit.js";

const tent = (x) => (x <= 0.5 ? 2 * x : 2 - 2 * x);
const composeTent = (x, k) => { let y = x; for (let i = 0; i < k; i++) y = tent(Math.max(0, Math.min(1, y))); return y; };

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "Folding a tent function k times" });
  const say = live(body);
  let k = 1;

  const cv = canvas(body, { aspect: 0.55, label: "The tent function composed with itself k times" });
  const st = stats([["bp", "breakpoints (2^k − 1)"], ["du", "units needed by depth (2k)"], ["wu", "units needed by one wide layer (≈2^k − 1)"]]);
  const sl = slider({ label: "depth k", min: 1, max: 8, step: 1, value: k, onInput: (v) => { k = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, 1], [-0.1, 1.1]);
    m.axes(ctx, p, { xlabel: "x", ylabel: `tent composed ${k}×` });
    curve(ctx, m, (x) => composeTent(x, k), 0, 1, { color: p.accent, width: 2.5, clip: clip(m), steps: Math.max(400, 2 ** (k + 2)) });
  });

  function update() {
    const bp = 2 ** k - 1;
    st.set("bp", String(bp));
    st.set("du", String(2 * k));
    st.set("wu", `~${bp}`);
    say(`depth ${k}: ${bp} breakpoints, ${2 * k} units by depth versus about ${bp} by width`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
