// Bench: watch how one weak category can hide inside an otherwise-strong overall benchmark average.
import { categoryAverage } from "./llmkit.js";

const BASE_SCORES = { math: 0.85, reading: 0.82, coding: 0.88, safety_qa: 0.40, commonsense: 0.80 };

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "One weak score, hidden in the average" });
  const say = live(body);
  let safetyScore = BASE_SCORES.safety_qa;

  const cv = canvas(body, { aspect: 0.45, label: "Per-category scores and the overall average" });
  const st = stats([["overall", "overall average"]]);
  const sl = slider({ label: "safety_qa score", min: 0, max: 1, step: 0.05, value: safetyScore, format: (v) => v.toFixed(2), onInput: (v) => { safetyScore = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let scores = { ...BASE_SCORES };
  cv.onDraw((ctx, w, hh, p) => {
    const labels = Object.keys(scores), bw = w / (labels.length + 1);
    labels.forEach((l, i) => {
      const bh = scores[l] * (hh - 30);
      ctx.fillStyle = l === "safety_qa" ? p.warm : p.accent;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(l, bw * (i + 0.5) + bw * 0.3, hh - 2);
    });
  });

  function update() {
    scores = { ...BASE_SCORES, safety_qa: safetyScore };
    const overall = categoryAverage(scores);
    st.set("overall", overall.toFixed(3));
    say(`safety_qa at ${safetyScore.toFixed(2)}: overall average is ${overall.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
