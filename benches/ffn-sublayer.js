// Bench: push a vector through a two-layer feed-forward sublayer and show the hidden layer's activations.
import { feedForward, relu } from "./tfkit.js";
import { rng } from "./kit.js";

const D_MODEL = 4;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Expand, activate, project back down" });
  const say = live(body);
  let x = [0.5, -0.3, 0.8, 0.1], dFF = 8;

  const cv = canvas(body, { aspect: 0.5, label: "Hidden layer activations and output" });
  const st = stats([["zeroed", "hidden units zeroed by ReLU"], ["params", "parameter count"]]);
  const sliders = x.map((v, i) => slider({ label: `x[${i}]`, min: -1.5, max: 1.5, step: 0.1, value: v, format: (n) => n.toFixed(1), onInput: (n) => { x[i] = n; update(); } }));
  const slF = slider({ label: "d_ff (hidden width)", min: 4, max: 16, step: 2, value: dFF, format: (v) => String(v), onInput: (v) => { dFF = v; update(); } });
  body.append(cv.box, st.el, ...sliders.map((s) => s.el), slF.el);

  let hidden = [], out = [];
  cv.onDraw((ctx, w, hh, p) => {
    const topH = hh * 0.55, botH = hh - topH;
    const bwH = w / (hidden.length + 1);
    ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = p.ink;
    ctx.fillText("hidden (after activation)", w / 2, 12);
    const maxH = Math.max(...hidden, 0.1);
    hidden.forEach((v, i) => {
      const bh = (v / maxH) * (topH - 30);
      ctx.fillStyle = v > 0 ? p.accent : p.soft;
      ctx.fillRect(bwH * (i + 0.5) - bwH * 0.3, topH - 10 - bh, bwH * 0.6, bh);
    });
    const bwO = w / (out.length + 1);
    ctx.fillStyle = p.ink; ctx.fillText("output", w / 2, topH + 16);
    const maxO = Math.max(...out.map(Math.abs), 0.1);
    out.forEach((v, i) => {
      const bh = (Math.abs(v) / maxO) * (botH / 2 - 20);
      ctx.fillStyle = p.good;
      ctx.fillRect(bwO * (i + 0.5) - bwO * 0.3, topH + botH / 2 - (v >= 0 ? bh : 0), bwO * 0.6, v >= 0 ? bh : -bh);
    });
    ctx.strokeStyle = p.muted; ctx.beginPath(); ctx.moveTo(0, topH + botH / 2); ctx.lineTo(w, topH + botH / 2); ctx.stroke();
  });

  function update() {
    const rand = rng(9);
    const randMat = (a, b, scale) => Array.from({ length: a }, () => Array.from({ length: b }, () => (rand() * 2 - 1) * scale));
    const W1 = randMat(dFF, D_MODEL, 0.5);
    const b1 = Array.from({ length: dFF }, () => (rand() * 2 - 1) * 0.2);
    const W2 = randMat(D_MODEL, dFF, 0.5);
    const b2 = Array.from({ length: D_MODEL }, () => (rand() * 2 - 1) * 0.2);
    hidden = W1.map((row, i) => relu(row.reduce((s, v, j) => s + v * x[j], 0) + b1[i]));
    out = feedForward(x, { W1, b1, W2, b2, activation: relu });
    const zeroed = hidden.filter((v) => v === 0).length;
    st.set("zeroed", `${zeroed} of ${dFF}`);
    st.set("params", String(dFF * D_MODEL + dFF + D_MODEL * dFF + D_MODEL));
    say(`${zeroed} of ${dFF} hidden units zeroed by ReLU`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
