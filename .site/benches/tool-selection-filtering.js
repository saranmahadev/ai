// Bench: compare worst-case tool-selection accuracy at different pre-filter sizes K, including the risk of filtering the correct tool out entirely.
import { recallAtK, worstCaseToolAccuracy } from "./agentkit.js";

const N = 40, CORRECT_RANK = 3; // the genuinely correct tool ranks 3rd by embedding similarity
const RANKED = Array.from({ length: N }, (_, i) => ({ relevant: i === CORRECT_RANK - 1 }));

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "How many candidates to show the model" });
  const say = live(body);
  let k = 3;

  const cv = canvas(body, { aspect: 0.45, label: "Recall and worst-case accuracy by K" });
  const st = stats([["recall", "correct tool survives filtering"], ["acc", "worst-case selection accuracy"]]);
  const sl = slider({ label: "Candidates shown (K)", min: 1, max: N, step: 1, value: k, onInput: (v) => { k = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (N + 2);
    for (let i = 1; i <= N; i++) {
      const inSet = i <= k;
      const isCorrect = i === CORRECT_RANK;
      ctx.fillStyle = isCorrect ? (inSet ? p.good : p.warm) : inSet ? p.accent : p.soft;
      ctx.fillRect(bw * i, hh - 20 - (isCorrect ? 30 : 16), bw * 0.8, isCorrect ? 30 : 16);
    }
    ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    ctx.fillText(`rank ${CORRECT_RANK} is the genuinely correct tool`, w / 2, hh - 4);
  });

  function update() {
    const recall = recallAtK(RANKED, k, 1);
    const acc = worstCaseToolAccuracy(RANKED, k);
    st.set("recall", recall ? "yes" : "no — filtered out");
    st.set("acc", `${(acc * 100).toFixed(1)}%`);
    say(`K=${k}: correct tool ${recall ? "survives filtering" : "is filtered out"}, worst-case accuracy ${(acc * 100).toFixed(1)} percent`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
