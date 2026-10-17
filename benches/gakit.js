// Shared code for the Generative AI benches: decoding algorithms, sampling controls, a tiny grammar
// mask, self-consistency voting, and an induction-head-style copy completion. Pure functions, so the
// notes' worked numbers can be computed by running this same code in Node.

export function softmax(logits) {
  const m = Math.max(...logits);
  const ex = logits.map((x) => Math.exp(x - m));
  const s = ex.reduce((a, b) => a + b, 0);
  return ex.map((x) => x / s);
}

export function softmaxTemperature(logits, temperature) {
  return softmax(logits.map((x) => x / temperature));
}

export function argmax(arr) {
  return arr.reduce((best, v, i, a) => (v > a[best] ? i : best), 0);
}

// Keep the smallest prefix of tokens (sorted by probability, descending) whose cumulative
// probability reaches p; renormalize the kept probabilities so they sum to 1.
export function topPFilter(probs, p) {
  const order = probs.map((pr, i) => [i, pr]).sort((a, b) => b[1] - a[1]);
  let cum = 0;
  const kept = [];
  for (const [i, pr] of order) {
    kept.push(i);
    cum += pr;
    if (cum >= p) break;
  }
  const sum = kept.reduce((s, i) => s + probs[i], 0);
  return kept.map((i) => [i, probs[i] / sum]);
}

export function topKFilter(probs, k) {
  const order = probs.map((pr, i) => [i, pr]).sort((a, b) => b[1] - a[1]).slice(0, k);
  const sum = order.reduce((s, [, pr]) => s + pr, 0);
  return order.map(([i, pr]) => [i, pr / sum]);
}

export function sampleFromProbs(probs, rand) {
  const r = rand();
  let cum = 0;
  for (let i = 0; i < probs.length; i++) {
    cum += probs[i];
    if (r < cum) return i;
  }
  return probs.length - 1;
}

// Greedy decoding: always take the single most likely next token.
export function greedyDecode(nextLogits, { maxLen, eosId }) {
  const ids = [];
  let prefix = [];
  for (let step = 0; step < maxLen; step++) {
    const next = argmax(nextLogits(prefix));
    ids.push(next);
    if (next === eosId) break;
    prefix = [...prefix, next];
  }
  return ids;
}

// Beam search: keep the `beamWidth` highest cumulative-log-probability candidates at every step.
export function beamSearch(nextLogits, { beamWidth, maxLen, eosId }) {
  let beams = [{ ids: [], logProb: 0, done: false }];
  for (let step = 0; step < maxLen; step++) {
    const candidates = [];
    for (const b of beams) {
      if (b.done) {
        candidates.push(b);
        continue;
      }
      const probs = softmax(nextLogits(b.ids));
      probs.forEach((p, tokenId) => {
        candidates.push({ ids: [...b.ids, tokenId], logProb: b.logProb + Math.log(p), done: tokenId === eosId });
      });
    }
    candidates.sort((x, y) => y.logProb - x.logProb);
    beams = candidates.slice(0, beamWidth);
    if (beams.every((b) => b.done)) break;
  }
  return beams.sort((a, b) => b.logProb - a.logProb);
}

// Penalize tokens that have already appeared, scaling by how many times each has occurred.
export function applyRepetitionPenalty(logits, counts, penalty) {
  if (!penalty || penalty === 1) return logits.slice();
  return logits.map((v, i) => {
    const n = counts[i] || 0;
    if (n === 0) return v;
    const scale = Math.pow(penalty, n);
    return v < 0 ? v * scale : v / scale;
  });
}

// Bias the end-of-sequence logit: suppressed before minLen, boosted from softCapLen onward.
export function applyLengthBias(logits, step, { minLen = 0, softCapLen = Infinity, bias = 0, eosId }) {
  const out = logits.slice();
  if (step < minLen) out[eosId] -= bias;
  if (step >= softCapLen) out[eosId] += bias;
  return out;
}

// Zero out (set to -Infinity) every token not in `allowedIds` so sampling/argmax can never pick it.
export function grammarMask(logits, allowedIds) {
  return logits.map((v, i) => (allowedIds.includes(i) ? v : -Infinity));
}

