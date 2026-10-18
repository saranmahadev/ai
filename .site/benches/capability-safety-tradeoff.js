// Bench: slide alignment strength and watch capability and safety scores move in opposite directions.
import { capabilityAtAlignment, safetyAtAlignment } from "./llmkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Two scores, one knob, opposite directions" });
  const say = live(body);
  let strength = 0.5;

  const cv = canvas(body, { aspect: 0.4, label: "Capability vs. safety across alignment strength" });
  const st = stats([["capability", "capability score"], ["safety", "safety score"]]);
  const sl = slider({ label: "alignment training strength", min: 0, max: 1, step: 0.05, value: strength, format: (v) => v.toFixed(2), onInput: (v) => { strength = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const steps = 40;
    const draw = (fn, color) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const s = i / steps, px = s * w, py = hh - 15 - fn(s) * (hh - 30);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
    };
    draw(capabilityAtAlignment, p.accent); draw(safetyAtAlignment, p.warm);
    const mx = strength * w;
    ctx.strokeStyle = p.soft; ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, hh); ctx.stroke();
  });

  function update() {
    st.set("capability", capabilityAtAlignment(strength).toFixed(3));
    st.set("safety", safetyAtAlignment(strength).toFixed(3));
    say(`alignment strength ${strength.toFixed(2)}: capability ${capabilityAtAlignment(strength).toFixed(3)}, safety ${safetyAtAlignment(strength).toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
