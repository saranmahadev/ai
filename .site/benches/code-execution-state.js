// Bench: compare total code volume sent across n steps, with persistent state vs. without.
import { statefulCodeVolume, statelessCodeVolume } from "./agentkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Remembering between steps, or starting over" });
  const say = live(body);
  let n = 4;

  const cv = canvas(body, { aspect: 0.45, label: "Total code volume by step count" });
  const st = stats([["stateful", "stateful total (units of code)"], ["stateless", "stateless total"], ["ratio", "stateless ÷ stateful"]]);
  const sl = slider({ label: "Pipeline steps", min: 2, max: 8, step: 1, value: n, onInput: (v) => { n = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const a = statefulCodeVolume(n), b = statelessCodeVolume(n);
    const maxV = Math.max(a, b);
    const bw = w / 3;
    [["stateful (REPL)", a, p.accent], ["stateless (resend all)", b, p.warm]].forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 40);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 24 - bh, bw * 0.7, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(String(v), bw * (i + 0.6) + bw * 0.35, hh - 24 - bh - 6);
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.35, hh - 6);
    });
  });

  function update() {
    const a = statefulCodeVolume(n), b = statelessCodeVolume(n);
    st.set("stateful", String(a));
    st.set("stateless", String(b));
    st.set("ratio", `${(b / a).toFixed(2)}×`);
    say(`${n} steps: stateful total ${a}, stateless total ${b}, ${(b / a).toFixed(2)} times more code`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
