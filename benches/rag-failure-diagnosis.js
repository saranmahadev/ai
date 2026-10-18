// Bench: pick a RAG failure symptom and see which stage and fix it actually points to.
const SYMPTOMS = {
  "retrieved a stale version of a fact": { stage: "retrieval (metadata)", fix: "add a freshness filter on retrieved chunks" },
  "returned far fewer results than requested": { stage: "retrieval (filtering)", fix: "pre-filter by metadata instead of post-filtering" },
  "missed a query using an exact product code": { stage: "retrieval (strategy)", fix: "add sparse retrieval or hybrid fusion alongside dense" },
  "generated a confident answer from irrelevant context": { stage: "generation (grounding)", fix: "add a relevance check before generating (Self-RAG / Corrective RAG)" },
  "question needs facts from two different documents": { stage: "retrieval (strategy)", fix: "use multi-hop or graph-based retrieval" },
  "answer doesn't actually use the retrieved context": { stage: "generation (faithfulness)", fix: "measure and enforce faithfulness before returning the answer" },
};

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "Every symptom points at one stage" });
  const say = live(body);
  let symptom = Object.keys(SYMPTOMS)[0];

  const st = stats([["stage", "likely stage"], ["fix", "likely fix"]]);
  const ch = choice("Symptom", Object.keys(SYMPTOMS).map((s) => [s, s]), symptom, (v) => { symptom = v; update(); });
  body.append(st.el, ch.el);

  function update() {
    const { stage, fix } = SYMPTOMS[symptom];
    st.set("stage", stage);
    st.set("fix", fix);
    say(`"${symptom}" points to ${stage}: ${fix}`);
  }
  update();
  return () => {};
}
