// Drawing helpers shared by the Math benches (world-to-pixel views, arrows, function curves). Not a bench itself.
export function view(w, h, { cx = 0, cy = 0, scale = 40 } = {}) {
  return { scale, X: (x) => w / 2 + (x - cx) * scale, Y: (y) => h / 2 - (y - cy) * scale, x: (px) => (px - w / 2) / scale + cx, y: (py) => (h / 2 - py) / scale + cy };
}
export function grid(ctx, v, w, h, p, { step = 1, labels = true } = {}) {
  ctx.lineWidth = 1; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.fillStyle = p.muted;
  const x0 = Math.floor(v.x(0) / step) * step, x1 = Math.ceil(v.x(w) / step) * step, y0 = Math.floor(v.y(h) / step) * step, y1 = Math.ceil(v.y(0) / step) * step;
  for (let x = x0; x <= x1 + 1e-9; x += step) { ctx.strokeStyle = Math.abs(x) < 1e-9 ? p.muted : p.soft2; ctx.beginPath(); ctx.moveTo(v.X(x), 0); ctx.lineTo(v.X(x), h); ctx.stroke(); if (labels && Math.abs(x) > 1e-9 && v.scale * step > 22) { ctx.textAlign = "center"; ctx.fillText(String(Math.round(x * 100) / 100), v.X(x), Math.min(h - 3, Math.max(11, v.Y(0) + 12))); } }
  for (let y = y0; y <= y1 + 1e-9; y += step) { ctx.strokeStyle = Math.abs(y) < 1e-9 ? p.muted : p.soft2; ctx.beginPath(); ctx.moveTo(0, v.Y(y)); ctx.lineTo(w, v.Y(y)); ctx.stroke(); if (labels && Math.abs(y) > 1e-9 && v.scale * step > 22) { ctx.textAlign = "left"; ctx.fillText(String(Math.round(y * 100) / 100), Math.max(3, Math.min(w - 24, v.X(0) + 4)), v.Y(y) - 3); } }
}
export function arrow(ctx, x0, y0, x1, y1, color, width = 3) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0), s = Math.min(11, L * 0.4);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * s * 0.6, y1 - Math.sin(a) * s * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.4) * s, y1 - Math.sin(a - 0.4) * s); ctx.lineTo(x1 - Math.cos(a + 0.4) * s, y1 - Math.sin(a + 0.4) * s); ctx.closePath(); ctx.fill();
}
export function dot(ctx, x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
export function label(ctx, text, x, y, color, { align = "left", size = 12, weight = 800 } = {}) { ctx.fillStyle = color; ctx.font = `${weight} ${size}px Nunito, system-ui, sans-serif`; ctx.textAlign = align; ctx.textBaseline = "alphabetic"; ctx.fillText(text, x, y); }
/** Draw y = f(x) between two data x-values using a mapping with X() and Y() (from kit.plot or view). */
export function curve(ctx, m, f, x0, x1, { color = "#888", width = 3, dash = null, clip = null, steps = 240 } = {}) {
  ctx.save();
  if (clip) { ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.w, clip.h); ctx.clip(); }
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = "round"; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); let open = false;
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps, y = f(x);
    if (!Number.isFinite(y) || Math.abs(y) > 1e6) { open = false; continue; }
    if (open) ctx.lineTo(m.X(x), m.Y(y)); else { ctx.moveTo(m.X(x), m.Y(y)); open = true; }
  }
  ctx.stroke(); ctx.restore();
}
export const clip = (m) => ({ x: m.pad.l, y: m.pad.t, w: m.iw, h: m.ih });
