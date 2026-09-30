// Bench: breadth-first and depth-first search exploring a grid you can draw walls on.
import { layout, makeSearch, paintWalls } from "./grid.js";
export default function mount(root, kit) {
  const { h, frame, canvas, choice, stepper, button, stats, live } = kit;
  const body = frame(root, {
    title: "Searching for a path"
  });
  const say = live(body);
  const ROWS = 10, COLS = 16, start = [4, 1], goal = [4, 14];
  const layouts = {
    open: () => new Set(),
    gap: () => new Set([0, 1, 2, 3, 4, 5, 6, 7, 9].map((r) => r + ",8")),
    zigzag: () => new Set([...[0, 1, 2, 3, 4, 5, 6, 7].map((r) => r + ",5"), ...[2, 3, 4, 5, 6, 7, 8, 9].map((r) => r + ",10")])
  };
  let walls = layouts.gap(), kind = "bfs", s = null;
  const pick = choice("Algorithm", [["bfs", "Breadth-first (BFS)"], ["dfs", "Depth-first (DFS)"]], kind, (k) => { kind = k; reset(); });
  const cv = canvas(body, { aspect: 0.62, label: "A grid maze with the search's explored cells, frontier and path" });
  const st = stats([["exp", "cells explored"], ["front", "frontier size"], ["len", "path length"]]);
  const out = h("p", { class: "bench-verdict" });
  const stp = stepper({ onStep: () => { if (!s) reset(); const more = s.step(); refresh(); return more; }, onReset: reset, interval: 90, stepLabel: "Step" });
  const presets = h("div", { class: "bench-row" },
    button("Wall with a gap", () => { walls = layouts.gap(); reset(); }), button("Open field", () => { walls = layouts.open(); reset(); }),
    button("Zig-zag walls", () => { walls = layouts.zigzag(); reset(); }), button("Clear my walls", () => { walls = new Set(); reset(); }));
  body.append(pick.el, cv.box, st.el, stp.el, presets);

  function reset() { s = makeSearch(kind, { rows: ROWS, cols: COLS, walls, start, goal }); out.textContent = "Nothing explored yet."; refresh(true); }
  cv.onDraw((ctx, W, H2, p) => {
    const L = layout(W, H2, ROWS, COLS), state = s ? s.state() : { closed: new Set(), frontier: new Set(), path: [] }, onPath = new Set(state.path.map((q) => q.join(",")));
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const k = r + "," + c;
      ctx.fillStyle = walls.has(k) ? p.muted : onPath.has(k) ? p.good : state.closed.has(k) ? p.soft : state.frontier.has(k) ? p.warm : p.white;
      ctx.globalAlpha = state.frontier.has(k) && !walls.has(k) ? 0.75 : 1;
      ctx.beginPath(); ctx.roundRect(L.ox + c * L.cell + 1.5, L.oy + r * L.cell + 1.5, L.cell - 3, L.cell - 3, 5); ctx.fill(); ctx.globalAlpha = 1;
    }
    for (const [pt, col] of [[start, p.accent], [goal, p.good]]) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(L.ox + pt[1] * L.cell + L.cell / 2, L.oy + pt[0] * L.cell + L.cell / 2, L.cell * 0.32, 0, 7); ctx.fill(); ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.stroke(); }
  });
  paintWalls(cv, { rows: ROWS, cols: COLS, walls, fixed: [start, goal], onChange: reset });
  function refresh(quiet) {
    const t = s.state();
    st.set("exp", String(t.expanded)); st.set("front", String(t.frontier.size)); st.set("len", t.found ? String(t.path.length - 1) : "—");
    if (t.done) out.textContent = t.found ? `Found a path of ${t.path.length - 1} steps after exploring ${t.expanded} cells.` : `No path exists: it explored ${t.expanded} cells and ran out of options.`;
    else if (!quiet) out.textContent = kind === "bfs" ? "BFS explores in rings: every cell one step away, then two steps away, and so on." : "DFS keeps going down one route as far as it can before backing up.";
    if (!quiet) say(out.textContent); cv.redraw();
  }
  reset();
  return () => { stp.stop(); cv.destroy(); };
}
