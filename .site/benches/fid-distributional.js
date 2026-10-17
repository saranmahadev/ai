// Bench: compare a Fréchet-distance-style distributional metric between real and generated feature sets.
import { frechetDistance } from "./gakit.js";

const REAL = [[1, 2], [1.2, 2.1], [0.9, 1.9], [1.1, 2.05]];
const FAKE_SETS = {
  "close match": [[1.05, 1.95], [1.15, 2.08], [0.95, 1.92], [1.0, 2.0]],
  "shifted distribution": [[5, 5], [5.2, 5.1], [4.8, 4.9], [5.1, 5.05]],
};

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "How far apart are two feature distributions?" });
  const say = live(body);
  let key = Object.keys(FAKE_SETS)[0];

  const cv = canvas(body, { aspect: 0.5, label: "Real (hollow) vs. generated (solid) feature points" });
  const st = stats([["fid", "distributional distance"]]);
  const ch = choice("Generated set", Object.keys(FAKE_SETS).map((k) => [k, k]), key, (v) => { key = v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const cx = w / 2, cy = hh / 2, scalePx = 30;
    const draw = (pts, style) => pts.forEach(([x, y]) => {
      ctx.strokeStyle = ctx.fillStyle = style;
      ctx.beginPath(); ctx.arc(cx + (x - 3) * scalePx, cy - (y - 3) * scalePx, 6, 0, Math.PI * 2);
      style === "hollow" ? ctx.stroke() : ctx.fill();
    });
    ctx.strokeStyle = p.ink;
    REAL.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(cx + (x - 3) * scalePx, cy - (y - 3) * scalePx, 6, 0, Math.PI * 2); ctx.stroke(); });
    ctx.fillStyle = p.accent;
    FAKE_SETS[key].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(cx + (x - 3) * scalePx, cy - (y - 3) * scalePx, 5, 0, Math.PI * 2); ctx.fill(); });
  });

  function update() {
    const d = frechetDistance(REAL, FAKE_SETS[key]);
    st.set("fid", d.toFixed(4));
    say(`"${key}": distributional distance ${d.toFixed(4)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
