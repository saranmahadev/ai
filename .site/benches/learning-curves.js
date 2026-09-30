// Bench: learning curves for a stiff and a flexible model as the training set grows.
import { rng } from "./mlkit.js";
import { polyfit, polyval } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Learning curves" });
  const say = live(body);
  const f = (x) => Math.sin(1.6 * x) * 1.4 + 0.3 * x, mk = (seed, n) => { const r = rng(seed); return Array.from({ length: n }, () => { const x = -2.5 + 5 * r(); return { x, y: f(x) + 0.5 * r.gauss() }; }); };
  const val = mk(999, 400), NS = [12, 15, 20, 30, 40, 60, 80, 120, 160], DEG = [1, 6];
  const err = (c, P) => Math.sqrt(P.reduce((s, p) => s + (polyval(c, p.x) - p.y) ** 2, 0) / P.length);
  const curve = DEG.map((d) => NS.map((n) => { let tr = 0, va = 0; for (let s = 1; s <= 20; s++) { const D = mk(s, n), c = polyfit(D.map((p) => p.x), D.map((p) => p.y), d); tr += err(c, D); va += err(c, val); } return { tr: tr / 20, va: va / 20 }; }));
  let idx = 4;
  const sl = slider({ label: "training examples", min: 0, max: NS.length - 1, step: 1, value: idx, format: (v) => NS[v], onInput: (v) => { idx = v; update(); } });
  const cv = canvas(body, { aspect: 0.55, label: "Training and validation error against training set size for a straight line and a degree six curve" });
  const st = stats([["a", "line: train / validation"], ["b", "flexible curve: train / validation"]]);
  body.append(cv.box, st.el, sl.el);
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [Math.log(12), Math.log(160)], [0, 2.2], { l: 44, r: 14, t: 12, b: 32 }); m.axes(ctx, p, { xlabel: "training examples (log scale)", ylabel: "error (RMSE)", ticks: 1 });
    ctx.font = "700 11px Nunito, system-ui"; ctx.fillStyle = p.muted; ctx.textAlign = "center"; NS.forEach((n) => ctx.fillText(n, m.X(Math.log(n)), m.pad.t + m.ih + 26)); ctx.strokeStyle = p.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(m.pad.l, m.Y(0.5)); ctx.lineTo(m.pad.l + m.iw, m.Y(0.5)); ctx.stroke(); ctx.setLineDash([]);
    [[0, p.accent], [1, p.warm]].forEach(([i, col]) => { for (const [key, dash] of [["va", []], ["tr", [6, 4]]]) { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash(dash); ctx.beginPath(); curve[i].forEach((c, j) => { const X = m.X(Math.log(NS[j])), Y = m.Y(Math.min(2.2, c[key])); j ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke(); ctx.setLineDash([]); } });
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.X(Math.log(NS[idx])), m.pad.t); ctx.lineTo(m.X(Math.log(NS[idx])), m.pad.t + m.ih); ctx.stroke(); ctx.font = "800 11px Nunito, system-ui"; ctx.textAlign = "left"; ctx.fillStyle = p.accent; ctx.fillText("line", m.pad.l + 8, m.pad.t + 14); ctx.fillStyle = p.warm; ctx.fillText("flexible curve   solid = validation, dashed = training   dotted grey = noise floor", m.pad.l + 44, m.pad.t + 14); });
  function update() { const a = curve[0][idx], b = curve[1][idx]; st.set("a", `${fmt(a.tr, 2)} / ${fmt(a.va, 2)}`); st.set("b", `${fmt(b.tr, 2)} / ${fmt(Math.min(b.va, 99), 2)}`); say(`${NS[idx]} examples: line validation ${fmt(a.va, 2)}, flexible ${fmt(b.va, 2)}`); cv.redraw(); }
  update(); return () => cv.destroy();
}
