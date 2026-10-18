// Bench: switch what a task values most and watch which model size actually scores best.
import { weightedLeaderboardScore } from "./llmkit.js";

const MODELS = {
  small: { quality: 0.6, speed: 0.95, affordability: 0.95 },
  medium: { quality: 0.8, speed: 0.7, affordability: 0.7 },
  large: { quality: 0.95, speed: 0.3, affordability: 0.3 },
};
const SCENARIOS = {
  "latency-sensitive chat": { quality: 0.2, speed: 0.6, affordability: 0.2 },
  "quality-sensitive offline task": { quality: 0.9, speed: 0.05, affordability: 0.05 },
};

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "The best model depends on what the task actually needs" });
  const say = live(body);
  let scenario = Object.keys(SCENARIOS)[0];

  const cv = canvas(body, { aspect: 0.4, label: "Weighted score per model, by task scenario" });
  const st = stats([["best", "best model for this task"]]);
  const ch = choice("Task scenario", Object.keys(SCENARIOS).map((k) => [k, k]), scenario, (v) => { scenario = v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const weights = SCENARIOS[scenario];
    const scores = Object.entries(MODELS).map(([name, m]) => [name, weightedLeaderboardScore(m, weights)]);
    const bw = w / 4;
    scores.forEach(([name, score], i) => {
      const bh = score * (hh - 30);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(name, bw * (i + 0.6) + bw * 0.3, hh - 2);
      ctx.fillText(score.toFixed(2), bw * (i + 0.6) + bw * 0.3, hh - 15 - bh - 6);
    });
  });

  function update() {
    const weights = SCENARIOS[scenario];
    const scores = Object.entries(MODELS).map(([name, m]) => [name, weightedLeaderboardScore(m, weights)]);
    const best = scores.reduce((a, b) => (b[1] > a[1] ? b : a));
    st.set("best", `${best[0]} (${best[1].toFixed(3)})`);
    say(`for "${scenario}": ${scores.map(([n, s]) => `${n} ${s.toFixed(3)}`).join(", ")} — best is ${best[0]}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
