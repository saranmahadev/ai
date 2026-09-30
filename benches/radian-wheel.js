// Bench: an angle in degrees and radians, with arc length and sector area.
import { dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Angles in degrees and radians" });
  const say = live(body);
  let deg = 60, r = 2;
  const sd = slider({ label: "angle (degrees)", min: 0, max: 720, step: 5, value: deg, format: (v) => v + "°", onInput: (v) => { deg = v; update(); } });
  const sr = slider({ label: "radius", min: 1, max: 5, step: 0.5, value: r, format: (v) => fmt(v, 1), onInput: (v) => { r = v; update(); } });
  const cv = canvas(body, { aspect: 0.75, maxH: 420, label: "A circle with an angle drawn as a sector" });
  const st = stats([["rad", "radians"], ["wrap", "wrapped to 0–360°"], ["arc", "arc length r·θ"], ["area", "sector area ½r²θ"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sd.el, sr.el));
  cv.onDraw((ctx, w, hh, p) => {
    const cx = w / 2, cy = hh / 2, R = Math.min(w, hh) / 2 - 24, a = (deg * Math.PI) / 180;
    ctx.strokeStyle = p.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.strokeStyle = p.soft2; ctx.beginPath(); ctx.moveTo(cx - R - 10, cy); ctx.lineTo(cx + R + 10, cy); ctx.moveTo(cx, cy - R - 10); ctx.lineTo(cx, cy + R + 10); ctx.stroke();
    ctx.fillStyle = p.accent; ctx.globalAlpha = 0.28; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, 0, -a, true); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = p.accent; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, R, 0, -a, true); ctx.stroke();
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * Math.cos(-a), cy + R * Math.sin(-a)); ctx.stroke();
    dot(ctx, cx + R * Math.cos(-a), cy + R * Math.sin(-a), 7, p.warm);
  });
  function update() { const a = (deg * Math.PI) / 180; st.set("rad", `${fmt(a, 4)}  (${fmt(a / Math.PI, 3)}π)`); st.set("wrap", `${deg % 360}°`); st.set("arc", fmt(r * a, 3)); st.set("area", fmt(0.5 * r * r * a, 3)); say(`${deg} degrees is ${fmt(a, 3)} radians`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
