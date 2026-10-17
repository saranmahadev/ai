// Shared maths for the Neural Networks benches: Hopfield networks, Boltzmann machines, SOMs, spiking neurons.
// Pure functions only, so the notes' worked numbers can be checked by running this file in Node.

export const sign = (x) => (x >= 0 ? 1 : -1);
export const sigmoid = (z) => 1 / (1 + Math.exp(-z));

export function softmax(scores) {
  const m = Math.max(...scores);
  const e = scores.map((s) => Math.exp(s - m));
  const sum = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / sum);
}

/** Modern (continuous) Hopfield update: ξ_new = Σᵢ softmax(β · patternᵢ · ξ) · patternᵢ — the same formula as single-query attention. */
export function modernHopfieldUpdate(patterns, xi, beta = 1) {
  const scores = patterns.map((p) => beta * p.reduce((s, v, k) => s + v * xi[k], 0));
  const weights = softmax(scores);
  const out = new Array(xi.length).fill(0);
  patterns.forEach((p, i) => p.forEach((v, k) => (out[k] += weights[i] * v)));
  return { weights, out };
}

/** Hebbian outer-product weight matrix for a set of ±1 patterns, zero diagonal. */
export function hopfieldWeights(patterns) {
  const n = patterns[0].length;
  const W = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const p of patterns) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) W[i][j] += (p[i] * p[j]) / patterns.length;
  return W;
}

/** One asynchronous Hopfield update of unit i: s_i <- sign(sum_j W_ij s_j). */
export function hopfieldUpdateUnit(W, s, i) {
  let sum = 0;
  for (let j = 0; j < s.length; j++) if (j !== i) sum += W[i][j] * s[j];
  return sign(sum);
}

/** Run asynchronous Hopfield updates (in the given unit order, repeated) until no unit changes, or maxSweeps reached. */
export function hopfieldSettle(W, s0, order, maxSweeps = 10) {
  let s = s0.slice();
  const path = [s.slice()];
  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let changed = false;
    for (const i of order) {
      const v = hopfieldUpdateUnit(W, s, i);
      if (v !== s[i]) { s[i] = v; changed = true; path.push(s.slice()); }
    }
    if (!changed) break;
  }
  return { s, path };
}

/** Hopfield energy: E = -1/2 sum_ij W_ij s_i s_j. */
export function hopfieldEnergy(W, s) {
  let e = 0;
  for (let i = 0; i < s.length; i++) for (let j = 0; j < s.length; j++) e += W[i][j] * s[i] * s[j];
  return -0.5 * e;
}

/** Hamming distance between two ±1 (or 0/1) vectors. */
export const hammingDistance = (a, b) => a.reduce((s, v, i) => s + (v !== b[i] ? 1 : 0), 0);

/** Flip k random bits of a ±1 pattern, using a seeded rand() in [0,1). */
export function corrupt(pattern, k, rand) {
  const p = pattern.slice();
  const idx = Array.from({ length: p.length }, (_, i) => i);
  for (let i = idx.length - 1; i > 0 && k > 0; i--, k--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
    p[idx[i]] *= -1;
  }
  return p;
}

/** One Gibbs-sampling step for a Boltzmann unit: P(s_i=1) = sigmoid(sum_j W_ij s_j / T). */
export function boltzmannProb(W, s, i, T = 1) {
  let sum = 0;
  for (let j = 0; j < s.length; j++) if (j !== i) sum += W[i][j] * s[j];
  return sigmoid(sum / T);
}

/** Sample a ±1 state from a probability p, using a seeded rand() in [0,1). */
export const sampleState = (p, rand) => (rand() < p ? 1 : -1);

/** One step of contrastive divergence (CD-1) for an RBM: visible <-> hidden via sigmoid sampling. */
export function cd1Step(Wvh, v0, rand) {
  const nH = Wvh[0].length, nV = Wvh.length;
  const hProb = Array.from({ length: nH }, (_, j) => sigmoid(v0.reduce((s, vi, i) => s + vi * Wvh[i][j], 0)));
  const h0 = hProb.map((p) => (rand() < p ? 1 : 0));
  const vProb = Array.from({ length: nV }, (_, i) => sigmoid(h0.reduce((s, hj, j) => s + hj * Wvh[i][j], 0)));
  const v1 = vProb.map((p) => (rand() < p ? 1 : 0));
  const h1Prob = Array.from({ length: nH }, (_, j) => sigmoid(v1.reduce((s, vi, i) => s + vi * Wvh[i][j], 0)));
  const posGrad = v0.map((vi) => hProb.map((hj) => vi * hj));
  const negGrad = v1.map((vi) => h1Prob.map((hj) => vi * hj));
  return { h0, v1, hProb, vProb, h1Prob, posGrad, negGrad };
}

/** Leaky integrate-and-fire neuron: one time step. Returns the new membrane potential and whether it spiked. */
export function lifStep(v, input, { leak = 0.1, threshold = 1, reset = 0, dt = 1 } = {}) {
  const vNext = v + dt * (-leak * v + input);
  if (vNext >= threshold) return { v: reset, spiked: true };
  return { v: vNext, spiked: false };
}

/** Best-matching unit (smallest Euclidean distance) in a set of SOM weight vectors. */
export function bmu(weights, x) {
  let best = 0, bestDist = Infinity;
  weights.forEach((w, i) => { const d = w.reduce((s, wi, k) => s + (wi - x[k]) ** 2, 0); if (d < bestDist) { bestDist = d; best = i; } });
  return best;
}

/** One SOM training step: move the BMU and its neighbours (by 1D grid distance) toward x. */
export function somStep(weights, x, { lr = 0.3, radius = 1 } = {}) {
  const b = bmu(weights, x);
  weights.forEach((w, i) => {
    const dist = Math.abs(i - b);
    if (dist > radius) return;
    const influence = Math.exp(-(dist * dist) / (2 * radius * radius || 1));
    for (let k = 0; k < w.length; k++) w[k] += lr * influence * (x[k] - w[k]);
  });
  return b;
}

/** Gaussian radial basis function: responds to how close x is to centre c, not to a dot product. */
export function gaussianRBF(x, c, sigma) {
  const d2 = x.reduce((s, xi, i) => s + (xi - c[i]) ** 2, 0);
  return Math.exp(-d2 / (2 * sigma * sigma));
}

/** Solve a linear least-squares fit Phi w = y by the normal equations (PhiᵗPhi) w = Phiᵗy. */
export function leastSquares(Phi, y) {
  const n = Phi[0].length;
  const M = Array.from({ length: n }, () => new Array(n).fill(0));
  const b = new Array(n).fill(0);
  for (const [k, row] of Phi.entries()) {
    for (let i = 0; i < n; i++) { b[i] += row[i] * y[k]; for (let j = 0; j < n; j++) M[i][j] += row[i] * row[j]; }
  }
  const A = M.map((r) => r.slice()), B = b.slice();
  for (let i = 0; i < n; i++) {
    const piv = A[i][i];
    for (let j = 0; j < n; j++) A[i][j] /= piv;
    B[i] /= piv;
    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const f = A[k][i];
      for (let j = 0; j < n; j++) A[k][j] -= f * A[i][j];
      B[k] -= f * B[i];
    }
  }
  return B;
}
