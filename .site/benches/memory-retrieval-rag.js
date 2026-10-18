// Bench: rank an agent's stored memories against the current query by cosine similarity, the same mechanism as retrieval on the RAG planet.
import { cosineSim } from "./gakit.js";

const MEM = [
  { id: "m1", label: "\"the user prefers metric units\"", v: [1, 0] },
  { id: "m2", label: "\"the user's deadline is Friday\"", v: [0, 1] },
  { id: "m3", label: "\"the user prefers metric units and works in kilometers\"", v: [1, 1] },
  { id: "m4", label: "\"the user prefers imperial units\"", v: [-1, 0] },
];
const QUERY = [0.8, 0.6];

export default function mount(root, kit) {
  const { frame, h, slider, stats, live } = kit;
  const body = frame(root, { title: "Pulling the right memory back out" });
  const say = live(body);
  let k = 2;

  const list = h("ul", { class: "isai-list" });
  const st = stats([["query", "current query"]]);
  const sK = slider({ label: "Memories retrieved (K)", min: 1, max: 4, step: 1, value: k, onInput: (v) => { k = v; update(); } });
  body.append(list, st.el, sK.el);

  function update() {
    const ranked = MEM.map((m) => ({ ...m, score: cosineSim(QUERY, m.v) })).sort((a, b) => b.score - a.score);
    st.set("query", "\"what units does the user want?\"");
    list.textContent = "";
    ranked.forEach((m, i) => {
      list.append(h("li", {}, `${i < k ? "✓ retrieved" : "— not retrieved"} (similarity ${m.score.toFixed(3)}) ${m.label}`));
    });
    say(`top ${k} memor${k === 1 ? "y" : "ies"} by cosine similarity: ${ranked.slice(0, k).map((m) => m.label).join("; ")}`);
  }
  update();
  return () => {};
}
