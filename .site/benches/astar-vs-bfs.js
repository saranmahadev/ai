// Bench: breadth-first, A* and greedy search compared on the same grid.
import { layout, makeSearch, paintWalls } from "./grid.js";
export default function mount(root, kit) {
  const { h, frame, canvas, choice, stepper, button, rng, live } = kit;
  const body = frame(root, {
    title: "A guess that saves work: BFS, A* and greedy",
    hint: "The table compares all three algorithms on the same grid. Animate one, and draw walls to change the problem."
  });
  const say = live(body);
  const ROWS = 11, COLS = 16, start = [5, 2], goal = [5, 13];
  const mk = {
    open: () => new Set(),
    gap: () => new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 10].map((r) => r + ",8")),
    rocks: () => { const r = rng(21), w = new Set(); for (let i = 0; i < ROWS; i++) for (let j = 0; j < COLS; j++) if (r() < 0.3 && !(i === start[0] && j === start[1]) && !(i === goal[0] && j === goal[1])) w.add(i + "," + j); return w; }
  };
  const NAMES = { bfs: "Breadth-first", astar: "A* (cost so far + guess)", greedy: "Greedy (guess only)" };
  let walls = mk.rocks(), kind = "astar", s = null;
  const pick = choice("Animate", Object.entries(NAMES), kind, (k) => { kind = k; reset(); });
  const cv = canvas(body, { aspect: 0.66, label: "Grid with walls and the explored cells of the chosen search" });
  const table = h("table", { class: "bench-table" });
  const out = h("p", { class: "bench-verdict" });
  const stp = stepper({ onStep: () => { const more = s.step(); refresh(); return more; }, onReset: reset, interval: 90 });
  const presets = h("div", { class: "bench-row" }, button("Scattered rocks", () => { walls = mk.rocks(); reset(); }), button("Wall with a gap", () => { walls = mk.gap(); reset(); }), button("Open field", () => { walls = mk.open(); reset(); }));
  body.append(pick.el, cv.box, table, out, stp.el, presets);

  function reset() { s = makeSearch(kind, { rows: ROWS, cols: COLS, walls, start, goal }); compare(); refresh(true); }
  function compare() {
    table.textContent = "";
    table.append(h("thead", {}, h("tr", {}, h("th", {}, "Algorithm"), h("th", {}, "cells explored"), h("th", {}, "path length"))));
    const rows = Object.keys(NAMES).map((k) => { const t = makeSearch(k, { rows: ROWS, cols: COLS, walls, start, goal }).runAll(); return [k, t]; });
    const shortest = Math.min(...rows.filter(([, t]) => t.found).map(([, t]) => t.path.length - 1));
    table.append(h("tbody", {}, ...rows.map(([k, t]) => h("tr", {}, h("th", {}, NAMES[k]), h("td", {}, String(t.expanded)), h("td", {}, t.found ? `${t.path.length - 1}${t.path.length - 1 > shortest ? " (not shortest)" : ""}` : "no path")))));
  }
  cv.onDraw((ctx, W, H2, p) => {
    const L = layout(W, H2, ROWS, COLS), t = s ? s.state() : { closed: new Set(), frontier: new Set(), path: [] }, onPath = new Set(t.path.map((q) => q.join(",")));
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const k = r + "," + c, wall = walls.has(k);
      ctx.fillStyle = wall ? p.muted : onPath.has(k) ? p.good : t.closed.has(k) ? p.soft : t.frontier.has(k) ? p.warm : p.white;
      ctx.beginPath(); ctx.roundRect(L.ox + c * L.cell + 1.5, L.oy + r * L.cell + 1.5, L.cell - 3, L.cell - 3, 5); ctx.fill();
    }
    for (const [pt, col] of [[start, p.accent], [goal, p.good]]) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(L.ox + pt[1] * L.cell + L.cell / 2, L.oy + pt[0] * L.cell + L.cell / 2, L.cell * 0.32, 0, 7); ctx.fill(); ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.stroke(); }
  });
  paintWalls(cv, { rows: ROWS, cols: COLS, walls, fixed: [start, goal], onChange: reset });
  function refresh(quiet) {
    const t = s.state();
    if (t.done) out.textContent = t.found ? `${NAMES[kind]} found a path of ${t.path.length - 1} steps after exploring ${t.expanded} cells.` : "No path exists.";
    else if (!quiet) out.textContent = kind === "bfs" ? "BFS has no idea where the goal is, so it spreads in every direction." : kind === "astar" ? "A* leans towards the goal but still counts how far it has come, so it stays honest." : "Greedy only looks at how close the goal seems, so it rushes ahead and can take a longer way round.";
    if (!quiet) say(out.textContent); cv.redraw();
  }
  reset();
  return () => { stp.stop(); cv.destroy(); };
}
