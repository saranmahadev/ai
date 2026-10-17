// Bench: compare classifier-free guidance at different scales against plain conditional generation.
import { mixtureScore, gaussScore } from "./gakit.js";

const COMPONENTS = [{ mu: [-2, 0], sigma2: 1, weight: 0.5 }, { mu: [2, 0], sigma2: 1, weight: 0.5 }];
const TARGET = [2, 0];

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Classifier-free guidance overshoots on purpose" });
  const say = live(body);
  let g = 1;
  const x0 = [0, 0], stepSize = 0.5;

  const cv = canvas(body, { aspect: 0.5, label: "Position after one CFG-guided step" });
  const st = stats([["x_new", "position after step"]]);
  const sl = slider({ label: "guidance scale", min: 0, max: 4, step: 0.5, value: g, format: (v) => v.toFixed(1), onInput: (v) => { g = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let xNew = x0;
  cv.onDraw((ctx, w, hh, p) => {
    const cx = w / 2, cy = hh / 2, scalePx = (w / 2) / 5;
    [[-2, 0], [2, 0]].forEach(([mx, my]) => {
      ctx.fillStyle = p.soft;
      ctx.beginPath(); ctx.arc(cx + mx * scalePx, cy - my * scalePx, 18, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = p.accent;
    ctx.beginPath(); ctx.arc(cx + xNew[0] * scalePx, cy - xNew[1] * scalePx, 8, 0, Math.PI * 2); ctx.fill();
  });

  function update() {
    const uncond = mixtureScore(x0, COMPONENTS);
    const cond = gaussScore(x0, TARGET, 1);
    const cfg = uncond.map((v, i) => v + g * (cond[i] - v));
    xNew = [x0[0] + stepSize * cfg[0], x0[1] + stepSize * cfg[1]];
    st.set("x_new", xNew.map((v) => v.toFixed(3)).join(", "));
    say(`guidance scale ${g.toFixed(1)}: moved to ${xNew.map((v) => v.toFixed(2)).join(", ")}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
