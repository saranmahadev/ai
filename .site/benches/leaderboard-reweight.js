// Bench: reweight leaderboard categories and watch the ranking between two models flip.
import { weightedLeaderboardScore } from "./llmkit.js";

const MODEL_X = { reasoning: 0.9, creativity: 0.5, safety: 0.7 };
const MODEL_Y = { reasoning: 0.6, creativity: 0.9, safety: 0.7 };

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "The ranking depends on the weighting" });
  const say = live(body);
  let creativityWeight = 1;
  const REASONING_WEIGHT = 1, SAFETY_WEIGHT = 1;

  const cv = canvas(body, { aspect: 0.4, label: "Weighted leaderboard score" });
  const st = stats([["winner", "current leader"]]);
  const sl = slider({ label: "weight on creativity", min: 0.2, max: 4, step: 0.2, value: creativityWeight, format: (v) => `${v.toFixed(1)}×`, onInput: (v) => { creativityWeight = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let scoreX, scoreY;
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / 3;
    const xH = scoreX * (hh - 30), yH = scoreY * (hh - 30);
    ctx.fillStyle = scoreX > scoreY ? p.accent : p.soft; ctx.fillRect(bw * 0.5, hh - 15 - xH, bw * 0.6, xH);
    ctx.fillStyle = scoreY > scoreX ? p.accent : p.soft; ctx.fillRect(bw * 1.7, hh - 15 - yH, bw * 0.6, yH);
    ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("Model X", bw * 0.8, hh - 2); ctx.fillText("Model Y", bw * 2.0, hh - 2);
  });

  function update() {
    const weights = { reasoning: REASONING_WEIGHT, creativity: creativityWeight, safety: SAFETY_WEIGHT };
    scoreX = weightedLeaderboardScore(MODEL_X, weights);
    scoreY = weightedLeaderboardScore(MODEL_Y, weights);
    st.set("winner", scoreX > scoreY ? "Model X" : "Model Y");
    say(`creativity weight ${creativityWeight.toFixed(1)}×: ${scoreX > scoreY ? "Model X" : "Model Y"} leads`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
