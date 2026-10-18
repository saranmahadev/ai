// Bench: fuse a sparse ranking and a dense ranking with reciprocal rank fusion and see which candidates survive.
import { reciprocalRankFusion } from "./ragkit.js";

const SCENARIOS = {
  "C ranks last on both methods": { sparse: ["A", "B", "C"], dense: ["B", "A", "C"] },
  "C ranks first on both methods": { sparse: ["C", "A", "B"], dense: ["C", "B", "A"] },
};

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "Either method's top pick survives fusion" });
  const say = live(body);
  let scenario = Object.keys(SCENARIOS)[0];

  const list = h("ol", { class: "isai-list" });
  const st = stats([["sparse", "sparse ranking"], ["dense", "dense ranking"]]);
  const ch = choice("Scenario", Object.keys(SCENARIOS).map((k) => [k, k]), scenario, (v) => { scenario = v; update(); });
  body.append(list, st.el, ch.el);

  function update() {
    const { sparse, dense } = SCENARIOS[scenario];
    const fused = reciprocalRankFusion([sparse, dense]);
    list.textContent = "";
    fused.forEach(([doc, score]) => list.append(h("li", {}, `${doc}: fused score ${score.toFixed(5)}`)));
    st.set("sparse", sparse.join(" > "));
    st.set("dense", dense.join(" > "));
    say(`fused ranking: ${fused.map(([d, s]) => `${d} (${s.toFixed(5)})`).join(", ")}`);
  }
  update();
  return () => {};
}
