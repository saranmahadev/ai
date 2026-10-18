// Bench: compare GUI-only, code-only and hybrid strategies across three tasks of different shapes.
import { actionSpaceStrategyTotals } from "./agentkit.js";

const TASKS = [
  { name: "bulk-rename 50 files", gui: 50, code: 1, codeSucceeds: true },
  { name: "single confirmation click", gui: 1, code: 1, codeSucceeds: true },
  { name: "10-field validated form + submit", gui: 11, code: 1, codeSucceeds: false },
];

export default function mount(root, kit) {
  const { frame, h, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Click through it, script it, or pick per step" });
  const say = live(body);
  let strategy = "hybrid";

  const cv = canvas(body, { aspect: 0.4, label: "Total actions by strategy" });
  const st = stats([["actions", "total actions"], ["success", "tasks completed"]]);
  const ch = choice("Strategy", [["gui", "GUI-only"], ["code", "Code-only"], ["hybrid", "Hybrid (picks per task)"]], strategy, (v) => { strategy = v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const strategies = ["gui", "code", "hybrid"];
    const maxV = Math.max(...strategies.map((s) => actionSpaceStrategyTotals(TASKS, s).actions));
    const bw = w / strategies.length;
    strategies.forEach((s, i) => {
      const r = actionSpaceStrategyTotals(TASKS, s);
      const bh = (r.actions / maxV) * (hh - 40);
      ctx.fillStyle = s === strategy ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.2), hh - 24 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`${r.actions} actions`, bw * (i + 0.2) + bw * 0.3, hh - 24 - bh - 6);
      ctx.fillText(`${s} (${r.successes}/${r.of})`, bw * (i + 0.2) + bw * 0.3, hh - 6);
    });
  });

  function update() {
    const r = actionSpaceStrategyTotals(TASKS, strategy);
    st.set("actions", String(r.actions));
    st.set("success", `${r.successes} of ${r.of}`);
    say(`${strategy} strategy: ${r.actions} total actions, ${r.successes} of ${r.of} tasks completed`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
