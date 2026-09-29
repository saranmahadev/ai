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
    hh = Math.min(maxH, Math.round(w * aspect));
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

/** Standard bench frame: title, body and a short instruction line. */
export function frame(root, { title, hint }) {
  root.textContent = "";
  root.classList.add("ready");
  const body = h("div", { class: "bench-body" });
  root.append(h("div", { class: "bench-head" }, h("span", { class: "bench-tag" }, "Bench"), h("b", {}, title)), body);
  if (hint) root.append(h("p", { class: "bench-hint" }, hint));
  return body;
}
