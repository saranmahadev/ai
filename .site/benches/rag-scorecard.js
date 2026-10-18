// Bench: compare two RAG systems' full metric scorecards and spot which pipeline stage is actually weak in each.
export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "The lowest score names the broken stage" });
  const say = live(body);
  let system = "A";

  const SYSTEMS = {
    A: { contextPrecision: 0.9, contextRecall: 0.85, faithfulness: 0.3, answerRelevancy: 0.9 },
    B: { contextPrecision: 0.4, contextRecall: 0.35, faithfulness: 0.9, answerRelevancy: 0.85 },
  };
  const STAGE = { contextPrecision: "retrieval", contextRecall: "retrieval", faithfulness: "generation", answerRelevancy: "generation" };

  const list = h("ul", { class: "isai-list" });
  const st = stats([["weakest", "weakest metric"], ["stage", "stage to fix"]]);
  const ch = choice("System", [["A", "System A"], ["B", "System B"]], system, (v) => { system = v; update(); });
  body.append(list, st.el, ch.el);

  function update() {
    const scores = SYSTEMS[system];
    const weakest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0];
    list.textContent = "";
    Object.entries(scores).forEach(([k, v]) => list.append(h("li", {}, `${k}: ${v.toFixed(2)}${k === weakest[0] ? "  ← weakest" : ""}`)));
    st.set("weakest", `${weakest[0]} (${weakest[1].toFixed(2)})`);
    st.set("stage", STAGE[weakest[0]]);
    say(`system ${system}: weakest metric is ${weakest[0]} at ${weakest[1].toFixed(2)}, pointing at the ${STAGE[weakest[0]]} stage`);
  }
  update();
  return () => {};
}
