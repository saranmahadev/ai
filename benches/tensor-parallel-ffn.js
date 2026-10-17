// Bench: split a feed-forward sublayer across devices and confirm the combined output matches the single-device result.
import { feedForward, tensorParallelFeedForward, relu } from "./tfkit.js";
import { rng } from "./kit.js";

const D_MODEL = 4, D_FF = 8;
const DEVICE_OPTIONS = [1, 2, 4, 8]; // divisors of D_FF, so the split is always even

export default function mount(root, kit) {
  const { frame, canvas, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "Split the matrix, sum the results" });
  const say = live(body);
  let x = [0.5, -0.3, 0.8, 0.1], numDevices = 2;

  const cv = canvas(body, { aspect: 0.5, label: "Each device's share of the weights" });
  const st = stats([["single", "single-device output"], ["parallel", "parallel (split) output"], ["match", "outputs match?"], ["perDevice", "weights per device"]]);
  const sliders = x.map((v, i) => slider({ label: `x[${i}]`, min: -1.5, max: 1.5, step: 0.1, value: v, format: (n) => n.toFixed(1), onInput: (n) => { x[i] = n; update(); } }));
  const ch = choice("Number of devices", DEVICE_OPTIONS.map((n) => [String(n), String(n)]), String(numDevices), (v) => { numDevices = +v; update(); });
  body.append(cv.box, st.el, ...sliders.map((s) => s.el), ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (numDevices + 1);
    const totalWeights = D_FF * D_MODEL * 2;
    const perDevice = totalWeights / numDevices;
    for (let d = 0; d < numDevices; d++) {
      const bh = (perDevice / totalWeights) * (hh - 60);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (d + 0.5), hh - 30 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`device ${d}`, bw * (d + 0.5) + bw * 0.3, hh - 10);
      ctx.fillText(String(perDevice), bw * (d + 0.5) + bw * 0.3, hh - 34 - bh);
    }
  });

  function update() {
    const rand = rng(43);
    const randMat = (a, b, scale) => Array.from({ length: a }, () => Array.from({ length: b }, () => (rand() * 2 - 1) * scale));
    const W1 = randMat(D_FF, D_MODEL, 0.5), W2 = randMat(D_MODEL, D_FF, 0.5);
    const b1 = new Array(D_FF).fill(0), b2 = new Array(D_MODEL).fill(0);
    const single = feedForward(x, { W1, b1, W2, b2, activation: relu });
    const parallel = tensorParallelFeedForward(x, { W1, W2, activation: relu }, numDevices);
    const match = single.every((v, i) => Math.abs(v - parallel[i]) < 1e-9);
    st.set("single", single.map((v) => v.toFixed(4)).join(", "));
    st.set("parallel", parallel.map((v) => v.toFixed(4)).join(", "));
    st.set("match", match ? "yes, identical" : "no");
    st.set("perDevice", String((D_FF * D_MODEL * 2) / numDevices));
    say(`outputs ${match ? "match" : "differ"} across ${numDevices} devices`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
