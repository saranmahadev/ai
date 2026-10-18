// Bench: step a greedy graph search toward a query and compare its comparison count against brute force.
import { greedyGraphSearch } from "./ragkit.js";

const NODES = {
  A: [0.05, 0.05], B: [0.1, 0.08], C: [0.08, 0.15], D: [0.2, 0.2], E: [0.25, 0.18],
  F: [0.4, 0.4], G: [0.45, 0.38], H: [0.5, 0.5], I: [0.6, 0.62], J: [0.65, 0.58],
  K: [0.8, 0.8], L: [0.85, 0.82], M: [0.9, 0.88], N: [0.95, 0.9], O: [0.88, 0.95],
};
const NAMES = Object.keys(NODES);
function euclid(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
const EDGES = {};
NAMES.forEach((n) => {
  const others = NAMES.filter((m) => m !== n).map((m) => [m, euclid(NODES[n], NODES[m])]).sort((a, b) => a[1] - b[1]);
  EDGES[n] = others.slice(0, 2).map((o) => o[0]);
});
EDGES.A.push("H"); EDGES.H.push("A", "N"); EDGES.N.push("H");
const QUERY = [0.95, 0.9];

export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "A shortcut path instead of checking everyone" });
  const say = live(body);
  let step = 0;

  const result = greedyGraphSearch(NODES, EDGES, QUERY, "A");
  const bruteForceComparisons = NAMES.length;

  const list = h("ol", { class: "isai-list" });
  const st = stats([["path", "nodes visited so far"], ["comparisons", "comparisons so far"]]);
  body.append(list, st.el);

  function render() {
    const shown = result.path.slice(0, step + 1);
    list.textContent = "";
    shown.forEach((n) => list.append(h("li", {}, `${n}  [${NODES[n].join(", ")}]  distance to query: ${euclid(QUERY, NODES[n]).toFixed(3)}`)));
    st.set("path", shown.join(" → "));
    st.set("comparisons", step < result.path.length - 1 ? "in progress" : `${result.comparisons} (vs. ${bruteForceComparisons} for brute force)`);
    say(`step ${step + 1}: at node ${shown[shown.length - 1]}`);
  }
  const sp = stepper({
    stepLabel: "search step",
    onStep: () => {
      if (step >= result.path.length - 1) return false;
      step++;
      render();
      return step < result.path.length - 1;
    },
    onReset: () => { step = 0; render(); },
  });
  body.append(sp.el);
  render();
  return () => {};
}
