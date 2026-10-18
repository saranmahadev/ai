// Bench: split a fixed compute budget between model size and training tokens optimally.
import { computeOptimalSplit } from "./llmkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Splitting a compute budget in two" });
  const say = live(body);
  let logC = 20;

  const cv = canvas(body, { aspect: 0.45, label: "Optimal model size vs. training tokens" });
  const st = stats([["N", "optimal parameters"], ["D", "optimal tokens"]]);
  const sl = slider({ label: "log₁₀(compute, FLOPs)", min: 18, max: 24, step: 0.5, value: logC, format: (v) => `10^${v}`, onInput: (v) => { logC = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let result = null;
  cv.onDraw((ctx, w, hh, p) => {
    if (!result) return;
    const bw = w / 3;
    const maxLog = 13;
    const nH = (Math.log10(result.N) / maxLog) * (hh - 30);
    const dH = (Math.log10(result.D) / maxLog) * (hh - 30);
    ctx.fillStyle = p.accent; ctx.fillRect(bw * 0.5, hh - 15 - nH, bw * 0.6, nH);
    ctx.fillStyle = p.warm; ctx.fillRect(bw * 1.7, hh - 15 - dH, bw * 0.6, dH);
    ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("params (N)", bw * 0.8, hh - 2);
    ctx.fillText("tokens (D)", bw * 2.0, hh - 2);
  });

  function update() {
    const C = Math.pow(10, logC);
    result = computeOptimalSplit(C);
    st.set("N", result.N.toExponential(2));
    st.set("D", result.D.toExponential(2));
    say(`compute 10^${logC}: optimal params ${result.N.toExponential(2)}, optimal tokens ${result.D.toExponential(2)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
