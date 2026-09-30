// Shared code for the Machine Learning benches: seeded toy datasets and tiny classic learners.
// Pure functions (no DOM), so notes' worked numbers can be computed with them in Node.

export function rng(seed = 1) {
  let a = seed >>> 0;
  const next = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  next.gauss = () => Math.sqrt(-2 * Math.log(Math.max(1e-12, next()))) * Math.cos(2 * Math.PI * next());
  next.int = (n) => Math.floor(next() * n);
  return next;
}

/** Two Gaussian blobs: points {x, y, c} with class c in {0, 1}. */
export function blobs(r, n, c0 = [-1, -0.5], c1 = [1, 0.5], sd = 0.6) {
  const out = [];
  for (let i = 0; i < n; i++) { const c = i % 2; const m = c ? c1 : c0; out.push({ x: m[0] + sd * r.gauss(), y: m[1] + sd * r.gauss(), c }); }
  return out;
}
/** Two interleaving half-moons. */
export function moons(r, n, noise = 0.15) {
  const out = [];
  for (let i = 0; i < n; i++) { const c = i % 2, t = Math.PI * r(); const x = c ? 1 - Math.cos(t) : Math.cos(t), y = c ? 0.35 - Math.sin(t) : Math.sin(t);
    out.push({ x: (x - 0.5) * 1.6 + noise * r.gauss(), y: (y - 0.15) * 1.6 + noise * r.gauss(), c }); }
  return out;
}
/** A class-0 core surrounded by a class-1 ring. */
export function ring(r, n, noise = 0.12) {
  const out = [];
  for (let i = 0; i < n; i++) { const c = i % 2, a = 2 * Math.PI * r(), rad = (c ? 1.1 : 0.4) + noise * r.gauss(); out.push({ x: rad * Math.cos(a), y: rad * Math.sin(a), c }); }
  return out;
}

export const sigmoid = (z) => 1 / (1 + Math.exp(-z));
export const accuracy = (pts, f) => pts.filter((p) => f(p) === p.c).length / pts.length;

/** Solve A·x = b by Gaussian elimination with partial pivoting. */
export function solve(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let i = 0; i < n; i++) {
    let p = i; for (let k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
    [M[i], M[p]] = [M[p], M[i]];
    const d = M[i][i] || 1e-12;
    for (let k = i + 1; k < n; k++) { const f = M[k][i] / d; for (let j = i; j <= n; j++) M[k][j] -= f * M[i][j]; }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j]; x[i] = s / (M[i][i] || 1e-12); }
  return x;
}

/** Ridge regression. X: rows of features, returns [bias, w1, w2, …]; the bias is not penalised. */
export function lstsq(X, y, lambda = 0) {
  const d = X[0].length + 1, A = Array.from({ length: d }, () => new Array(d).fill(0)), b = new Array(d).fill(0);
  X.forEach((row, i) => { const v = [1, ...row]; for (let a = 0; a < d; a++) { b[a] += v[a] * y[i]; for (let c = 0; c < d; c++) A[a][c] += v[a] * v[c]; } });
  for (let a = 1; a < d; a++) A[a][a] += lambda;
  return solve(A, b);
}
export const predictLinear = (w, row) => w[0] + row.reduce((s, v, i) => s + w[i + 1] * v, 0);
export const mse = (w, X, y) => X.reduce((s, row, i) => s + (predictLinear(w, row) - y[i]) ** 2, 0) / X.length;

/** Lasso by coordinate descent on standardised features (returns weights in the standardised space). */
export function lasso(Z, y, lambda, iters = 200) {
  const n = Z.length, d = Z[0].length, w = new Array(d).fill(0), ym = y.reduce((a, b) => a + b, 0) / n, yc = y.map((v) => v - ym);
  for (let it = 0; it < iters; it++) for (let j = 0; j < d; j++) {
    let rho = 0, zz = 0;
    for (let i = 0; i < n; i++) { let pred = 0; for (let k = 0; k < d; k++) if (k !== j) pred += w[k] * Z[i][k]; rho += Z[i][j] * (yc[i] - pred); zz += Z[i][j] ** 2; }
    w[j] = Math.abs(rho) <= lambda ? 0 : (rho - Math.sign(rho) * lambda) / zz;
  }
  return w;
}
export function standardise(X) {
  const n = X.length, d = X[0].length, mu = [], sd = [];
  for (let j = 0; j < d; j++) { const c = X.map((r) => r[j]), m = c.reduce((a, b) => a + b, 0) / n; mu.push(m); sd.push(Math.sqrt(c.reduce((s, v) => s + (v - m) ** 2, 0) / n) || 1); }
  return { mu, sd, Z: X.map((r) => r.map((v, j) => (v - mu[j]) / sd[j])) };
}

