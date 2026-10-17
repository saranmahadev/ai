// Bench: compare linear and spherical interpolation between two latent points.
import { lerp, slerp, vecNorm } from "./gakit.js";

const Z1 = [1, 0], Z2 = [0, 1];

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Interpolating between two latents" });
  const say = live(body);
  let t = 0.5;

  const cv = canvas(body, { aspect: 0.6, label: "Linear vs. spherical interpolation path" });
  const st = stats([["lerp", "lerp |z|"], ["slerp", "slerp |z|"]]);
  const sl = slider({ label: "t", min: 0, max: 1, step: 0.05, value: t, format: (v) => v.toFixed(2), onInput: (v) => { t = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const cx = w / 2, cy = hh / 2, r = Math.min(w, hh) / 2 - 20;
    ctx.strokeStyle = p.soft; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    const steps = 40;
    ctx.strokeStyle = p.warm; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const tt = i / steps, [x, y] = lerp(Z1, Z2, tt);
      const px = cx + x * r, py = cy - y * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const tt = i / steps, [x, y] = slerp(Z1, Z2, tt);
      const px = cx + x * r, py = cy - y * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    const [lx, ly] = lerp(Z1, Z2, t), [sx, sy] = slerp(Z1, Z2, t);
    ctx.fillStyle = p.warm; ctx.beginPath(); ctx.arc(cx + lx * r, cy - ly * r, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(cx + sx * r, cy - sy * r, 6, 0, Math.PI * 2); ctx.fill();
  });

  function update() {
    const l = lerp(Z1, Z2, t), s = slerp(Z1, Z2, t);
    st.set("lerp", vecNorm(l).toFixed(3));
    st.set("slerp", vecNorm(s).toFixed(3));
    say(`t=${t.toFixed(2)}: lerp norm ${vecNorm(l).toFixed(3)}, slerp norm ${vecNorm(s).toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
