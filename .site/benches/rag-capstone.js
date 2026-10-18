// Capstone: step one question through retrieval, re-ranking, assembly and grounded generation, reusing this planet's own verified functions at each stage.
import { bestSupport } from "./ragkit.js";
import { cosineSim } from "./gakit.js";

const QUERY_VEC = [0.9, 0.1];
const DOCS = { "refund timeline": [0.95, 0.05], "returns policy": [0.85, 0.15], "shipping times": [0.3, 0.2], "product warranty": [0.05, 0.95] };
const TRUE_RELEVANCE = { "refund timeline": 0.97, "returns policy": 0.80 };
const STAGES = ["embed + retrieve", "re-rank", "assemble", "generate + cite"];

export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "One question, every stage of this road" });
  const say = live(body);
  let stage = 0;

  const list = h("ol", { class: "isai-list" });
  const st = stats([["stage", "current stage"]]);
  body.append(list, st.el);

  function computeStageText(i) {
    if (i === 0) {
      const ranked = Object.entries(DOCS).map(([n, v]) => [n, cosineSim(QUERY_VEC, v)]).sort((a, b) => b[1] - a[1]).slice(0, 2);
      return `Query "how long do refunds take" embedded and matched against ${Object.keys(DOCS).length} documents: top 2 by cosine similarity are "${ranked[0][0]}" (${ranked[0][1].toFixed(3)}) and "${ranked[1][0]}" (${ranked[1][1].toFixed(3)}).`;
    }
    if (i === 1) {
      const reranked = Object.entries(TRUE_RELEVANCE).sort((a, b) => b[1] - a[1]);
      return `A cross-encoder-style joint score re-ranks the shortlist: "${reranked[0][0]}" (${reranked[0][1]}) now clearly ahead of "${reranked[1][0]}" (${reranked[1][1]}).`;
    }
    if (i === 2) {
      return `Both passages are assembled at the edges of the context (positions 1 and 2 of 2) -- with only two passages, neither one falls in a lost-in-the-middle position.`;
    }
    const claimVec = [0.93, 0.07];
    const passages = { "refund timeline": [0.95, 0.05], "returns policy": [0.85, 0.15] };
    const [src, sim] = bestSupport(claimVec, passages);
    return `Generated answer: "Refunds take 5 business days." This claim is cited to "${src}" (similarity ${sim.toFixed(3)}) -- fully grounded in what was actually retrieved.`;
  }
  const stageText = STAGES.map((_, i) => computeStageText(i));

  function render() {
    list.textContent = "";
    for (let i = 0; i <= stage; i++) list.append(h("li", {}, `${STAGES[i]}: ${stageText[i]}`));
    st.set("stage", `${stage + 1} / ${STAGES.length} — ${STAGES[stage]}`);
    say(stageText[stage]);
  }
  const sp = stepper({
    stepLabel: "pipeline stage",
    onStep: () => {
      if (stage >= STAGES.length - 1) return false;
      stage++;
      render();
      return stage < STAGES.length - 1;
    },
    onReset: () => { stage = 0; render(); },
  });
  body.append(sp.el);
  render();
  return () => {};
}
