// Bench: compare windowed (local) attention's pair count against full attention at a chosen sequence length and radius.
import { windowMask } from "./tfkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "A sliding neighbourhood instead of the whole sequence" });
  const say = live(body);
  let n = 8, radius = 2;

  const cv = canvas(body, { aspect: 1, label: "The windowed attention mask as a grid" });
  const st = stats([["full", "full attention pairs"], ["windowed", "windowed attention pairs"], ["reduction", "reduction"]]);
  const slN = slider({ label: "sequence length", min: 4, max: 40, step: 1, value: n, format: (v) => String(v), onInput: (v) => { n = v; radius = Math.min(radius, Math.floor((n - 1) / 2)); update(); } });
  const slR = slider({ label: "window radius", min: 0, max: 20, step: 1, value: radius, format: (v) => String(v), onInput: (v) => { radius = v; update(); } });
  body.append(cv.box, st.el, slN.el, slR.el);

  let mask;
  cv.onDraw((ctx, w, hh, p) => {
    const cell = Math.min(w, hh) / n;
    const ox = (w - cell * n) / 2, oy = (hh - cell * n) / 2;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      ctx.fillStyle = mask[i][j] ? p.good : p.soft;
      ctx.fillRect(ox + j * cell + 1, oy + i * cell + 1, Math.max(1, cell - 2), Math.max(1, cell - 2));
    }
  });

  function update() {
    mask = windowMask(n, radius);
    const windowedPairs = mask.flat().filter(Boolean).length;
    const fullPairs = n * n;
    st.set("full", fullPairs.toLocaleString());
    st.set("windowed", windowedPairs.toLocaleString());
    st.set("reduction", `${(fullPairs / windowedPairs).toFixed(1)}×`);
    say(`${windowedPairs.toLocaleString()} of ${fullPairs.toLocaleString()} pairs, ${(fullPairs / windowedPairs).toFixed(1)} times fewer`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
