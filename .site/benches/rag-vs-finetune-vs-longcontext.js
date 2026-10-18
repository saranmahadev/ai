// Bench: switch what a task needs most and watch which approach actually scores best.
import { weightedLeaderboardScore } from "./llmkit.js";

const APPROACHES = {
  RAG: { freshness: 0.95, updateCost: 0.9, latencyCost: 0.6, transparency: 0.9, style: 0.3 },
  "fine-tuning": { freshness: 0.2, updateCost: 0.2, latencyCost: 0.9, transparency: 0.3, style: 0.95 },
  "long-context": { freshness: 0.95, updateCost: 0.95, latencyCost: 0.3, transparency: 0.7, style: 0.3 },
};
const SCENARIOS = {
  "freshness-critical knowledge base": { freshness: 0.6, updateCost: 0.2, latencyCost: 0.1, transparency: 0.1, style: 0 },
  "writing-style adaptation": { freshness: 0.05, updateCost: 0.05, latencyCost: 0.2, transparency: 0.1, style: 0.6 },
};

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Different gaps need different fixes" });
  const say = live(body);
  let scenario = Object.keys(SCENARIOS)[0];

  const cv = canvas(body, { aspect: 0.4, label: "Weighted score per approach, by scenario" });
  const st = stats([["best", "best approach for this scenario"]]);
  const ch = choice("Scenario", Object.keys(SCENARIOS).map((k) => [k, k]), scenario, (v) => { scenario = v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const weights = SCENARIOS[scenario];
    const scores = Object.entries(APPROACHES).map(([name, m]) => [name, weightedLeaderboardScore(m, weights)]);
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
    const scores = Object.entries(APPROACHES).map(([name, m]) => [name, weightedLeaderboardScore(m, weights)]);
    const best = scores.reduce((a, b) => (b[1] > a[1] ? b : a));
    st.set("best", `${best[0]} (${best[1].toFixed(3)})`);
    say(`for "${scenario}": ${scores.map(([n, s]) => `${n} ${s.toFixed(3)}`).join(", ")} — best is ${best[0]}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
