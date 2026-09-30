// Shared toolkit for benches: tiny DOM helper, themed canvas, sliders, readouts, drag handles.
// A bench module is `export default function mount(root, kit) { ...; return cleanup; }`.
// Benches simulate, they never hold knowledge: the explanation lives in the note.

export const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  return el;
}

/** Colours that follow the time-of-day theme (read from CSS variables at draw time). */
export function palette(el = document.documentElement) {
  const cs = getComputedStyle(el);
  const v = (n) => cs.getPropertyValue(n).trim();
  return {
    ink: v("--ink"), muted: v("--muted"), accent: v("--accent"), soft: v("--soft"), soft2: v("--soft2"), white: v("--white"),
    planet: v("--c") || v("--accent"),
    warm: document.documentElement.classList.contains("night") ? "#ffb070" : "#e8793a",
    good: document.documentElement.classList.contains("night") ? "#8ff0c6" : "#17924f"
  };
}

export const fmt = (n, d = 2) => {
  if (!Number.isFinite(n)) return "—";
  let s = (Math.abs(n) < 0.5 * 10 ** -d ? 0 : n).toFixed(d);
  if (s.includes(".")) s = s.replace(/\.?0+$/, "");
  return s;
};

/** A DPR-aware canvas that calls `draw(ctx, w, h, pal)` on resize, theme change and `redraw()`. */
export function canvas(parent, { aspect = 0.6, label = "", maxH = 460 } = {}) {
  const cv = h("canvas", { role: "img", "aria-label": label });
  const box = h("div", { class: "bench-canvas" }, cv);
  parent.append(box);
  const ctx = cv.getContext("2d");
  let draw = () => {}, w = 0, hh = 0, raf = 0;
  const size = () => {
    w = Math.max(220, box.clientWidth);
    hh = Math.max(Math.min(240, maxH), Math.min(maxH, Math.round(w * aspect)));
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(w * dpr); cv.height = Math.round(hh * dpr);
    cv.style.height = hh + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  };
  const redraw = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { ctx.clearRect(0, 0, w, hh); draw(ctx, w, hh, palette(parent)); });
  };
  const ro = new ResizeObserver(size);
  ro.observe(box);
  const mo = new MutationObserver(redraw); // theme.js changes root style/class as the day goes by
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
  mo.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] }); // the reader can switch theme
  return {
    cv, box, ctx,
    get w() { return w; }, get h() { return hh; },
    onDraw(fn) { draw = fn; size(); },
    redraw,
    destroy() { ro.disconnect(); mo.disconnect(); cancelAnimationFrame(raf); }
  };
}

/** Labelled range input with a live value. */
export function slider({ label, min, max, step = 1, value, format = (v) => String(v), onInput }) {
  const out = h("output", { class: "bench-val" }, format(value));
  const input = h("input", { type: "range", min, max, step, value });
  const set = (v, silent) => { input.value = v; out.textContent = format(+input.value); if (!silent && onInput) onInput(+input.value); };
  input.addEventListener("input", () => { out.textContent = format(+input.value); if (onInput) onInput(+input.value); });
  const el = h("label", { class: "bench-slider" }, h("span", {}, label), input, out);
  return { el, input, get: () => +input.value, set };
}

export function button(text, onClick, { pressed } = {}) {
  const b = h("button", { type: "button", class: "bench-btn", onClick }, text);
  if (pressed != null) b.setAttribute("aria-pressed", String(pressed));
  return b;
}

/** A row of values, each with a small caption. `set(key, text)` updates one. */
export function stats(items) {
  const cells = {};
  const el = h("dl", { class: "bench-stats" });
  for (const [key, label] of items) {
    const dd = h("dd", {}, "—");
    cells[key] = dd;
    el.append(h("div", {}, h("dt", {}, label), dd));
  }
  return { el, set: (key, text) => { if (cells[key]) cells[key].textContent = text; } };
}

