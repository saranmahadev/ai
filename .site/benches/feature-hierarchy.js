// Bench: combine a horizontal- and vertical-edge feature map into a corner detector, via elementwise minimum.
import { toyImage, conv2d, relu } from "./dlkit.js";

const HORIZ = [[-1, -1], [1, 1]], VERT = [[-1, 1], [-1, 1]];

export default function mount(root, kit) {
  const { frame, canvas, choice, live } = kit;
  const body = frame(root, { title: "Combining two edge detectors into a corner detector" });
  const say = live(body);
  let kind = "corner";

  const cv = canvas(body, { aspect: 0.4, label: "Horizontal map, vertical map, and their combination" });
  const ch = choice("Image", [["edge", "Edge"], ["corner", "Corner"], ["blob", "Blob"]], kind, (v) => { kind = v; update(); });
  body.append(cv.box, ch.el);

  function draw(ctx, grid, ox, oy, cell, p) {
    const maxV = Math.max(...grid.flat(), 1e-6);
    for (let i = 0; i < grid.length; i++) for (let j = 0; j < grid[0].length; j++) {
      const t = grid[i][j] / maxV;
      ctx.fillStyle = t > 0 ? p.good : p.soft2;
      ctx.globalAlpha = Math.min(1, 0.2 + t);
      ctx.fillRect(ox + j * cell + 2, oy + i * cell + 2, cell - 4, cell - 4);
      ctx.globalAlpha = 1;
    }
  }

  cv.onDraw((ctx, w, hh, p) => {
    const img = toyImage(kind, 5);
    const hMap = conv2d(img, HORIZ).map((row) => row.map(relu));
    const vMap = conv2d(img, VERT).map((row) => row.map(relu));
    const combined = hMap.map((row, i) => row.map((v, j) => Math.min(v, vMap[i][j])));
    const cell = Math.min(hh, w / 13);
    draw(ctx, hMap, 0, 0, cell, p);
    draw(ctx, vMap, 5 * cell, 0, cell, p);
    draw(ctx, combined, 10 * cell, 0, cell, p);
  });

  function update() { say(`showing ${kind}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
