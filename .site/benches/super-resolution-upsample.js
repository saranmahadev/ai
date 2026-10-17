// Bench: compare nearest-neighbor and bilinear upsampling of a tiny low-resolution grid.
import { nearestUpsample, bilinearUpsample } from "./gakit.js";

const LR = [[10, 20], [30, 40]];

export default function mount(root, kit) {
  const { frame, canvas, slider, live } = kit;
  const body = frame(root, { title: "Blocky vs. smooth upsampling" });
  const say = live(body);
  let factor = 2;

  const cv = canvas(body, { aspect: 0.5, label: "Nearest-neighbor (left) vs. bilinear (right)" });
  const sl = slider({ label: "upsample factor", min: 2, max: 6, step: 1, value: factor, format: (v) => `${v}×`, onInput: (v) => { factor = v; update(); } });
  body.append(cv.box, sl.el);

  function render(ctx, grid, x0, y0, size) {
    const n = grid.length, cell = size / n;
    const max = 40, min = 10;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const t = (grid[i][j] - min) / (max - min);
      ctx.fillStyle = `rgb(${Math.round(60 + 160 * t)},${Math.round(60 + 120 * t)},${Math.round(200 - 100 * t)})`;
      ctx.fillRect(x0 + j * cell, y0 + i * cell, cell, cell);
    }
  }

  cv.onDraw((ctx, w, hh) => {
    const nn = nearestUpsample(LR, factor);
    const bi = bilinearUpsample(LR, factor * 2, factor * 2);
    const size = Math.min(hh - 20, w / 2 - 30);
    render(ctx, nn, 10, 10, size);
    render(ctx, bi, w / 2 + 10, 10, size);
  });

  function update() {
    say(`upsample factor ${factor}×: left is blocky nearest-neighbor, right is smooth bilinear`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
