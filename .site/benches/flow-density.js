// Bench: a simple affine flow x = scale*z + shift; base and transformed densities via change of variables.
import { curve, clip, normPdf } from "./mathkit.js";

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "Stretching a distribution and tracking its density" });
  const say = live(body);
  let scale = 2, shift = 3, evalX = 5;

  const cv = canvas(body, { aspect: 0.55, label: "Base distribution (dashed) and the transformed distribution" });
  const st = stats([["z", "corresponding z"], ["px", "exact density p(x) at the evaluation point"]]);
  const ss = slider({ label: "scale", min: 0.3, max: 4, step: 0.1, value: scale, format: (v) => v.toFixed(1), onInput: (v) => { scale = v; update(); } });
  const sh = slider({ label: "shift", min: -4, max: 4, step: 0.1, value: shift, format: (v) => v.toFixed(1), onInput: (v) => { shift = v; update(); } });
  const se = slider({ label: "evaluation point x", min: -6, max: 10, step: 0.1, value: evalX, format: (v) => v.toFixed(1), onInput: (v) => { evalX = v; update(); } });
  body.append(cv.box, st.el, ss.el, sh.el, se.el);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [-8, 12], [0, 1.2]);
    m.axes(ctx, p, { xlabel: "value", ylabel: "density" });
    curve(ctx, m, (z) => normPdf(z), -8, 12, { color: p.muted, width: 2.5, dash: [5, 4], clip: clip(m) });
    curve(ctx, m, (x) => normPdf((x - shift) / scale) / Math.abs(scale), -8, 12, { color: p.accent, width: 3, clip: clip(m) });
    const z = (evalX - shift) / scale, px = normPdf(z) / Math.abs(scale);
    ctx.fillStyle = p.warm; ctx.beginPath(); ctx.arc(m.X(evalX), m.Y(px), 6, 0, 7); ctx.fill();
  });

  function update() {
    const z = (evalX - shift) / scale;
    const px = normPdf(z) / Math.abs(scale);
    st.set("z", z.toFixed(4));
    st.set("px", px.toFixed(4));
    say(`z=${z.toFixed(2)}, density ${px.toFixed(4)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
