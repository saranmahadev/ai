// Bench: a forward pass through a tiny network, one layer at a time.
import { forward, drawNet } from "./network-kit.js";
export default function mount(root, kit) {
  const { h, frame, slider, stepper, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Step through a tiny network" });
  const say = live(body);
  const net = { W1: [[0.5, -1], [1, 0.5]], b1: [0, 0.5], w2: [1, 0.8], b2: -1 }, x = [1, 2]; let step = 0;
  const s1 = slider({ label: "input x₁", min: -3, max: 3, step: 0.5, value: x[0], format: (v) => fmt(v, 1), onInput: (v) => { x[0] = v; update(); } });
  const s2 = slider({ label: "input x₂", min: -3, max: 3, step: 0.5, value: x[1], format: (v) => fmt(v, 1), onInput: (v) => { x[1] = v; update(); } });
  const s3 = slider({ label: "output weight for h₂", min: -2, max: 2, step: 0.1, value: net.w2[1], format: (v) => fmt(v, 1), onInput: (v) => { net.w2[1] = v; update(); } });
  const cv = canvas(body, { aspect: 0.5, label: "A network with two inputs, two hidden units and one output, with values filling in step by step" });
  const st = stats([["msg", "this step"], ["loss", "loss if the true label is 1"]]);
  const MSG = ["Start: the inputs are known.", "Layer 1: z = W₁ x + b₁ for each hidden unit.", "Layer 1: apply ReLU: negative scores become 0.", "Layer 2: z = w₂ · a + b₂.", "Output: ŷ = σ(z), a probability."];
  const stp = stepper({ interval: 900, stepLabel: "Next step", onStep: () => { if (step >= 4) return false; step++; update(); if (step >= 4) return false; }, onReset: () => { step = 0; update(); } });
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, s1.el, s2.el, s3.el), stp.el);
  cv.onDraw((ctx, w, hh, p) => drawNet(ctx, w, hh, p, { x, net, f: forward(net, x), g: null, show: step }));
  function update() { const f = forward(net, x); st.set("msg", MSG[step]); st.set("loss", step >= 4 ? fmt(f.L, 4) : "—"); say(MSG[step]); cv.redraw(); }
  update();
  return () => { stp.stop(); cv.destroy(); };
}
