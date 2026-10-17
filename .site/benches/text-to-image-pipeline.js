// Bench: run a toy text-to-image pipeline -- CFG-guided denoising toward a chosen prompt's cluster.
import { mixtureScore, gaussScore } from "./gakit.js";

const CLUSTERS = { cat: [-2, 2], dog: [2, 2], bird: [0, -2.5] };
const COMPONENTS = Object.values(CLUSTERS).map((mu) => ({ mu, sigma2: 1, weight: 1 / 3 }));
const STEPS = 6, STEP_SIZE = 0.3, GUIDANCE_SCALE = 3;

export default function mount(root, kit) {
  const { frame, canvas, choice, stepper, stats, live } = kit;
  const body = frame(root, { title: "Text prompt → denoised image latent" });
  const say = live(body);
  let prompt = "cat", path = [], shown = 0;

  const cv = canvas(body, { aspect: 0.6, label: "Denoising path toward the prompted cluster" });
  const st = stats([["step", "step"], ["position", "position"]]);
  const ch = choice("Prompt", Object.keys(CLUSTERS).map((k) => [k, k]), prompt, (v) => { prompt = v; rebuild(); });

  function report() {
    st.set("step", String(shown));
    st.set("position", path[shown].map((v) => v.toFixed(2)).join(", "));
    say(`step ${shown}: position ${path[shown].map((v) => v.toFixed(2)).join(", ")}`);
    cv.redraw();
  }
  const sp = stepper({
    stepLabel: "Step",
    onStep: () => { if (shown >= STEPS) return false; shown++; report(); },
    onReset: () => { shown = 0; report(); },
  });
  body.append(cv.box, st.el, ch.el, sp.el);

  cv.onDraw((ctx, w, hh, p) => {
    const cx = w / 2, cy = hh / 2, scalePx = (w / 2) / 4;
    Object.entries(CLUSTERS).forEach(([name, [mx, my]]) => {
      ctx.fillStyle = name === prompt ? p.accent : p.soft;
      ctx.beginPath(); ctx.arc(cx + mx * scalePx, cy - my * scalePx, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(name, cx + mx * scalePx, cy - my * scalePx + 28);
    });
    ctx.strokeStyle = p.warm; ctx.lineWidth = 2; ctx.beginPath();
    path.slice(0, shown + 1).forEach(([x, y], i) => { const px = cx + x * scalePx, py = cy - y * scalePx; i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
    ctx.stroke();
    const [lx, ly] = path[shown];
    ctx.fillStyle = p.warm; ctx.beginPath(); ctx.arc(cx + lx * scalePx, cy - ly * scalePx, 7, 0, Math.PI * 2); ctx.fill();
  });

  function rebuild() {
    let x = [0, 0];
    path = [x];
    for (let s = 0; s < STEPS; s++) {
      const uncond = mixtureScore(x, COMPONENTS);
      const cond = gaussScore(x, CLUSTERS[prompt], 1);
      const cfg = uncond.map((v, i) => v + GUIDANCE_SCALE * (cond[i] - v));
      x = [x[0] + STEP_SIZE * cfg[0], x[1] + STEP_SIZE * cfg[1]];
      path.push(x);
    }
    shown = 0;
    report();
  }
  rebuild();
  return () => cv.destroy();
}