/** Logistic regression by batch gradient descent; features are rows, returns [bias, w…]. */
export function logisticFit(X, y, { l2 = 0, iters = 1500, lr = 0.3 } = {}) {
  const d = X[0].length + 1, w = new Array(d).fill(0), n = X.length;
  for (let it = 0; it < iters; it++) {
    const g = new Array(d).fill(0);
    X.forEach((row, i) => { const v = [1, ...row], e = sigmoid(v.reduce((s, x, j) => s + x * w[j], 0)) - y[i]; for (let j = 0; j < d; j++) g[j] += e * v[j]; });
    for (let j = 0; j < d; j++) w[j] -= lr * (g[j] / n + (j ? l2 * w[j] : 0));
  }
  return w;
}
export const logisticProb = (w, row) => sigmoid(predictLinear(w, row));

/** Linear soft-margin SVM by dual coordinate descent. Labels are 0/1; returns [bias, w1, w2] (the bias is lightly regularised). */
export function svmFit(pts, C = 1, epochs = 300) {
  const n = pts.length, X = pts.map((p) => [p.x, p.y, 1]), Y = pts.map((p) => (p.c ? 1 : -1)), a = new Array(n).fill(0), w = [0, 0, 0];
  for (let e = 0; e < epochs; e++) for (let i = 0; i < n; i++) {
    const q = X[i][0] ** 2 + X[i][1] ** 2 + 1, g = Y[i] * (w[0] * X[i][0] + w[1] * X[i][1] + w[2]) - 1, an = Math.min(C, Math.max(0, a[i] - g / q)), d = (an - a[i]) * Y[i];
    w[0] += d * X[i][0]; w[1] += d * X[i][1]; w[2] += d; a[i] = an;
  }
  return [w[2], w[0], w[1]];
}

export function knn(train, x, y, k) {
  const d = train.map((p) => ({ p, d: Math.hypot(p.x - x, p.y - y) })).sort((a, b) => a.d - b.d).slice(0, k);
  return { vote: d.reduce((s, e) => s + e.p.c, 0) / d.length, near: d.map((e) => e.p) };
}

/** Colour a decision region: `prob(x, y)` is P(class 1). Draws faint tinted blocks under the points. */
export function regions(ctx, m, prob, p, { block = 9, alpha = 0.22 } = {}) {
  const x0 = m.pad.l, y0 = m.pad.t;
  for (let px = 0; px < m.iw; px += block) for (let py = 0; py < m.ih; py += block) {
    const q = prob(m.x(x0 + px + block / 2), m.y(y0 + py + block / 2));
    ctx.globalAlpha = alpha * (0.4 + 1.2 * Math.abs(q - 0.5));
    ctx.fillStyle = q > 0.5 ? p.warm : p.accent;
    ctx.fillRect(x0 + px, y0 + py, Math.min(block, m.iw - px), Math.min(block, m.ih - py));
  }
  ctx.globalAlpha = 1;
}
export function scatter(ctx, m, pts, p, { r = 5, ring: mark = () => false } = {}) {
  for (const q of pts) {
    ctx.fillStyle = q.c ? p.warm : p.accent; ctx.beginPath(); ctx.arc(m.X(q.x), m.Y(q.y), r, 0, 7); ctx.fill();
    ctx.strokeStyle = mark(q) ? p.ink : p.white; ctx.lineWidth = mark(q) ? 2.5 : 1.5; ctx.stroke();
  }
}
/** Draw the line b + w·(x, y) = 0 across the plot. */
export function boundaryLine(ctx, m, w, color, { width = 3, dash = null, rx = [-3, 3] } = {}) {
  ctx.save(); ctx.beginPath(); ctx.rect(m.pad.l, m.pad.t, m.iw, m.ih); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = width; if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  if (Math.abs(w[2]) > 1e-9) { ctx.moveTo(m.X(rx[0]), m.Y(-(w[0] + w[1] * rx[0]) / w[2])); ctx.lineTo(m.X(rx[1]), m.Y(-(w[0] + w[1] * rx[1]) / w[2])); }
  else { const x = -w[0] / (w[1] || 1e-9); ctx.moveTo(m.X(x), m.pad.t); ctx.lineTo(m.X(x), m.pad.t + m.ih); }
  ctx.stroke(); ctx.restore();
}

