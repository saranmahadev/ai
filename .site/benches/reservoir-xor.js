// Bench: a fixed random reservoir plus a trained linear readout, solving temporal XOR, vs. a linear readout on raw inputs.
import { leastSquares } from "./nnkit.js";
import { rng } from "./kit.js";

const T = 300, TRAIN_START = 10;

function randMat(rand, a, b, scale) { return Array.from({ length: a }, () => Array.from({ length: b }, () => (rand() * 2 - 1) * scale)); }

function scaleSpectral(W, target) {
  let v = new Array(W.length).fill(1);
  for (let it = 0; it < 40; it++) {
    const v2 = W.map((row) => row.reduce((s, wij, j) => s + wij * v[j], 0));
    const norm = Math.sqrt(v2.reduce((s, x) => s + x * x, 0)) || 1;
    v = v2.map((x) => x / norm);
  }
  const Wv = W.map((row) => row.reduce((s, wij, j) => s + wij * v[j], 0));
  const lambda = Math.sqrt(Wv.reduce((s, x) => s + x * x, 0)) || 1;
  const factor = target / lambda;
  return W.map((row) => row.map((w) => w * factor));
}

function run(reservoirSize, spectralRadius) {
  const rand = rng(7);
  const Win = randMat(rand, reservoirSize, 1, 1);
  const Wrec = scaleSpectral(randMat(rand, reservoirSize, reservoirSize, 1), spectralRadius);
  const u = Array.from({ length: T }, () => (rand() < 0.5 ? 1 : 0));
  const y = u.map((_, t) => (t >= 2 ? u[t - 1] ^ u[t - 2] : 0));

  let h = new Array(reservoirSize).fill(0);
  const states = [];
  for (let t = 0; t < T; t++) {
    const pre = Win.map((row, i) => row[0] * u[t] + Wrec[i].reduce((s, w, j) => s + w * h[j], 0));
    h = pre.map(Math.tanh);
    states.push(h.slice());
  }
  const PhiRes = states.slice(TRAIN_START).map((s) => [...s, 1]);
  const PhiRaw = u.slice(TRAIN_START).map((_, idx) => { const t = idx + TRAIN_START; return [u[t - 1], u[t - 2], 1]; });
  const Y = y.slice(TRAIN_START);

  const accOf = (Phi) => { const w = leastSquares(Phi, Y); const preds = Phi.map((row) => row.reduce((s, v, i) => s + v * w[i], 0)); const bin = preds.map((p) => (p > 0.5 ? 1 : 0)); return bin.filter((b, i) => b === Y[i]).length / Y.length; };

  return { reservoirAcc: accOf(PhiRes), rawAcc: accOf(PhiRaw) };
}

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "A fixed, random reservoir solves temporal XOR" });
  const say = live(body);
  let size = 8, radius = 0.9;

  const cv = canvas(body, { aspect: 0.5, label: "Accuracy, reservoir readout vs raw-input readout" });
  const st = stats([["res", "reservoir + readout accuracy"], ["raw", "raw-input readout accuracy"]]);
  const slSize = slider({ label: "reservoir size", min: 2, max: 20, step: 1, value: size, format: (v) => String(v), onInput: (v) => { size = v; update(); } });
  const slR = slider({ label: "spectral radius", min: 0.1, max: 1.3, step: 0.05, value: radius, format: (v) => v.toFixed(2), onInput: (v) => { radius = v; update(); } });
  body.append(cv.box, st.el, slSize.el, slR.el);

  let last = run(size, radius);
  cv.onDraw((ctx, w, hh, p) => {
    const bars = [["reservoir", last.reservoirAcc, p.good], ["raw inputs", last.rawAcc, p.warm]];
    const bw = w / 3;
    bars.forEach(([label, v, color], i) => {
      const bh = v * (hh - 50);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 1) - bw * 0.3, hh - 30 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 1), hh - 10);
      ctx.fillText(`${Math.round(v * 100)}%`, bw * (i + 1), hh - 34 - bh);
    });
  });

  function update() {
    last = run(size, radius);
    st.set("res", `${Math.round(last.reservoirAcc * 100)}%`);
    st.set("raw", `${Math.round(last.rawAcc * 100)}%`);
    say(`reservoir accuracy ${Math.round(last.reservoirAcc * 100)}%, raw-input accuracy ${Math.round(last.rawAcc * 100)}%`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
