// Drawing helpers shared by the Math benches (world-to-pixel views, arrows, function curves). Not a bench itself.
export function view(w, h, { cx = 0, cy = 0, scale = 40 } = {}) {
  return { scale, X: (x) => w / 2 + (x - cx) * scale, Y: (y) => h / 2 - (y - cy) * scale, x: (px) => (px - w / 2) / scale + cx, y: (py) => (h / 2 - py) / scale + cy };
}
export function grid(ctx, v, w, h, p, { step = 1, labels = true } = {}) {
  ctx.lineWidth = 1; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.fillStyle = p.muted;
  const x0 = Math.floor(v.x(0) / step) * step, x1 = Math.ceil(v.x(w) / step) * step, y0 = Math.floor(v.y(h) / step) * step, y1 = Math.ceil(v.y(0) / step) * step;
  for (let x = x0; x <= x1 + 1e-9; x += step) { ctx.strokeStyle = Math.abs(x) < 1e-9 ? p.muted : p.soft2; ctx.beginPath(); ctx.moveTo(v.X(x), 0); ctx.lineTo(v.X(x), h); ctx.stroke(); if (labels && Math.abs(x) > 1e-9 && v.scale * step > 22) { ctx.textAlign = "center"; ctx.fillText(String(Math.round(x * 100) / 100), v.X(x), Math.min(h - 3, Math.max(11, v.Y(0) + 12))); } }
  for (let y = y0; y <= y1 + 1e-9; y += step) { ctx.strokeStyle = Math.abs(y) < 1e-9 ? p.muted : p.soft2; ctx.beginPath(); ctx.moveTo(0, v.Y(y)); ctx.lineTo(w, v.Y(y)); ctx.stroke(); if (labels && Math.abs(y) > 1e-9 && v.scale * step > 22) { ctx.textAlign = "left"; ctx.fillText(String(Math.round(y * 100) / 100), Math.max(3, Math.min(w - 24, v.X(0) + 4)), v.Y(y) - 3); } }
}
export function arrow(ctx, x0, y0, x1, y1, color, width = 3) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0), s = Math.min(11, L * 0.4);
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * s * 0.6, y1 - Math.sin(a) * s * 0.6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.4) * s, y1 - Math.sin(a - 0.4) * s); ctx.lineTo(x1 - Math.cos(a + 0.4) * s, y1 - Math.sin(a + 0.4) * s); ctx.closePath(); ctx.fill();
}
export function dot(ctx, x, y, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
export function label(ctx, text, x, y, color, { align = "left", size = 12, weight = 800 } = {}) { ctx.fillStyle = color; ctx.font = `${weight} ${size}px Nunito, system-ui, sans-serif`; ctx.textAlign = align; ctx.textBaseline = "alphabetic"; ctx.fillText(text, x, y); }
/** Draw y = f(x) between two data x-values using a mapping with X() and Y() (from kit.plot or view). */
export function curve(ctx, m, f, x0, x1, { color = "#888", width = 3, dash = null, clip = null, steps = 240 } = {}) {
  ctx.save();
  if (clip) { ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.w, clip.h); ctx.clip(); }
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = "round"; if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); let open = false;
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps, y = f(x);
    if (!Number.isFinite(y) || Math.abs(y) > 1e6) { open = false; continue; }
    if (open) ctx.lineTo(m.X(x), m.Y(y)); else { ctx.moveTo(m.X(x), m.Y(y)); open = true; }
  }
  ctx.stroke(); ctx.restore();
}
export const clip = (m) => ({ x: m.pad.l, y: m.pad.t, w: m.iw, h: m.ih });

/** Apply a 2x2 matrix M = [a, b, c, d] (row-major) to a point. */
export const apply2 = (M, x, y) => [M[0] * x + M[1] * y, M[2] * x + M[3] * y];

