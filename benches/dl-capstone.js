// Bench: step through the nine design stages of an end-to-end deep learning project.
const STAGES = [
  { name: "Architecture", decision: "Image input → a CNN", evidence: "Grid-structured data calls for convolution (Choosing an Architecture for a Problem)." },
  { name: "Initialization", decision: "Scale weights by ~1/√n", evidence: "scale=1 exploded to 3.3 billion after 10 layers; scale=1/√n stayed at 0.334 (Weight Initialization)." },
  { name: "Regularization", decision: "Add dropout + augmentation", evidence: "Test error spiked past 160 right at the interpolation threshold (Overfitting and Double Descent)." },
  { name: "Training", decision: "Warmup + cosine LR, clip gradients", evidence: "A 0.25 per-layer factor shrinks a gradient to ~0.0000009 over 10 layers without care (Vanishing and Exploding Gradients)." },
  { name: "Debugging", decision: "Monitor gradient norm", evidence: "A jump from 1.8 to 15.3 in one step is the warning sign to catch before NaN (Debugging a Training Run)." },
  { name: "Interpretation", decision: "Check a saliency map", evidence: "The model attended to the column the kernel actually weighted +1 (Feature Visualization)." },
  { name: "Robustness", decision: "Run an adversarial check", evidence: "A 0.1-magnitude nudge dropped a 0.7311 prediction to 0.4800 (Adversarial Examples and Robustness)." },
  { name: "Compression", decision: "Prune + quantize for the phone", evidence: "2× pruning × 4× quantization = 8× smaller overall (Edge and On-Device Deep Learning)." },
  { name: "Safety review", decision: "Check the train/held-out loss gap", evidence: "A large gap is a membership-inference risk, not just an accuracy one (Ethics and Safety of Deep Systems)." }
];

export default function mount(root, kit) {
  const { frame, canvas, stats, live, h, button } = kit;
  const body = frame(root, { title: "One project, every stage" });
  const say = live(body);
  let i = 0;

  const cv = canvas(body, { aspect: 0.45, label: "Progress through the nine design stages" });
  const st = stats([["decision", "decision"], ["evidence", "evidence"]]);
  const nav = h("div", { class: "bench-row" }, button("‹ Previous", () => { i = (i + STAGES.length - 1) % STAGES.length; update(); }), button("Next ›", () => { i = (i + 1) % STAGES.length; update(); }));
  body.append(cv.box, st.el, nav);

  cv.onDraw((ctx, w, hh, p) => {
    const n = STAGES.length, gw = w / n;
    STAGES.forEach((s, idx) => {
      const done = idx <= i;
      ctx.fillStyle = idx === i ? p.warm : done ? p.good : p.soft2;
      ctx.beginPath(); ctx.arc(gw * (idx + 0.5), hh * 0.4, 10, 0, 7); ctx.fill();
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(s.name, gw * (idx + 0.5), hh * 0.4 + 24);
    });
    ctx.strokeStyle = p.muted; ctx.lineWidth = 2; ctx.beginPath();
    ctx.moveTo(gw * 0.5, hh * 0.4); ctx.lineTo(gw * (n - 0.5), hh * 0.4); ctx.stroke();
  });

  function update() {
    st.set("decision", STAGES[i].decision);
    st.set("evidence", STAGES[i].evidence);
    say(`stage ${i + 1} of ${STAGES.length}: ${STAGES[i].name}. ${STAGES[i].decision}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
