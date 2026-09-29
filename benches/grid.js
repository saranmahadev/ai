// Shared grid and search code for the Classic AI benches (not a bench itself).
export const DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]];

/** Parse preset layouts: '#' is a wall. */
export function parseLayout(rows) { const s = new Set(); rows.forEach((row, r) => [...row].forEach((ch, c) => ch === "#" && s.add(r + "," + c))); return s; }

/** Where cells sit on a canvas, and which cell a pixel is in. */
export function layout(w, h, rows, cols) {
  const cell = Math.min(w / cols, h / rows), ox = (w - cell * cols) / 2, oy = (h - cell * rows) / 2;
  return { cell, ox, oy, at: (px, py) => { const c = Math.floor((px - ox) / cell), r = Math.floor((py - oy) / cell); return r >= 0 && c >= 0 && r < rows && c < cols ? [r, c] : null; } };
}

/**
 * A stepwise graph search on a 4-connected grid with unit step costs.
 * kind: "bfs" | "dfs" | "astar" | "greedy". Call step() until state().done.
 */
export function makeSearch(kind, { rows, cols, walls, start, goal }) {
  const key = (r, c) => r * cols + c, hOf = (r, c) => Math.abs(r - goal[0]) + Math.abs(c - goal[1]);
  const open = [{ r: start[0], c: start[1], g: 0, n: 0 }], seen = new Set([key(...start)]), best = new Map([[key(...start), 0]]);
  const closed = new Set(), parent = new Map();
  let n = 1, expanded = 0, done = false, found = false, path = [];
  const free = (r, c) => r >= 0 && c >= 0 && r < rows && c < cols && !walls.has(r + "," + c);
  const pri = (e) => (kind === "astar" ? e.g + hOf(e.r, e.c) : hOf(e.r, e.c));
  function pop() {
    if (kind === "bfs") return open.shift();
    if (kind === "dfs") return open.pop();
    let bi = 0;
    for (let i = 1; i < open.length; i++) { const a = open[i], b = open[bi], d = pri(a) - pri(b); if (d < 0 || (d === 0 && (hOf(a.r, a.c) < hOf(b.r, b.c) || (hOf(a.r, a.c) === hOf(b.r, b.c) && a.n < b.n)))) bi = i; }
    return open.splice(bi, 1)[0];
  }
  function step() {
    if (done) return false;
    let cur;
    do { cur = open.length ? pop() : null; } while (cur && closed.has(key(cur.r, cur.c)));
    if (!cur) { done = true; return false; }
    closed.add(key(cur.r, cur.c)); expanded++;
    if (cur.r === goal[0] && cur.c === goal[1]) {
      found = done = true; path = []; let k = key(cur.r, cur.c);
      while (k !== undefined) { path.push([Math.floor(k / cols), k % cols]); k = parent.get(k); }
      path.reverse(); return false;
    }
    for (const [dr, dc] of DIRS) {
      const r = cur.r + dr, c = cur.c + dc, k = key(r, c);
      if (!free(r, c) || closed.has(k)) continue;
      const g = cur.g + 1;
      if (kind === "bfs" || kind === "dfs") { if (seen.has(k)) continue; seen.add(k); }
      else if (kind === "astar") { if (best.has(k) && best.get(k) <= g) continue; best.set(k, g); }
      else { if (seen.has(k)) continue; seen.add(k); }
      parent.set(k, key(cur.r, cur.c)); open.push({ r, c, g, n: n++ });
    }
    return true;
  }
  return {
    step,
    runAll() { let guard = 0; while (step() && guard++ < 100000); return this.state(); },
    state: () => ({ done, found, expanded, path, closed: new Set([...closed].map((k) => Math.floor(k / cols) + "," + (k % cols))), frontier: new Set(open.map((e) => e.r + "," + e.c)) })
  };
}

/** Click/drag to toggle walls on a grid canvas. `fixed` lists [r,c] cells that cannot change; `onChange()` runs after each edit. */
export function paintWalls(cvObj, { rows, cols, walls, fixed, onChange }) {
  const el = cvObj.cv; el.style.touchAction = "none";
  let paint = null;
  const isFixed = (c) => fixed.some((f) => f[0] === c[0] && f[1] === c[1]);
  const cellAt = (e) => { const r = el.getBoundingClientRect(); return layout(cvObj.w, cvObj.h, rows, cols).at(e.clientX - r.left, e.clientY - r.top); };
  const apply = (c) => { if (isFixed(c)) return; const k = c.join(","); if (paint) walls.add(k); else walls.delete(k); onChange(); };
  el.addEventListener("pointerdown", (e) => { const c = cellAt(e); if (!c || isFixed(c)) return; paint = !walls.has(c.join(",")); el.setPointerCapture(e.pointerId); apply(c); });
  el.addEventListener("pointermove", (e) => { if (paint === null) return; const c = cellAt(e); if (c) apply(c); });
  el.addEventListener("pointerup", () => (paint = null)); el.addEventListener("pointercancel", () => (paint = null));
}
