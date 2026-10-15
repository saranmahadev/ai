// Bench: test error for minimum-norm regression as the number of features crosses the interpolation threshold p = n.
import { gauss } from "./mathkit.js";
import { solve } from "./mlkit.js";

const N = 40, NOISE = 0.5, TRIALS = 8, TEST = 150;

function transpose(A) { return A[0].map((_, j) => A.map((row) => row[j])); }
function matmul(A, B) { const r = A.length, c = B[0].length, k = B.length, R = Array.from({ length: r }, () => new Array(c).fill(0)); for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) { let s = 0; for (let t = 0; t < k; t++) s += A[i][t] * B[t][j]; R[i][j] = s; } return R; }

function fitMinNorm(X, y, lambda = 1e-6) {
  const n = X.length, p = X[0].length, Xt = transpose(X);
  if (p <= n) {
    const XtX = matmul(Xt, X); for (let i = 0; i < p; i++) XtX[i][i] += lambda;
    const Xty = matmul(Xt, y.map((v) => [v])).map((r) => r[0]);
    return solve(XtX, Xty);
  }
  const XXt = matmul(X, Xt); for (let i = 0; i < n; i++) XXt[i][i] += lambda;
  const alpha = solve(XXt, y);
  return Xt.map((row) => row.reduce((s, v, i) => s + v * alpha[i], 0));
}
const predict = (X, w) => X.map((row) => row.reduce((s, v, i) => s + v * w[i], 0));

function trialMSE(seed, p) {
  const r = (() => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })();
  const Xtr = Array.from({ length: N }, () => Array.from({ length: p }, () => gauss(r)));
  const Xte = Array.from({ length: TEST }, () => Array.from({ length: p }, () => gauss(r)));
  const yTr = Xtr.map((row) => row[0] + NOISE * gauss(r));
  const yTe = Xte.map((row) => row[0]);
  const w = fitMinNorm(Xtr, yTr);
  const pred = predict(Xte, w);
  return pred.reduce((s, v, i) => s + (v - yTe[i]) ** 2, 0) / pred.length;
}
function avgMSE(p) { let sum = 0; for (let t = 0; t < TRIALS; t++) sum += trialMSE(900 + t, p); return sum / TRIALS; }

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "Test error across the interpolation threshold" });
  const say = live(body);
  let p = 5;
  const cache = new Map();
  const curve = [];
  for (let q = 2; q <= 150; q += (q < 50 ? 1 : 5)) curve.push(q);

  const cv = canvas(body, { aspect: 0.55, label: "Average test error as the number of features p grows, with n = 40 training points marked" });
  const st = stats([["mse", "test MSE at this p"]]);
  const sl = slider({ label: "features (p)", min: 2, max: 150, step: 1, value: p, onInput: (v) => { p = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  function get(q) { if (!cache.has(q)) cache.set(q, avgMSE(q)); return cache.get(q); }

  cv.onDraw((ctx, w, hh, pal) => {
    const m = plot(w, hh, [0, 150], [0, 6]);
    m.axes(ctx, pal, { xlabel: "features (p)", ylabel: "log10(test MSE + 1)" });
    ctx.strokeStyle = pal.muted; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(m.X(N), m.pad.t); ctx.lineTo(m.X(N), m.pad.t + m.ih); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = pal.accent; ctx.lineWidth = 2.5; ctx.beginPath();
    curve.forEach((q, i) => { const y = Math.log10(get(q) + 1); const px = m.X(q), py = m.Y(y); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
    ctx.stroke();
    const yMark = Math.log10(get(p) + 1);
    ctx.fillStyle = pal.warm; ctx.beginPath(); ctx.arc(m.X(p), m.Y(yMark), 6, 0, 7); ctx.fill();
  });

  function update() {
    const mse = get(p);
    st.set("mse", mse.toFixed(3));
    say(`${p} features, test MSE ${mse.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
