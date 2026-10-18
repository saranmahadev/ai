// Bench: compare a peer mesh's connectivity before and after one agent fails, against a star topology's single point of failure.
import { starEdges, meshEdges } from "./agentkit.js";

export default function mount(root, kit) {
  const { frame, h, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "One hub going down, or one peer going down" });
  const say = live(body);
  let n = 4, topology = "mesh";

  const list = h("ul", { class: "isai-list" });
  const st = stats([["before", "links before a failure"], ["after", "links among survivors"]]);
  const sN = slider({ label: "Agents", min: 3, max: 8, step: 1, value: n, onInput: (v) => { n = v; update(); } });
  const ch = choice("Topology", [["mesh", "peer mesh"], ["star", "supervisor (star)"]], topology, (v) => { topology = v; update(); });
  body.append(list, st.el, sN.el, ch.el);

  function update() {
    const before = topology === "mesh" ? meshEdges(n) : starEdges(n);
    const after = topology === "mesh" ? meshEdges(n - 1) : 0;
    st.set("before", String(before));
    st.set("after", String(after));
    list.textContent = "";
    if (topology === "mesh") {
      list.append(h("li", {}, `one peer fails: the other ${n - 1} agents keep all ${after} links among themselves`));
    } else {
      list.append(h("li", {}, `the supervisor fails: every one of the ${n} specialists loses its only link — 0 links remain`));
    }
    say(`${topology === "mesh" ? "peer mesh" : "star"}: ${before} links before a failure, ${after} links remain among the survivors`);
  }
  update();
  return () => {};
}
