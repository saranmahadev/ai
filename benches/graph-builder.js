// Bench: build a small graph and read degrees, connectivity and shortest paths.
import { dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, button, canvas, stats, dragHandles, live } = kit;
  const body = frame(root, { title: "Build a graph" });
  const say = live(body);
  const names = ["A", "B", "C", "D", "E", "F"], pos = names.map((_, i) => ({ x: 0.5 + 0.36 * Math.cos((i / 6) * Math.PI * 2 - Math.PI / 2), y: 0.5 + 0.36 * Math.sin((i / 6) * Math.PI * 2 - Math.PI / 2) }));
  const edges = new Set(["A-B", "A-C", "B-C", "C-D"]);
  let from = 0, to = 3, W = 300, H = 200;
  const sel = (label, get, set) => { const s = h("select", { "aria-label": label }, names.map((n, i) => h("option", { value: i }, n))); s.value = get(); s.addEventListener("change", () => { set(+s.value); update(); }); return h("label", { class: "bench-slider" }, h("span", {}, label), s); };
  const key = (a, b) => (a < b ? `${names[a]}-${names[b]}` : `${names[b]}-${names[a]}`);
  const cv = canvas(body, { aspect: 0.62, label: "A graph of six nodes with edges you can add or remove" });
  const st = stats([["deg", "degrees"], ["e", "edges"], ["sum", "sum of degrees"], ["con", "connected?"], ["path", "shortest path"]]);
  const toggle = button("Add or remove edge", () => { if (from === to) return; const k = key(from, to); edges.has(k) ? edges.delete(k) : edges.add(k); update(); });
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sel("from node", () => from, (v) => (from = v)), sel("to node", () => to, (v) => (to = v))), h("div", { class: "bench-row" }, toggle, button("Clear all edges", () => { edges.clear(); update(); })));
  const adj = () => names.map((_, i) => names.map((__, j) => (i !== j && edges.has(key(i, j)) ? j : -1)).filter((j) => j >= 0));
  const bfs = (s, t) => { const A = adj(), prev = new Array(6).fill(-2); prev[s] = -1; const q = [s]; while (q.length) { const u = q.shift(); for (const v of A[u]) if (prev[v] === -2) { prev[v] = u; q.push(v); } } if (prev[t] === -2) return null; const path = []; for (let u = t; u !== -1; u = prev[u]) path.unshift(u); return path; };
  cv.onDraw((ctx, w, hh, p) => {
    W = w; H = hh; const path = bfs(from, to), onPath = new Set(); if (path) for (let i = 0; i + 1 < path.length; i++) onPath.add(key(path[i], path[i + 1]));
    for (const e of edges) { const [a, b] = e.split("-").map((n) => names.indexOf(n)); ctx.strokeStyle = onPath.has(e) ? p.warm : p.muted; ctx.lineWidth = onPath.has(e) ? 5 : 2.5; ctx.beginPath(); ctx.moveTo(pos[a].x * w, pos[a].y * hh); ctx.lineTo(pos[b].x * w, pos[b].y * hh); ctx.stroke(); }
    names.forEach((n, i) => { const x = pos[i].x * w, y = pos[i].y * hh; dot(ctx, x, y, 17, i === from ? p.warm : i === to ? p.good : p.accent); ctx.fillStyle = p.white; ctx.font = "800 14px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText(n, x, y + 5); });
  });
  dragHandles(cv.cv, () => pos.map((q) => ({ x: q.x * W, y: q.y * H })), (i, px, py) => { pos[i].x = Math.max(0.05, Math.min(0.95, px / W)); pos[i].y = Math.max(0.08, Math.min(0.92, py / H)); cv.redraw(); }, 22);
  function update() {
    const A = adj(), deg = A.map((l) => l.length), seen = new Set([0]), q = [0]; while (q.length) { const u = q.shift(); for (const v of A[u]) if (!seen.has(v)) { seen.add(v); q.push(v); } }
    const path = bfs(from, to);
    st.set("deg", names.map((n, i) => `${n}:${deg[i]}`).join("  ")); st.set("e", String(edges.size)); st.set("sum", `${deg.reduce((a, b) => a + b, 0)} = 2 × ${edges.size}`); st.set("con", seen.size === 6 ? "yes" : `no (${seen.size} of 6 nodes reachable from A)`);
    st.set("path", path ? `${path.map((i) => names[i]).join(" – ")}  (${path.length - 1} edge${path.length === 2 ? "" : "s"})` : `none between ${names[from]} and ${names[to]}`);
    say(`${edges.size} edges`); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
