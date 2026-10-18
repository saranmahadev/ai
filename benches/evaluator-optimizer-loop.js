// Bench: step an evaluator-optimizer loop and watch quality climb with diminishing returns, reusing the self-refinement curve already verified on the LLMs planet.
import { selfRefineQuality } from "./llmkit.js";

const MAX_ROUNDS = 4;

export default function mount(root, kit) {
  const { frame, canvas, stepper, stats, live } = kit;
  const body = frame(root, { title: "Generate, critique, improve, repeat" });
  const say = live(body);
  let round = 0;

  const cv = canvas(body, { aspect: 0.4, label: "Quality after each evaluator-optimizer round" });
  const st = stats([["quality", "quality after this round"]]);
  body.append(cv.box, st.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (MAX_ROUNDS + 1);
    for (let r = 0; r <= MAX_ROUNDS; r++) {
      const q = selfRefineQuality(r);
      const bh = q * (hh - 30);
      ctx.fillStyle = r === round ? p.accent : p.soft;
      ctx.fillRect(bw * (r + 0.2), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`round ${r}`, bw * (r + 0.2) + bw * 0.3, hh - 2);
    }
  });

  function update() {
    st.set("quality", `${(selfRefineQuality(round) * 100).toFixed(1)}%`);
    say(`round ${round}: quality ${(selfRefineQuality(round) * 100).toFixed(1)} percent`);
    cv.redraw();
  }
  const sp = stepper({
    stepLabel: "evaluator-optimizer round",
    onStep: () => { if (round >= MAX_ROUNDS) return false; round++; update(); return round < MAX_ROUNDS; },
    onReset: () => { round = 0; update(); },
  });
  body.append(sp.el);
  update();
  return () => cv.destroy();
}
