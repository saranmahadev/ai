// Bench: build up a transformer's total parameter count from its attention and feed-forward matrices.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Add up the matrices, layer by layer" });
  const say = live(body);
  let dModel = 768, numLayers = 12, dFF = 3072, vocabSize = 30522;

  const cv = canvas(body, { aspect: 0.5, label: "Parameter count by component" });
  const st = stats([["attn", "attention per layer"], ["ffn", "feed-forward per layer"], ["layers", "all layers total"], ["embed", "embedding table"], ["total", "grand total"]]);
  const slD = slider({ label: "d_model", min: 64, max: 2048, step: 64, value: dModel, format: (v) => String(v), onInput: (v) => { dModel = v; update(); } });
  const slL = slider({ label: "num_layers", min: 1, max: 48, step: 1, value: numLayers, format: (v) => String(v), onInput: (v) => { numLayers = v; update(); } });
  const slF = slider({ label: "d_ff", min: 64, max: 8192, step: 64, value: dFF, format: (v) => String(v), onInput: (v) => { dFF = v; update(); } });
  const slV = slider({ label: "vocabulary size", min: 1000, max: 60000, step: 1000, value: vocabSize, format: (v) => v.toLocaleString(), onInput: (v) => { vocabSize = v; update(); } });
  body.append(cv.box, st.el, slD.el, slL.el, slF.el, slV.el);

  cv.onDraw((ctx, w, hh, p) => {
    const attn = 4 * dModel * dModel, ffn = 2 * dModel * dFF;
    const layersTotal = (attn + ffn) * numLayers;
    const embed = vocabSize * dModel;
    const total = layersTotal + embed;
    const bars = [["attention (all layers)", attn * numLayers, p.accent], ["feed-forward (all layers)", ffn * numLayers, p.warm], ["embedding", embed, p.good]];
    const bw = w / (bars.length + 1);
    const maxV = Math.max(...bars.map((b) => b[1]), 1);
    bars.forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 60);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.5), hh - 30 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 0.5) + bw * 0.3, hh - 10);
      ctx.fillText((v / 1e6).toFixed(1) + "M", bw * (i + 0.5) + bw * 0.3, hh - 34 - bh);
    });
  });

  function update() {
    const attn = 4 * dModel * dModel, ffn = 2 * dModel * dFF;
    const perLayer = attn + ffn;
    const layersTotal = perLayer * numLayers;
    const embed = vocabSize * dModel;
    const total = layersTotal + embed;
    st.set("attn", attn.toLocaleString());
    st.set("ffn", ffn.toLocaleString());
    st.set("layers", layersTotal.toLocaleString());
    st.set("embed", embed.toLocaleString());
    st.set("total", `${total.toLocaleString()} (${(total / 1e6).toFixed(1)}M)`);
    say(`total ${(total / 1e6).toFixed(1)} million parameters`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
