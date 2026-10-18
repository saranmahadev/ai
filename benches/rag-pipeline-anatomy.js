// Bench: step through a RAG pipeline's stages on one toy query, from embedding to retrieval to a grounded answer.
import { cosineSim } from "./gakit.js";

const DOCS = {
  "refund timeline": [0.95, 0.05],
  "returns policy": [0.85, 0.15],
  "shipping times": [0.3, 0.2],
  "product warranty": [0.05, 0.95],
};
const QUERY_VEC = [0.9, 0.1];
const STAGES = ["query", "embed", "retrieve", "assemble", "generate"];

export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "One question, five stages" });
  const say = live(body);
  let stage = 0;

  const scored = Object.entries(DOCS).map(([name, vec]) => [name, cosineSim(QUERY_VEC, vec)]).sort((a, b) => b[1] - a[1]);
  const topTwo = scored.slice(0, 2);

  const list = h("ol", { class: "isai-list" });
  const st = stats([["stage", "current stage"]]);
  body.append(list, st.el);

  function describeStage(i) {
    if (i === 0) return `Query: "how long do refunds take" — the user's raw question, nothing retrieved yet.`;
    if (i === 1) return `Embed: the query becomes a vector [${QUERY_VEC.join(", ")}] in the same space as every document.`;
    if (i === 2) return `Retrieve: cosine similarity against all ${scored.length} documents — ${scored.map(([n, s]) => `"${n}" ${s.toFixed(3)}`).join(", ")}. Top 2 kept: ${topTwo.map((t) => `"${t[0]}"`).join(", ")}.`;
    if (i === 3) return `Assemble: the top 2 passages ("${topTwo[0][0]}", "${topTwo[1][0]}") are inserted into the prompt as context, ahead of the question.`;
    return `Generate: the model answers using only "${topTwo[0][0]}" and "${topTwo[1][0]}" — not "product warranty", which scored far lower (${scored[3][1].toFixed(3)}) and was never retrieved.`;
  }
  const stageText = STAGES.map((_, i) => describeStage(i));

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
