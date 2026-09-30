// Bench: mutual information of a two-by-two table controlled by marginals and a link.
import { entropy } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "How much does X tell you about Y?" });
  const say = live(body);
  let pa = 0.5, pb = 0.5, link = 0.6;
  const s1 = slider({ label: "P(X = 1)", min: 0.1, max: 0.9, step: 0.05, value: pa, format: (v) => fmt(v, 2), onInput: (v) => { pa = v; update(); } });
  const s2 = slider({ label: "P(Y = 1)", min: 0.1, max: 0.9, step: 0.05, value: pb, format: (v) => fmt(v, 2), onInput: (v) => { pb = v; update(); } });
  const s3 = slider({ label: "link (0 = independent, 1 = as tied together as possible)", min: 0, max: 1, step: 0.05, value: link, format: (v) => fmt(v, 2), onInput: (v) => { link = v; update(); } });
  const cv = canvas(body, { aspect: 0.22, maxH: 110, label: "A meter for mutual information compared with its largest possible value" });
  const st = stats([["hy", "H(Y)"], ["hyx", "H(Y given X)"], ["i", "mutual information I(X; Y)"], ["max", "largest possible for these marginals"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, s1.el, s2.el, s3.el));
  const joint = () => { const ind = pa * pb, hi = Math.min(pa, pb), j = ind + link * (hi - ind); return [j, pa - j, pb - j, 1 - pa - pb + j]; };
  const calc = () => { const [a, b, c, d] = joint(), hx = entropy([pa, 1 - pa]), hy = entropy([pb, 1 - pb]), hxy = entropy([a, b, c, d]); return { hy, hyx: hxy - hx, i: hx + hy - hxy, max: Math.min(hx, hy) }; };
  cv.onDraw((ctx, w, hh, p) => { const c = calc(), x0 = 20, x1 = w - 20, y = hh / 2; ctx.fillStyle = p.soft; ctx.fillRect(x0, y - 12, x1 - x0, 24); ctx.fillStyle = p.accent; ctx.fillRect(x0, y - 12, (x1 - x0) * Math.min(1, c.i / (c.max || 1)), 24); ctx.strokeStyle = p.muted; ctx.strokeRect(x0, y - 12, x1 - x0, 24); });
  function update() { const c = calc(); st.set("hy", fmt(c.hy, 4)); st.set("hyx", fmt(c.hyx, 4)); st.set("i", fmt(c.i, 4) + " bits"); st.set("max", fmt(c.max, 4) + " bits"); say(`Mutual information ${fmt(c.i, 3)} bits`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