/** Polite screen-reader announcements for values that change while dragging. */
export function live(parent) {
  const el = h("div", { class: "sr-only", "aria-live": "polite" });
  parent.append(el);
  let t = 0;
  return (msg) => { clearTimeout(t); t = setTimeout(() => (el.textContent = msg), 400); };
}

/**
 * Pointer dragging for handles drawn on a canvas.
 * `handles()` returns [{x, y}] in CSS pixels; `onMove(index, x, y)` receives the pointer position.
 */
export function dragHandles(cv, handles, onMove, radius = 18) {
  let active = -1;
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const down = (e) => {
    const [x, y] = pos(e);
    let best = -1, bd = radius * radius;
    handles().forEach((p, i) => { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < bd) { bd = d; best = i; } });
    if (best < 0) return;
    active = best; cv.setPointerCapture(e.pointerId); e.preventDefault();
  };
  const move = (e) => {
    const [x, y] = pos(e);
    if (active >= 0) { onMove(active, x, y); return; }
    const near = handles().some((p) => (p.x - x) ** 2 + (p.y - y) ** 2 < radius * radius);
    cv.style.cursor = near ? "grab" : "default";
  };
  const up = () => { active = -1; };
  cv.style.touchAction = "none";
  cv.addEventListener("pointerdown", down);
  cv.addEventListener("pointermove", move);
  cv.addEventListener("pointerup", up);
  cv.addEventListener("pointercancel", up);
}

/**
 * Standard bench frame: a title, then two panes. Visuals (canvas, grids, sorters, tables, lists) go to the
 * stage; controls and readouts go to the panel. `body.append(...)` routes each node, so a bench just appends.
 * Mark any element with class "stage" to force it into the stage.
 */
export function frame(root, { title }) {
  root.textContent = "";
  root.classList.add("ready");
  const stage = h("div", { class: "bench-stage" }), panel = h("div", { class: "bench-panel" });
  const body = h("div", { class: "bench-layout" }, stage, panel);
  const STAGE = ".bench-canvas, .bench-two, .sorter, table, .stage, .bench-legend, .isai-list";
  body.append = (...nodes) => { for (const n of nodes.flat()) if (n != null) (n.nodeType === 1 && n.matches(STAGE) ? stage : panel).append(n); };
  root.append(h("div", { class: "bench-head" }, h("span", { class: "bench-tag" }, "Bench"), h("b", {}, title)), body);
  return body;
}

// ---------- shared helpers added for the AI Fundamentals benches

/** Small seeded random generator (mulberry32) so demos are reproducible. */
export function rng(seed = 1) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.int = (n) => Math.floor(next() * n);
  next.pick = (arr) => arr[next.int(arr.length)];
  next.chance = (p) => next() < p;
  next.shuffle = (arr) => { const o = arr.slice(); for (let i = o.length - 1; i > 0; i--) { const j = next.int(i + 1); [o[i], o[j]] = [o[j], o[i]]; } return o; };
  return next;
}

/** Labelled row of checkboxes. `onChange(values)` gets {key: boolean}. */
export function toggles(items, onChange) {
  const values = {};
  const inputs = {};
  const el = h("div", { class: "bench-toggles", role: "group" });
  for (const [key, label, on] of items) {
    values[key] = !!on;
    const input = h("input", { type: "checkbox" });
    input.checked = !!on;
    input.addEventListener("change", () => { values[key] = input.checked; onChange({ ...values }); });
    inputs[key] = input;
    el.append(h("label", { class: "bench-toggle" }, input, h("span", {}, label)));
  }
  return {
    el, get: () => ({ ...values }),
    set(next, silent) { for (const k of Object.keys(next)) { values[k] = !!next[k]; inputs[k].checked = !!next[k]; } if (!silent) onChange({ ...values }); }
  };
}

