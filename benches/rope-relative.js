// Bench: rotate a query and key by two chosen positions and show the dot product depends only on their relative distance.
import { ropeApply, dot } from "./tfkit.js";

const Q = [1, 0.5];
const K = [0.3, -0.8];
const BASE = 10000;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Rotation that only sees relative distance" });
  const say = live(body);
  let m = 2, n = 5;

  const cv = canvas(body, { aspect: 0.5, label: "The rotated query and key vectors, and their dot product" });
  const st = stats([["dist", "relative distance (m − n)"], ["dot", "dot product"], ["raw", "unrotated dot(q,k)"]]);
  const slM = slider({ label: "query position (m)", min: 0, max: 50, step: 1, value: m, format: (v) => String(v), onInput: (v) => { m = v; update(); } });
  const slN = slider({ label: "key position (n)", min: 0, max: 50, step: 1, value: n, format: (v) => String(v), onInput: (v) => { n = v; update(); } });
  body.append(cv.box, st.el, slM.el, slN.el);

  let qr, kr;
  cv.onDraw((ctx, w, hh, p) => {
    const cx = w / 2, cy = hh / 2, r = Math.min(w, hh) / 2 - 20;
    ctx.strokeStyle = p.muted; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    ctx.strokeStyle = p.muted; ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
    const scale = r / 1.5;
    [["q", qr, p.accent], ["k", kr, p.warm]].forEach(([label, v, color]) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + v[0] * scale, cy - v[1] * scale); ctx.stroke();
      ctx.fillStyle = color; ctx.font = "700 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "left";
      ctx.fillText(label, cx + v[0] * scale + 6, cy - v[1] * scale);
    });
  });

  function update() {
    qr = ropeApply(Q, m, BASE);
    kr = ropeApply(K, n, BASE);
    const d = dot(qr, kr);
    st.set("dist", String(m - n));
    st.set("dot", d.toFixed(6));
    st.set("raw", dot(Q, K).toFixed(6));
    say(`relative distance ${m - n}, dot product ${d.toFixed(4)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
