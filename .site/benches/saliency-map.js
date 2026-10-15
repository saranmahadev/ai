// Bench: a finite-difference saliency map for the toy CNN pipeline's class-0 probability.
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
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Which pixels matter to this prediction?" });
  const say = live(body);
  let kind = "corner";

  const cv = canvas(body, { aspect: 0.5, label: "The image, and its saliency map for class 0" });
  const st = stats([["p", "predicted probability, class 0"]]);
  const ch = choice("Image", [["edge", "Edge"], ["corner", "Corner"], ["blob", "Blob"]], kind, (v) => { kind = v; update(); });
  body.append(cv.box, st.el, ch.el);

  function saliency() {
    const img = toyImage(kind, 4);
    const base = predict(img);
    const eps = 0.01;
    const map = img.map((row, i) => row.map((_, j) => {
      const img2 = img.map((r) => r.slice());
      img2[i][j] += eps;
      return (predict(img2) - base) / eps;
    }));
    return { img, base, map };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const { img, map } = saliency();
    const n = img.length, cell = Math.min(w / (2 * n + 2), hh / n);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      ctx.fillStyle = img[i][j] ? p.accent : p.soft2;
      ctx.fillRect(j * cell + 2, i * cell + 2, cell - 4, cell - 4);
    }
    const ox = (n + 1) * cell;
    const maxAbs = Math.max(...map.flat().map(Math.abs), 1e-6);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = map[i][j] / maxAbs;
      ctx.fillStyle = v > 0 ? p.good : p.warm;
      ctx.globalAlpha = Math.min(1, Math.abs(v) + 0.1);
      ctx.fillRect(ox + j * cell + 2, i * cell + 2, cell - 4, cell - 4);
      ctx.globalAlpha = 1;
    }
  });

  function update() {
    const { base } = saliency();
    st.set("p", base.toFixed(4));
    say(`predicted probability ${base.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
