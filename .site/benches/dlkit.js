// Shared maths for the Deep Learning benches: activations, a tiny dense network, convolution and recurrent cells.
// Pure functions only, so the notes' worked numbers can be checked by running this file in Node.

export const relu = (z) => Math.max(0, z);
export const leakyRelu = (z, a = 0.01) => (z >= 0 ? z : a * z);
export const sigmoid = (z) => 1 / (1 + Math.exp(-z));
export const tanhAct = (z) => Math.tanh(z);
export const gelu = (z) => 0.5 * z * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (z + 0.044715 * z ** 3)));
export const step = (z) => (z > 0 ? 1 : 0);
export const identity = (z) => z;
export const softmax = (zs) => {
  const m = Math.max(...zs);
  const ex = zs.map((z) => Math.exp(z - m));
  const s = ex.reduce((a, b) => a + b, 0);
  return ex.map((e) => e / s);
};

/** One dense layer: y = act(W x + b). W is an array of rows, b an array, act a scalar function (identity if omitted). */
export function dense(x, W, b, act = identity) {
  return W.map((row, i) => act(row.reduce((s, w, j) => s + w * x[j], b[i])));
}

/** Run x through a list of { W, b, act } layers, returning every layer's activation including the input. */
export function forwardMLP(x, layers) {
  const acts = [x];
  let a = x;
  for (const { W, b, act } of layers) { a = dense(a, W, b, act); acts.push(a); }
  return { output: a, acts };
}

/** The standard deviation of a vector, for tracking how a signal's scale grows or shrinks across layers. */
export const sd = (a) => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);

/** A random Gaussian weight matrix scaled by `scale` (e.g. 1/sqrt(width) for sensible initialization), using a seeded `rand()` in [0, 1). */
export function gaussMatrix(rows, cols, scale, rand) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => scale * gauss(rand)));
}

/** A 1D convolution of a signal with a small kernel (no padding; "valid" mode). */
export function conv1d(signal, kernel) {
  const out = [];
  for (let i = 0; i + kernel.length <= signal.length; i++) {
    let s = 0;
    for (let k = 0; k < kernel.length; k++) s += signal[i + k] * kernel[k];
    out.push(s);
  }
  return out;
}

/** A 2D convolution of a single-channel image (array of rows) with a square kernel. "valid" mode, stride 1. */
export function conv2d(image, kernel) {
  const kh = kernel.length, kw = kernel[0].length;
  const out = [];
  for (let y = 0; y + kh <= image.length; y++) {
    const row = [];
    for (let x = 0; x + kw <= image[0].length; x++) {
      let s = 0;
      for (let ky = 0; ky < kh; ky++) for (let kx = 0; kx < kw; kx++) s += image[y + ky][x + kx] * kernel[ky][kx];
      row.push(s);
    }
    out.push(row);
  }
  return out;
}

/** Max-pool a single-channel image with a square window and matching stride ("valid" mode). */
export function maxPool2d(image, size) {
  const out = [];
  for (let y = 0; y + size <= image.length; y += size) {
    const row = [];
    for (let x = 0; x + size <= image[0].length; x += size) {
      let m = -Infinity;
      for (let ky = 0; ky < size; ky++) for (let kx = 0; kx < size; kx++) m = Math.max(m, image[y + ky][x + kx]);
      row.push(m);
    }
    out.push(row);
  }
  return out;
}

/** One step of a vanilla RNN: h' = tanh(Wx x + Wh h + b). */
export function rnnStep(x, h, Wx, Wh, b) {
  return h.map((_, i) => Math.tanh(Wx[i].reduce((s, w, j) => s + w * x[j], 0) + Wh[i].reduce((s, w, j) => s + w * h[j], 0) + b[i]));
}

/** One step of an LSTM cell: returns the new hidden state h' and cell state c'. Gates use sigmoid, candidate uses tanh. */
export function lstmStep(x, h, c, gates) {
  const n = h.length;
  const z = (W) => W.map((row) => row.slice(0, x.length).reduce((s, w, j) => s + w * x[j], 0) + row.slice(x.length).reduce((s, w, j) => s + w * h[j], 0));
  const concat = x.concat(h);
  const lin = (W, b) => W.map((row, i) => row.reduce((s, w, j) => s + w * concat[j], b[i]));
  const f = lin(gates.Wf, gates.bf).map(sigmoid);
  const i = lin(gates.Wi, gates.bi).map(sigmoid);
  const o = lin(gates.Wo, gates.bo).map(sigmoid);
  const g = lin(gates.Wg, gates.bg).map(tanhAct);
  const c2 = c.map((cv, k) => f[k] * cv + i[k] * g[k]);
  const h2 = c2.map((cv, k) => o[k] * Math.tanh(cv));
  return { h: h2, c: c2, f, i, o, g };
}

/** One step of a GRU cell: returns the new hidden state h'. */
export function gruStep(x, h, gates) {
  const concat = x.concat(h);
  const lin = (W, b) => W.map((row, i) => row.reduce((s, w, j) => s + w * concat[j], b[i]));
  const r = lin(gates.Wr, gates.br).map(sigmoid);
  const zz = lin(gates.Wz, gates.bz).map(sigmoid);
  const hr = h.map((v, k) => r[k] * v);
  const concat2 = x.concat(hr);
  const lin2 = (W, b) => W.map((row, i) => row.reduce((s, w, j) => s + w * concat2[j], b[i]));
  const n = lin2(gates.Wn, gates.bn).map(tanhAct);
  const h2 = h.map((v, k) => (1 - zz[k]) * n[k] + zz[k] * v);
  return { h: h2, r, z: zz, n };
}

/** A seeded 2D "image": a small grid with one simple shape (edge, corner or blob) picked by `kind`. */
export function toyImage(kind, n = 8) {
  const g = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
  if (kind === "edge") for (let y = 0; y < n; y++) for (let x = Math.floor(n / 2); x < n; x++) g[y][x] = 1;
  if (kind === "corner") for (let y = Math.floor(n / 2); y < n; y++) for (let x = Math.floor(n / 2); x < n; x++) g[y][x] = 1;
  if (kind === "blob") { const c = (n - 1) / 2; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (Math.hypot(x - c, y - c) < n / 3) g[y][x] = 1; }
  return g;
}

const gauss = (r) => Math.sqrt(-2 * Math.log(Math.max(1e-12, r()))) * Math.cos(2 * Math.PI * r());
