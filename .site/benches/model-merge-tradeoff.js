// Bench: compare each task-specialist model's loss against the averaged, merged model's.
import { squaredLoss } from "./llmkit.js";

const TASK_A = [1, 0], TASK_B = [0, 1];

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "One model, moderately good at both" });
  const say = live(body);
  let which = "merged";

  const wA = TASK_A, wB = TASK_B, merged = [(wA[0] + wB[0]) / 2, (wA[1] + wB[1]) / 2];
  const MODELS = { specialistA: wA, specialistB: wB, merged };

  const cv = canvas(body, { aspect: 0.4, label: "Loss on task A and task B, by model" });
  const st = stats([["lossA", "loss on task A"], ["lossB", "loss on task B"]]);
  const ch = choice("Model", [["specialistA", "specialist (fine-tuned on A)"], ["specialistB", "specialist (fine-tuned on B)"], ["merged", "merged (averaged weights)"]], which, (v) => { which = v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const w0 = MODELS[which];
    const lossA = squaredLoss(w0, TASK_A), lossB = squaredLoss(w0, TASK_B);
    const bw = w / 3, maxV = 2;
    [["task A", lossA, p.accent], ["task B", lossB, p.warm]].forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 30);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`${label} loss`, bw * (i + 0.6) + bw * 0.3, hh - 2);
    });
  });

  function update() {
    const w0 = MODELS[which];
    const lossA = squaredLoss(w0, TASK_A), lossB = squaredLoss(w0, TASK_B);
    st.set("lossA", lossA.toFixed(3));
    st.set("lossB", lossB.toFixed(3));
    say(`${which}: loss on task A ${lossA.toFixed(3)}, loss on task B ${lossB.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
