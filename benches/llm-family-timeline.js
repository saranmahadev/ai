// Bench: step through major LLM families and watch parameter counts and architecture choices evolve.
const MODELS = [
  { name: "BERT-base", year: 2018, params: 110e6, family: "encoder-only" },
  { name: "GPT-2", year: 2019, params: 1.5e9, family: "decoder-only" },
  { name: "T5-11B", year: 2019, params: 11e9, family: "encoder-decoder" },
  { name: "GPT-3", year: 2020, params: 175e9, family: "decoder-only" },
  { name: "Llama 2 70B", year: 2023, params: 70e9, family: "decoder-only" },
];

export default function mount(root, kit) {
  const { frame, canvas, stepper, stats, live } = kit;
  const body = frame(root, { title: "From millions to hundreds of billions" });
  const say = live(body);
  let shown = 1;

  const cv = canvas(body, { aspect: 0.45, label: "Parameter count by model (log scale)" });
  const st = stats([["model", "model"], ["params", "parameters"], ["family", "architecture family"]]);

  function report() {
    const m = MODELS[shown - 1];
    st.set("model", `${m.name} (${m.year})`);
    st.set("params", m.params.toExponential(2));
    st.set("family", m.family);
    say(`${m.name} (${m.year}): ${m.params.toExponential(2)} parameters, ${m.family}`);
    cv.redraw();
  }
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (MODELS.length + 1);
    const maxLog = Math.log10(MODELS[MODELS.length - 1].params);
    MODELS.forEach((m, i) => {
      const bh = (Math.log10(m.params) / maxLog) * (hh - 30);
      ctx.fillStyle = i < shown ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 8px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(m.name, bw * (i + 0.5) + bw * 0.3, hh - 2);
    });
  });
  const sp = stepper({
    stepLabel: "Next model",
    onStep: () => { if (shown >= MODELS.length) return false; shown++; report(); },
    onReset: () => { shown = 1; report(); },
  });
  body.append(cv.box, st.el, sp.el);
  report();
  return () => cv.destroy();
}
