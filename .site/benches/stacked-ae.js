// Bench: train two small autoencoders greedily, by backpropagation on reconstruction error, one frozen layer at a time.
import { sigmoid } from "./nnkit.js";
import { rng } from "./kit.js";

const DATA = [[1, 1, 0, 0], [1, 0, 1, 0], [0, 0, 1, 1], [0, 1, 0, 1]];
const LABELS = ["pattern A", "pattern B", "pattern C", "pattern D"];

function randMatrix(a, b, rand, scale = 0.5) { return Array.from({ length: a }, () => Array.from({ length: b }, () => (rand() * 2 - 1) * scale)); }
function matvec(W, x) { return W[0].map((_, j) => x.reduce((s, xi, i) => s + xi * W[i][j], 0)); }
function encode(Wenc, v) { return matvec(Wenc, v).map(sigmoid); }

function trainAE(data, nH, epochs, lr, rand) {
  const nV = data[0].length;
  const Wenc = randMatrix(nV, nH, rand), Wdec = randMatrix(nH, nV, rand);
  let err = 0;
  for (let e = 0; e < epochs; e++) {
    err = 0;
    for (const v of data) {
      const h = encode(Wenc, v);
      const zdec = matvec(Wdec, h); const vhat = zdec.map(sigmoid);
      const dVhat = vhat.map((vh, i) => (2 * (vh - v[i])) / nV);
      const dZdec = dVhat.map((d, i) => d * vhat[i] * (1 - vhat[i]));
      const dH = Wdec.map((row) => row.reduce((s, wji, i) => s + wji * dZdec[i], 0));
      const dZenc = dH.map((d, j) => d * h[j] * (1 - h[j]));
      for (let j = 0; j < nH; j++) for (let i = 0; i < nV; i++) Wdec[j][i] -= lr * h[j] * dZdec[i];
      for (let i = 0; i < nV; i++) for (let j = 0; j < nH; j++) Wenc[i][j] -= lr * v[i] * dZenc[j];
      err += v.reduce((s, vi, i) => s + (vi - vhat[i]) ** 2, 0);
    }
  }
  return { Wenc, err: err / data.length };
}

export default function mount(root, kit) {
  const { frame, canvas, choice, button, stats, live } = kit;
  const body = frame(root, { title: "Stack two autoencoders, one frozen layer at a time" });
  const say = live(body);
  const rand = rng(3);
  let ae1 = null, ae2 = null, pick = 0;

  const cv = canvas(body, { aspect: 0.5, label: "The chosen pattern's code at each trained layer" });
  const st = stats([["e1", "layer 1 reconstruction error"], ["e2", "layer 2 reconstruction error"]]);
  const ch = choice("Pattern", LABELS.map((l, i) => [String(i), l]), "0", (v) => { pick = +v; draw(); });
  const b1 = button("Train layer 1 (4 → 3)", () => { ae1 = trainAE(DATA, 3, 1200, 0.5, rand); draw(); });
  const b2 = button("Train layer 2 (3 → 2)", () => { if (!ae1) return; const codes1 = DATA.map((v) => encode(ae1.Wenc, v)); ae2 = trainAE(codes1, 2, 1200, 0.5, rand); draw(); });
  body.append(cv.box, st.el, ch.el, b1, b2);

  cv.onDraw((ctx, w, hh, p) => {
    const v = DATA[pick];
    const code1 = ae1 ? encode(ae1.Wenc, v) : null;
    const code2 = ae1 && ae2 ? encode(ae2.Wenc, code1) : null;
    const cols = [["raw (4)", v], ["code 1 (3)", code1], ["code 2 (2)", code2]];
    const colW = w / cols.length;
    ctx.font = "700 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    cols.forEach(([label, vec], c) => {
      ctx.fillStyle = p.ink; ctx.fillText(label, colW * (c + 0.5), 16);
      if (!vec) { ctx.fillStyle = p.muted; ctx.fillText("not trained yet", colW * (c + 0.5), hh / 2); return; }
      const barW = colW / (vec.length + 1);
      vec.forEach((val, i) => {
        const bh = val * (hh - 60);
        ctx.fillStyle = p.accent;
        ctx.fillRect(colW * c + barW * (i + 0.5), hh - 24 - bh, barW * 0.7, bh);
        ctx.fillStyle = p.muted; ctx.font = "700 10px Nunito, system-ui, sans-serif";
        ctx.fillText(val.toFixed(2), colW * c + barW * (i + 0.5) + barW * 0.35, hh - 10);
      });
      ctx.font = "700 12px Nunito, system-ui, sans-serif";
    });
  });

  function draw() {
    st.set("e1", ae1 ? ae1.err.toFixed(4) : "—");
    st.set("e2", ae2 ? ae2.err.toFixed(4) : "—");
    say(`showing ${LABELS[pick]}; layer 1 error ${ae1 ? ae1.err.toFixed(3) : "not trained"}; layer 2 error ${ae2 ? ae2.err.toFixed(3) : "not trained"}`);
    cv.redraw();
  }
  draw();
  return () => cv.destroy();
}
