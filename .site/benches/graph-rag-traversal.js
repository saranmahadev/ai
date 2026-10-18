// Bench: step through a graph traversal that chains three relations no single document states together.
import { traverseGraph } from "./ragkit.js";

const EDGES = [["Movie X", "directed by", "Director Y"], ["Director Y", "works at", "Studio Z"], ["Studio Z", "produced", "Film A"]];

export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "A fact built from three separate edges" });
  const say = live(body);
  let hops = 0;

  const list = h("ol", { class: "isai-list" });
  const st = stats([["path", "path so far"]]);
  body.append(list, st.el);

  function render() {
    const path = traverseGraph(EDGES, "Movie X", hops);
    list.textContent = "";
    for (let i = 0; i < path.length; i += 2) {
      const entity = path[i], relation = path[i + 1];
      list.append(h("li", {}, relation ? `${entity} —[${relation}]→` : entity));
    }
    st.set("path", path.filter((_, i) => i % 2 === 0).join(" → "));
    say(`after ${hops} hop(s): ${path.filter((_, i) => i % 2 === 0).join(" then ")}`);
  }
  const sp = stepper({
    stepLabel: "graph hop",
    onStep: () => {
      if (hops >= EDGES.length) return false;
      hops++;
      render();
      return hops < EDGES.length;
    },
    onReset: () => { hops = 0; render(); },
  });
  body.append(sp.el);
  render();
  return () => {};
}
