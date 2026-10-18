// Bench: slide an event's date relative to a training cutoff and watch confidence decay past it.
import { confidenceVsCutoff } from "./ragkit.js";

const CUTOFF = new Date("2024-01-01").getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Confident up to a point, then guessing" });
  const say = live(body);
  let daysFromCutoff = 0;

  const cv = canvas(body, { aspect: 0.4, label: "Confidence vs. days from training cutoff" });
  const st = stats([["confidence", "model's unretrieved confidence"]]);
  const sl = slider({ label: "days from cutoff (negative = before)", min: -365, max: 365, step: 5, value: daysFromCutoff, format: (v) => (v >= 0 ? `+${v}` : String(v)), onInput: (v) => { daysFromCutoff = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const n = 100;
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const days = -365 + (i / n) * 730;
      const conf = confidenceVsCutoff(CUTOFF + days * DAY_MS, CUTOFF);
      const x = (i / n) * w, y = hh - conf * (hh - 20) - 10;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    const mx = ((daysFromCutoff + 365) / 730) * w;
    ctx.strokeStyle = p.warm; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, hh); ctx.stroke();
  });

  function update() {
    const conf = confidenceVsCutoff(CUTOFF + daysFromCutoff * DAY_MS, CUTOFF);
    st.set("confidence", `${(conf * 100).toFixed(0)}%`);
    say(`${daysFromCutoff} days from cutoff: confidence ${(conf * 100).toFixed(0)} percent`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
