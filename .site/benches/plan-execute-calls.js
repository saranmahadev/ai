// Bench: compare total LLM calls for plan-and-execute against interleaving think-then-act every step.
import { planExecuteCalls, interleavedCalls } from "./agentkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "One plan then act, or think at every step" });
  const say = live(body);
  let n = 5;

  const cv = canvas(body, { aspect: 0.45, label: "Total LLM calls by approach" });
  const st = stats([["pe", "plan-and-execute calls"], ["il", "interleaved calls"]]);
  const sl = slider({ label: "Plan steps", min: 2, max: 10, step: 1, value: n, format: (v) => String(v), onInput: (v) => { n = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const pe = planExecuteCalls(n), il = interleavedCalls(n);
    const maxV = Math.max(pe, il);
    const bw = w / 3;
    [["plan + execute", pe, p.accent], ["interleaved", il, p.warm]].forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 40);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 24 - bh, bw * 0.7, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`${label}: ${v}`, bw * (i + 0.6) + bw * 0.35, hh - 24 - bh - 6);
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.35, hh - 6);
    });
  });

  function update() {
    st.set("pe", String(planExecuteCalls(n)));
    st.set("il", String(interleavedCalls(n)));
    say(`${n} steps: plan-and-execute ${planExecuteCalls(n)} calls, interleaved ${interleavedCalls(n)} calls`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
