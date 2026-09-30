// Bench: selecting features on all the data before cross-validation "finds" a signal in pure noise.
import { rng } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, button, canvas, stats, plot, live, fmt } = kit;
  let pending = 0; const later = () => { clearTimeout(pending); pending = setTimeout(update, 120); };
  const body = frame(root, { title: "A signal in pure noise?" });
  const say = live(body);
  let d = 300, nsel = 10, seed = 1, mode = "leaky", res = null;
  const mc = choice("Pipeline", [["leaky", "select features on all the data, then cross-validate"], ["proper", "select features inside each training fold"]], mode, (v) => { mode = v; update(); });
  const sd = slider({ label: "noise features available", min: 20, max: 1000, step: 20, value: d, onInput: (v) => { d = v; later(); } });
  const sn = slider({ label: "features kept", min: 2, max: 40, step: 1, value: nsel, onInput: (v) => { nsel = v; later(); } });
  const cv = canvas(body, { aspect: 0.4, maxH: 240, label: "Cross-validated accuracy of both pipelines on twenty random datasets" });
  const st = stats([["a", "accuracy in this pipeline (this dataset)"], ["m", "average over 20 datasets"], ["c", "chance level"]]);
  body.append(cv.box, st.el, mc.el, sd.el, sn.el, button("New random dataset", () => { seed++; update(); }));
  const run = (sd0) => { const r = rng(sd0), n = 60, X = Array.from({ length: n }, () => Array.from({ length: d }, () => r.gauss())), y = Array.from({ length: n }, (_, i) => i % 2);
    const corr = (idx, j) => { let s = 0; for (const i of idx) s += X[i][j] * (y[i] ? 1 : -1); return Math.abs(s); }, all = X.map((_, i) => i), sel = (idx) => { const sc = Array.from({ length: d }, (_, j) => corr(idx, j)); return sc.map((v, j) => j).sort((a, b) => sc[b] - sc[a]).slice(0, nsel); };
    const cent = (idx, f) => [0, 1].map((cl) => f.map((j) => { const m = idx.filter((i) => y[i] === cl); return m.reduce((s, i) => s + X[i][j], 0) / m.length; })), predict = (c, f, i) => (f.reduce((s, j, q) => s + (X[i][j] - c[1][q]) ** 2, 0) < f.reduce((s, j, q) => s + (X[i][j] - c[0][q]) ** 2, 0) ? 1 : 0);
    const rr = rng(sd0 * 7), perm = all.slice(); for (let i = perm.length - 1; i > 0; i--) { const j = rr.int(i + 1); [perm[i], perm[j]] = [perm[j], perm[i]]; }
    const globalSel = sel(all); let leaky = 0, proper = 0; for (let f = 0; f < 5; f++) { const te = perm.filter((_, q) => q % 5 === f), tr = perm.filter((_, q) => q % 5 !== f); const c1 = cent(tr, globalSel); te.forEach((i) => { if (predict(c1, globalSel, i) === y[i]) leaky++; }); const fs = sel(tr), c2 = cent(tr, fs); te.forEach((i) => { if (predict(c2, fs, i) === y[i]) proper++; }); }
    return { leaky: leaky / n, proper: proper / n }; };
  cv.onDraw((ctx, w, hh, p) => { if (!res) return; const m = plot(w, hh, [0, 21], [0.2, 1], { l: 44, r: 14, t: 12, b: 32 }); m.axes(ctx, p, { xlabel: "twenty random datasets", ylabel: "accuracy", ticks: 1 });
    ctx.strokeStyle = p.muted; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(m.pad.l, m.Y(0.5)); ctx.lineTo(m.pad.l + m.iw, m.Y(0.5)); ctx.stroke(); ctx.setLineDash([]);
    res.forEach((v, i) => { const x0 = m.X(i + 0.6), x1 = m.X(i + 1.4), a = v[mode]; ctx.fillStyle = i === 0 ? p.ink : mode === "leaky" ? p.warm : p.accent; ctx.fillRect(x0, m.Y(a), x1 - x0, m.pad.t + m.ih - m.Y(a)); }); });
  function update() { res = Array.from({ length: 20 }, (_, i) => run(seed + i)); const me = res.reduce((s, v) => s + v[mode], 0) / 20; st.set("a", fmt(res[0][mode] * 100, 0) + "%"); st.set("m", fmt(me * 100, 1) + "%"); st.set("c", "50%"); say(`${mode} pipeline: ${fmt(me * 100, 1)} percent on average`); cv.redraw(); }
  update(); return () => { clearTimeout(pending); cv.destroy(); };
}
