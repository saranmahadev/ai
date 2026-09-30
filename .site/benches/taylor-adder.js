// Bench: more Taylor terms hug the function more closely near 0.
import { curve, clip, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Add Taylor terms" });
  const say = live(body);
  const fact = (k) => (k <= 1 ? 1 : k * fact(k - 1));
  const F = { exp: ["eˣ", Math.exp, (k) => 1 / fact(k), [-4, 4], [-2, 12]], sin: ["sin x", Math.sin, (k) => (k % 2 ? ((k - 1) / 2) % 2 ? -1 / fact(k) : 1 / fact(k) : 0), [-6, 6], [-2.5, 2.5]], ln: ["ln(1 + x)", (x) => Math.log(1 + x), (k) => (k === 0 ? 0 : (k % 2 ? 1 : -1) / k), [-0.95, 2], [-3, 2]], geo: ["1/(1 − x)", (x) => 1 / (1 - x), () => 1, [-2, 0.95], [-1, 6]] };
  let key = "exp", order = 2, x0 = 1;
  const so = slider({ label: "highest power kept", min: 0, max: 9, step: 1, value: order, onInput: (v) => { order = v; update(); } });
  const sx = slider({ label: "check the error at x", min: -2, max: 2, step: 0.1, value: x0, format: (v) => fmt(v, 1), onInput: (v) => { x0 = v; update(); } });
  const ch = choice("Function", Object.entries(F).map(([k, v]) => [k, v[0]]), key, (k) => { key = k; update(); });
  const cv = canvas(body, { aspect: 0.62, label: "A function and its Taylor polynomial around zero" });
  const st = stats([["poly", "polynomial"], ["v", "polynomial value"], ["t", "true value"], ["e", "error"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, so.el, sx.el));
  const poly = (x) => { const c = F[key][2]; let s = 0; for (let k = 0; k <= order; k++) s += c(k) * x ** k; return s; };
  cv.onDraw((ctx, w, hh, p) => { const [, f, , rx, ry] = F[key], m = plot(w, hh, rx, ry), c = clip(m); m.axes(ctx, p, { xlabel: "x", ylabel: "value" });
    curve(ctx, m, f, rx[0], rx[1], { color: p.ink, width: 3.5, clip: c, steps: 400 }); curve(ctx, m, poly, rx[0], rx[1], { color: p.warm, width: 3, dash: [7, 5], clip: c, steps: 400 });
    const x = Math.min(rx[1], Math.max(rx[0], x0)); ctx.save(); ctx.beginPath(); ctx.rect(c.x, c.y, c.w, c.h); ctx.clip(); dot(ctx, m.X(x), m.Y(f(x)), 5, p.ink); dot(ctx, m.X(x), m.Y(poly(x)), 5, p.warm); ctx.restore(); });
  function update() { const [nm, f, cf, rx] = F[key], x = Math.min(rx[1], Math.max(rx[0], x0)), terms = []; for (let k = 0; k <= order; k++) if (cf(k)) terms.push(`${fmt(cf(k), 4)}${k ? "x" + (k > 1 ? "^" + k : "") : ""}`); st.set("poly", terms.join(" + ") || "0"); st.set("v", fmt(poly(x), 5)); st.set("t", fmt(f(x), 5)); st.set("e", fmt(poly(x) - f(x), 5)); say(`Order ${order}, error ${fmt(poly(x) - f(x), 4)} at ${fmt(x, 1)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