/** A segmented single-choice control. */
export function choice(label, options, value, onChange) {
  let cur = value;
  const btns = options.map(([key, text]) => h("button", { type: "button", class: "bench-btn", "aria-pressed": String(key === cur), onClick: () => set(key) }, text));
  const set = (key, silent) => { cur = key; options.forEach(([k], i) => btns[i].setAttribute("aria-pressed", String(k === cur))); if (!silent) onChange(cur); };
  const el = h("div", { class: "bench-choice", role: "group", "aria-label": label }, label ? h("span", { class: "bench-choice-label" }, label) : null, h("div", { class: "bench-row" }, btns));
  return { el, get: () => cur, set };
}

/**
 * Play / step / reset controls for step-through benches. Playing is always started by the reader and never automatic.
 * `onStep()` returns false when the run is finished (playback then stops).
 */
export function stepper({ onStep, onReset, interval = 500, stepLabel = "Step" }) {
  let timer = 0, speed = interval;
  const playBtn = h("button", { type: "button", class: "bench-btn", onClick: () => (timer ? pause() : play()) }, "Play");
  const stepBtn = h("button", { type: "button", class: "bench-btn", onClick: () => { pause(); onStep(); } }, stepLabel);
  const resetBtn = h("button", { type: "button", class: "bench-btn", onClick: () => { pause(); onReset(); } }, "Reset");
  const spd = slider({ label: "speed", min: 1, max: 5, step: 1, value: 3, format: (v) => ["slowest", "slow", "medium", "fast", "fastest"][v - 1], onInput: (v) => { speed = interval * [3, 1.8, 1, 0.5, 0.25][v - 1]; if (timer) { pause(); play(); } } });
  function tick() { if (onStep() === false) pause(); }
  function play() { playBtn.textContent = "Pause"; playBtn.setAttribute("aria-pressed", "true"); timer = setInterval(tick, speed); }
  function pause() { clearInterval(timer); timer = 0; playBtn.textContent = "Play"; playBtn.setAttribute("aria-pressed", "false"); }
  const el = h("div", { class: "bench-stepper" }, h("div", { class: "bench-row" }, stepBtn, playBtn, resetBtn), spd.el);
  return { el, stop: pause };
}

/** Collapsible answer: `reveal("Why?", "Because …")`. */
export function reveal(summary, text) {
  return h("details", { class: "bench-reveal" }, h("summary", {}, summary), h("p", {}, text));
}

/**
 * Sort items into bins. Works by click (select an item, then choose a bin) and by drag and drop.
 * items: [{id, label, why}], bins: [{id, label}], answers: {itemId: binId}.
 * Returns {el, reset, placed}. `onCheck({correct, total})` runs when the reader presses Check.
 */
