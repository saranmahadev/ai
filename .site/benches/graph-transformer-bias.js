// Bench: compare a GNN-style adjacency mask against a graph transformer's full attention with a distance-based bias.
import { adjacencyMatrix, graphShortestPaths, alibiBias } from "./tfkit.js";

const N = 5;
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 4]];

export default function mount(root, kit) {
  const { frame, canvas, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "Full attention, with the graph's shape as a bias" });
  const say = live(body);
  let node = 0, slope = 0.5, mode = "GNN";

  const adj = adjacencyMatrix(N, EDGES);
  const dist = graphShortestPaths(adj);

  const cv = canvas(body, { aspect: 0.5, label: "What the chosen node can attend to, and how strongly" });
  const st = stats([["visible", "visible nodes"]]);
  const ch = choice("View", [["GNN", "GNN-style mask"], ["GT", "Graph transformer bias"]], mode, (v) => { mode = v; update(); });
  const slN = slider({ label: "node", min: 0, max: N - 1, step: 1, value: node, format: (v) => String(v), onInput: (v) => { node = v; update(); } });
  const slS = slider({ label: "bias slope", min: 0.1, max: 2, step: 0.1, value: slope, format: (v) => v.toFixed(1), onInput: (v) => { slope = v; update(); } });
  body.append(cv.box, st.el, ch.el, slN.el, slS.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (N + 1);
    for (let j = 0; j < N; j++) {
      let value;
      if (mode === "GNN") value = adj[node][j] ? 1 : 0;
      else value = Math.exp(alibiBias(slope, 0, dist[node][j]));
      const bh = value * (hh - 50);
      ctx.fillStyle = j === node ? p.ink : p.accent;
      ctx.fillRect(bw * (j + 0.5), hh - 24 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`n${j}`, bw * (j + 0.5) + bw * 0.3, hh - 8);
    }
  });

  function update() {
    const visible = mode === "GNN" ? adj[node].filter(Boolean).length : N;
    st.set("visible", `${visible} of ${N}`);
    say(`node ${node}, ${mode === "GNN" ? "GNN-style masking" : "graph transformer bias"}: ${visible} of ${N} nodes visible`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
