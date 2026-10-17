// Bench: compare KV cache size across standard multi-head, grouped-query and multi-query attention.
const D_MODEL = 512, HEAD_DIM = 64, NUM_LAYERS = 12;

function perTokenFloats(numKVHeads) { return 2 * numKVHeads * HEAD_DIM * NUM_LAYERS; }

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Shrinking what has to be cached" });
  const say = live(body);
  let numKVHeads = 8, seqLen = 2048;

  const cv = canvas(body, { aspect: 0.5, label: "KV cache size for the chosen sequence length" });
  const st = stats([["perToken", "floats per token"], ["total", "cache size for this sequence"]]);
  const slK = slider({ label: "num_kv_heads", min: 1, max: 8, step: 1, value: numKVHeads, format: (v) => String(v), onInput: (v) => { numKVHeads = v; update(); } });
  const slS = slider({ label: "sequence length", min: 64, max: 8192, step: 64, value: seqLen, format: (v) => v.toLocaleString(), onInput: (v) => { seqLen = v; update(); } });
  body.append(cv.box, st.el, slK.el, slS.el);

  cv.onDraw((ctx, w, hh, p) => {
    const options = [1, 2, 4, 8];
    const bw = w / (options.length + 1);
    const maxBytes = perTokenFloats(8) * seqLen * 4;
    options.forEach((k, i) => {
      const bytes = perTokenFloats(k) * seqLen * 4;
      const bh = (bytes / maxBytes) * (hh - 50);
      ctx.fillStyle = k === numKVHeads ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 30 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`${k} kv`, bw * (i + 0.5) + bw * 0.3, hh - 10);
      ctx.fillText(`${(bytes / 1e6).toFixed(1)}MB`, bw * (i + 0.5) + bw * 0.3, hh - 34 - bh);
    });
  });

  function update() {
    const perToken = perTokenFloats(numKVHeads);
    const totalBytes = perToken * seqLen * 4;
    st.set("perToken", perToken.toLocaleString());
    st.set("total", `${(totalBytes / 1e6).toFixed(2)} MB`);
    say(`${numKVHeads} KV heads: ${perToken.toLocaleString()} floats per token, ${(totalBytes / 1e6).toFixed(1)} MB for ${seqLen.toLocaleString()} tokens`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
