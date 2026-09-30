// Bench: forward pass, backward pass and one gradient-descent update on the tiny network.
import { forward, backward, drawNet } from "./network-kit.js";
export default function mount(root, kit) {
  const { h, frame, slider, stepper, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Trace the gradient backwards" });
  const say = live(body);
  const init = () => ({ W1: [[0.5, -1], [1, 0.5]], b1: [0, 0.5], w2: [1, 0.8], b2: -1 }), x = [1, 2]; let net = init(), step = 0, eta = 0.5, before = 0, snapG = null, snapChk = 0;
  const se = slider({ label: "learning rate η", min: 0.1, max: 1.5, step: 0.1, value: eta, format: (v) => fmt(v, 1), onInput: (v) => { eta = v; } });
  const cv = canvas(body, { aspect: 0.5, label: "The network with the gradient at each node during the backward pass" });
  const st = stats([["msg", "this step"], ["gw", "gradient for the output weights (∂L/∂w₂)"], ["gW", "gradient for the second hidden row (∂L/∂W₁)"], ["chk", "check: finite-difference estimate of ∂L/∂W₁[2,1]"], ["loss", "loss before → after the update"]]);
  const MSG = ["Start: inputs known, true label 1.", "Forward pass complete: prediction and loss.", "Backward: ∂L/∂z₂ = ŷ − y.", "Backward: through the output weights, then the ReLU (blocked where the input was negative).", "Backward: gradients for the hidden weights.", "Update: every weight moves by −η × its gradient."];
  const stp = stepper({ interval: 1000, stepLabel: "Next step", onStep: () => { if (step >= 5) return false; step++; if (step === 5) { const f = forward(net, x), g = backward(net, x, f), e = 1e-6, n2 = { ...net, W1: net.W1.map((r) => r.slice()) }; n2.W1[1][0] += e; snapG = g; snapChk = (forward(n2, x).L - f.L) / e; before = f.L; net.w2 = net.w2.map((w, i) => w - eta * g.dw2[i]); net.b2 -= eta * g.db2; net.W1 = net.W1.map((r, i) => r.map((w, j) => w - eta * g.dW1[i][j])); net.b1 = net.b1.map((b, i) => b - eta * g.db1[i]); } update(); if (step >= 5) return false; }, onReset: () => { net = init(); step = 0; snapG = null; update(); } });
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, se.el), stp.el);
  cv.onDraw((ctx, w, hh, p) => { const f = forward(net, x), g = backward(net, x, f); drawNet(ctx, w, hh, p, { x, net, f, g: step >= 2 ? { o: g.dz2, h1: step >= 3 ? g.dz1[0] : null, h2: step >= 3 ? g.dz1[1] : null } : null, show: step >= 1 ? 4 : 0 }); });
  function update() { const f = forward(net, x), g = step >= 5 ? snapG : backward(net, x, f), e = 1e-6, n2 = { ...net, W1: net.W1.map((r) => r.slice()) }; n2.W1[1][0] += e; st.set("msg", MSG[step]); st.set("gw", step >= 3 ? `(${fmt(g.dw2[0], 4)}, ${fmt(g.dw2[1], 4)})` : "—"); st.set("gW", step >= 4 ? `(${fmt(g.dW1[1][0], 4)}, ${fmt(g.dW1[1][1], 4)})` : "—"); st.set("chk", step >= 5 ? fmt(snapChk, 4) : step >= 4 ? fmt((forward(n2, x).L - f.L) / e, 4) : "—"); st.set("loss", step >= 5 ? `${fmt(before, 4)} → ${fmt(f.L, 4)}` : step >= 1 ? fmt(f.L, 4) : "—"); say(MSG[step]); cv.redraw(); }
  update();
  return () => { stp.stop(); cv.destroy(); };
}
