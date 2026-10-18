// Bench: classify a retrieval's quality and watch which corrective action it triggers.
import { classifyRetrieval } from "./ragkit.js";

const SCENARIOS = {
  "good retrieval": [0.85, 0.3, 0.1],
  "weak retrieval": [0.45, 0.4, 0.2],
  "bad retrieval": [0.15, 0.1, 0.05],
};
const ACTIONS = { correct: "generate from retrieved context", ambiguous: "refine the query and retrieve again", incorrect: "fall back to a broader search" };

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "Checking the retrieval before trusting it" });
  const say = live(body);
  let scenario = Object.keys(SCENARIOS)[0];

  const list = h("ul", { class: "isai-list" });
  const st = stats([["verdict", "retrieval verdict"], ["action", "corrective action"]]);
  const ch = choice("Scenario", Object.keys(SCENARIOS).map((k) => [k, k]), scenario, (v) => { scenario = v; update(); });
  body.append(list, st.el, ch.el);

  function update() {
    const scores = SCENARIOS[scenario];
    const verdict = classifyRetrieval(scores);
    list.textContent = "";
    scores.forEach((s, i) => list.append(h("li", {}, `passage ${i + 1}: relevance ${s.toFixed(2)}`)));
    st.set("verdict", verdict);
    st.set("action", ACTIONS[verdict]);
    say(`${scenario}: best relevance ${Math.max(...scores).toFixed(2)}, verdict "${verdict}" -> ${ACTIONS[verdict]}`);
  }
  update();
  return () => {};
}