/** Draw the grid warped by M, the unit square and the two column vectors, using a view V. */
export function warp(ctx, V, M, p, { range = 5, square = true, columns = true, faint = false } = {}) {
  ctx.lineWidth = 1;
  for (let t = -range; t <= range; t++) {
    ctx.strokeStyle = t === 0 ? p.muted : faint ? p.soft : p.soft2;
    for (const horiz of [true, false]) {
      ctx.beginPath();
      const a = horiz ? apply2(M, -range, t) : apply2(M, t, -range), b = horiz ? apply2(M, range, t) : apply2(M, t, range);
      ctx.moveTo(V.X(a[0]), V.Y(a[1])); ctx.lineTo(V.X(b[0]), V.Y(b[1])); ctx.stroke();
    }
  }
  if (square) {
    const q = [apply2(M, 0, 0), apply2(M, 1, 0), apply2(M, 1, 1), apply2(M, 0, 1)];
    ctx.fillStyle = p.accent; ctx.globalAlpha = 0.28; ctx.beginPath(); q.forEach((s, i) => (i ? ctx.lineTo(V.X(s[0]), V.Y(s[1])) : ctx.moveTo(V.X(s[0]), V.Y(s[1])))); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.stroke();
  }
  if (columns) { arrow(ctx, V.X(0), V.Y(0), V.X(M[0]), V.Y(M[2]), p.warm, 3.5); arrow(ctx, V.X(0), V.Y(0), V.X(M[1]), V.Y(M[3]), p.good, 3.5); }
}

/** Four sliders for a 2x2 matrix plus preset buttons. Returns { el, M, set(m) }. */
export function matrixControls(kit, M, onChange, presets = []) {
  const { h, slider, button, fmt } = kit;
  const names = ["a", "b", "c", "d"], sl = names.map((n, i) => slider({ label: n, min: -3, max: 3, step: 0.25, value: M[i], format: (v) => fmt(v, 2), onInput: (v) => { M[i] = v; onChange(); } }));
  const el = h("div", { class: "bench-controls" }, h("p", { class: "bench-line" }, "Matrix [ a b ; c d ]. Column 1 is (a, c) and column 2 is (b, d)."), sl.map((s) => s.el));
  const set = (m) => { m.forEach((v, i) => { M[i] = v; sl[i].set(v, true); }); onChange(); };
  const row = presets.length ? h("div", { class: "bench-row" }, presets.map(([name, m]) => button(name, () => set(m)))) : null;
  return { el, row, set };
}
export const PRESETS = [
  ["Identity", [1, 0, 0, 1]], ["Stretch x", [2, 0, 0, 1]], ["Rotate 90°", [0, -1, 1, 0]], ["Shear", [1, 1, 0, 1]], ["Flip", [1, 0, 0, -1]], ["Squash", [1, 2, 0.5, 1]]
];

/** Colour a scalar field f(x, y) over the canvas using a view V. Returns the min and max value found. */
export function heatmap(ctx, w, h, V, f, { block = 6, bands = 10, lo = null, hi = null } = {}) {
  const cols = Math.ceil(w / block), rows = Math.ceil(h / block), vals = new Float32Array(cols * rows);
  let mn = Infinity, mx = -Infinity;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const v = f(V.x(i * block + block / 2), V.y(j * block + block / 2)); vals[j * cols + i] = v; if (v < mn) mn = v; if (v > mx) mx = v; }
  if (lo !== null) mn = lo; if (hi !== null) mx = hi;
  const span = mx - mn || 1;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const t = Math.min(1, Math.max(0, (vals[j * cols + i] - mn) / span)), band = Math.floor(t * bands);
    ctx.fillStyle = `hsla(${230 - 200 * t}, 75%, ${band % 2 ? 62 : 56}%, 0.55)`; ctx.fillRect(i * block, j * block, block + 0.5, block + 0.5);
  }
  return { mn, mx };
}
export const numDiff = (f, x, h = 1e-4) => (f(x + h) - f(x - h)) / (2 * h);

