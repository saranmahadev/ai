// Bench: compare two answers that each fail one of faithfulness and answer relevancy, but not the other.
import { cosineSim } from "./gakit.js";

const QUERY_VEC = [0.9, 0.1]; // "how long do refunds take"
const PASSAGES = { p1: [0.9, 0.1], p2: [0.1, 0.9] };
const SCENARIOS = {
  "grounded, but off-topic": { claimVec: [0.1, 0.9], answerVec: [0.1, 0.9] },
  "on-topic, but ungrounded": { claimVec: [0.5, 0.5], answerVec: [0.85, 0.15] },
};

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Two different ways an answer can go wrong" });
  const say = live(body);
  let scenario = Object.keys(SCENARIOS)[0];

  const cv = canvas(body, { aspect: 0.4, label: "Faithfulness vs. answer relevancy" });
  const st = stats([["faithfulness", "faithfulness"], ["relevancy", "answer relevancy"]]);
  const ch = choice("Scenario", Object.keys(SCENARIOS).map((k) => [k, k]), scenario, (v) => { scenario = v; update(); });
  body.append(cv.box, st.el, ch.el);

  function scores() {
    const s = SCENARIOS[scenario];
    const faithfulness = Object.values(PASSAGES).some((v) => cosineSim(s.claimVec, v) >= 0.8) ? 1 : 0;
    const relevancy = cosineSim(QUERY_VEC, s.answerVec);
    return { faithfulness, relevancy };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const { faithfulness, relevancy } = scores();
    const bw = w / 3;
    [["faithfulness", faithfulness, p.accent], ["relevancy", relevancy, p.warm]].forEach(([label, v, color], i) => {
      const bh = v * (hh - 30);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.3, hh - 2);
    });
  });

  function update() {
    const { faithfulness, relevancy } = scores();
    st.set("faithfulness", faithfulness.toFixed(3));
    st.set("relevancy", relevancy.toFixed(3));
    say(`${scenario}: faithfulness ${faithfulness.toFixed(3)}, answer relevancy ${relevancy.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
