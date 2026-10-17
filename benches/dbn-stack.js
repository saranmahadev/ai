// Bench: train two RBMs greedily, one frozen layer at a time, and inspect a pattern's representation at each layer.
import { sigmoid } from "./nnkit.js";
import { rng } from "./kit.js";

const DATA = [[1, 1, 0, 0], [1, 0, 1, 0], [0, 0, 1, 1], [0, 1, 0, 1]];
const LABELS = ["pattern A", "pattern B", "pattern C", "pattern D"];

function hProbOf(W, v) { const nH = W[0].length; return Array.from({ length: nH }, (_, j) => sigmoid(v.reduce((s, vi, i) => s + vi * W[i][j], 0))); }
function vProbOf(W, h) { const nV = W.length; return Array.from({ length: nV }, (_, i) => sigmoid(h.reduce((s, hj, j) => s + hj * W[i][j], 0))); }
function sampleAll(p, rand) { return p.map((x) => (rand() < x ? 1 : 0)); }
function randMatrix(nV, nH, rand, scale = 0.3) { return Array.from({ length: nV }, () => Array.from({ length: nH }, () => (rand() * 2 - 1) * scale)); }

function trainRBM(data, nH, epochs, lr, rand) {
  const nV = data[0].length;
  const W = randMatrix(nV, nH, rand);
  for (let e = 0; e < epochs; e++) for (const v0 of data) {
    const hProb0 = hProbOf(W, v0); const h0 = sampleAll(hProb0, rand);
    const vProb1 = vProbOf(W, h0); const v1 = sampleAll(vProb1, rand);
    const hProb1 = hProbOf(W, v1);
    for (let i = 0; i < nV; i++) for (let j = 0; j < nH; j++) W[i][j] += lr * (v0[i] * hProb0[j] - v1[i] * hProb1[j]);
  }
  return W;
}

export default function mount(root, kit) {
  const { frame, canvas, choice, button, stats, live } = kit;
  const body = frame(root, { title: "Stack two RBMs, one frozen layer at a time" });
  const say = live(body);
  const rand = rng(9);
  let W1 = null, W2 = null, pick = 0;

  const cv = canvas(body, { aspect: 0.5, label: "The chosen pattern's representation at each trained layer" });
  const st = stats([["l1", "layer 1 trained?"], ["l2", "layer 2 trained?"]]);
  const ch = choice("Pattern", LABELS.map((l, i) => [String(i), l]), "0", (v) => { pick = +v; draw(); });
  const b1 = button("Train layer 1 (4 → 3)", () => { W1 = trainRBM(DATA, 3, 400, 0.3, rand); draw(); });
  const b2 = button("Train layer 2 (3 → 2)", () => { if (!W1) return; const h1reps = DATA.map((v) => hProbOf(W1, v)); W2 = trainRBM(h1reps, 2, 400, 0.3, rand); draw(); });
  body.append(cv.box, st.el, ch.el, b1, b2);

  cv.onDraw((ctx, w, hh, p) => {
    const v = DATA[pick];
    const h1 = W1 ? hProbOf(W1, v) : null;
    const h2 = W1 && W2 ? hProbOf(W2, h1) : null;
    const cols = [["raw (4)", v], ["layer 1 (3)", h1], ["layer 2 (2)", h2]];
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
    st.set("l1", W1 ? "yes" : "no");
    st.set("l2", W2 ? "yes" : "no");
    say(`showing ${LABELS[pick]}; layer 1 trained: ${W1 ? "yes" : "no"}; layer 2 trained: ${W2 ? "yes" : "no"}`);
    cv.redraw();
  }
  draw();
  return () => cv.destroy();
}