// ---------- probability helpers
export const erf = (x) => { const s = Math.sign(x), t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; };
export const normCdf = (x, mu = 0, s = 1) => 0.5 * (1 + erf((x - mu) / (s * Math.SQRT2)));
export const normPdf = (x, mu = 0, s = 1) => Math.exp(-((x - mu) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
export const choose = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i; return r; };
export const factorial = (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
/** Numerical integral of f over [a, b] (Simpson's rule). */
export const integrate = (f, a, b, n = 400) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; };
/** Gaussian sample via Box-Muller from a uniform generator. */
export const gauss = (r) => Math.sqrt(-2 * Math.log(Math.max(1e-12, r()))) * Math.cos(2 * Math.PI * r());
/** Draw a histogram of `counts` as bars using a plot mapping m (x from lo..hi over bins). */
export function bars(ctx, m, counts, lo, hi, color, { gap = 1 } = {}) {
  const bw = (hi - lo) / counts.length;
  counts.forEach((c, i) => { const x0 = m.X(lo + i * bw), x1 = m.X(lo + (i + 1) * bw); ctx.fillStyle = color; ctx.fillRect(x0 + gap / 2, m.Y(c), Math.max(1, x1 - x0 - gap), m.Y(0) - m.Y(c)); });
}

// ---------- statistics helpers
export const lgamma = (x) => { const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; let y = x, t = x + 5.5; t -= (x + 0.5) * Math.log(t); let s = 1.000000000190015; for (const cj of c) s += cj / ++y; return -t + Math.log((2.5066282746310005 * s) / x); };
export const betaPdf = (p, a, b) => (p <= 0 || p >= 1 ? 0 : Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + (a - 1) * Math.log(p) + (b - 1) * Math.log(1 - p)));
export const quantile = (sorted, q) => { const i = (sorted.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i); return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo); };
export const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
export const variance = (a, ddof = 1) => { const m = mean(a); return a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - ddof); };
/** Least-squares polynomial fit of the given degree (x should lie in about [-1, 1]); returns coefficients, lowest power first. */
export function polyfit(xs, ys, deg) {
  const n = deg + 1, A = Array.from({ length: n }, () => new Array(n + 1).fill(0));
  for (let k = 0; k < xs.length; k++) { const pw = [1]; for (let i = 1; i < 2 * n; i++) pw.push(pw[i - 1] * xs[k]); for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) A[i][j] += pw[i + j]; A[i][n] += pw[i] * ys[k]; } }
  for (let i = 0; i < n; i++) A[i][i] += 1e-9;
  for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r; [A[c], A[p]] = [A[p], A[c]]; for (let r = c + 1; r < n; r++) { const f = A[r][c] / A[c][c]; for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]; } }
  const x = new Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let s = A[i][n]; for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; } return x;
}
export const polyval = (c, x) => c.reduceRight((s, v) => s * x + v, 0);
export const entropy = (p) => -p.reduce((s, x) => s + (x > 0 ? x * Math.log2(x) : 0), 0);
export const norm1 = (w) => { const t = w.reduce((a, b) => a + b, 0) || 1; return w.map((x) => x / t); };

/** Repeatedly fit polynomials of a given degree to fresh noisy data from `truth` on [-1, 1]; used by the bias-variance bench. */
export function biasVariance(rand, truth, { deg, N, noise, sets = 30, grid = 41 }) {
  const xs = Array.from({ length: grid }, (_, i) => -1 + (2 * i) / (grid - 1)), fits = [];
  for (let s = 0; s < sets; s++) {
    const tx = Array.from({ length: N }, (_, i) => -1 + (2 * (i + rand() * 0.6)) / N), ty = tx.map((x) => truth(x) + noise * gauss(rand));
    const c = polyfit(tx, ty, Math.min(deg, N - 1)); fits.push(xs.map((x) => polyval(c, x)));
  }
  const avg = xs.map((_, j) => fits.reduce((a, f) => a + f[j], 0) / sets);
  const bias2 = xs.reduce((a, x, j) => a + (avg[j] - truth(x)) ** 2, 0) / grid, vari = xs.reduce((a, _, j) => a + fits.reduce((b, f) => b + (f[j] - avg[j]) ** 2, 0) / sets, 0) / grid;
  return { xs, fits, avg, bias2, variance: vari, noise2: noise * noise, total: bias2 + vari + noise * noise };
}
