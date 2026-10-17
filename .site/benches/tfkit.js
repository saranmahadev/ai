// Shared maths for the Transformers benches: tokenization, attention building blocks, normalization, positional encodings.
// Pure functions only, so the notes' worked numbers can be checked by running this file in Node.

export const sigmoid = (z) => 1 / (1 + Math.exp(-z));
export const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
export const matvec = (W, x) => W.map((row) => dot(row, x));
export const vecAdd = (a, b) => a.map((v, i) => v + b[i]);

export function softmax(scores) {
  const m = Math.max(...scores);
  const e = scores.map((s) => Math.exp(s - m));
  const sum = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / sum);
}

// ---------- Byte Pair Encoding ----------

/** Represent a corpus {word: freq} as symbol-sequences with an end-of-word marker. */
export function bpeInit(corpus, eow = "</w>") {
  const vocab = {};
  for (const [word, freq] of Object.entries(corpus)) vocab[[...word, eow].join(" ")] = freq;
  return vocab;
}

/** SentencePiece-style init: each entry is a whole stream of characters (spaces already marked), no per-word end-of-word marker. */
export function streamInit(corpus) {
  const vocab = {};
  for (const [stream, freq] of Object.entries(corpus)) vocab[[...stream].join(" ")] = freq;
  return vocab;
}

/** Count frequency of every adjacent symbol pair across the vocab. */
export function bpePairStats(vocab) {
  const pairs = {};
  for (const [word, freq] of Object.entries(vocab)) {
    const symbols = word.split(" ");
    for (let i = 0; i < symbols.length - 1; i++) {
      const pair = `${symbols[i]},${symbols[i + 1]}`;
      pairs[pair] = (pairs[pair] || 0) + freq;
    }
  }
  return pairs;
}

/** The most frequent pair, or null if the vocab has no pairs left to merge. */
export function bpeBestPair(pairs) {
  let best = null, bestCount = -1;
  for (const [pair, count] of Object.entries(pairs)) if (count > bestCount) { bestCount = count; best = pair; }
  return best ? { pair: best, count: bestCount } : null;
}

/** Merge every occurrence of a pair "a,b" into the single symbol "ab". */
export function bpeMerge(pair, vocab) {
  const [a, b] = pair.split(",");
  const bigram = `${a} ${b}`, replacement = a + b;
  const next = {};
  for (const [word, freq] of Object.entries(vocab)) next[word.split(bigram).join(replacement)] = freq;
  return next;
}

/** Count each symbol's total frequency across the whole vocab (not just as part of one pair). */
export function bpeSymbolCounts(vocab) {
  const counts = {};
  for (const [word, freq] of Object.entries(vocab)) for (const sym of word.split(" ")) counts[sym] = (counts[sym] || 0) + freq;
  return counts;
}

/** WordPiece's merge criterion: score = count(pair) / (count(left) · count(right)) — co-occurrence relative to chance, not raw frequency. */
export function wordpieceBestPair(vocab) {
  const pairs = bpePairStats(vocab);
  const symCounts = bpeSymbolCounts(vocab);
  let best = null, bestScore = -1;
  for (const [pair, count] of Object.entries(pairs)) {
    const [a, b] = pair.split(",");
    const score = count / (symCounts[a] * symCounts[b]);
    if (score > bestScore) { bestScore = score; best = pair; }
  }
  return best ? { pair: best, score: bestScore, count: pairs[best] } : null;
}

/** Run BPE training for `numMerges` steps, returning the final vocab and the ordered list of merges. */
export function bpeTrain(corpus, numMerges, eow = "</w>") {
  let vocab = bpeInit(corpus, eow);
  const merges = [];
  for (let i = 0; i < numMerges; i++) {
    const best = bpeBestPair(bpePairStats(vocab));
    if (!best) break;
    merges.push(best);
    vocab = bpeMerge(best.pair, vocab);
  }
  return { vocab, merges };
}

/** Apply a learned list of merges (in order) to tokenize one new word. */
export function bpeApply(word, merges, eow = "</w>") {
  let symbols = [...word, eow];
  for (const { pair } of merges) {
    const [a, b] = pair.split(",");
    const next = [];
    let i = 0;
    while (i < symbols.length) {
      if (symbols[i] === a && symbols[i + 1] === b) { next.push(a + b); i += 2; } else { next.push(symbols[i]); i += 1; }
    }
    symbols = next;
  }
  return symbols;
}

// ---------- Embeddings ----------

/** Look up a token's embedding row, optionally scaled (the √d_model factor). */
export function embeddingLookup(table, tokenId, scale = 1) {
  return table[tokenId].map((v) => v * scale);
}

export const vecNorm = (x) => Math.sqrt(x.reduce((s, v) => s + v * v, 0));

// ---------- Normalization ----------

export function layerNorm(x, { eps = 1e-5, gamma = null, beta = null } = {}) {
  const n = x.length;
  const mean = x.reduce((s, v) => s + v, 0) / n;
  const variance = x.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const norm = x.map((v) => (v - mean) / Math.sqrt(variance + eps));
  return norm.map((v, i) => v * (gamma ? gamma[i] : 1) + (beta ? beta[i] : 0));
}

