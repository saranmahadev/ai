// Bench: the Hessian's eigenvalues decide bowl, hill or saddle.
import { view, heatmap } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Bowl, hill or saddle?" });
  const say = live(body);
  let a = 1, b = 0, c = 1;
  const mk = (l, v, set) => slider({ label: l, min: -3, max: 3, step: 0.25, value: v, format: (x) => fmt(x, 2), onInput: (x) => { set(x); update(); } });
  const sa = mk("a  (x² term)", a, (v) => (a = v)), sb = mk("b  (x·y term)", b, (v) => (b = v)), sc = mk("c  (y² term)", c, (v) => (c = v));
  const cv = canvas(body, { aspect: 0.7, label: "A contour map of f = a x² + b x y + c y²" });
  const st = stats([["H", "Hessian [ 2a b ; b 2c ]"], ["ev", "eigenvalues"], ["kind", "the flat spot at the origin is"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sa.el, sb.el, sc.el));
  const eig = () => { const p = 2 * a, q = b, s = 2 * c, t = p + s, d = p * s - q * q, D = Math.sqrt(Math.max(0, t * t / 4 - d)); return [t / 2 + D, t / 2 - D]; };
  cv.onDraw((ctx, w, hh) => { const V = view(w, hh, { scale: Math.min(w, hh) / 4.4 }); heatmap(ctx, w, hh, V, (x, y) => a * x * x + b * x * y + c * y * y, { block: 6 }); ctx.fillStyle = "#000"; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(V.X(0), V.Y(0), 5, 0, 7); ctx.fill(); ctx.globalAlpha = 1; });
  function update() { const [l1, l2] = eig(), eps = 1e-9; st.set("H", `[ ${fmt(2 * a, 2)} ${fmt(b, 2)} ; ${fmt(b, 2)} ${fmt(2 * c, 2)} ]`); st.set("ev", `${fmt(l1, 3)} and ${fmt(l2, 3)}`);
    st.set("kind", l1 > eps && l2 > eps ? "a minimum (bowl)" : l1 < -eps && l2 < -eps ? "a maximum (hill)" : l1 > eps && l2 < -eps ? "a saddle" : "flat in some direction (inconclusive)"); say(`Eigenvalues ${fmt(l1, 2)} and ${fmt(l2, 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
