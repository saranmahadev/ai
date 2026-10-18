// Bench: compare a plain LLM call's latency against the full RAG pipeline's, and see where the overhead actually sits.
export default function mount(root, kit) {
  const { frame, canvas, toggles, stats, live } = kit;
  const body = frame(root, { title: "Retrieval's overhead, next to the generation it feeds" });
  const say = live(body);
  let includeRerank = true;

  const PLAIN = 2500;
  const cv = canvas(body, { aspect: 0.4, label: "Total latency: plain LLM call vs. RAG pipeline" });
  const st = stats([["overhead", "RAG's added latency"]]);
  const tg = toggles([["rerank", "include re-ranking stage", includeRerank]], (v) => { includeRerank = v.rerank; update(); });
  body.append(cv.box, st.el, tg.el);

  function ragLatency() { return 15 + 20 + (includeRerank ? 80 : 0) + 5 + PLAIN; }

  cv.onDraw((ctx, w, hh, p) => {
    const RAG = ragLatency(), bw = w / 3, maxV = 15 + 20 + 80 + 5 + PLAIN;
    [["plain LLM call", PLAIN, p.warm], ["RAG pipeline", RAG, p.accent]].forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 30);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.3, hh - 2);
      ctx.fillText(`${v}ms`, bw * (i + 0.6) + bw * 0.3, hh - 15 - bh - 6);
    });
  });

  function update() {
    const RAG = ragLatency();
    st.set("overhead", `${RAG - PLAIN}ms (${(((RAG - PLAIN) / PLAIN) * 100).toFixed(1)}%)`);
    say(`plain LLM call ${PLAIN}ms, RAG pipeline ${RAG}ms, overhead ${RAG - PLAIN}ms (${(((RAG - PLAIN) / PLAIN) * 100).toFixed(1)} percent more)`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
