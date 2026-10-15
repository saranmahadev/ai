// Bench: step through a toy noise schedule, showing the signal and noise weights trading off.
import { curve, clip, dot } from "./mathkit.js";

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live, stepper } = kit;
  const body = frame(root, { title: "Noising a value, step by step" });
  const say = live(body);
  let betaScale = 1, t = 0;
  const MAX_T = 12;
  const baseBetas = Array.from({ length: MAX_T }, (_, i) => 0.05 + 0.03 * i);

  const cv = canvas(body, { aspect: 0.55, label: "Signal weight and noise weight across steps" });
  const st = stats([["abar", "ᴀ̄ (cumulative) at this step"], ["sig", "signal weight"], ["noise", "noise weight"]]);
  const sb = slider({ label: "noise schedule scale", min: 0.2, max: 2, step: 0.1, value: betaScale, format: (v) => v.toFixed(1), onInput: (v) => { betaScale = v; update(); } });
  const sp = stepper({ onStep: step, onReset: reset, interval: 300 });
  body.append(cv.box, st.el, sb.el, sp.el);

  function abarAt(step) { let ab = 1; for (let i = 0; i < step; i++) ab *= 1 - Math.min(0.95, baseBetas[i] * betaScale); return ab; }
  function reset() { t = 0; update(); }
  function step() { if (t >= MAX_T) return false; t++; update(); return t < MAX_T; }

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, MAX_T], [0, 1]);
    m.axes(ctx, p, { xlabel: "step", ylabel: "weight" });
    curve(ctx, m, (x) => Math.sqrt(abarAt(x)), 0, MAX_T, { color: p.accent, width: 3, clip: clip(m), steps: 200 });
    curve(ctx, m, (x) => Math.sqrt(1 - abarAt(x)), 0, MAX_T, { color: p.warm, width: 3, clip: clip(m), steps: 200 });
    dot(ctx, m.X(t), m.Y(Math.sqrt(abarAt(t))), 5, p.ink);
    dot(ctx, m.X(t), m.Y(Math.sqrt(1 - abarAt(t))), 5, p.ink);
  });

  function update() {
    const ab = abarAt(t);
    st.set("abar", ab.toFixed(4));
    st.set("sig", Math.sqrt(ab).toFixed(4));
    st.set("noise", Math.sqrt(1 - ab).toFixed(4));
    say(`step ${t}: signal weight ${Math.sqrt(ab).toFixed(3)}, noise weight ${Math.sqrt(1 - ab).toFixed(3)}`);
    cv.redraw();
  }
  reset();
  return () => { cv.destroy(); sp.stop(); };
}
