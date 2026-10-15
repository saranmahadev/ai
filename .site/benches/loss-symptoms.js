// Bench: four canonical loss-curve failure shapes, each with its likely causes.
import { curve, clip } from "./mathkit.js";

const pseudoNoise = (t) => Math.sin(t * 12.9) * Math.sin(t * 3.7) * 0.5;

const PATTERNS = {
  flat: {
    label: "Flat loss (never moves)",
    causes: "Learning rate far too small; gradients not flowing; bad initialization.",
    fns: [{ f: (t) => 2.0 + 0.02 * pseudoNoise(t), color: "accent" }]
  },
  exploding: {
    label: "Exploding loss",
    causes: "Learning rate far too large; exploding gradients; missing gradient clipping.",
    fns: [{ f: (t) => Math.min(20, 0.8 * Math.exp(0.9 * t)), color: "warm" }]
  },
  overfit: {
    label: "Overfitting gap (train vs. val)",
    causes: "Model memorising the training set; see Overfitting and Double Descent.",
    fns: [
      { f: (t) => 2 * Math.exp(-t / 2) + 0.1, color: "muted" },
      { f: (t) => 2 * Math.exp(-t / 2) + 0.1 + 0.03 * t * t, color: "warm" }
    ]
  },
  noisy: {
    label: "Noisy oscillation",
    causes: "Learning rate too high; batch size too small.",
    fns: [{ f: (t) => 1 + 0.6 * pseudoNoise(t * 2), color: "accent" }]
  }
};

export default function mount(root, kit) {
  const { frame, canvas, plot, choice, live } = kit;
  const body = frame(root, { title: "Reading a loss curve's symptoms" });
  const say = live(body);
  let pattern = "exploding";

  const cv = canvas(body, { aspect: 0.55, label: "The selected failure pattern's loss curve" });
  const ch = choice("Pattern", Object.entries(PATTERNS).map(([k, v]) => [k, v.label]), pattern, (v) => { pattern = v; update(); });
  const note = kit.h("p", { class: "bench-verdict" });
  body.append(cv.box, ch.el, note);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, 10], [0, 10]);
    m.axes(ctx, p, { xlabel: "step", ylabel: "loss" });
    for (const { f, color } of PATTERNS[pattern].fns) {
      curve(ctx, m, f, 0, 10, { color: p[color], width: 3, clip: clip(m), steps: 200 });
    }
  });

  function update() {
    note.textContent = PATTERNS[pattern].causes;
    say(`${PATTERNS[pattern].label}: ${PATTERNS[pattern].causes}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
