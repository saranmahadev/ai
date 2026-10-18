// Bench: watch a toy capability curve stay flat near chance, then jump sharply across a scale threshold.
import { sigmoid } from "./llmkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Flat, then a sudden jump" });
  const say = live(body);
  let logScale = 9;

  const cv = canvas(body, { aspect: 0.45, label: "Accuracy vs. model scale" });
  const st = stats([["accuracy", "accuracy at this scale"]]);
  const sl = slider({ label: "log₁₀(parameters)", min: 8, max: 12, step: 0.1, value: logScale, format: (v) => `10^${v.toFixed(1)}`, onInput: (v) => { logScale = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  function accuracyAt(x) { return 0.2 + 0.75 * sigmoid(8 * (x - 10)); }

  cv.onDraw((ctx, w, hh, p) => {
    const steps = 60;
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const x = 8 + (i / steps) * 4;
      const y = accuracyAt(x);
      const px = (i / steps) * w, py = hh - 15 - y * (hh - 30);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    const markerX = ((logScale - 8) / 4) * w, markerY = hh - 15 - accuracyAt(logScale) * (hh - 30);
    ctx.fillStyle = p.warm; ctx.beginPath(); ctx.arc(markerX, markerY, 6, 0, Math.PI * 2); ctx.fill();
  });

  function update() {
    const acc = accuracyAt(logScale);
    st.set("accuracy", `${(acc * 100).toFixed(1)}%`);
    say(`scale 10^${logScale.toFixed(1)}: accuracy ${(acc * 100).toFixed(1)} percent`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
