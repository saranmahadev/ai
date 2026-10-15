// Bench: pick a problem scenario and see which data structure and architecture family it points to.
const SCENARIOS = [
  { label: "X-ray images, 5,000 labelled", structure: "Grid (image)", pick: "CNN, likely via transfer learning", reason: "Pixels have 2D grid structure; a moderate dataset favours reusing a pretrained backbone over training from scratch." },
  { label: "Daily sales, 2 years, one series", structure: "Sequence", pick: "Recurrent network or small attention model", reason: "A single long time series is sequential; keep the model modest since there is only one series to learn from." },
  { label: "Spreadsheet: age, income, location, purchases", structure: "Tabular, no spatial/sequential structure", pick: "Classic ML model or small dense network", reason: "No grid, sequence or graph structure to exploit, and the dataset is small — a large deep model risks overfitting." },
  { label: "Social network: users and friendships", structure: "Graph", pick: "Graph neural network", reason: "Connections between users are irregular, not grid- or sequence-shaped." },
  { label: "Photos with captions", structure: "Multimodal (grid + sequence)", pick: "CNN/vision transformer + attention-based text model", reason: "Combines two structures; each modality is handled by the architecture family built for it." }
];

export default function mount(root, kit) {
  const { frame, canvas, choice, live } = kit;
  const body = frame(root, { title: "Matching a problem to an architecture family" });
  const say = live(body);
  let idx = 0;

  const cv = canvas(body, { aspect: 0.45, label: "The scenario's data structure and the architecture family it points to" });
  const ch = choice("Scenario", SCENARIOS.map((s, i) => [String(i), s.label]), "0", (v) => { idx = +v; update(); });
  const note = kit.h("p", { class: "bench-verdict" });
  body.append(cv.box, ch.el, note);

  cv.onDraw((ctx, w, hh, p) => {
    const s = SCENARIOS[idx];
    ctx.textAlign = "center";
    ctx.fillStyle = p.muted; ctx.font = "700 13px Nunito, system-ui, sans-serif";
    ctx.fillText("data structure", w / 2, hh * 0.22);
    ctx.fillStyle = p.ink; ctx.font = "800 18px Nunito, system-ui, sans-serif";
    ctx.fillText(s.structure, w / 2, hh * 0.22 + 24);
    ctx.fillStyle = p.muted; ctx.font = "700 13px Nunito, system-ui, sans-serif";
    ctx.fillText("↓", w / 2, hh * 0.5);
    ctx.fillStyle = p.accent; ctx.font = "800 18px Nunito, system-ui, sans-serif";
    ctx.fillText(s.pick, w / 2, hh * 0.68);
  });

  function update() {
    note.textContent = SCENARIOS[idx].reason;
    say(SCENARIOS[idx].reason);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