// Majority vote over a list of sampled values; returns the winning value, its count, and the tally.
export function majorityVote(samples) {
  const tally = new Map();
  for (const s of samples) tally.set(s, (tally.get(s) || 0) + 1);
  let winner = null, best = -1;
  for (const [value, count] of tally) if (count > best) { best = count; winner = value; }
  return { winner, count: best, tally };
}

// Induction-head-style copy completion: find the most recent earlier occurrence of the token at
// the end of `tokens`, excluding that final position itself, and return whatever followed it.
export function inductionComplete(tokens) {
  const lastIdx = tokens.length - 1;
  const query = tokens[lastIdx];
  for (let i = lastIdx - 1; i >= 0; i--) {
    if (tokens[i] === query) return tokens[i + 1] ?? null;
  }
  return null;
}

// ---------- Toy score-based diffusion (exact score of a Gaussian mixture) ----------

function vecSub(a, b) { return a.map((x, i) => x - b[i]); }
function vecLenSq(a) { return a.reduce((s, x) => s + x * x, 0); }

export function gaussDensity(x, mu, sigma2) {
  return Math.exp(-vecLenSq(vecSub(x, mu)) / (2 * sigma2));
}

// ∇x log N(x; mu, sigma2 · I) = -(x - mu) / sigma2
export function gaussScore(x, mu, sigma2) {
  return vecSub(x, mu).map((d) => -d / sigma2);
}

// Exact score of an equal-weight Gaussian-mixture density, by responsibility-weighting each
// component's own score.
export function mixtureScore(x, components) {
  const densities = components.map((c) => c.weight * gaussDensity(x, c.mu, c.sigma2));
  const total = densities.reduce((a, b) => a + b, 0);
  const dims = x.length;
  const out = new Array(dims).fill(0);
  components.forEach((c, i) => {
    const responsibility = densities[i] / total;
    const s = gaussScore(x, c.mu, c.sigma2);
    for (let d = 0; d < dims; d++) out[d] += responsibility * s[d];
  });
  return out;
}

export function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

export function vecNorm(v) {
  return Math.sqrt(vecLenSq(v));
}

export function lerp(a, b, t) {
  return a.map((x, i) => (1 - t) * x + t * b[i]);
}

// Spherical interpolation: follows the great-circle arc between a and b, keeping the vector's
// norm roughly constant along the path instead of dipping toward the midpoint like lerp does.
export function slerp(a, b, t) {
  const na = vecNorm(a), nb = vecNorm(b);
  const cosTheta = a.reduce((s, x, i) => s + x * b[i], 0) / (na * nb);
  const theta = Math.acos(Math.max(-1, Math.min(1, cosTheta)));
  if (theta < 1e-6) return lerp(a, b, t);
  const s0 = Math.sin((1 - t) * theta) / Math.sin(theta);
  const s1 = Math.sin(t * theta) / Math.sin(theta);
  return a.map((x, i) => s0 * x + s1 * b[i]);
}

// ---------- Video, 3D and code generation helpers ----------

// One toy "frame" of score-guided motion, optionally damped toward the previous frame to keep a
// generated sequence temporally consistent instead of jittering independently each step.
export function nextFrame(x, components, { stepSize, noise, consistencyLambda = 0 }) {
  const score = mixtureScore(x, components);
  let next = [x[0] + stepSize * score[0] + noise[0], x[1] + stepSize * score[1] + noise[1]];
  if (consistencyLambda) next = [x[0] + (1 - consistencyLambda) * (next[0] - x[0]), x[1] + (1 - consistencyLambda) * (next[1] - x[1])];
  return next;
}

export function sdCircle(p, c, r) {
  return Math.hypot(p[0] - c[0], p[1] - c[1]) - r;
}

