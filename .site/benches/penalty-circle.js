// Bench: L1 and L2 constraint regions, and where the best allowed weights land.
import { view, heatmap, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "The leash on the weights" });
  const say = live(body);
  let cx = 3, cy = 1, r = 2, kind = "l2";
  const mk = (l, min, max, st, v, set) => slider({ label: l, min, max, step: st, value: v, format: (x) => fmt(x, 1), onInput: (x) => { set(x); update(); } });
  const s1 = mk("best unconstrained w₁", -4, 4, 0.5, cx, (v) => (cx = v)), s2 = mk("best unconstrained w₂", -4, 4, 0.5, cy, (v) => (cy = v)), s3 = mk("radius of the allowed region", 0.2, 5, 0.1, r, (v) => (r = v));
  const ch = choice("Penalty", [["l2", "L2 (circle)"], ["l1", "L1 (diamond)"]], kind, (k) => { kind = k; update(); });
  const cv = canvas(body, { aspect: 0.7, label: "Loss contours, the allowed region and the best allowed weights" });
  const st = stats([["w", "best allowed weights"], ["l", "loss there"], ["z", "exactly-zero weights"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, s1.el, s2.el, s3.el));
  const projL1 = ([x, y]) => { if (Math.abs(x) + Math.abs(y) <= r) return [x, y]; const u = [Math.abs(x), Math.abs(y)].sort((a, b) => b - a); let th = (u[0] + u[1] - r) / 2; if (u[0] - r > 0 && u[0] - r >= u[1]) th = u[0] - r; else th = (u[0] + u[1] - r) / 2; th = Math.max(0, th); return [Math.sign(x) * Math.max(0, Math.abs(x) - th), Math.sign(y) * Math.max(0, Math.abs(y) - th)]; };
  const sol = () => { if (kind === "l2") { const n = Math.hypot(cx, cy); return n <= r ? [cx, cy] : [(cx * r) / n, (cy * r) / n]; } return projL1([cx, cy]); };
  cv.onDraw((ctx, w, hh, p) => {
    const V = view(w, hh, { scale: Math.min(w, hh) / 10.5 }); heatmap(ctx, w, hh, V, (x, y) => (x - cx) ** 2 + (y - cy) ** 2, { block: 6, lo: 0, hi: 40 });
    ctx.strokeStyle = p.ink; ctx.lineWidth = 3; ctx.fillStyle = p.white; ctx.globalAlpha = 0.3; ctx.beginPath();
    if (kind === "l2") ctx.arc(V.X(0), V.Y(0), r * V.scale, 0, 7); else { ctx.moveTo(V.X(r), V.Y(0)); ctx.lineTo(V.X(0), V.Y(r)); ctx.lineTo(V.X(-r), V.Y(0)); ctx.lineTo(V.X(0), V.Y(-r)); ctx.closePath(); }
    ctx.fill(); ctx.globalAlpha = 1; ctx.stroke(); dot(ctx, V.X(cx), V.Y(cy), 6, p.muted); const s = sol(); dot(ctx, V.X(s[0]), V.Y(s[1]), 8, p.warm);
  });
  function update() { const s = sol(), zero = s.filter((x) => Math.abs(x) < 1e-9).length; st.set("w", `(${fmt(s[0], 3)}, ${fmt(s[1], 3)})`); st.set("l", fmt((s[0] - cx) ** 2 + (s[1] - cy) ** 2, 3)); st.set("z", String(zero) + (zero ? "  (sparse)" : "")); say(`Weights ${fmt(s[0], 2)}, ${fmt(s[1], 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
