// Bench: compare total frame-to-frame motion with and without a temporal-consistency damping term.
import { nextFrame } from "./gakit.js";
import { rng } from "./kit.js";

const COMPONENTS = [{ mu: [-2, 2], sigma2: 1, weight: 0.5 }, { mu: [2, 2], sigma2: 1, weight: 0.5 }];
const N_FRAMES = 8, STEP_SIZE = 0.3, NOISE_SCALE = 1.2;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Jittery frames vs. a temporally consistent sequence" });
  const say = live(body);
  let lambda = 0;

  const cv = canvas(body, { aspect: 0.5, label: "Frame-to-frame path" });
  const st = stats([["motion", "total frame-to-frame motion"]]);
  const sl = slider({ label: "temporal consistency (λ)", min: 0, max: 0.9, step: 0.1, value: lambda, format: (v) => v.toFixed(1), onInput: (v) => { lambda = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let frames = [];
  cv.onDraw((ctx, w, hh, p) => {
    const cx = w / 2, cy = hh / 2, scalePx = (w / 2) / 4;
    [[-2, 2], [2, 2]].forEach(([mx, my]) => {
      ctx.fillStyle = p.soft; ctx.beginPath(); ctx.arc(cx + mx * scalePx, cy - my * scalePx, 16, 0, Math.PI * 2); ctx.fill();
    });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    frames.forEach(([x, y], i) => { const px = cx + x * scalePx, py = cy - y * scalePx; i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
    ctx.stroke();
    frames.forEach(([x, y]) => { ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(cx + x * scalePx, cy - y * scalePx, 4, 0, Math.PI * 2); ctx.fill(); });
  });

  function update() {
    const rand = rng(3);
    let x = [0, 2];
    frames = [x];
    let motion = 0;
    for (let f = 0; f < N_FRAMES; f++) {
      const noise = [(rand() * 2 - 1) * NOISE_SCALE, (rand() * 2 - 1) * NOISE_SCALE];
      const next = nextFrame(x, COMPONENTS, { stepSize: STEP_SIZE, noise, consistencyLambda: lambda });
      motion += Math.hypot(next[0] - x[0], next[1] - x[1]);
      frames.push(next);
      x = next;
    }
    st.set("motion", motion.toFixed(3));
    say(`λ=${lambda.toFixed(1)}: total frame-to-frame motion ${motion.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
