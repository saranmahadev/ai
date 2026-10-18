// Bench: compare growing model size against a fixed data cap vs. growing training tokens against a fixed small model.
import { scalingLoss } from "./llmkit.js";

const D_CAP = 4e9, N_SMALL = 1e9;

export default function mount(root, kit) {
  const { frame, canvas, choice, slider, stats, live } = kit;
  const body = frame(root, { title: "When one side of the budget is stuck" });
  const say = live(body);
  let regime = "data-constrained", logX = 9;

  const cv = canvas(body, { aspect: 0.45, label: "Loss as the free variable grows" });
  const st = stats([["loss", "loss"]]);
  const ch = choice("Regime", [["data-constrained", "data-constrained (D capped)"], ["overtrained", "overtrained (N capped, small)"]], regime, (v) => { regime = v; update(); });
  const sl = slider({ label: "log₁₀(free variable)", min: 9, max: 12, step: 0.1, value: logX, format: (v) => `10^${v.toFixed(1)}`, onInput: (v) => { logX = v; update(); } });
  body.append(cv.box, st.el, ch.el, sl.el);

  let curve = [];
  cv.onDraw((ctx, w, hh, p) => {
    const xs = [9, 9.5, 10, 10.5, 11, 11.5, 12];
    const bw = w / (xs.length + 1);
    const maxL = Math.max(...curve) * 1.02, minL = Math.min(...curve) * 0.98;
    xs.forEach((x, i) => {
      const bh = ((curve[i] - minL) / (maxL - minL)) * (hh - 30);
      ctx.fillStyle = Math.abs(x - logX) < 0.1 ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
    });
  });

  function update() {
    const xs = [9, 9.5, 10, 10.5, 11, 11.5, 12];
    curve = xs.map((x) => {
      const val = Math.pow(10, x);
      return regime === "data-constrained" ? scalingLoss(val, D_CAP) : scalingLoss(N_SMALL, val);
    });
    const val = Math.pow(10, logX);
    const loss = regime === "data-constrained" ? scalingLoss(val, D_CAP) : scalingLoss(N_SMALL, val);
    st.set("loss", loss.toFixed(4));
    say(`${regime}: loss ${loss.toFixed(4)} at 10^${logX.toFixed(1)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
