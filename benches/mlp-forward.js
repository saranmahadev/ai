// Bench: a small 2-3-1 feedforward network, redrawn as a diagram as the two inputs change.
import { dot, label } from "./mathkit.js";
import { forwardMLP, relu, sigmoid } from "./dlkit.js";

const W1 = [[0.5, -0.5], [0.3, 0.8], [-0.6, 0.2]], B1 = [0.1, -0.2, 0.05];
const W2 = [[0.4, -0.3, 0.6]], B2 = [0.1];

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "A forward pass through a small network" });
  const say = live(body);
  let x1 = 1, x2 = 2;

  const cv = canvas(body, { aspect: 0.62, label: "Network diagram: brighter nodes mean a larger activation" });
  const st = stats([["h", "hidden activations"], ["y", "output"]]);
  const s1 = slider({ label: "x1", min: -3, max: 3, step: 0.1, value: x1, format: (v) => v.toFixed(1), onInput: (v) => { x1 = v; update(); } });
  const s2 = slider({ label: "x2", min: -3, max: 3, step: 0.1, value: x2, format: (v) => v.toFixed(1), onInput: (v) => { x2 = v; update(); } });
  body.append(cv.box, st.el, s1.el, s2.el);

  let acts;
  const inX = [0.14, 0.14], hidX = 0.5, outX = 0.86;
  const inY = [0.3, 0.7], hidY = [0.18, 0.5, 0.82], outY = 0.5;

  cv.onDraw((ctx, w, hh, p) => {
    const X = (f) => f * w, Y = (f) => f * hh;
    const glow = (a) => { const t = Math.max(0, Math.min(1, (a + 1) / 2)); return `rgba(${t > 0.5 ? 220 : 120},${120 + 80 * t},${200 - 60 * t},1)`; };
    // connections, input -> hidden
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) {
      ctx.strokeStyle = W1[j][i] >= 0 ? p.good : p.warm;
      ctx.globalAlpha = Math.min(1, Math.abs(W1[j][i]));
      ctx.beginPath(); ctx.moveTo(X(inX[i]), Y(inY[i])); ctx.lineTo(X(hidX), Y(hidY[j])); ctx.stroke();
    }
    for (let j = 0; j < 3; j++) {
      ctx.strokeStyle = W2[0][j] >= 0 ? p.good : p.warm;
      ctx.globalAlpha = Math.min(1, Math.abs(W2[0][j]));
      ctx.beginPath(); ctx.moveTo(X(hidX), Y(hidY[j])); ctx.lineTo(X(outX), Y(outY)); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // nodes
    const inputs = [x1, x2];
    inputs.forEach((v, i) => { dot(ctx, X(inX[i]), Y(inY[i]), 16, p.soft2); label(ctx, v.toFixed(1), X(inX[i]), Y(inY[i]) + 32, p.ink, { align: "center" }); });
    acts.acts[1].forEach((a, j) => { dot(ctx, X(hidX), Y(hidY[j]), 16, glow(a / 2)); label(ctx, a.toFixed(2), X(hidX), Y(hidY[j]) + 32, p.ink, { align: "center" }); });
    dot(ctx, X(outX), Y(outY), 18, glow(acts.output[0] * 2 - 1));
    label(ctx, acts.output[0].toFixed(3), X(outX), Y(outY) + 34, p.ink, { align: "center" });
    label(ctx, "input", X(inX[0]), Y(0.08), p.muted, { align: "center" });
    label(ctx, "hidden (ReLU)", X(hidX), Y(0.08), p.muted, { align: "center" });
    label(ctx, "output (sigmoid)", X(outX), Y(0.08), p.muted, { align: "center" });
  });

  function update() {
    acts = forwardMLP([x1, x2], [{ W: W1, b: B1, act: relu }, { W: W2, b: B2, act: sigmoid }]);
    st.set("h", acts.acts[1].map((v) => v.toFixed(2)).join(", "));
    st.set("y", acts.output[0].toFixed(4));
    say(`output ${acts.output[0].toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
