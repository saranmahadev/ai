// Bench: steer a toy diffusion step toward a class using a separate classifier's gradient.
import { mixtureScore, sigmoid } from "./gakit.js";

const COMPONENTS = [{ mu: [-2, 0], sigma2: 1, weight: 0.5 }, { mu: [2, 0], sigma2: 1, weight: 0.5 }];
function classifierGrad(x, k = 1) {
  const s = sigmoid(k * x[0]);
  return [k * (1 - s), 0];
}

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Steering a denoising step with a classifier" });
  const say = live(body);
  let scale = 0;
  const x0 = [0, 0], stepSize = 0.5;

  const cv = canvas(body, { aspect: 0.5, label: "Position after one guided step" });
  const st = stats([["score", "guided score"], ["x_new", "position after step"]]);
  const sl = slider({ label: "guidance scale", min: 0, max: 10, step: 1, value: scale, format: (v) => String(v), onInput: (v) => { scale = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let xNew = x0;
  cv.onDraw((ctx, w, hh, p) => {
    const cx = w / 2, cy = hh / 2, scalePx = (w / 2) / 3;
    [[-2, 0], [2, 0]].forEach(([mx, my], i) => {
      ctx.fillStyle = p.soft;
      ctx.beginPath(); ctx.arc(cx + mx * scalePx, cy - my * scalePx, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(i === 0 ? "cluster 0" : "cluster 1", cx + mx * scalePx, cy - my * scalePx + 32);
    });
    ctx.fillStyle = p.accent;
    ctx.beginPath(); ctx.arc(cx + xNew[0] * scalePx, cy - xNew[1] * scalePx, 8, 0, Math.PI * 2); ctx.fill();
  });

  function update() {
    const score = mixtureScore(x0, COMPONENTS).map((v, i) => v + scale * classifierGrad(x0)[i]);
    xNew = [x0[0] + stepSize * score[0], x0[1] + stepSize * score[1]];
    st.set("score", score.map((v) => v.toFixed(3)).join(", "));
    st.set("x_new", xNew.map((v) => v.toFixed(3)).join(", "));
    say(`guidance scale ${scale}: moved to ${xNew.map((v) => v.toFixed(2)).join(", ")}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
