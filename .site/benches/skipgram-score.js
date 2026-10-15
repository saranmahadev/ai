// Bench: skip-gram-style dot-product scoring and softmax probability for candidate context words.
import { softmax } from "./dlkit.js";

const WORDS = ["cat", "dog", "car", "truck"];

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "Scoring a word's likely neighbours" });
  const say = live(body);
  let vecs = { cat: [1, 1], dog: [1.2, 0.8], car: [-1, 1], truck: [-1.2, 0.9] };
  let center = "cat";

  const cv = canvas(body, { aspect: 0.75, label: "Word vectors in 2D; adjust any word's position with its sliders" });
  const st = stats([["probs", "P(context | center)"]]);
  const ch = choice("Centre word", WORDS.map((w) => [w, w]), center, (v) => { center = v; update(); });
  const sliders = WORDS.flatMap((w) => [
    slider({ label: `${w} x`, min: -2, max: 2, step: 0.1, value: vecs[w][0], format: (v) => v.toFixed(1), onInput: (v) => { vecs[w][0] = v; update(); } }),
    slider({ label: `${w} y`, min: -2, max: 2, step: 0.1, value: vecs[w][1], format: (v) => v.toFixed(1), onInput: (v) => { vecs[w][1] = v; update(); } })
  ]);
  body.append(cv.box, st.el, ch.el, ...sliders.map((s) => s.el));

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [-2, 2], [-2, 2]);
    m.axes(ctx, p, { xlabel: "dim 1", ylabel: "dim 2" });
    for (const word of WORDS) {
      const [x, y] = vecs[word];
      ctx.fillStyle = word === center ? p.warm : p.accent;
      ctx.beginPath(); ctx.arc(m.X(x), m.Y(y), 7, 0, 7); ctx.fill();
      ctx.fillStyle = p.ink; ctx.font = "700 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "left";
      ctx.fillText(word, m.X(x) + 10, m.Y(y));
    }
  });

  function update() {
    const candidates = WORDS.filter((w) => w !== center);
    const scores = candidates.map((w) => vecs[center][0] * vecs[w][0] + vecs[center][1] * vecs[w][1]);
    const probs = softmax(scores);
    st.set("probs", candidates.map((w, i) => `${w}: ${(probs[i] * 100).toFixed(1)}%`).join(", "));
    say(`centre ${center}: ${candidates.map((w, i) => `${w} ${(probs[i] * 100).toFixed(0)}%`).join(", ")}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
