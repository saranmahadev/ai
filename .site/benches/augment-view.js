// Bench: a toy image with flip, rotation and noise augmentations toggled live.
import { toyImage } from "./dlkit.js";

export default function mount(root, kit) {
  const { frame, canvas, toggles, stats, live, rng } = kit;
  const body = frame(root, { title: "One image, several augmentations" });
  const say = live(body);
  const base = toyImage("edge", 4);
  let opts = { flip: false, rotate: false, noise: false };
  const r = rng(4);

  const cv = canvas(body, { aspect: 0.9, label: "The toy image with the chosen augmentations applied" });
  const st = stats([["on", "lit pixels"], ["moved", "pixels that changed position"]]);
  const tg = toggles([["flip", "Horizontal flip", false], ["rotate", "90° rotation", false], ["noise", "Add noise", false]], (v) => { opts = v; update(); });
  body.append(cv.box, st.el, tg.el);

  function apply() {
    let g = base.map((row) => row.slice());
    if (opts.flip) g = g.map((row) => row.slice().reverse());
    if (opts.rotate) g = g[0].map((_, c) => g.map((row) => row[c]).reverse());
    if (opts.noise) g = g.map((row) => row.map((v) => (r.chance(0.1) ? 1 - v : v)));
    return g;
  }

  cv.onDraw((ctx, w, hh, p) => {
    const g = apply();
    const n = g.length, cell = Math.min(w, hh) / n;
    const ox = (w - cell * n) / 2, oy = (hh - cell * n) / 2;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      ctx.fillStyle = g[i][j] ? p.accent : p.soft2;
      ctx.fillRect(ox + j * cell + 2, oy + i * cell + 2, cell - 4, cell - 4);
    }
  });

  function update() {
    const g = apply();
    const on = g.flat().reduce((a, b) => a + b, 0);
    let moved = 0;
    for (let i = 0; i < base.length; i++) for (let j = 0; j < base.length; j++) if (g[i][j] !== base[i][j]) moved++;
    st.set("on", String(on));
    st.set("moved", String(moved));
    say(`${on} lit pixels, ${moved} changed position from the original`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
