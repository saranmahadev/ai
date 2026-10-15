// Bench: output size under padding and stride, plus a separate max-pooling view.
import { toyImage, maxPool2d } from "./dlkit.js";

const N = 6, K = 3;
const outSize = (n, f, pad, stride) => Math.floor((n + 2 * pad - f) / stride) + 1;

export default function mount(root, kit) {
  const { frame, canvas, choice, slider, stats, live } = kit;
  const body = frame(root, { title: "Padding, stride and pooling, side by side" });
  const say = live(body);
  let mode = "conv", pad = 0, stride = 1, poolSize = 2;

  const cv = canvas(body, { aspect: 0.5, label: "The image, with padding shown and the convolution or pooling output" });
  const st = stats([["out", "output size"]]);
  const ch = choice("View", [["conv", "Padding & stride"], ["pool", "Max pooling"]], mode, (v) => { mode = v; update(); });
  const sp = slider({ label: "padding", min: 0, max: 2, step: 1, value: pad, onInput: (v) => { pad = v; update(); } });
  const ss = slider({ label: "stride", min: 1, max: 3, step: 1, value: stride, onInput: (v) => { stride = v; update(); } });
  const spool = slider({ label: "pool window", min: 2, max: 3, step: 1, value: poolSize, onInput: (v) => { poolSize = v; update(); } });
  body.append(cv.box, st.el, ch.el, sp.el, ss.el, spool.el);

  const img = toyImage("edge", N);

  cv.onDraw((ctx, w, hh, p) => {
    const cell = Math.min(w / 14, hh / (N + 2 * pad));
    if (mode === "conv") {
      const total = N + 2 * pad;
      for (let i = 0; i < total; i++) for (let j = 0; j < total; j++) {
        const inPad = i < pad || j < pad || i >= pad + N || j >= pad + N;
        const v = inPad ? 0 : img[i - pad][j - pad];
        ctx.fillStyle = inPad ? p.soft : v ? p.accent : p.soft2;
        ctx.fillRect(j * cell + 1, i * cell + 1, cell - 2, cell - 2);
      }
    } else {
      const pooled = maxPool2d(img, poolSize);
      for (let i = 0; i < img.length; i++) for (let j = 0; j < img[0].length; j++) {
        ctx.fillStyle = img[i][j] ? p.accent : p.soft2;
        ctx.fillRect(j * cell + 1, i * cell + 1, cell - 2, cell - 2);
      }
      const ox = (N + 1) * cell;
      for (let i = 0; i < pooled.length; i++) for (let j = 0; j < pooled[0].length; j++) {
        ctx.fillStyle = pooled[i][j] ? p.good : p.soft2;
        ctx.fillRect(ox + j * cell * 1.3 + 1, i * cell * 1.3 + 1, cell * 1.2, cell * 1.2);
      }
    }
  });

  function update() {
    if (mode === "conv") { st.set("out", String(outSize(N, K, pad, stride))); say(`output size ${outSize(N, K, pad, stride)}`); }
    else { const o = Math.floor(N / poolSize); st.set("out", `${o} × ${o}`); say(`pooled to ${o} by ${o}`); }
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
