// Bench: coefficient paths for ridge and lasso as the penalty grows.
import { rng, standardise, lstsq, lasso, predictLinear } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Coefficient paths: ridge and lasso" });
  const say = live(body);
  const names = ["size", "rooms", "age", "noise 1", "noise 2", "noise 3", "noise 4", "noise 5"], truth = [3, -2, 1.5, 0, 0, 0, 0, 0];
  const mk = (seed, n) => { const r = rng(seed), X = [], y = []; for (let i = 0; i < n; i++) { const a = r.gauss(), row = [a, 0.8 * a + 0.6 * r.gauss(), r.gauss(), r.gauss(), r.gauss(), r.gauss(), r.gauss(), r.gauss()]; X.push(row); y.push(row.reduce((s, v, j) => s + truth[j] * v, 0) + 2.5 * r.gauss()); } return { X, y }; };
  const tr = mk(9, 24), te = mk(10, 400), S = standardise(tr.X), Zte = te.X.map((row) => row.map((v, j) => (v - S.mu[j]) / S.sd[j]));
  const ym = tr.y.reduce((a, b) => a + b, 0) / tr.y.length;
  let kind = "ridge", s = 0.3;
  const coefs = (k, strength) => k === "ridge" ? lstsq(S.Z, tr.y, strength * 24).slice(1) : lasso(S.Z, tr.y, strength * 24);
  const testErr = (wv) => Math.sqrt(Zte.reduce((a, row, i) => a + (ym + row.reduce((q, v, j) => q + wv[j] * v, 0) - te.y[i]) ** 2, 0) / Zte.length);
  const kc = choice("Penalty", [["ridge", "ridge (sum of squares)"], ["lasso", "lasso (sum of sizes)"]], kind, (v) => { kind = v; update(); });
  const sl = slider({ label: "penalty strength", min: 0, max: 3, step: 0.02, value: s, format: (v) => fmt(v, 2), onInput: (v) => { s = v; update(); } });
  const cv = canvas(body, { aspect: 0.6, label: "Coefficient values against penalty strength for six features" });
  const st = stats([["n", "features kept"], ["e", "error on new data"], ["t", "error at zero penalty"]]);
  body.append(cv.box, st.el, kc.el, sl.el);
  const cols = (p) => [p.accent, p.warm, p.good, p.muted, p.muted, p.muted, p.muted, p.muted];
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [0, 3], [-3.5, 4], { l: 44, r: 70, t: 14, b: 32 }); m.axes(ctx, p, { xlabel: "penalty strength", ylabel: "coefficient", ticks: 3 }); const c = cols(p);
    ctx.strokeStyle = p.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(m.X(0), m.Y(0)); ctx.lineTo(m.X(3), m.Y(0)); ctx.stroke();
    for (let j = 0; j < 8; j++) { ctx.strokeStyle = c[j]; ctx.lineWidth = j < 3 ? 3 : 1.6; ctx.setLineDash(j < 3 ? [] : [4, 4]); ctx.beginPath(); for (let i = 0; i <= 60; i++) { const sv = (3 * i) / 60, wv = coefs(kind, sv)[j]; i ? ctx.lineTo(m.X(sv), m.Y(wv)) : ctx.moveTo(m.X(sv), m.Y(wv)); } ctx.stroke(); ctx.setLineDash([]); const end = coefs(kind, 3)[j]; if (j <= 3) { ctx.fillStyle = c[j]; ctx.font = "700 11px Nunito, system-ui"; ctx.textAlign = "left"; ctx.fillText(j < 3 ? names[j] : "5 noise", m.X(3) + 8, m.pad.t + 12 + 16 * j); } }
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.X(s), m.pad.t); ctx.lineTo(m.X(s), m.pad.t + m.ih); ctx.stroke(); });
  function update() { const wv = coefs(kind, s); st.set("n", wv.filter((v) => Math.abs(v) > 0.005).length); st.set("e", fmt(testErr(wv), 2)); st.set("t", fmt(testErr(coefs(kind, 0)), 2)); say(`${wv.filter((v) => Math.abs(v) > 0.005).length} features kept, error on new data ${fmt(testErr(wv), 2)}`); cv.redraw(); }
  update(); return () => cv.destroy();
}
