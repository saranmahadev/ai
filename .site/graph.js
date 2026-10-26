// Graph Mode: every topic in the vault and the links between them, as a navigable 2D map —
// the same idea as Obsidian's own graph view, scoped to this site: planet colour instead of folder
// colour, the status shapes already used for planet signposts (solid = written, ring = outlined,
// square = index) instead of a plain dot. Lazily imported only when `#/graph` is first visited
// (see main.js) — like scenes/*.js, it is not part of the precached PWA shell.

// ---------- data: pure, so it can be tested without a DOM
export function buildGraphData(content) {
  const nodes = [];
  for (const t of Object.values(content.topics)) {
    const degree = new Set([...(t.links || []), ...(t.backlinks || [])]).size;
    nodes.push({ id: t.id, title: t.title, planet: t.planet, status: t.status, degree });
  }
  const seen = new Set();
  const edges = [];
  for (const t of Object.values(content.topics)) {
    for (const other of t.links || []) {
      if (!content.topics[other] || other === t.id) continue;
      const key = t.id < other ? `${t.id}|${other}` : `${other}|${t.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ a: t.id, b: other });
    }
  }
  return { nodes, edges };
}

// deterministic PRNG so an uncached layout looks the same on every machine for the same content
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A node's base (unzoomed) draw radius, by its degree — small and fairly uniform, like Obsidian's own
// graph (a plain dot per note, only mildly bigger for a well-linked hub) rather than a chart-style bubble.
// Shared between the layout's own collision pass (so the physics knows each node's true footprint) and
// mountGraph's draw() below.
export function nodeRadius(degree) { return 2.5 + Math.min(6, Math.sqrt(degree) * 1.3); }

// A pure circle-packing pass (Gephi's "noverlap" idea, also what keeps Obsidian's own graph from ever
// showing two overlapping dots): push apart any pair of nodes closer than the sum of their radii, repeated
// until stable. Exported so a manual node drag (see mountGraph) can re-run just this step locally afterwards,
// instead of the full, much more expensive force-directed layout below.
export function declutterPositions(nodes, pos, iterations = 200, seed = 2) {
  const rng = mulberry32(seed);
  const pad = 2;
  for (let it = 0; it < iterations; it++) {
    let moved = false;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i].id, b = nodes[j].id, pa = pos[a], pb = pos[b];
        let dx = pa.x - pb.x, dy = pa.y - pb.y;
        let d = Math.hypot(dx, dy);
        const minD = nodeRadius(nodes[i].degree) + nodeRadius(nodes[j].degree) + pad;
        if (d >= minD) continue;
        if (d < 0.01) { dx = (rng() - 0.5) * 0.1; dy = (rng() - 0.5) * 0.1; d = 0.1; }
        const push = (minD - d) / 2, ux = dx / d, uy = dy / d;
        pa.x += ux * push; pa.y += uy * push;
        pb.x -= ux * push; pb.y -= uy * push;
        moved = true;
      }
    }
    if (!moved) break;
  }
}

// Fruchterman-Reingold force-directed layout for the overall shape (clusters pulled together by their
// edges, pushed apart otherwise), then declutterPositions above so no two nodes end up overlapping
// regardless of how dense a cluster gets — run once to a settled, static layout (no continuous physics
// afterwards — the result is cached by the caller, so this cost is paid once per content version).
export function layoutGraph(nodes, edges, { width = 2000, height = 1400, iterations = 110, declutterIterations = 200, seed = 1 } = {}) {
  const rng = mulberry32(seed);
  const idx = new Map(nodes.map((n, i) => [n.id, i]));
  const n = nodes.length;
  const px = new Float64Array(n), py = new Float64Array(n), fx = new Float64Array(n), fy = new Float64Array(n);
  for (let i = 0; i < n; i++) { px[i] = (rng() - 0.5) * width; py[i] = (rng() - 0.5) * height; }
  const adj = edges.map((e) => [idx.get(e.a), idx.get(e.b)]).filter(([a, b]) => a !== undefined && b !== undefined);
  const k = Math.sqrt((width * height) / Math.max(1, n)) * 1.6; // generous breathing room — Obsidian's graph is airy, not packed
  let temp = width / 10;
  for (let it = 0; it < iterations; it++) {
    fx.fill(0); fy.fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let dx = px[i] - px[j], dy = py[i] - py[j];
        let d2 = dx * dx + dy * dy;
        if (d2 < 0.01) { dx = (rng() - 0.5) * 0.1; dy = (rng() - 0.5) * 0.1; d2 = 0.01; }
        const d = Math.sqrt(d2), force = (k * k) / d;
        const ux = dx / d, uy = dy / d;
        fx[i] += ux * force; fy[i] += uy * force;
        fx[j] -= ux * force; fy[j] -= uy * force;
      }
    }
    for (const [a, b] of adj) {
      let dx = px[a] - px[b], dy = py[a] - py[b];
      const d = Math.max(0.01, Math.hypot(dx, dy)), force = (d * d) / k;
      const ux = dx / d, uy = dy / d;
      fx[a] -= ux * force; fy[a] -= uy * force;
      fx[b] += ux * force; fy[b] += uy * force;
    }
    for (let i = 0; i < n; i++) {
      fx[i] -= px[i] * 0.012; fy[i] -= py[i] * 0.012; // gentle pull to centre so isolated nodes don't drift off
      const disp = Math.hypot(fx[i], fy[i]) || 1, lim = Math.min(disp, temp);
      px[i] += (fx[i] / disp) * lim; py[i] += (fy[i] / disp) * lim;
    }
    temp *= 0.94;
  }
  const pos = {};
  for (let i = 0; i < n; i++) pos[nodes[i].id] = { x: px[i], y: py[i] };
  declutterPositions(nodes, pos, declutterIterations);
  return pos;
}

const cssVar = (name, fallback) => (getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback);
const LAYOUT_VERSION = "v3"; // bump to invalidate every cached ai-base-graph-layout when the algorithm changes

// ---------- mount: canvas render + pan/zoom/hover/click/filter/search
export function mountGraph(root, { nodes, edges }, { content, reduceMotion = false, onOpen, cacheKey } = {}) {
  const canvas = root.querySelector("#graphcanvas");
  const ctx = canvas.getContext("2d");
  const statusEl = root.querySelector("#gstatus");
  const countEl = root.querySelector("#gcount");
  const legendEl = root.querySelector("#glegend");
  const searchEl = root.querySelector("#gsearch");
  const resetBtn = root.querySelector("#greset");
  const toggleBtn = root.querySelector("#gctltoggle");
  const panel = root.querySelector("#gpanel");

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const planetOf = (id) => content.planets.find((p) => p.id === id);
  const neutral = () => cssVar("--muted", "#8a84ad");

  let pos = {};
  let view = { x: 0, y: 0, scale: 1 };
  const hiddenPlanets = new Set();
  let hoverId = null;
  let query = "";
  let matchIds = null; // Set of ids matching the search, or null when no search is active
  let dpr = 1;
  const screenPos = new Map(); // id -> { x, y, r } from the last draw, used for hit-testing

  function resize() {
    const rect = root.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    draw();
  }

  function worldToScreen(x, y) {
    const w = canvas.width / dpr, h = canvas.height / dpr;
    return { x: (x - view.x) * view.scale + w / 2, y: (y - view.y) * view.scale + h / 2 };
  }
  function screenToWorld(sx, sy) {
    const w = canvas.width / dpr, h = canvas.height / dpr;
    return { x: (sx - w / 2) / view.scale + view.x, y: (sy - h / 2) / view.scale + view.y };
  }

  function fitView(animated = true) {
    const xs = nodes.map((n) => pos[n.id].x), ys = nodes.map((n) => pos[n.id].y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const w = canvas.width / dpr, h = canvas.height / dpr;
    const spanX = Math.max(1, maxX - minX), spanY = Math.max(1, maxY - minY);
    const scale = Math.min(w / (spanX * 1.15), h / (spanY * 1.15), 2.5);
    setView({ x: (minX + maxX) / 2, y: (minY + maxY) / 2, scale }, animated);
  }

  function setView(next, animated) {
    if (reduceMotion || !animated) { view = { ...next }; draw(); return; }
    const from = { ...view };
    const dur = 320, t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      view = { x: from.x + (next.x - from.x) * e, y: from.y + (next.y - from.y) * e, scale: from.scale + (next.scale - from.scale) * e };
      draw();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const radiusOf = (n) => nodeRadius(n.degree);

  function draw() {
    const w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = cssVar("--clay", "#f7f2ff");
    ctx.fillRect(0, 0, w, h);

    const inkColor = cssVar("--ink", "#2f2a4a");
    const restColor = cssVar("--muted", "#8a84ad"); // resting edges: faint and low-contrast, like Obsidian's own thin gray lines
    const activeId = draggedId || hoverId;
    const highlightActive = activeId || matchIds;

    // edges — barely-there at rest so 2500+ of them read as soft connective tissue, not a hairball;
    // only the hovered/dragged node's own edges (or a search match) pop to full contrast.
    ctx.lineWidth = 1;
    for (const e of edges) {
      const na = byId.get(e.a), nb = byId.get(e.b);
      if (!na || !nb) continue;
      const dimmed = hiddenPlanets.has(na.planet) || hiddenPlanets.has(nb.planet);
      const touches = activeId && (e.a === activeId || e.b === activeId);
      const inMatch = matchIds && matchIds.has(e.a) && matchIds.has(e.b);
      const pa = worldToScreen(pos[e.a].x, pos[e.a].y), pb = worldToScreen(pos[e.b].x, pos[e.b].y);
      let alpha = dimmed ? 0.03 : 0.08;
      ctx.strokeStyle = restColor;
      if (touches || inMatch) { alpha = 0.7; ctx.strokeStyle = inkColor; }
      else if (highlightActive) alpha = dimmed ? 0.015 : 0.025;
      ctx.globalAlpha = alpha;
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    screenPos.clear();
    const showLabels = view.scale > 1.15 || activeId || matchIds;
    for (const node of nodes) {
      const p = worldToScreen(pos[node.id].x, pos[node.id].y);
      const r = radiusOf(node) * Math.min(1.5, Math.max(0.6, view.scale));
      screenPos.set(node.id, { x: p.x, y: p.y, r: Math.max(r, 6) });
      const dimmed = hiddenPlanets.has(node.planet);
      const isActive = node.id === activeId;
      const isMatch = matchIds && matchIds.has(node.id);
      const planet = node.planet && planetOf(node.planet);
      const color = planet ? planet.color : neutral();
      let alpha = dimmed ? 0.12 : 1;
      if (highlightActive && !isActive && !isMatch) alpha = dimmed ? 0.04 : 0.14; // Obsidian-style spotlight: fade almost everything else away

      ctx.globalAlpha = alpha;
      if (isActive || isMatch) {
        ctx.save();
        ctx.shadowColor = color; ctx.shadowBlur = reduceMotion ? 0 : 14;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      if (node.status === "index") {
        ctx.rect(p.x - r * 0.8, p.y - r * 0.8, r * 1.6, r * 1.6);
      } else {
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      }
      if (node.status === "outlined") {
        ctx.lineWidth = 1.5; ctx.strokeStyle = color; ctx.stroke();
      } else {
        ctx.fillStyle = color; ctx.fill();
      }
      if (showLabels && (isActive || isMatch || view.scale > 1.6)) {
        ctx.globalAlpha = 1;
        ctx.font = `${isActive ? "700" : "600"} 12px var(--font, sans-serif)`;
        ctx.fillStyle = inkColor;
        ctx.fillText(node.title, p.x + r + 5, p.y + 4);
      }
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ---------- interaction: pan the canvas from empty space, drag an individual node from on top of
  // one (Obsidian lets you pick up and reposition a note's dot; everything else just pans), hover, click.
  let panning = false, draggedId = null, lastX = 0, lastY = 0, moved = false;
  function nodeAt(sx, sy) {
    let best = null, bestD = Infinity;
    for (const [id, s] of screenPos) {
      const d = Math.hypot(sx - s.x, sy - s.y);
      if (d < s.r + 4 && d < bestD) { bestD = d; best = id; }
    }
    return best;
  }
  function persistPos() {
    try { localStorage.setItem("ai-base-graph-layout", JSON.stringify({ key: fullCacheKey, pos })); } catch { /* ignore */ }
  }
  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const hit = nodeAt(e.clientX - rect.left, e.clientY - rect.top);
    moved = false; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    if (hit) { draggedId = hit; hoverId = hit; } else { panning = true; }
  });
  canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    if (draggedId) {
      if (Math.hypot(e.clientX - lastX, e.clientY - lastY) > 1) moved = true;
      const w = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      pos[draggedId].x = w.x; pos[draggedId].y = w.y;
      draw();
      return;
    }
    if (panning) {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (Math.hypot(dx, dy) > 2) moved = true;
      view.x -= dx / view.scale; view.y -= dy / view.scale;
      lastX = e.clientX; lastY = e.clientY;
      draw();
      return;
    }
    const best = nodeAt(e.clientX - rect.left, e.clientY - rect.top);
    if (best !== hoverId) { hoverId = best; draw(); }
  });
  const endDrag = (e) => {
    if (draggedId) {
      if (moved) { declutterPositions(nodes, pos, 20); persistPos(); draw(); }
      else if (onOpen) onOpen(draggedId);
      draggedId = null;
    } else if (panning && !moved && hoverId && onOpen) {
      onOpen(hoverId);
    }
    panning = false;
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", () => { draggedId = null; panning = false; });
  canvas.addEventListener("pointerleave", () => { if (!draggedId && !panning) { hoverId = null; draw(); } });
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const before = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const next = Math.min(3.5, Math.max(0.12, view.scale * Math.pow(1.0015, -e.deltaY)));
    view.scale = next;
    const after = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    view.x += before.x - after.x; view.y += before.y - after.y;
    draw();
  }, { passive: false });

  // ---------- legend + filters
  function renderLegend() {
    const used = new Set(nodes.map((n) => n.planet).filter(Boolean));
    legendEl.innerHTML = content.planets.filter((p) => used.has(p.id)).map((p) => `
      <label class="gleg-item" style="--c:${p.color}">
        <input type="checkbox" data-planet="${p.id}" ${hiddenPlanets.has(p.id) ? "" : "checked"}>
        <span class="gleg-dot" aria-hidden="true"></span>${p.title}
      </label>`).join("");
  }
  legendEl.addEventListener("change", (e) => {
    const cb = e.target.closest("input[data-planet]");
    if (!cb) return;
    if (cb.checked) hiddenPlanets.delete(cb.dataset.planet); else hiddenPlanets.add(cb.dataset.planet);
    draw();
  });
  if (toggleBtn && panel) {
    toggleBtn.addEventListener("click", () => {
      const open = panel.hidden;
      panel.hidden = !open;
      toggleBtn.setAttribute("aria-expanded", String(open));
    });
  }
  if (resetBtn) resetBtn.addEventListener("click", () => fitView(true));

  // ---------- search: highlights matches, Enter opens a single match
  if (searchEl) {
    searchEl.addEventListener("input", () => {
      query = searchEl.value.trim().toLowerCase();
      matchIds = query ? new Set(nodes.filter((n) => n.title.toLowerCase().includes(query)).map((n) => n.id)) : null;
      draw();
    });
    searchEl.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || !matchIds || matchIds.size !== 1) return;
      onOpen && onOpen([...matchIds][0]);
    });
  }

  const ro = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(root); else window.addEventListener("resize", resize);

  // ---------- layout: cached per content version so a repeat visit renders instantly
  // (LAYOUT_VERSION invalidates any cache from before a layout-algorithm change, independent of content)
  const fullCacheKey = `${cacheKey}|${LAYOUT_VERSION}`;
  function computeAndRender() {
    const rect = root.getBoundingClientRect();
    let cached = null;
    try {
      const raw = localStorage.getItem("ai-base-graph-layout");
      if (raw) { const parsed = JSON.parse(raw); if (parsed.key === fullCacheKey) cached = parsed.pos; }
    } catch { /* ignore */ }
    if (cached) { pos = cached; }
    else { pos = layoutGraph(nodes, edges, { width: Math.max(1200, rect.width * 1.4), height: Math.max(900, rect.height * 1.4) }); persistPos(); }
    if (statusEl) statusEl.hidden = true;
    if (countEl) countEl.textContent = `${nodes.length} topics · ${edges.length} connections`;
    renderLegend();
    resize();
    fitView(false);
  }
  if (statusEl) statusEl.hidden = false;
  requestAnimationFrame(computeAndRender);

  return {
    destroy() { if (ro) ro.disconnect(); else window.removeEventListener("resize", resize); },
    resize,
    debug: { nodes, edges, screenPosOf: (id) => screenPos.get(id), toggleHiddenPlanets: hiddenPlanets },
  };
}
