// Bench: step through convolution, ReLU, flattening and a dense+softmax layer on a toy image.
import { toyImage, conv2d, relu, softmax } from "./dlkit.js";

const KERNEL = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]];
const W = [[0.5, -0.3, 0.2, 0.1], [-0.4, 0.6, 0.1, -0.2]], B = [0.1, -0.1];

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live, button, h } = kit;
  const body = frame(root, { title: "One tiny image, all the way to a prediction" });
  const say = live(body);
  let kind = "corner", stage = 0;
  const STAGES = ["image", "convolution", "ReLU", "flatten + dense + softmax"];

  const cv = canvas(body, { aspect: 0.55, label: "The data at the current pipeline stage" });
  const st = stats([["shape", "shape"], ["note", "result"]]);
  const ch = choice("Image", [["edge", "Edge"], ["corner", "Corner"], ["blob", "Blob"]], kind, (v) => { kind = v; update(); });
  const nav = h("div", { class: "bench-row" }, button("‹ Previous stage", () => { stage = (stage + 3) % 4; update(); }), button("Next stage ›", () => { stage = (stage + 1) % 4; update(); }));
  body.append(cv.box, st.el, ch.el, nav);

  function pipeline() {
    const img = toyImage(kind, 4);
    const conv = conv2d(img, KERNEL);
    const relud = conv.map((row) => row.map(relu));
    const flat = relud.flat();
    const logits = W.map((row, i) => row.reduce((s, w, j) => s + w * flat[j], B[i]));
    const probs = softmax(logits);
    return { img, conv, relud, flat, logits, probs };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const r = pipeline();
    if (stage === 0 || stage === 1 || stage === 2) {
      const grid = stage === 0 ? r.img : stage === 1 ? r.conv : r.relud;
      const n = grid.length, m = grid[0].length;
      const cell = Math.min(w / (m + 1), hh / (n + 1));
      const lo = Math.min(...grid.flat()), hi = Math.max(...grid.flat(), lo + 1e-6);
      for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
        const t = (grid[i][j] - lo) / (hi - lo || 1);
        ctx.fillStyle = grid[i][j] === 0 ? p.soft2 : t > 0.5 ? p.accent : p.warm;
        ctx.fillRect(j * cell + 2, i * cell + 2, cell - 4, cell - 4);
        ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(grid[i][j].toFixed(0), j * cell + cell / 2, i * cell + cell / 2);
      }
    } else {
      const barW = w / 4;
      r.probs.forEach((v, i) => {
        const bh = v * (hh - 40);
        ctx.fillStyle = i === 0 ? p.accent : p.good;
        ctx.fillRect(barW * (i + 1) - barW * 0.3, hh - 20 - bh, barW * 0.6, bh);
        ctx.fillStyle = p.ink; ctx.font = "700 13px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(`class ${i}: ${(v * 100).toFixed(1)}%`, barW * (i + 1), hh - 4);
      });
    }
  });

  function update() {
    const r = pipeline();
    st.set("shape", STAGES[stage]);
    const note = stage === 0 ? "4×4 image" : stage === 1 ? "2×2 feature map" : stage === 2 ? "2×2, non-negative" : `flattened to (${r.flat.join(", ")}), logits (${r.logits.map((v) => v.toFixed(2)).join(", ")})`;
    st.set("note", note);
    say(`stage: ${STAGES[stage]}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
