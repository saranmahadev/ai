// Bench: assign vectors to clusters and search only the query's nearest cluster instead of the whole collection.
import { nearestCentroid } from "./ragkit.js";

const CENTROIDS = { A: [0.123, 0.133], B: [0.823, 0.823], C: [0.125, 0.81] };
const VECTORS = {
  a1: [0.1, 0.1], a2: [0.15, 0.12], a3: [0.12, 0.18],
  b1: [0.8, 0.8], b2: [0.85, 0.82], b3: [0.82, 0.85],
  c1: [0.1, 0.8], c2: [0.15, 0.82],
};

export default function mount(root, kit) {
  const { frame, h, slider, stats, live } = kit;
  const body = frame(root, { title: "Narrow the search to one neighborhood first" });
  const say = live(body);
  let qx = 0.82, qy = 0.84;

  const list = h("ul", { class: "isai-list" });
  const st = stats([["cluster", "query's nearest cluster"], ["searched", "vectors actually searched"]]);
  const sx = slider({ label: "query x", min: 0, max: 1, step: 0.02, value: qx, format: (v) => v.toFixed(2), onInput: (v) => { qx = v; update(); } });
  const sy = slider({ label: "query y", min: 0, max: 1, step: 0.02, value: qy, format: (v) => v.toFixed(2), onInput: (v) => { qy = v; update(); } });
  body.append(list, st.el, sx.el, sy.el);

  function update() {
    const q = [qx, qy];
    const cluster = nearestCentroid(q, CENTROIDS);
    const assignments = Object.fromEntries(Object.entries(VECTORS).map(([k, v]) => [k, nearestCentroid(v, CENTROIDS)]));
    const members = Object.entries(assignments).filter(([, c]) => c === cluster).map(([k]) => k);
    list.textContent = "";
    Object.entries(assignments).forEach(([k, c]) => list.append(h("li", {}, `${k} → cluster ${c}${members.includes(k) ? "  (searched)" : ""}`)));
    st.set("cluster", cluster);
    st.set("searched", `${members.length} of ${Object.keys(VECTORS).length}`);
    say(`query falls in cluster ${cluster}: only ${members.length} of ${Object.keys(VECTORS).length} vectors need to be compared`);
  }
  update();
  return () => {};
}
