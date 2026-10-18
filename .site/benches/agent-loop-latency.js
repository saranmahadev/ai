// Bench: break one agent-loop iteration's latency into its stages, reusing sequentialTotal from the Tool Use district.
import { sequentialTotal } from "./agentkit.js";

const STAGE_LABELS = ["observe", "reason", "act", "verify"];
const BASE = [5, 1800, 200, 20];

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "One loop iteration, four stages" });
  const say = live(body);
  let reasonMs = BASE[1];

  const cv = canvas(body, { aspect: 0.45, label: "Latency by stage" });
  const st = stats([["total", "total iteration latency"]]);
  const sl = slider({ label: "reason stage (LLM call) latency", min: 200, max: 3000, step: 100, value: reasonMs, format: (v) => `${v}ms`, onInput: (v) => { reasonMs = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  function stageMs() { return [BASE[0], reasonMs, BASE[2], BASE[3]]; }

  cv.onDraw((ctx, w, hh, p) => {
    const ms = stageMs();
    const total = sequentialTotal(ms);
    const barH = (hh - 40) / ms.length;
    ms.forEach((v, i) => {
      const frac = v / total;
      const bw = frac * (w - 100);
      ctx.fillStyle = i === 1 ? p.accent : p.soft;
      ctx.fillRect(90, 10 + i * barH, bw, barH * 0.6);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "right";
      ctx.fillText(STAGE_LABELS[i], 84, 10 + i * barH + barH * 0.4);
      ctx.textAlign = "left";
      ctx.fillText(`${v}ms (${(100 * frac).toFixed(1)}%)`, 95 + bw, 10 + i * barH + barH * 0.4);
    });
  });

  function update() {
    const ms = stageMs();
    const total = sequentialTotal(ms);
    st.set("total", `${total}ms`);
    say(`total iteration latency ${total} milliseconds, reason stage ${(100 * reasonMs / total).toFixed(1)} percent`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
