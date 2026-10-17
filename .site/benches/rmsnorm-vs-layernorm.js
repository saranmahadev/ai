// Bench: compare LayerNorm (centers then rescales) against RMSNorm (rescales only) on a chosen vector.
import { layerNorm, rmsNorm } from "./tfkit.js";

const N = 4;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Centering and rescaling, or rescaling alone" });
  const say = live(body);
  let x = [2, 4, -1, 3];

  const cv = canvas(body, { aspect: 0.5, label: "Input, LayerNorm output and RMSNorm output" });
  const st = stats([["mean", "mean(x)"], ["proportional", "RMSNorm proportional to x?"]]);
  const sliders = x.map((v, i) => slider({ label: `x[${i}]`, min: -5, max: 5, step: 0.5, value: v, format: (n) => n.toFixed(1), onInput: (n) => { x[i] = n; update(); } }));
  body.append(cv.box, st.el, ...sliders.map((s) => s.el));

  let ln, rn;
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (N + 1);
    const rows = [["x", x, p.ink], ["LayerNorm", ln, p.warm], ["RMSNorm", rn, p.accent]];
    const rowH = hh / rows.length;
    rows.forEach(([label, vec, color], r) => {
      const maxAbs = Math.max(...vec.map(Math.abs), 0.1);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left";
      ctx.fillText(label, 4, r * rowH + 14);
      vec.forEach((v, i) => {
        const bh = (Math.abs(v) / maxAbs) * (rowH / 2 - 14);
        ctx.fillStyle = color;
        ctx.fillRect(bw * (i + 0.7), r * rowH + rowH / 2 - (v >= 0 ? bh : 0), bw * 0.5, v >= 0 ? bh : -bh);
      });
      ctx.strokeStyle = p.muted; ctx.beginPath(); ctx.moveTo(0, r * rowH + rowH / 2); ctx.lineTo(w, r * rowH + rowH / 2); ctx.stroke();
    });
  });

  function update() {
    ln = layerNorm(x);
    rn = rmsNorm(x);
    const mean = x.reduce((s, v) => s + v, 0) / x.length;
    const ratios = rn.map((v, i) => (Math.abs(x[i]) > 1e-6 ? v / x[i] : null)).filter((r) => r !== null);
    const proportional = ratios.every((r) => Math.abs(r - ratios[0]) < 1e-6);
    st.set("mean", mean.toFixed(3));
    st.set("proportional", proportional ? "yes, by a constant factor" : "no");
    say(`mean ${mean.toFixed(2)}; RMSNorm output ${proportional ? "is" : "is not"} proportional to x`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
