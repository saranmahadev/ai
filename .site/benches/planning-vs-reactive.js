// Bench: compare total time spent replanning as the environment changes against a reactive policy.
import { planningTotalTime, reactiveTotalTime } from "./agentkit.js";

const HORIZON = 12, T_PLAN = 400, T_EXEC = 20, T_REACTIVE = 150;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Plan ahead, or just react" });
  const say = live(body);
  let volatility = 12;

  const cv = canvas(body, { aspect: 0.45, label: "Total time: planning vs. reactive" });
  const st = stats([["plan", "planning total time"], ["react", "reactive total time"], ["winner", "cheaper approach"]]);
  const sl = slider({ label: "Steps between environment changes", min: 1, max: 12, step: 1, value: volatility, format: (v) => (v === 12 ? "stable (never)" : String(v)), onInput: (v) => { volatility = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const plan = planningTotalTime(HORIZON, volatility, T_PLAN, T_EXEC);
    const react = reactiveTotalTime(HORIZON, T_REACTIVE);
    const maxV = Math.max(plan, react);
    const bw = w / 3;
    [["planning", plan, p.accent], ["reactive", react, p.warm]].forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 40);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 24 - bh, bw * 0.7, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`${v}ms`, bw * (i + 0.6) + bw * 0.35, hh - 24 - bh - 6);
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.35, hh - 6);
    });
  });

  function update() {
    const plan = planningTotalTime(HORIZON, volatility, T_PLAN, T_EXEC);
    const react = reactiveTotalTime(HORIZON, T_REACTIVE);
    st.set("plan", `${plan}ms`);
    st.set("react", `${react}ms`);
    st.set("winner", plan < react ? "planning" : "reactive");
    say(`every ${volatility} steps: planning ${plan} milliseconds, reactive ${react} milliseconds, ${plan < react ? "planning" : "reactive"} is cheaper`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