// A smooth minimum: blends two signed distances into one rounded union instead of a sharp corner.
export function smoothMin(a, b, k) {
  if (!k) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

// Evaluate a postfix (reverse Polish) arithmetic program.
export function evalRPN(tokens) {
  const stack = [];
  for (const t of tokens) {
    if (!isNaN(+t)) stack.push(+t);
    else {
      const b = stack.pop(), a = stack.pop();
      stack.push(t === "+" ? a + b : t === "-" ? a - b : a * b);
    }
  }
  return stack[0];
}

// Brute-force program synthesis: enumerate every grammar-valid candidate and keep the ones that
// evaluate to the target value -- a search, not a trained model, but a genuine synthesis method.
export function synthesizePrograms(digits, ops, target) {
  const candidates = [];
  for (const a of digits) for (const b of digits) for (const op1 of ops) for (const c of digits) for (const op2 of ops) {
    candidates.push([a, b, op1, c, op2]);
  }
  return candidates.filter((c) => evalRPN(c) === target);
}

// ---------- Evaluation helpers ----------

export function perplexity(probs) {
  const meanNegLogP = -probs.reduce((s, p) => s + Math.log(p), 0) / probs.length;
  return Math.exp(meanNegLogP);
}

function ngrams(tokens, n) {
  const g = [];
  for (let i = 0; i <= tokens.length - n; i++) g.push(tokens.slice(i, i + n).join(" "));
  return g;
}
function countMap(arr) {
  const m = new Map();
  for (const x of arr) m.set(x, (m.get(x) || 0) + 1);
  return m;
}
function clippedOverlap(a, b) {
  const am = countMap(a), bm = countMap(b);
  let overlap = 0;
  for (const [g, c] of am) overlap += Math.min(c, bm.get(g) || 0);
  return overlap;
}

export function bleuScore(candidate, reference, maxN = 2) {
  const candTokens = candidate.split(" "), refTokens = reference.split(" ");
  let logSum = 0;
  for (let n = 1; n <= maxN; n++) {
    const cg = ngrams(candTokens, n), rg = ngrams(refTokens, n);
    const precision = clippedOverlap(cg, rg) / cg.length;
    logSum += Math.log(precision || 1e-9);
  }
  const bp = candTokens.length < refTokens.length ? Math.exp(1 - refTokens.length / candTokens.length) : 1;
  return bp * Math.exp(logSum / maxN);
}

export function rougeRecall(candidate, reference, n = 1) {
  const candTokens = candidate.split(" "), refTokens = reference.split(" ");
  const cg = ngrams(candTokens, n), rg = ngrams(refTokens, n);
  return clippedOverlap(rg, cg) / rg.length;
}

function meanVec(samples) {
  const d = samples[0].length, m = new Array(d).fill(0);
  for (const s of samples) for (let i = 0; i < d; i++) m[i] += s[i];
  return m.map((v) => v / samples.length);
}
function diagVar(samples, mean) {
  const d = samples[0].length, v = new Array(d).fill(0);
  for (const s of samples) for (let i = 0; i < d; i++) v[i] += (s[i] - mean[i]) ** 2;
  return v.map((x) => x / samples.length);
}

// Fréchet distance between two sample sets, under a diagonal-covariance simplification (the
// metric behind FID: a smaller value means the two distributions are more alike).
export function frechetDistance(real, fake) {
  const m1 = meanVec(real), m2 = meanVec(fake);
  const v1 = diagVar(real, m1), v2 = diagVar(fake, m2);
  let meanTerm = 0, traceTerm = 0;
  for (let i = 0; i < m1.length; i++) {
    meanTerm += (m1[i] - m2[i]) ** 2;
    traceTerm += v1[i] + v2[i] - 2 * Math.sqrt(v1[i] * v2[i]);
  }
  return meanTerm + traceTerm;
}

export function avgPairwiseDist(samples) {
  let s = 0, n = 0;
  for (let i = 0; i < samples.length; i++) {
    for (let j = i + 1; j < samples.length; j++) {
      s += Math.hypot(samples[i][0] - samples[j][0], samples[i][1] - samples[j][1]);
      n++;
    }
  }
  return s / n;
}

// One Elo rating update after a pairwise comparison's winner and loser.
export function eloUpdate(ratings, winner, loser, k = 16) {
  const expected = 1 / (1 + 10 ** ((ratings[loser] - ratings[winner]) / 400));
  ratings[winner] += k * (1 - expected);
  ratings[loser] -= k * (1 - expected);
}

// ---------- Practice: adaptation, product and cost helpers ----------

function matmul(X, Y) {
  const out = Array.from({ length: X.length }, () => Array(Y[0].length).fill(0));
  for (let i = 0; i < X.length; i++) for (let j = 0; j < Y[0].length; j++) for (let k = 0; k < Y.length; k++) out[i][j] += X[i][k] * Y[k][j];
  return out;
}

// A LoRA-style low-rank update: delta = A·B (A is d×r, B is r×d), added onto a base weight matrix
// so only 2·d·r parameters are learned instead of the full d² of the base matrix.
export function loraDelta(A, B) {
  return matmul(A, B);
}

export function addMatrix(X, Y) {
  return X.map((row, i) => row.map((v, j) => v + Y[i][j]));
}

// A rough order-of-magnitude compute → energy → carbon chain: FLOPs at a given throughput take
// some time, drawing power for that time, at some grid carbon intensity.
export function computeCost(flops, { gpuFlopsPerSec, gpuPowerKw, carbonIntensity }) {
  const timeSec = flops / gpuFlopsPerSec;
  const energyKWh = gpuPowerKw * (timeSec / 3600);
  return { timeSec, energyKWh, carbonKg: energyKWh * carbonIntensity };
}

// ---------- Risk and responsible-generation helpers ----------

// What fraction of the generated text's own n-grams also appear in a reference (e.g. training)
// corpus -- a simple verbatim-overlap check, the mechanism behind plagiarism/regurgitation detectors.
export function overlapFraction(generated, corpus, n) {
  const gen = ngrams(generated, n), ref = new Set(ngrams(corpus, n));
  if (gen.length === 0) return 0;
  let matched = 0;
  for (const g of gen) if (ref.has(g)) matched++;
  return matched / gen.length;
}

function seededRng(seed) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The green-list/red-list watermark: the previous token seeds a pseudorandom split of the
// vocabulary into a "green" fraction (gamma) and the rest, reproducible by anyone who knows the seeding rule.
export function greenListIds(prevTokenId, vocabSize, gamma) {
  const rand = seededRng((prevTokenId * 2654435761) >>> 0);
  const ids = Array.from({ length: vocabSize }, (_, i) => i);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return new Set(ids.slice(0, Math.round(vocabSize * gamma)));
}

// Bias every green-list token's logit upward by delta, biasing generation toward producing a
// detectable excess of green tokens without otherwise changing the model.
export function biasGreenLogits(logits, greenSet, delta) {
  return logits.map((v, id) => (greenSet.has(id) ? v + delta : v));
}

// ---------- Multimodal generation helpers ----------

// Quantize a continuous vector to the nearest entry in a fixed codebook, by squared distance --
// the discretization step behind VQ-style "visual tokens."
export function nearestCode(vec, codebook) {
  let best = 0, bestDist = Infinity;
  codebook.forEach((c, i) => {
    const d = vec.reduce((s, v, k) => s + (v - c[k]) ** 2, 0);
    if (d < bestDist) { bestDist = d; best = i; }
  });
  return best;
}

export function cosineSim(a, b) {
  const dot = a.reduce((s, x, i) => s + x * b[i], 0);
  return dot / (vecNorm(a) * vecNorm(b));
}

// ---------- Audio synthesis helpers ----------

// A short frame of a pure sine tone, starting at `startPhase` so consecutive frames can be
// stitched together without a phase discontinuity (an audible click).
export function sineFrame(freq, amp, nSamples, sampleRate, startPhase = 0) {
  const samples = [];
  for (let n = 0; n < nSamples; n++) samples.push(amp * Math.sin(startPhase + (2 * Math.PI * freq * n) / sampleRate));
  const endPhase = startPhase + (2 * Math.PI * freq * nSamples) / sampleRate;
  return { samples, endPhase };
}

// ---------- Image generation and editing helpers ----------

export function nearestUpsample(lr, factor) {
  const h = lr.length, w = lr[0].length;
  return Array.from({ length: h * factor }, (_, i) =>
    Array.from({ length: w * factor }, (_, j) => lr[Math.floor(i / factor)][Math.floor(j / factor)])
  );
}

export function bilinearUpsample(lr, outH, outW) {
  const h = lr.length, w = lr[0].length;
  const out = Array.from({ length: outH }, () => Array(outW).fill(0));
  for (let i = 0; i < outH; i++) {
    for (let j = 0; j < outW; j++) {
      const fy = ((i + 0.5) * h) / outH - 0.5, fx = ((j + 0.5) * w) / outW - 0.5;
      const y0 = Math.max(0, Math.min(h - 1, Math.floor(fy))), x0 = Math.max(0, Math.min(w - 1, Math.floor(fx)));
      const y1 = Math.min(h - 1, y0 + 1), x1 = Math.min(w - 1, x0 + 1);
      const dy = Math.max(0, Math.min(1, fy - y0)), dx = Math.max(0, Math.min(1, fx - x0));
      out[i][j] =
        lr[y0][x0] * (1 - dy) * (1 - dx) + lr[y0][x1] * (1 - dy) * dx + lr[y1][x0] * dy * (1 - dx) + lr[y1][x1] * dy * dx;
    }
  }
  return out;
}

// Inpainting between two known anchors is the exact minimizer of total squared adjacent
// differences (a discrete harmonic / smoothness prior) — linear interpolation.
export function harmonicInpaint(x0, xN, n) {
  return Array.from({ length: n + 1 }, (_, i) => x0 + (i / n) * (xN - x0));
}

// Outpainting from a single anchor, with a ridge pull toward a prior mean: the further from the
// known anchor, the more the extrapolation decays toward that prior rather than any known value.
export function ridgeOutpaint(anchor, extend, lambda, priorMean = 0, steps = 3000, lr = 0.05) {
  let free = Array.from({ length: extend }, () => priorMean);
  for (let s = 0; s < steps; s++) {
    const full = [anchor, ...free];
    const grad = free.map((_, k) => {
      const i = k + 1;
      let g = 2 * lambda * (full[i] - priorMean);
      g += -2 * (i + 1 < full.length ? full[i + 1] - full[i] : 0);
      g += 2 * (full[i] - full[i - 1]);
      return g;
    });
    free = free.map((v, k) => v - lr * grad[k]);
  }
  return [anchor, ...free];
}

// Gram (channel-correlation) matrix of a feature matrix: positions × channels.
export function gramMatrix(features) {
  const n = features.length, c = features[0].length;
  const G = Array.from({ length: c }, () => Array(c).fill(0));
  for (let p = 0; p < n; p++) for (let a = 0; a < c; a++) for (let b = 0; b < c; b++) G[a][b] += features[p][a] * features[p][b];
  return G;
}

export function frobeniusDiff(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) for (let j = 0; j < a[0].length; j++) s += (a[i][j] - b[i][j]) ** 2;
  return s;
}

// One gradient-descent step of the Gatys-style style-transfer loss (content fidelity + Gram-matrix
// style matching), using a numerical gradient so it needs no autodiff machinery.
export function styleTransferStep(F, content, styleGram, { alpha, beta, lr, eps = 1e-4 } = {}) {
  function loss(features) {
    let contentLoss = 0;
    for (let p = 0; p < features.length; p++) for (let c = 0; c < features[0].length; c++) contentLoss += (features[p][c] - content[p][c]) ** 2;
    const styleLoss = frobeniusDiff(gramMatrix(features), styleGram);
    return alpha * contentLoss + beta * styleLoss;
  }
  const grad = F.map((row) => row.map(() => 0));
  for (let p = 0; p < F.length; p++) {
    for (let c = 0; c < F[0].length; c++) {
      const Fp = F.map((r) => r.slice()); Fp[p][c] += eps;
      const Fm = F.map((r) => r.slice()); Fm[p][c] -= eps;
      grad[p][c] = (loss(Fp) - loss(Fm)) / (2 * eps);
    }
  }
  return F.map((row, p) => row.map((v, c) => v - lr * grad[p][c]));
}
