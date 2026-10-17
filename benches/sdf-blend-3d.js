// Bench: render a cross-section of two blended signed-distance shapes at different smoothness.
import { sdCircle, smoothMin } from "./gakit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Blending two implicit shapes" });
  const say = live(body);
  let k = 0;

  const cv = canvas(body, { aspect: 0.6, label: "Cross-section of two blended circles" });
  const st = stats([["mid", "distance at the midpoint"]]);
  const sl = slider({ label: "blend amount (k)", min: 0, max: 1.2, step: 0.1, value: k, format: (v) => v.toFixed(1), onInput: (v) => { k = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  function sceneSDF(p) {
    const d1 = sdCircle(p, [-0.5, 0], 0.6), d2 = sdCircle(p, [0.5, 0], 0.6);
    return smoothMin(d1, d2, k);
  }

  cv.onDraw((ctx, w, hh, p) => {
    const scalePx = Math.min(w, hh) / 3;
    const cx = w / 2, cy = hh / 2;
    const res = 3;
    for (let py = 0; py < hh; py += res) {
      for (let px = 0; px < w; px += res) {
        const wx = (px - cx) / scalePx, wy = (py - cy) / scalePx;
        const d = sceneSDF([wx, wy]);
        if (d < 0) {
          const shade = Math.max(0, 1 + d);
          ctx.fillStyle = p.accent;
          ctx.globalAlpha = 0.4 + 0.6 * shade;
          ctx.fillRect(px, py, res, res);
        }
      }
    }
    ctx.globalAlpha = 1;
  });

  function update() {
    const mid = sceneSDF([0, 0]);
    st.set("mid", mid.toFixed(4));
    say(`blend k=${k.toFixed(1)}: signed distance at the midpoint is ${mid.toFixed(4)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
