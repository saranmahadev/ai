// Bench: shuffle features one at a time to see which ones the model actually uses.
import { rng, logisticFit, logisticProb } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, toggles, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Shuffle a feature, watch the score" });
  const say = live(body);
  const r = rng(5), D = Array.from({ length: 600 }, () => { const a = r.gauss(), b = r.gauss(); return { f: [a, a + 0.2 * r.gauss(), b, r.gauss()], c: 2 * a + b + 0.7 * r.gauss() > 0 ? 1 : 0 }; });
  const T = D.slice(0, 200), V = D.slice(200), w = logisticFit(T.map((p) => p.f), T.map((p) => p.c), { iters: 1500, lr: 0.3 });
  const NAMES = ["signal A", "copy of A (with noise)", "signal B", "pure noise"];
  const acc = (rows) => rows.filter((p) => (logisticProb(w, p.f) > 0.5 ? 1 : 0) === p.c).length / rows.length;
  const perm = (cols, seed) => { const rr = rng(seed), cs = cols.map((c) => { const v = V.map((p) => p.f[c]); for (let i = v.length - 1; i > 0; i--) { const j = rr.int(i + 1); [v[i], v[j]] = [v[j], v[i]]; } return v; }); return V.map((p, i) => { const f = [...p.f]; cols.forEach((c, q) => { f[c] = cs[q][i]; }); return { f, c: p.c }; }); };
  const mean = (cols) => { let s = 0; for (let z = 1; z <= 20; z++) s += acc(perm(cols, z)); return s / 20; };
  const base = acc(V), alone = [0, 1, 2, 3].map((c) => base - mean([c]));
  const tg = toggles(NAMES.map((n, i) => [String(i), `shuffle "${n}"`, i === 0]), () => update());
  const cv = canvas(body, { aspect: 0.45, label: "Accuracy lost when each feature is shuffled on its own" });
  const st = stats([["b", "accuracy on held-out points"], ["a", "accuracy with the ticked features shuffled"], ["d", "drop"]]);
  body.append(cv.box, st.el, tg.el);
  cv.onDraw((ctx, wd, hh, p) => { const m = plot(wd, hh, [0, 5], [-0.02, 0.32], { l: 44, r: 14, t: 12, b: 34 }); m.axes(ctx, p, { ylabel: "accuracy lost", ticks: 1 }); ctx.font = "700 11px Nunito, system-ui"; ctx.textAlign = "center";
    alone.forEach((d, i) => { const x0 = m.X(i + 0.65), x1 = m.X(i + 1.35), y = m.Y(Math.max(0, d)); ctx.fillStyle = i === 3 ? p.soft2 : p.accent; ctx.fillRect(x0, y, x1 - x0, m.Y(0) - y); ctx.fillStyle = p.muted; ctx.fillText(["A", "A copy", "B", "noise"][i], (x0 + x1) / 2, m.pad.t + m.ih + 16); ctx.fillStyle = p.ink; ctx.fillText(fmt(d * 100, 1) + " pts", (x0 + x1) / 2, y - 5); }); });
  function update() { const on = Object.entries(tg.get()).filter(([, v]) => v).map(([k]) => +k), a = on.length ? mean(on) : base; st.set("b", fmt(base * 100, 1) + "%"); st.set("a", fmt(a * 100, 1) + "%"); st.set("d", fmt((base - a) * 100, 1) + " points"); say(`Accuracy ${fmt(a * 100, 1)} percent`); cv.redraw(); }
  update(); return () => cv.destroy();
}