// ---------- trees, forests and boosting

export const gini = (n0, n1) => { const n = n0 + n1; if (!n) return 0; const p = n1 / n; return 2 * p * (1 - p); };
export const entropyBits = (n0, n1) => { const n = n0 + n1; if (!n) return 0; return [n0, n1].reduce((s, k) => s + (k ? -(k / n) * Math.log2(k / n) : 0), 0); };

/** Greedy classification tree on points {x, y, c}. Options: maxDepth, minLeaf, crit ("gini" | "entropy"), rand (an rng: pick one random feature per split). */
export function fitTree(pts, { maxDepth = 3, minLeaf = 1, crit = "gini", rand = null } = {}, depth = 0) {
  const I = crit === "gini" ? gini : entropyBits, n1 = pts.filter((p) => p.c).length, n0 = pts.length - n1, leaf = { leaf: true, p: pts.length ? n1 / pts.length : 0.5, n: pts.length };
  if (depth >= maxDepth || !n0 || !n1 || pts.length < 2 * minLeaf) return leaf;
  const feats = rand ? [rand() < 0.5 ? "x" : "y"] : ["x", "y"], parent = I(n0, n1);
  let best = null;
  for (const f of feats) {
    const s = [...pts].sort((a, b) => a[f] - b[f]); let l0 = 0, l1 = 0;
    for (let i = 0; i < s.length - 1; i++) {
      s[i].c ? l1++ : l0++;
      if (s[i][f] === s[i + 1][f]) continue;
      const nl = i + 1, nr = s.length - nl; if (nl < minLeaf || nr < minLeaf) continue;
      const imp = (nl * I(l0, l1) + nr * I(n0 - l0, n1 - l1)) / s.length;
      if (!best || imp < best.imp - 1e-12) best = { imp, f, t: (s[i][f] + s[i + 1][f]) / 2 };
    }
  }
  if (!best || best.imp >= parent - 1e-12) return leaf;
  const L = pts.filter((p) => p[best.f] <= best.t), R = pts.filter((p) => p[best.f] > best.t);
  return { f: best.f, t: best.t, l: fitTree(L, { maxDepth, minLeaf, crit, rand }, depth + 1), r: fitTree(R, { maxDepth, minLeaf, crit, rand }, depth + 1), n: pts.length, gain: parent - best.imp };
}
export const treeProb = (t, x, y) => (t.leaf ? t.p : (t.f === "x" ? x : y) <= t.t ? treeProb(t.l, x, y) : treeProb(t.r, x, y));
export const treeLeaves = (t) => (t.leaf ? 1 : treeLeaves(t.l) + treeLeaves(t.r));

/** A random forest: bootstrap samples, one random feature per split, averaged probabilities. */
export function fitForest(pts, nTrees, opts = {}, seed = 3) {
  const r = rng(seed);
  return Array.from({ length: nTrees }, () => fitTree(Array.from({ length: pts.length }, () => pts[r.int(pts.length)]), { ...opts, rand: r }));
}
export const forestProb = (F, x, y) => F.reduce((s, t) => s + treeProb(t, x, y), 0) / F.length;

/** Best one-split regression stump on 1-D data: returns {t, l, r}. */
export function fitStump(xs, res) {
  const idx = xs.map((_, i) => i).sort((a, b) => xs[a] - xs[b]), n = xs.length, tot = res.reduce((a, b) => a + b, 0);
  let best = null, sl = 0;
  for (let k = 0; k < n - 1; k++) {
    sl += res[idx[k]];
    if (xs[idx[k]] === xs[idx[k + 1]]) continue;
    const nl = k + 1, nr = n - nl, ml = sl / nl, mr = (tot - sl) / nr, gain = nl * ml * ml + nr * mr * mr;
    if (!best || gain > best.gain) best = { gain, t: (xs[idx[k]] + xs[idx[k + 1]]) / 2, l: ml, r: mr };
  }
  return best || { t: 0, l: tot / n, r: tot / n };
}
