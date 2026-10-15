// Bench: stack pruning and quantization reduction factors, showing each stage's resulting model size.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Stacking compression techniques" });
  const say = live(body);
  let original = 100, pruneFactor = 2, quantFactor = 4;

  const cv = canvas(body, { aspect: 0.45, label: "Model size after each compression stage" });
  const st = stats([["pruned", "size after pruning"], ["final", "size after pruning + quantization"], ["ratio", "combined reduction"]]);
  const so = slider({ label: "original size (MB)", min: 10, max: 500, step: 10, value: original, onInput: (v) => { original = v; update(); } });
  const sp = slider({ label: "pruning reduction factor", min: 1, max: 4, step: 0.5, value: pruneFactor, format: (v) => v.toFixed(1) + "×", onInput: (v) => { pruneFactor = v; update(); } });
  const sq = slider({ label: "quantization reduction factor", min: 1, max: 4, step: 0.5, value: quantFactor, format: (v) => v.toFixed(1) + "×", onInput: (v) => { quantFactor = v; update(); } });
  body.append(cv.box, st.el, so.el, sp.el, sq.el);

  cv.onDraw((ctx, w, hh, p) => {
    const afterPrune = original / pruneFactor;
    const afterQuant = afterPrune / quantFactor;
    const stages = [["original", original, p.muted], ["after pruning", afterPrune, p.accent], ["after quantization", afterQuant, p.good]];
    const bw = w / 4;
    const maxV = original;
    stages.forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 36);
      ctx.fillStyle = color; ctx.fillRect(bw * (i + 1) - bw * 0.3, hh - 20 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 1), hh - 4);
      ctx.fillText(`${v.toFixed(1)} MB`, bw * (i + 1), hh - 24 - bh);
    });
  });

  function update() {
    const afterPrune = original / pruneFactor;
    const afterQuant = afterPrune / quantFactor;
    st.set("pruned", `${afterPrune.toFixed(1)} MB`);
    st.set("final", `${afterQuant.toFixed(1)} MB`);
    st.set("ratio", `${(pruneFactor * quantFactor).toFixed(1)}×`);
    say(`final size ${afterQuant.toFixed(1)} MB, combined reduction ${(pruneFactor * quantFactor).toFixed(1)}x`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
