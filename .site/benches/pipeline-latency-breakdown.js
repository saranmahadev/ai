// Bench: see where a RAG request's total latency actually goes, stage by stage.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "One request, five stages, very unequal shares" });
  const say = live(body);
  let rerankShortlist = 50;

  const cv = canvas(body, { aspect: 0.45, label: "Latency contribution per stage" });
  const st = stats([["total", "total latency"]]);
  const sl = slider({ label: "re-rank shortlist size", min: 10, max: 200, step: 10, value: rerankShortlist, format: (v) => String(v), onInput: (v) => { rerankShortlist = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  function stages() {
    return { "embed query": 15, "vector search": 20, "re-rank": rerankShortlist * 1.6, "assemble context": 5, "generate (LLM call)": 2500 };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const STAGES = stages(), total = Object.values(STAGES).reduce((a, b) => a + b, 0);
    const bw = w / Object.keys(STAGES).length;
    Object.entries(STAGES).forEach(([name, ms], i) => {
      const bh = (ms / total) * (hh - 30);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.1), hh - 15 - bh, bw * 0.8, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 8px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`${ms.toFixed(0)}ms`, bw * (i + 0.1) + bw * 0.4, hh - 15 - bh - 6);
    });
  });

  function update() {
    const STAGES = stages(), total = Object.values(STAGES).reduce((a, b) => a + b, 0);
    st.set("total", `${total.toFixed(0)}ms`);
    say(`total latency ${total.toFixed(0)}ms: ${Object.entries(STAGES).map(([n, ms]) => `${n} ${ms.toFixed(0)}ms (${((ms / total) * 100).toFixed(1)}%)`).join(", ")}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
