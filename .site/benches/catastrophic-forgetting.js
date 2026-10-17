// Bench: step fine-tuning updates toward a new task and watch the old task's loss climb back up.
import { squaredLoss, gradientStepToward } from "./llmkit.js";

const TASK_A = [1, 0], TASK_B = [0, 1], LR = 0.3;

export default function mount(root, kit) {
  const { frame, canvas, stepper, stats, live } = kit;
  const body = frame(root, { title: "Learning the new task un-learns the old one" });
  const say = live(body);
  let w = [...TASK_A], step = 0;

  const cv = canvas(body, { aspect: 0.4, label: "Loss on task A (old) vs. task B (new) over fine-tuning steps" });
  const st = stats([["step", "fine-tuning step"], ["lossA", "loss on old task A"], ["lossB", "loss on new task B"]]);
  body.append(cv.box, st.el);

  const history = [{ lossA: squaredLoss(w, TASK_A), lossB: squaredLoss(w, TASK_B) }];
  cv.onDraw((ctx, w2, hh, p) => {
    const maxV = 2, pad = 20;
    ctx.strokeStyle = p.soft; ctx.lineWidth = 1;
    [0, 1, 2].forEach((lvl) => { const y = hh - pad - (lvl / maxV) * (hh - 2 * pad); ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w2 - pad, y); ctx.stroke(); });
    function drawLine(key, color) {
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
      history.forEach((h, i) => {
        const x = pad + (i / 6) * (w2 - 2 * pad);
        const y = hh - pad - (h[key] / maxV) * (hh - 2 * pad);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
    drawLine("lossA", p.warm);
    drawLine("lossB", p.accent);
  });

  function report() {
    const lossA = squaredLoss(w, TASK_A), lossB = squaredLoss(w, TASK_B);
    st.set("step", String(step));
    st.set("lossA", lossA.toFixed(4));
    st.set("lossB", lossB.toFixed(4));
    say(`step ${step}: loss on old task A ${lossA.toFixed(3)}, loss on new task B ${lossB.toFixed(3)}`);
    cv.redraw();
  }
  const sp = stepper({
    stepLabel: "fine-tuning step",
    onStep: () => {
      if (step >= 6) return false;
      w = gradientStepToward(w, TASK_B, LR);
      step++;
      history.push({ lossA: squaredLoss(w, TASK_A), lossB: squaredLoss(w, TASK_B) });
      report();
      return step < 6;
    },
    onReset: () => { w = [...TASK_A]; step = 0; history.length = 1; report(); },
  });
  body.append(sp.el);
  report();
  return () => cv.destroy();
}
