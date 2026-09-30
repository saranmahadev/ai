// Bench: choose model complexity on a validation set; peeking at the test set spoils it.
import { rng, } from "./mlkit.js";
import { polyfit, polyval } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, button, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Train, validate, test" });
  const say = live(body);
  const r = rng(5), f = (x) => Math.sin(1.6 * x) * 1.4 + 0.3 * x;
  const all = Array.from({ length: 60 }, () => { const x = -2.5 + 5 * r(); return { x, y: f(x) + 0.55 * r.gauss() }; });
  const tr = all.slice(0, 30), va = all.slice(30, 45), te = all.slice(45);
  let deg = 1, peeks = 0;
  const err = (c, pts) => Math.sqrt(pts.reduce((s, p) => s + (polyval(c, p.x) - p.y) ** 2, 0) / pts.length);
  const cv = canvas(body, { aspect: 0.6, label: "Training, validation and test points with the fitted curve" });
  const sl = slider({ label: "polynomial degree", min: 0, max: 12, step: 1, value: deg, onInput: (v) => { deg = v; update(); } });
  const st = stats([["a", "train error"], ["b", "validation error"], ["c", "test error"], ["d", "test looks"]]);
  let showTest = false;
  const peek = button("Look at the test error", () => { showTest = true; peeks++; update(); });
  body.append(cv.box, st.el, sl.el, h("div", { class: "bench-row" }, peek));
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [-2.5, 2.5], [-4, 4]); m.axes(ctx, p);
    for (const [pts, col, rad] of [[tr, p.accent, 5], [va, p.warm, 5], [te, p.muted, 4]]) for (const q of pts) { ctx.fillStyle = col; ctx.globalAlpha = pts === te && !showTest ? 0.25 : 1; ctx.beginPath(); ctx.arc(m.X(q.x), m.Y(Math.max(-4, Math.min(4, q.y))), rad, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
    const c = polyfit(tr.map((q) => q.x), tr.map((q) => q.y), deg); ctx.save(); ctx.beginPath(); ctx.rect(m.pad.l, m.pad.t, m.iw, m.ih); ctx.clip(); ctx.strokeStyle = p.ink; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= 200; i++) { const x = -2.5 + (5 * i) / 200, y = polyval(c, x); i ? ctx.lineTo(m.X(x), m.Y(y)) : ctx.moveTo(m.X(x), m.Y(y)); } ctx.stroke(); ctx.restore(); });
  function update() { const c = polyfit(tr.map((q) => q.x), tr.map((q) => q.y), deg);
    st.set("a", fmt(err(c, tr), 2)); st.set("b", fmt(err(c, va), 2)); st.set("c", showTest ? fmt(err(c, te), 2) : "hidden"); st.set("d", peeks);
    say(`Degree ${deg}: train ${fmt(err(c, tr), 2)}, validation ${fmt(err(c, va), 2)}`); cv.redraw(); }
  update(); return () => cv.destroy();
}
