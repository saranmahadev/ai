// Bench: switch the task type and see which of an assistant, a workflow or an agent actually scores best.
import { weightedLeaderboardScore } from "./llmkit.js";

const SYSTEMS = {
  assistant: { predictability: 0.3, flexibility: 0.4, cost: 0.95, autonomy: 0.05 },
  workflow: { predictability: 0.95, flexibility: 0.2, cost: 0.8, autonomy: 0.5 },
  agent: { predictability: 0.45, flexibility: 0.95, cost: 0.3, autonomy: 0.95 },
};
const SCENARIOS = {
  "a well-defined, multi-step task": { predictability: 0.6, flexibility: 0.05, cost: 0.2, autonomy: 0.15 },
  "an open-ended, novel task": { predictability: 0.1, flexibility: 0.6, cost: 0.1, autonomy: 0.2 },
};

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Different tasks want different structures" });
  const say = live(body);
  let scenario = Object.keys(SCENARIOS)[0];

  const cv = canvas(body, { aspect: 0.4, label: "Weighted score per system, by task type" });
  const st = stats([["best", "best system for this task"]]);
  const ch = choice("Task type", Object.keys(SCENARIOS).map((k) => [k, k]), scenario, (v) => { scenario = v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const weights = SCENARIOS[scenario];
    const scores = Object.entries(SYSTEMS).map(([name, m]) => [name, weightedLeaderboardScore(m, weights)]);
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
    const scores = Object.entries(SYSTEMS).map(([name, m]) => [name, weightedLeaderboardScore(m, weights)]);
    const best = scores.reduce((a, b) => (b[1] > a[1] ? b : a));
    st.set("best", `${best[0]} (${best[1].toFixed(3)})`);
    say(`for "${scenario}": ${scores.map(([n, s]) => `${n} ${s.toFixed(3)}`).join(", ")} — best is ${best[0]}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