export function sorter({ items, bins, answers, onCheck, checkLabel = "Check my answers" }) {
  const place = {}; // itemId -> binId | null
  items.forEach((i) => (place[i.id] = null));
  let selected = null, checked = false;
  const pool = h("div", { class: "sorter-pool", "aria-label": "Items to place" });
  const cols = h("div", { class: "sorter-bins" });
  const note = h("p", { class: "bench-verdict", "aria-live": "polite" });
  const checkBtn = h("button", { type: "button", class: "bench-btn", onClick: check }, checkLabel);
  const resetBtn = h("button", { type: "button", class: "bench-btn", onClick: reset }, "Start over");
  const el = h("div", { class: "sorter" }, pool, cols, h("div", { class: "bench-row" }, checkBtn, resetBtn), note);
  const binEls = {};
  for (const b of bins) {
    const list = h("div", { class: "sorter-list" });
    const btn = h("button", { type: "button", class: "sorter-bin-btn", onClick: () => { if (selected) { move(selected, b.id); } } }, b.label);
    const col = h("div", { class: "sorter-bin" }, btn, list);
    col.addEventListener("dragover", (e) => e.preventDefault());
    col.addEventListener("drop", (e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (place[id] !== undefined) move(id, b.id); });
    binEls[b.id] = list;
    cols.append(col);
  }
  pool.addEventListener("dragover", (e) => e.preventDefault());
  pool.addEventListener("drop", (e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (place[id] !== undefined) move(id, null); });

  function chip(item) {
    const b = h("button", { type: "button", class: "sorter-chip", draggable: "true", "aria-pressed": String(selected === item.id) }, item.label);
    b.addEventListener("click", () => { selected = selected === item.id ? null : item.id; draw(); });
    b.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", item.id); });
    if (checked && place[item.id]) {
      const ok = place[item.id] === answers[item.id];
      b.classList.add(ok ? "ok" : "bad");
      b.title = item.why || "";
    }
    return b;
  }
  function move(id, bin) { place[id] = bin; selected = null; checked = false; note.textContent = ""; draw(); }
  function draw() {
    pool.textContent = ""; Object.values(binEls).forEach((l) => (l.textContent = ""));
    for (const item of items) {
      const c = chip(item);
      if (place[item.id]) binEls[place[item.id]].append(c); else pool.append(c);
    }
    if (!pool.children.length) pool.append(h("span", { class: "sorter-empty" }, "Everything is placed. Check your answers."));
  }
  function check() {
    const unplaced = items.filter((i) => !place[i.id]).length;
    if (unplaced) { note.textContent = `Place the remaining ${unplaced} item${unplaced > 1 ? "s" : ""} first.`; return; }
    checked = true; draw();
    const correct = items.filter((i) => place[i.id] === answers[i.id]).length;
    const wrong = items.filter((i) => place[i.id] !== answers[i.id]);
    note.textContent = "";
    note.append(document.createTextNode(`${correct} of ${items.length} correct`));
    if (wrong.length) note.append(h("ul", { class: "sorter-misses" }, wrong.map((i) => h("li", {}, h("b", {}, i.label), ` ${i.why}`))));
    if (onCheck) onCheck({ correct, total: items.length });
  }
  function reset() { items.forEach((i) => (place[i.id] = null)); selected = null; checked = false; note.textContent = ""; draw(); }
  draw();
  return { el, reset, placed: () => ({ ...place }) };
}

/**
 * Data-space to pixel mapping for scatter and line plots.
 * `const m = plot(w, h, [xmin, xmax], [ymin, ymax])`, then m.X(x), m.Y(y), m.x(px), m.y(py); `m.axes(ctx, pal)` draws a frame.
 */
export function plot(w, hh, rx, ry, pad = { l: 44, r: 14, t: 14, b: 32 }) {
  const iw = w - pad.l - pad.r, ih = hh - pad.t - pad.b;
  const m = {
    pad, iw, ih,
    X: (x) => pad.l + ((x - rx[0]) / (rx[1] - rx[0])) * iw,
    Y: (y) => pad.t + ih - ((y - ry[0]) / (ry[1] - ry[0])) * ih,
    x: (px) => rx[0] + ((px - pad.l) / iw) * (rx[1] - rx[0]),
    y: (py) => ry[0] + ((pad.t + ih - py) / ih) * (ry[1] - ry[0]),
    axes(ctx, p, { xlabel = "", ylabel = "", ticks = 4 } = {}) {
      ctx.strokeStyle = p.muted; ctx.fillStyle = p.muted; ctx.lineWidth = 1.2; ctx.font = "700 11px Nunito, system-ui, sans-serif";
      ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, pad.t + ih); ctx.lineTo(pad.l + iw, pad.t + ih); ctx.stroke();
      ctx.textAlign = "center"; ctx.textBaseline = "top";
      for (let i = 0; i <= ticks; i++) { const v = rx[0] + ((rx[1] - rx[0]) * i) / ticks; ctx.fillText(fmt(v, 1), m.X(v), pad.t + ih + 4); }
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      for (let i = 0; i <= ticks; i++) { const v = ry[0] + ((ry[1] - ry[0]) * i) / ticks; ctx.fillText(fmt(v, 1), pad.l - 6, m.Y(v)); }
      ctx.fillStyle = p.ink; ctx.font = "800 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      if (xlabel) ctx.fillText(xlabel, pad.l + iw / 2, hh - 4);
      if (ylabel) { ctx.save(); ctx.translate(12, pad.t + ih / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(ylabel, 0, 0); ctx.restore(); }
    }
  };
  return m;
}
