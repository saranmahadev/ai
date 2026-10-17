// Bench: split a small image grid into patches and show the resulting patch count and flattened values.
import { patchify } from "./tfkit.js";

const SIZE = 8;
const GRID = Array.from({ length: SIZE }, (_, r) => Array.from({ length: SIZE }, (_, c) => r * SIZE + c));

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Cutting a grid into a token sequence" });
  const say = live(body);
  let patchSize = 4;

  const cv = canvas(body, { aspect: 1, label: "The grid, divided into patches" });
  const st = stats([["count", "patch count"], ["dim", "patch dimension"]]);
  const sl = slider({ label: "patch size", min: 1, max: 8, step: 1, value: patchSize, format: (v) => `${v}×${v}`, onInput: (v) => { patchSize = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const cell = Math.min(w, hh) / SIZE;
    const ox = (w - cell * SIZE) / 2, oy = (hh - cell * SIZE) / 2;
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      const patchR = Math.floor(r / patchSize), patchC = Math.floor(c / patchSize);
      ctx.fillStyle = (patchR + patchC) % 2 === 0 ? p.soft : p.soft2;
      ctx.fillRect(ox + c * cell, oy + r * cell, cell, cell);
    }
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2;
    for (let r = 0; r < SIZE; r += patchSize) ctx.strokeRect(ox, oy + r * cell, cell * SIZE, Math.min(patchSize, SIZE - r) * cell);
    for (let r = 0; r < SIZE; r += patchSize) for (let c = 0; c < SIZE; c += patchSize) {
      const pw = Math.min(patchSize, SIZE - c), ph = Math.min(patchSize, SIZE - r);
      ctx.strokeRect(ox + c * cell, oy + r * cell, pw * cell, ph * cell);
    }
  });

  function update() {
    const patches = patchify(GRID, Math.min(patchSize, SIZE));
    st.set("count", String(patches.length));
    st.set("dim", String(patches[0] ? patches[0].length : 0));
    say(`${patches.length} patches, each a ${patches[0] ? patches[0].length : 0}-number vector`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
