// Bench: sinusoidal positional encoding, fast vs slow dimensions, across a range of positions.
import { curve, clip } from "./mathkit.js";

function posEnc(pos, dim, d, base = 10000) {
  const pairIndex = Math.floor(dim / 2);
  const freq = base ** ((2 * pairIndex) / d);
  return dim % 2 === 0 ? Math.sin(pos / freq) : Math.cos(pos / freq);
}

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "A page number written in sine waves" });
  const say = live(body);
  let d = 8, maxPos = 20;

  const cv = canvas(body, { aspect: 0.55, label: "Positional encoding dimension 0 (fast) and dimension d-2 (slow) across positions" });
  const st = stats([["fast", "dimension 0 at position 10"], ["slow", "last pair's dimension at position 10"]]);
  const sd = slider({ label: "model dimension d", min: 4, max: 16, step: 2, value: d, onInput: (v) => { d = v; update(); } });
  const sp = slider({ label: "positions shown", min: 5, max: 50, step: 5, value: maxPos, onInput: (v) => { maxPos = v; update(); } });
  body.append(cv.box, st.el, sd.el, sp.el);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, maxPos], [-1.1, 1.1]);
    m.axes(ctx, p, { xlabel: "position", ylabel: "encoding value" });
    curve(ctx, m, (pos) => posEnc(pos, 0, d), 0, maxPos, { color: p.accent, width: 3, clip: clip(m), steps: 300 });
    curve(ctx, m, (pos) => posEnc(pos, d - 2, d), 0, maxPos, { color: p.warm, width: 3, clip: clip(m), steps: 300 });
  });

  function update() {
    st.set("fast", posEnc(10, 0, d).toFixed(4));
    st.set("slow", posEnc(10, d - 2, d).toFixed(4));
    say(`model dimension ${d}, showing ${maxPos} positions`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
