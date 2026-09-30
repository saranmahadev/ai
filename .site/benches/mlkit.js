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

// ---------- unsupervised learning

/** Blobs at given centres (points {x, y, c: index of the centre}). */
export function clusters(r, centres, per, sd = 0.4) {
  const out = [];
  centres.forEach(([cx, cy], c) => { for (let i = 0; i < per; i++) out.push({ x: cx + sd * r.gauss(), y: cy + sd * r.gauss(), c }); });
  return out;
}
const d2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
/** k-means++ style seeding with a seeded rng. */
export function seedCentres(pts, k, seed) {
  const r = rng(seed), cs = [{ ...pts[r.int(pts.length)] }];
  while (cs.length < k) { const w = pts.map((p) => Math.min(...cs.map((c) => d2(p, c)))), tot = w.reduce((a, b) => a + b, 0); let u = r() * tot, i = 0; while (i < pts.length - 1 && (u -= w[i]) > 0) i++; cs.push({ x: pts[i].x, y: pts[i].y }); }
  return cs;
}
/** One Lloyd iteration: assign each point to its nearest centre, then move each centre to its members' mean. */
export function kmeansStep(pts, cents) {
  const assign = pts.map((p) => { let b = 0; cents.forEach((c, i) => { if (d2(p, c) < d2(p, cents[b])) b = i; }); return b; });
  const next = cents.map((c, i) => { const m = pts.filter((_, j) => assign[j] === i); return m.length ? { x: m.reduce((s, p) => s + p.x, 0) / m.length, y: m.reduce((s, p) => s + p.y, 0) / m.length } : c; });
  return { assign, cents: next };
}
export const inertia = (pts, cents, assign) => pts.reduce((s, p, i) => s + d2(p, cents[assign[i]]), 0);
export function kmeans(pts, k, seed = 1, iters = 40) {
  let cents = seedCentres(pts, k, seed), assign;
  for (let i = 0; i < iters; i++) { const s = kmeansStep(pts, cents); assign = s.assign; cents = s.cents; }
  assign = kmeansStep(pts, cents).assign;
  return { cents, assign, inertia: inertia(pts, cents, assign) };
}
export function silhouette(pts, assign, k) {
  if (k < 2) return 0;
  let tot = 0;
  pts.forEach((p, i) => {
    const mean = (c) => { let s = 0, n = 0; pts.forEach((q, j) => { if (j !== i && assign[j] === c) { s += Math.sqrt(d2(p, q)); n++; } }); return n ? s / n : Infinity; };
    const a = mean(assign[i]); let b = Infinity; for (let c = 0; c < k; c++) if (c !== assign[i]) b = Math.min(b, mean(c));
    tot += Number.isFinite(a) && Number.isFinite(b) ? (b - a) / Math.max(a, b) : 0;
  });
  return tot / pts.length;
}
/** Average-linkage agglomerative clustering. Returns the merges [{a, b, d}] in order (ids ≥ n are earlier merges). */
export function agglomerate(pts) {
  const n = pts.length, members = new Map(pts.map((_, i) => [i, [i]])), merges = []; let next = n;
  const dist = (A, B) => { let s = 0; for (const i of A) for (const j of B) s += Math.sqrt(d2(pts[i], pts[j])); return s / (A.length * B.length); };
  while (members.size > 1) {
    let best = null; const ids = [...members.keys()];
    for (let x = 0; x < ids.length; x++) for (let y = x + 1; y < ids.length; y++) { const d = dist(members.get(ids[x]), members.get(ids[y])); if (!best || d < best.d) best = { a: ids[x], b: ids[y], d }; }
    members.set(next, [...members.get(best.a), ...members.get(best.b)]); members.delete(best.a); members.delete(best.b); merges.push({ ...best, id: next }); next++;
  }
  return merges;
}
/** Labels for a cut that leaves `k` clusters. */
export function cutMerges(n, merges, k) {
  const members = new Map(Array.from({ length: n }, (_, i) => [i, [i]]));
  for (const m of merges.slice(0, n - k)) { members.set(m.id, [...members.get(m.a), ...members.get(m.b)]); members.delete(m.a); members.delete(m.b); }
  const label = new Array(n).fill(0); [...members.values()].forEach((mem, c) => mem.forEach((i) => { label[i] = c; }));
  return label;
}
/** Symmetric eigen-decomposition by Jacobi rotations: returns {vals, vecs} sorted by decreasing value (vecs[i] is the i-th eigenvector). */
export function jacobiEigen(A0) {
  const n = A0.length, A = A0.map((r) => [...r]), V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] ** 2; if (off < 1e-20) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(A[p][q]) < 1e-14) continue;
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const kp = A[k][p], kq = A[k][q]; A[k][p] = c * kp - s * kq; A[k][q] = s * kp + c * kq; }
      for (let k = 0; k < n; k++) { const pk = A[p][k], qk = A[q][k]; A[p][k] = c * pk - s * qk; A[q][k] = s * pk + c * qk; }
      for (let k = 0; k < n; k++) { const kp = V[k][p], kq = V[k][q]; V[k][p] = c * kp - s * kq; V[k][q] = s * kp + c * kq; }
    }
  }
  const order = A.map((_, i) => i).sort((a, b) => A[b][b] - A[a][a]);
  return { vals: order.map((i) => A[i][i]), vecs: order.map((i) => V.map((row) => row[i])) };
}
/** PCA of rows X: mean, eigenvalues (variances, decreasing) and principal directions. */
export function pca(X) {
  const n = X.length, d = X[0].length, mean = Array.from({ length: d }, (_, j) => X.reduce((s, r) => s + r[j], 0) / n);
  const C = Array.from({ length: d }, (_, a) => Array.from({ length: d }, (_, b) => X.reduce((s, r) => s + (r[a] - mean[a]) * (r[b] - mean[b]), 0) / (n - 1)));
  return { mean, ...jacobiEigen(C) };
}
/** One EM step for a 1-D Gaussian mixture: comps are {w, mu, sd}; returns the updated comps and the log-likelihood before the step. */
export function emStep(xs, comps) {
  const pdf = (x, c) => Math.exp(-((x - c.mu) ** 2) / (2 * c.sd * c.sd)) / (c.sd * Math.sqrt(2 * Math.PI));
  let ll = 0; const R = xs.map((x) => { const p = comps.map((c) => c.w * pdf(x, c)), s = p.reduce((a, b) => a + b, 0); ll += Math.log(s); return p.map((v) => v / s); });
  const next = comps.map((_, k) => { const nk = R.reduce((s, r) => s + r[k], 0), mu = R.reduce((s, r, i) => s + r[k] * xs[i], 0) / nk, v = R.reduce((s, r, i) => s + r[k] * (xs[i] - mu) ** 2, 0) / nk; return { w: nk / xs.length, mu, sd: Math.max(0.05, Math.sqrt(v)) }; });
  return { comps: next, ll, R };
}
