// Bench: trainable parameter count as more of a pretrained backbone is unfrozen for fine-tuning.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "How many parameters does adapting a model actually touch?" });
  const say = live(body);
  const BACKBONE_LAYERS = [50000, 80000, 120000, 200000, 350000]; // illustrative per-layer sizes, last layer closest to output
  const OUTPUT_LAYER = 512 * 3 + 3;
  let unfrozen = 0;

  const cv = canvas(body, { aspect: 0.5, label: "Trainable parameters as more backbone layers are unfrozen" });
  const st = stats([["total", "total trainable parameters"], ["layers", "backbone layers unfrozen"]]);
  const sl = slider({ label: "backbone layers unfrozen (from the output end)", min: 0, max: BACKBONE_LAYERS.length, step: 1, value: unfrozen, onInput: (v) => { unfrozen = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  function total() {
    const unfrozenParams = BACKBONE_LAYERS.slice(BACKBONE_LAYERS.length - unfrozen).reduce((a, b) => a + b, 0);
    return OUTPUT_LAYER + unfrozenParams;
  }

  cv.onDraw((ctx, w, hh, p) => {
    const maxTotal = OUTPUT_LAYER + BACKBONE_LAYERS.reduce((a, b) => a + b, 0);
    const t = total();
    const barH = (t / maxTotal) * (hh - 40);
    ctx.fillStyle = p.accent;
    ctx.fillRect(w * 0.3, hh - 24 - barH, w * 0.4, barH);
    ctx.fillStyle = p.ink; ctx.font = "800 16px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    ctx.fillText(t.toLocaleString(), w * 0.5, hh - 28 - barH);
    ctx.font = "700 12px Nunito, system-ui, sans-serif";
    ctx.fillText("trainable parameters", w * 0.5, hh - 6);
  });

  function update() {
    const t = total();
    st.set("total", t.toLocaleString());
    st.set("layers", `${unfrozen} of ${BACKBONE_LAYERS.length}`);
    say(`${t.toLocaleString()} trainable parameters with ${unfrozen} backbone layers unfrozen`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
