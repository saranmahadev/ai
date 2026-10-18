// Bench: slide a model's own confidence and watch Self-RAG decide whether to retrieve at all, then whether to trust what it found.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Deciding whether to look something up at all" });
  const say = live(body);
  let confidence = 0.5, relevance = 0.5;

  const cv = canvas(body, { aspect: 0.4, label: "Retrieval decision and relevance check" });
  const st = stats([["retrieve", "retrieval decision"], ["use", "use the retrieved passage?"]]);
  const s1 = slider({ label: "model's own (parametric) confidence", min: 0, max: 1, step: 0.02, value: confidence, format: (v) => v.toFixed(2), onInput: (v) => { confidence = v; update(); } });
  const s2 = slider({ label: "retrieved passage's relevance score", min: 0, max: 1, step: 0.02, value: relevance, format: (v) => v.toFixed(2), onInput: (v) => { relevance = v; update(); } });
  body.append(cv.box, st.el, s1.el, s2.el);

  cv.onDraw((ctx, w, hh, p) => {
    const retrieveThreshold = 0.7, relevanceThreshold = 0.5;
    const willRetrieve = confidence < retrieveThreshold;
    ctx.fillStyle = p.soft; ctx.fillRect(10, hh * 0.3 - 12, w - 20, 24);
    ctx.fillStyle = willRetrieve ? p.accent : p.warm; ctx.fillRect(10, hh * 0.3 - 12, (w - 20) * confidence, 24);
    ctx.fillStyle = p.soft; ctx.fillRect(10, hh * 0.7 - 12, w - 20, 24);
    ctx.fillStyle = relevance >= relevanceThreshold ? p.accent : p.warm; ctx.fillRect(10, hh * 0.7 - 12, (w - 20) * relevance, 24);
  });

  function update() {
    const willRetrieve = confidence < 0.7;
    const useIt = relevance >= 0.5;
    st.set("retrieve", willRetrieve ? "retrieve first" : "answer directly, no retrieval");
    st.set("use", willRetrieve ? (useIt ? "use it" : "discard it, irrelevant") : "n/a (didn't retrieve)");
    say(`confidence ${confidence.toFixed(2)}: ${willRetrieve ? "retrieves first" : "answers directly"}. relevance ${relevance.toFixed(2)}: ${useIt ? "retrieved passage used" : "retrieved passage discarded"}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
