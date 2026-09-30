// Bench: choose which columns are features, fit a linear model, and watch a leaking column give it away.
import { rng, lstsq, mse, predictLinear } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, toggles, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Pick the features, predict the price" });
  const say = live(body);
  const r = rng(21), rows = [];
  for (let i = 0; i < 60; i++) { const size = 50 + r() * 100, beds = Math.max(1, Math.min(5, Math.round(size / 40 + r.gauss() * 0.6))), age = r() * 50, noise = 12 * r.gauss(); const price = 40 + 2.2 * size + 8 * beds - 1.1 * age + noise; rows.push({ size, beds, age, id: i + 1, noise: r() * 100, quote: price * (0.985 + 0.03 * r()) + 0, price }); }
  const cols = [["size", "size (m²)"], ["beds", "bedrooms"], ["age", "age (years)"], ["id", "listing number"], ["quote", "agent's final quote (known only after the sale)"]];
  const tr = rows.slice(0, 40), te = rows.slice(40);
  const tg = toggles(cols.map(([k, l], i) => [k, l, i < 2]), () => update());
  const cv = canvas(body, { aspect: 0.6, label: "Predicted price against real price for unseen homes" });
  const st = stats([["a", "error on training homes"], ["b", "error on unseen homes"], ["c", "features used"]]);
  body.append(cv.box, st.el, tg.el);
  let preds = [];
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [100, 400], [100, 400]); m.axes(ctx, p, { xlabel: "real price", ylabel: "predicted price" });
    ctx.strokeStyle = p.muted; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(m.X(100), m.Y(100)); ctx.lineTo(m.X(400), m.Y(400)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = p.warm; for (const [a, b] of preds) { ctx.beginPath(); ctx.arc(m.X(a), m.Y(Math.max(100, Math.min(400, b))), 5, 0, 7); ctx.fill(); } });
  function update() { const on = Object.entries(tg.get()).filter(([, v]) => v).map(([k]) => k);
    if (!on.length) { preds = []; st.set("a", "—"); st.set("b", "—"); st.set("c", "none"); cv.redraw(); return; }
    const f = (x) => on.map((k) => x[k]), w = lstsq(tr.map(f), tr.map((x) => x.price), 1e-6);
    preds = te.map((x) => [x.price, predictLinear(w, f(x))]);
    st.set("a", fmt(Math.sqrt(mse(w, tr.map(f), tr.map((x) => x.price))), 1)); st.set("b", fmt(Math.sqrt(mse(w, te.map(f), te.map((x) => x.price))), 1)); st.set("c", on.length);
    say(`Error on unseen homes ${fmt(Math.sqrt(mse(w, te.map(f), te.map((x) => x.price))), 1)}`); cv.redraw(); }
  update(); return () => cv.destroy();
}
