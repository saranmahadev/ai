// Bench: an FGSM-style attack on the toy CNN pipeline, nudging every pixel by sign(saliency) * epsilon.
import { toyImage, conv2d, relu, softmax } from "./dlkit.js";

const KERNEL = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]];
const W = [[0.5, -0.3, 0.2, 0.1], [-0.4, 0.6, 0.1, -0.2]], B = [0.1, -0.1];

function predict(img) {
  const conv = conv2d(img, KERNEL);
  const relud = conv.map((row) => row.map(relu));
  const flat = relud.flat();
  const logits = W.map((row, i) => row.reduce((s, w, j) => s + w * flat[j], B[i]));
  return softmax(logits)[0];
}

export default function mount(root, kit) {
  const { frame, canvas, choice, slider, stats, live } = kit;
  const body = frame(root, { title: "Nudging every pixel the wrong way" });
  const say = live(body);
  let kind = "corner", eps = 0.1;

  const cv = canvas(body, { aspect: 0.5, label: "The original and the perturbed image" });
  const st = stats([["orig", "original probability"], ["new", "probability after attack"], ["drop", "drop"]]);
  const ch = choice("Image", [["edge", "Edge"], ["corner", "Corner"], ["blob", "Blob"]], kind, (v) => { kind = v; update(); });
  const se = slider({ label: "attack strength ε", min: 0, max: 0.3, step: 0.01, value: eps, format: (v) => v.toFixed(2), onInput: (v) => { eps = v; update(); } });
  body.append(cv.box, st.el, ch.el, se.el);

  function saliencyAndAttack() {
    const img = toyImage(kind, 4);
    const base = predict(img);
    const dEps = 0.01;
    const saliency = img.map((row, i) => row.map((_, j) => {
      const img2 = img.map((r) => r.slice());
      img2[i][j] += dEps;
      return (predict(img2) - base) / dEps;
    }));
    const perturbed = img.map((row, i) => row.map((v, j) => v - eps * Math.sign(saliency[i][j] || 1)));
    const newProb = predict(perturbed);
    return { img, perturbed, base, newProb };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const { img, perturbed } = saliencyAndAttack();
    const n = img.length, cell = Math.min(w / (2 * n + 2), hh / n);
    const draw = (grid, ox) => { for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = grid[i][j]; ctx.fillStyle = v > 0.5 ? p.accent : v < -0.05 ? p.warm : p.soft2; ctx.fillRect(ox + j * cell + 2, i * cell + 2, cell - 4, cell - 4); } };
    draw(img, 0);
    draw(perturbed, (n + 1) * cell);
  });

  function update() {
    const { base, newProb } = saliencyAndAttack();
    st.set("orig", base.toFixed(4));
    st.set("new", newProb.toFixed(4));
    st.set("drop", (base - newProb).toFixed(4));
    say(`probability dropped from ${base.toFixed(3)} to ${newProb.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
