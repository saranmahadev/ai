// Bench: step a policy-gradient update and watch probability mass shift toward the highest-reward candidate.
import { reinforceStep, softmax } from "./llmkit.js";

const REWARDS = [0.2, 0.9, 0.4, 0.1];
const LABELS = ["A", "B", "C", "D"];

export default function mount(root, kit) {
  const { frame, canvas, stepper, stats, live } = kit;
  const body = frame(root, { title: "Pulling probability toward what the reward model likes" });
  const say = live(body);
  let logits = [0, 0, 0, 0], step = 0;

  const cv = canvas(body, { aspect: 0.4, label: "Policy probability per candidate" });
  const st = stats([["step", "update step"]]);

  function report() {
    st.set("step", String(step));
    const probs = softmax(logits);
    say(`step ${step}: ${LABELS.map((l, i) => `${l}=${probs[i].toFixed(3)}`).join(", ")}`);
    cv.redraw();
  }
  cv.onDraw((ctx, w, hh, p) => {
    const probs = softmax(logits), bw = w / (probs.length + 1);
    probs.forEach((pr, i) => {
      const bh = pr * (hh - 30);
      ctx.fillStyle = REWARDS[i] === Math.max(...REWARDS) ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`${LABELS[i]} (R=${REWARDS[i]})`, bw * (i + 0.5) + bw * 0.3, hh - 2);
    });
  });
  const sp = stepper({
    stepLabel: "Policy gradient step",
    onStep: () => { if (step >= 8) return false; logits = reinforceStep(logits, REWARDS); step++; report(); },
    onReset: () => { logits = [0, 0, 0, 0]; step = 0; report(); },
  });
  body.append(cv.box, st.el, sp.el);
  report();
  return () => cv.destroy();
}
