// Bench: cost per SUCCESSFUL run can flip which agent configuration actually looks better.
import { costPerSuccess } from "./agentkit.js";

const CONFIGS = {
  retry: { label: "Heavy retries", successRate: 0.95, cost: 0.50 },
  single: { label: "Single pass", successRate: 0.85, cost: 0.05 },
};

export default function mount(root, kit) {
  const { frame, canvas, stats, live } = kit;
  const body = frame(root, { title: "Success rate alone isn't the whole story" });
  const say = live(body);

  const cv = canvas(body, { aspect: 0.4, label: "Cost per successful run" });
  const st = stats([["retry", "heavy retries: cost per success"], ["single", "single pass: cost per success"], ["ratio", "how much more the cheaper option costs"]]);
  body.append(cv.box, st.el);

  const retryCPS = costPerSuccess(CONFIGS.retry.successRate, CONFIGS.retry.cost);
  const singleCPS = costPerSuccess(CONFIGS.single.successRate, CONFIGS.single.cost);

  cv.onDraw((ctx, w, hh, p) => {
    const maxCPS = Math.max(retryCPS, singleCPS);
    [["retry", retryCPS], ["single", singleCPS]].forEach(([key, cps], i) => {
      const bw = w / 2;
      const bh = (cps / maxCPS) * (hh - 30);
      ctx.fillStyle = key === "single" ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.2), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(CONFIGS[key].label, bw * (i + 0.2) + bw * 0.3, hh - 2);
    });
  });

  st.set("retry", `$${retryCPS.toFixed(3)}`);
  st.set("single", `$${singleCPS.toFixed(3)}`);
  st.set("ratio", `${(retryCPS / singleCPS).toFixed(1)}×`);
  say(`heavy retries cost ${retryCPS.toFixed(3)} dollars per success, single pass costs ${singleCPS.toFixed(3)} dollars per success, ${(retryCPS / singleCPS).toFixed(1)} times more`);
  cv.redraw();
  return () => cv.destroy();
}
