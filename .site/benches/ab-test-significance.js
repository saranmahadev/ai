// Bench: slide sample size and watch the same observed difference between two RAG variants cross the significance threshold.
import { twoProportionZ } from "./ragkit.js";

const RATE_A = 0.62, RATE_B = 0.70;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "The same gap, more or less convincing" });
  const say = live(body);
  let n = 100;

  const cv = canvas(body, { aspect: 0.4, label: "z-score vs. the 95% significance threshold" });
  const st = stats([["z", "z-score"], ["significant", "significant at 95%?"]]);
  const sl = slider({ label: "sample size per variant", min: 50, max: 5000, step: 50, value: n, format: (v) => v.toLocaleString(), onInput: (v) => { n = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const z = Math.abs(twoProportionZ(RATE_A, n, RATE_B, n));
    const maxZ = 6;
    const bw = w - 40;
    ctx.fillStyle = p.soft; ctx.fillRect(20, hh / 2 - 15, bw, 30);
    ctx.fillStyle = z >= 1.96 ? p.accent : p.warm; ctx.fillRect(20, hh / 2 - 15, bw * Math.min(1, z / maxZ), 30);
    const thresholdX = 20 + bw * (1.96 / maxZ);
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(thresholdX, hh / 2 - 25); ctx.lineTo(thresholdX, hh / 2 + 25); ctx.stroke();
  });

  function update() {
    const z = Math.abs(twoProportionZ(RATE_A, n, RATE_B, n));
    st.set("z", z.toFixed(3));
    st.set("significant", z >= 1.96 ? "yes" : "no");
    say(`n=${n.toLocaleString()} per variant: |z| = ${z.toFixed(3)}, ${z >= 1.96 ? "significant" : "not significant"} at the 95% level`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
