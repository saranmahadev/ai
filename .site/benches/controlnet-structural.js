// Bench: lock one coordinate to a structural control value and watch the other evolve toward the matching cluster.
import { mixtureScore } from "./gakit.js";

const COMPONENTS = [{ mu: [-2, -1], sigma2: 1, weight: 0.5 }, { mu: [2, 1], sigma2: 1, weight: 0.5 }];

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "A locked structural coordinate steers the rest" });
  const say = live(body);
  let controlX = 0, steps = 5;
  const stepSize = 0.3;

  const cv = canvas(body, { aspect: 0.5, label: "Position after the structural control is applied" });
  const st = stats([["x", "final position"]]);
  const sl = slider({ label: "control value for x", min: -3, max: 3, step: 0.5, value: controlX, format: (v) => v.toFixed(1), onInput: (v) => { controlX = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let path = [];
  cv.onDraw((ctx, w, hh, p) => {
    const cx = w / 2, cy = hh / 2, scalePx = (w / 2) / 4;
    [[-2, -1], [2, 1]].forEach(([mx, my]) => {
      ctx.fillStyle = p.soft;
      ctx.beginPath(); ctx.arc(cx + mx * scalePx, cy - my * scalePx, 16, 0, Math.PI * 2); ctx.fill();
    });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    path.forEach(([x, y], i) => { const px = cx + x * scalePx, py = cy - y * scalePx; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); });
    ctx.stroke();
    const [lx, ly] = path[path.length - 1];
    ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(cx + lx * scalePx, cy - ly * scalePx, 8, 0, Math.PI * 2); ctx.fill();
  });

  function update() {
    let x = [0, 0];
    path = [x];
    for (let s = 0; s < steps; s++) {
      const score = mixtureScore(x, COMPONENTS);
      const nextY = x[1] + stepSize * score[1];
      x = [controlX, nextY];
      path.push(x);
    }
    st.set("x", `(${x[0].toFixed(2)}, ${x[1].toFixed(3)})`);
    say(`locked x to ${controlX.toFixed(1)}; free coordinate settled at ${x[1].toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