// ---------- Feed-forward sublayer ----------

export const relu = (x) => Math.max(0, x);
export const gelu = (x) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)));
export const silu = (x) => x * sigmoid(x);

/** A gated feed-forward sublayer (SwiGLU with activation=silu, GeGLU with activation=gelu): two parallel projections, one gated by an activation, elementwise-multiplied, then projected down. No biases, matching common practice. */
export function gatedFeedForward(x, { Wgate, Wup, Wdown, activation = silu } = {}) {
  const gate = Wgate.map((row) => activation(dot(row, x)));
  const up = Wup.map((row) => dot(row, x));
  const gated = gate.map((g, i) => g * up[i]);
  return Wdown.map((row) => dot(row, gated));
}

/** Standard two-layer feed-forward sublayer: W2 · activation(W1 · x + b1) + b2. */
export function feedForward(x, { W1, b1, W2, b2, activation = relu } = {}) {
  const hidden = W1.map((row, i) => activation(dot(row, x) + b1[i]));
  return W2.map((row, i) => dot(row, hidden) + b2[i]);
}

export function rmsNorm(x, { eps = 1e-5, gamma = null } = {}) {
  const n = x.length;
  const ms = x.reduce((s, v) => s + v * v, 0) / n;
  const norm = x.map((v) => v / Math.sqrt(ms + eps));
  return norm.map((v, i) => v * (gamma ? gamma[i] : 1));
}

// ---------- Attention ----------

/** Single-head scaled dot-product attention for one query against a set of keys/values. mask[i]=false blocks position i. */
export function attendOne(q, keys, values, mask = null) {
  const d = q.length;
  const scores = keys.map((k, i) => (mask && !mask[i] ? -Infinity : dot(q, k) / Math.sqrt(d)));
  const weights = softmax(scores);
  const out = new Array(values[0].length).fill(0);
  values.forEach((v, i) => v.forEach((vi, k) => (out[k] += weights[i] * vi)));
  return { weights, out };
}

/** Full self-attention over a sequence of vectors: each position attends to the others, honoring an optional [n x n] mask. */
export function selfAttention(X, { Wq, Wk, Wv, mask = null } = {}) {
  return crossAttention(X, X, { Wq, Wk, Wv, mask });
}

/** Cross-attention: queries come from one sequence, keys/values from another (e.g. a decoder attending to an encoder's output). */
export function crossAttention(Xq, Xkv, { Wq, Wk, Wv, mask = null } = {}) {
  const proj = (x, W) => W.map((row) => dot(row, x));
  const Q = Xq.map((x) => proj(x, Wq));
  const K = Xkv.map((x) => proj(x, Wk));
  const V = Xkv.map((x) => proj(x, Wv));
  const out = [], allWeights = [];
  for (let i = 0; i < Xq.length; i++) {
    const { weights, out: oi } = attendOne(Q[i], K, V, mask ? mask[i] : null);
    out.push(oi);
    allWeights.push(weights);
  }
  return { out, weights: allWeights };
}

// ---------- Masks ----------

export const causalMask = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => j <= i));

export function paddingMask(validLengths, n) {
  return validLengths.map((len) => Array.from({ length: n }, (_, j) => j < len));
}

export function combineMasks(a, b) {
  return a.map((row, i) => row.map((v, j) => v && b[i][j]));
}

// ---------- Positional encodings ----------

/** Rotate a 2D pair (x1, x2) by angle theta — the core operation behind RoPE. */
export function rotate2D(x1, x2, theta) {
  const c = Math.cos(theta), s = Math.sin(theta);
  return [x1 * c - x2 * s, x1 * s + x2 * c];
}

/** Apply RoPE to a vector (even length) at position `pos`, with per-pair frequency base `base`. */
export function ropeApply(x, pos, base = 10000) {
  const out = x.slice();
  for (let i = 0; i < x.length; i += 2) {
    const freq = 1 / base ** (i / x.length);
    const [r1, r2] = rotate2D(x[i], x[i + 1], pos * freq);
    out[i] = r1; out[i + 1] = r2;
  }
  return out;
}

/** ALiBi's linear bias: slope * -(distance), added directly to an attention score. */
export const alibiBias = (slope, queryPos, keyPos) => -slope * Math.abs(queryPos - keyPos);

// ---------- Patchifying (tokenizing beyond text) ----------

/** Split a 2D grid into non-overlapping P×P patches, each flattened row-major into one vector ("token").
 * A patch size that doesn't evenly divide the grid produces smaller, clipped patches along the bottom and right edges. */
export function patchify(grid, P) {
  const H = grid.length, W = grid[0].length;
  const patches = [];
  for (let r = 0; r < H; r += P) {
    for (let c = 0; c < W; c += P) {
      const patch = [];
      for (let i = 0; i < P && r + i < H; i++) for (let j = 0; j < P && c + j < W; j++) patch.push(grid[r + i][c + j]);
      patches.push(patch);
    }
  }
  return patches;
}
