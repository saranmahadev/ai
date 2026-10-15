// Bench: step a small filter across a toy image, showing the window and the computed output at each position.
import { toyImage } from "./dlkit.js";

export default function mount(root, kit) {
  const { frame, canvas, choice, slider, stats, live, stepper } = kit;
  const body = frame(root, { title: "Sliding a filter across an image" });
  const say = live(body);
  const N = 6;
  let kind = "edge", img = toyImage(kind, N), kernel = [1, -1], pos = 0;
  const kh = 1, kw = kernel.length;
  const outW = N - kw + 1;

  const cv = canvas(body, { aspect: 0.6, label: "The image with the current filter window highlighted, and the output so far" });
  const st = stats([["val", "output at this position"]]);
  const ch = choice("Image", [["edge", "Edge"], ["corner", "Corner"], ["blob", "Blob"]], kind, (v) => { kind = v; img = toyImage(kind, N); reset(); });
  const sw = slider({ label: "filter weight 1", min: -2, max: 2, step: 1, value: kernel[0], onInput: (v) => { kernel[0] = v; update(); } });
  const sw2 = slider({ label: "filter weight 2", min: -2, max: 2, step: 1, value: kernel[1], onInput: (v) => { kernel[1] = v; update(); } });
  const sp = stepper({ onStep: step, onReset: reset, interval: 300 });
  body.append(cv.box, st.el, ch.el, sw.el, sw2.el, sp.el);

  function reset() { pos = 0; update(); }
  function step() { if (pos >= outW * N - 1) return false; pos++; update(); return pos < outW * N - 1; }

  function outputAt(r, c) { return img[r][c] * kernel[0] + img[r][c + 1] * kernel[1]; }

  cv.onDraw((ctx, w, hh, p) => {
    const cell = Math.min(w / (N + outW + 1), hh / N);
    const row = Math.floor(pos / outW), col = pos % outW;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const inWindow = i === row && (j === col || j === col + 1);
      ctx.fillStyle = img[i][j] ? p.accent : p.soft2;
      ctx.fillRect(j * cell + 2, i * cell + 2, cell - 4, cell - 4);
      if (inWindow) { ctx.strokeStyle = p.warm; ctx.lineWidth = 3; ctx.strokeRect(j * cell + 2, i * cell + 2, cell - 4, cell - 4); }
    }
    const ox = (N + 1) * cell;
    for (let i = 0; i < N; i++) for (let j = 0; j < outW; j++) {
      const idx = i * outW + j;
      if (idx > pos) continue;
      const v = outputAt(i, j);
      ctx.fillStyle = v > 0 ? p.good : v < 0 ? p.warm : p.soft2;
      ctx.fillRect(ox + j * cell + 2, i * cell + 2, cell - 4, cell - 4);
    }
  });

  function update() {
    const row = Math.floor(pos / outW), col = pos % outW;
    const v = outputAt(row, col);
    st.set("val", v.toFixed(1));
    say(`position row ${row}, column ${col}: output ${v.toFixed(1)}`);
    cv.redraw();
  }
  reset();
  return () => { cv.destroy(); sp.stop(); };
}
