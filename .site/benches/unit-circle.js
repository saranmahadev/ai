// Bench: a point on the unit circle and the sine and cosine waves it draws.
import { dot, curve } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Trace the unit circle" });
  const say = live(body);
  let deg = 30;
  const sd = slider({ label: "angle (degrees)", min: 0, max: 360, step: 5, value: deg, format: (v) => v + "°", onInput: (v) => { deg = v; update(); } });
  const cv = canvas(body, { aspect: 0.5, label: "The unit circle beside the sine and cosine waves" });
  const st = stats([["c", "cos θ (width)"], ["s", "sin θ (height)"], ["id", "sin² + cos²"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sd.el));
  cv.onDraw((ctx, w, hh, p) => {
    const a = (deg * Math.PI) / 180, R = Math.min(hh / 2 - 16, w * 0.22), cx = R + 24, cy = hh / 2;
    ctx.strokeStyle = p.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
    ctx.strokeStyle = p.soft2; ctx.beginPath(); ctx.moveTo(cx - R - 8, cy); ctx.lineTo(cx + R + 8, cy); ctx.moveTo(cx, cy - R - 8); ctx.lineTo(cx, cy + R + 8); ctx.stroke();
    const px = cx + R * Math.cos(a), py = cy - R * Math.sin(a);
    ctx.strokeStyle = p.good; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();
    ctx.strokeStyle = p.warm; ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke(); dot(ctx, px, py, 7, p.accent);
    const x0 = cx + R + 40, x1 = w - 14, mid = cy, amp = R, X = (t) => x0 + (t / (2 * Math.PI)) * (x1 - x0);
    ctx.strokeStyle = p.soft2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, mid); ctx.lineTo(x1, mid); ctx.stroke();
    const m = { X, Y: (v) => mid - v * amp };
    curve(ctx, m, Math.cos, 0, 2 * Math.PI, { color: p.good, width: 3 }); curve(ctx, m, Math.sin, 0, 2 * Math.PI, { color: p.warm, width: 3 });
    ctx.strokeStyle = p.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(a), mid - amp - 6); ctx.lineTo(X(a), mid + amp + 6); ctx.stroke(); ctx.setLineDash([]);
    dot(ctx, X(a), m.Y(Math.sin(a)), 5, p.warm); dot(ctx, X(a), m.Y(Math.cos(a)), 5, p.good);
  });
  function update() { const a = (deg * Math.PI) / 180; st.set("c", fmt(Math.cos(a), 4)); st.set("s", fmt(Math.sin(a), 4)); st.set("id", fmt(Math.sin(a) ** 2 + Math.cos(a) ** 2, 4)); say(`Angle ${deg}: cosine ${fmt(Math.cos(a), 3)}, sine ${fmt(Math.sin(a), 3)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
