// Bench: two independent 2-weight filters on a toy image, shown as two separate feature-map channels.
import { toyImage, conv2d } from "./dlkit.js";

export default function mount(root, kit) {
  const { frame, canvas, choice, slider, live } = kit;
  const body = frame(root, { title: "Two filters, two feature maps" });
  const say = live(body);
  let kind = "corner", k1 = [1, -1], k2 = [1, -1];

  const cv = canvas(body, { aspect: 0.5, label: "The image and the two resulting feature-map channels" });
  const ch = choice("Image", [["edge", "Edge"], ["corner", "Corner"], ["blob", "Blob"]], kind, (v) => { kind = v; update(); });
  const s1a = slider({ label: "filter 1, weight a", min: -2, max: 2, step: 1, value: k1[0], onInput: (v) => { k1[0] = v; update(); } });
  const s1b = slider({ label: "filter 1, weight b", min: -2, max: 2, step: 1, value: k1[1], onInput: (v) => { k1[1] = v; update(); } });
  const s2a = slider({ label: "filter 2, weight a", min: -2, max: 2, step: 1, value: k2[0], onInput: (v) => { k2[0] = v; update(); } });
  const s2b = slider({ label: "filter 2, weight b", min: -2, max: 2, step: 1, value: k2[1], onInput: (v) => { k2[1] = v; update(); } });
  body.append(cv.box, ch.el, s1a.el, s1b.el, s2a.el, s2b.el);

  function draw(ctx, grid, ox, oy, cell, p, bipolar) {
    for (let i = 0; i < grid.length; i++) for (let j = 0; j < grid[0].length; j++) {
      const v = grid[i][j];
      ctx.fillStyle = bipolar ? (v > 0 ? p.good : v < 0 ? p.warm : p.soft2) : (v ? p.accent : p.soft2);
      ctx.fillRect(ox + j * cell + 2, oy + i * cell + 2, cell - 4, cell - 4);
    }
  }

  cv.onDraw((ctx, w, hh, p) => {
    const img = toyImage(kind, 5);
    const fm1 = conv2d(img, [k1]);
    const fm2 = conv2d(img, [[k2[0]], [k2[1]]]);
    const cell = Math.min(hh / 5, w / 16);
    draw(ctx, img, 0, 0, cell, p, false);
    draw(ctx, fm1, 6 * cell, 0, cell, p, true);
    draw(ctx, fm2, 12 * cell, 0, cell, p, true);
  });

  function update() { say("feature maps updated"); cv.redraw(); }
  update();
  return () => cv.destroy();
}
