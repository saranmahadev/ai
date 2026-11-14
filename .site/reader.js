// The reading experience for a lesson page: the reading line, "On this page" scroll-spy, text size, read and
// progress tracking, resume position, link previews, key-term popovers and a selection bar.
// Everything is local: preferences, progress and positions live in localStorage.

const PREFS_KEY = "ai-base-reader";
const SIZES = [17, 18, 20, 22, 24];
const DEFAULTS = { size: 2 };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "class") el.className = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  return el;
}

// lessons you have read: reaching the end (>= 90%) marks one, and so does the "Mark as read" button
const READ_KEY = "ai-base-read";
export function readSet() {
  try { const a = JSON.parse(localStorage.getItem(READ_KEY) || "[]"); return new Set(Array.isArray(a) ? a : []); } catch { return new Set(); }
}
export function markRead(id) {
  try { const s = readSet(); if (s.has(id)) return; s.add(id); localStorage.setItem(READ_KEY, JSON.stringify([...s])); } catch { /* private mode */ }
}
export function markUnread(id) {
  try {
    const s = readSet(); s.delete(id); localStorage.setItem(READ_KEY, JSON.stringify([...s]));
    const m = progressMap(); delete m[id]; localStorage.setItem(PROGRESS_KEY, JSON.stringify(m));
    localStorage.removeItem("ai-base-pos:" + id);
  } catch { /* private mode */ }
}

// how far into each lesson you have scrolled, 0-1: the furthest point reached, even if you scroll back up
const PROGRESS_KEY = "ai-base-progress";
export function progressMap() {
  try { const m = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}"); return m && typeof m === "object" && !Array.isArray(m) ? m : {}; } catch { return {}; }
}
export function progressFor(id) { return progressMap()[id] || 0; }
function saveProgress(id, f) {
  try {
    const m = progressMap(), cur = m[id] || 0, next = Math.round(Math.min(1, Math.max(0, f)) * 100) / 100;
    if (next > cur) { m[id] = next; localStorage.setItem(PROGRESS_KEY, JSON.stringify(m)); }
  } catch { /* private mode */ }
}

export function loadPrefs() {
  try { const p = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") }; return { size: clamp(+p.size || 0, 0, SIZES.length - 1) }; } catch { return { ...DEFAULTS }; }
}
function savePrefs(p) { try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch { /* private mode */ } }
export function applyPrefs(p = loadPrefs()) {
  document.documentElement.style.setProperty("--prose-size", SIZES[p.size] + "px");
}

export function mountReader({ page, topic, content, reduce, onRead }) {
  const prose = page.querySelector(".prose");
  if (!prose) return () => {};
  const heads = [...prose.querySelectorAll("h2,h3")].filter((x) => x.id);
  const smooth = reduce ? "auto" : "smooth";
  const cleanups = [];
  const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); cleanups.push(() => t.removeEventListener(ev, fn, opt)); };
  const mounted = [];
  const add = (el) => { document.body.append(el); mounted.push(el); return el; };
  const tocLinks = [...page.querySelectorAll(".lesson-toc a[data-scroll]")];

  // ---------- text size
  let prefs = loadPrefs();
  applyPrefs(prefs);
  const sizeBtns = [...page.querySelectorAll(".textsize [data-size]")];
  const syncSize = () => sizeBtns.forEach((b) => { b.disabled = +b.dataset.size < 0 ? prefs.size <= 0 : prefs.size >= SIZES.length - 1; });
  sizeBtns.forEach((b) => on(b, "click", () => { prefs = { size: clamp(prefs.size + +b.dataset.size, 0, SIZES.length - 1) }; savePrefs(prefs); applyPrefs(prefs); syncSize(); }));
  syncSize();

  // ---------- reading line, scroll-spy, read and progress tracking
  const line = document.getElementById("readline");
  let raf = 0, lastSave = 0, marked = readSet().has(topic.id);
  const geom = () => { const r = prose.getBoundingClientRect(); return { top: r.top + scrollY, H: Math.max(1, prose.offsetHeight) }; };
  const frac = () => { const { top, H } = geom(); return clamp((scrollY + innerHeight * 0.4 - top) / H, 0, 1); };
  function tick() {
    const f = frac();
    if (line) { line.style.transform = `scaleX(${f})`; line.parentElement.setAttribute("aria-valuenow", Math.round(f * 100)); }
    if (f >= 0.9 && !marked && topic.status === "written") { marked = true; markRead(topic.id); if (onRead) onRead(topic.id); }
    let cur = null;
    for (const hd of heads) if (hd.getBoundingClientRect().top < 140) cur = hd.tagName === "H2" ? hd.id : cur;
    tocLinks.forEach((a) => a.classList.toggle("active", a.dataset.scroll === cur));
    hideTip();
    if (Date.now() - lastSave > 400) { lastSave = Date.now(); savePos(f); saveProgress(topic.id, f); }
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; tick(); }); };
  on(window, "scroll", onScroll, { passive: true });
  on(window, "resize", onScroll);

  // ---------- resume where you left off
  const posKey = "ai-base-pos:" + topic.id;
  function savePos(f) { try { if (f > 0.97) localStorage.removeItem(posKey); else if (f > 0.03) localStorage.setItem(posKey, f.toFixed(3)); } catch { /* ignore */ } }
  let saved = 0;
  try { saved = parseFloat(localStorage.getItem(posKey)) || 0; } catch { /* ignore */ }
  if (saved > 0.08 && saved < 0.95 && scrollY < 60) {
    const go = () => { const { top, H } = geom(); scrollTo({ top: top + saved * H - innerHeight * 0.4, behavior: smooth }); toast.remove(); };
    const toast = add(h("div", { class: "r-toast", role: "status" }, h("span", {}, `Continue from ${Math.round(saved * 100)}%?`), h("button", { type: "button", class: "r-btn", onclick: go }, "Continue"), h("button", { type: "button", class: "r-btn", onclick: () => toast.remove() }, "Start over")));
    const t = setTimeout(() => toast.remove(), 9000);
    cleanups.push(() => clearTimeout(t));
  }

  // ---------- previews for lesson links and key terms
  const tip = add(h("div", { id: "rtip", class: "r-tip", role: "tooltip", hidden: true }));
  let tipTimer = 0;
  const fine = matchMedia("(hover: hover)").matches;
  function hideTip() { clearTimeout(tipTimer); if (!tip.hidden) tip.hidden = true; }
  function showTip(target) {
    let html;
    if (target.matches("abbr.term")) html = `<b>${esc(target.dataset.term)}</b><p>${esc(target.dataset.def)}</p>`;
    else {
      const t = content.topics[target.dataset.topic];
      if (!t) return;
      html = `<b>${esc(t.title)}</b><p>${esc(t.summary || "Not written yet.")}</p>`;
    }
    tip.innerHTML = html; tip.hidden = false;
    const r = target.getBoundingClientRect(), pw = tip.offsetWidth, ph = tip.offsetHeight;
    tip.style.left = clamp(r.left + r.width / 2 - pw / 2, 12, innerWidth - pw - 12) + "px";
    tip.style.top = (r.top - ph - 10 < 12 ? r.bottom + 10 : r.top - ph - 10) + "px";
  }
  const tipTarget = (e) => e.target.closest && e.target.closest(".prose a[data-topic], abbr.term");
  on(page, "mouseover", (e) => { if (!fine) return; const t = tipTarget(e); if (!t) return; clearTimeout(tipTimer); tipTimer = setTimeout(() => showTip(t), 220); });
  on(page, "mouseout", (e) => { if (tipTarget(e)) hideTip(); });
  on(page, "focusin", (e) => { const t = tipTarget(e); if (t) showTip(t); });
  on(page, "focusout", hideTip);

  // underline each key term the first time it appears, before the "Key terms" section itself
  (function markTerms() {
    const gl = (topic.glossary || []).map((g) => ({ ...g, key: g.term.replace(/\s*\([^)]*\)/g, "").trim() })).filter((g) => g.key.length >= 4 && !/ or /.test(g.key));
    if (!gl.length) return;
    const stopAt = prose.querySelector("#key-terms");
    const skip = "a, h1, h2, h3, code, pre, details, abbr, .bench, .needs, table, blockquote.callout";
    const walk = document.createTreeWalker(prose, NodeFilter.SHOW_TEXT);
    const nodes = [];
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (stopAt && stopAt.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING) break;
      if (n.parentElement && n.parentElement.closest(skip)) continue;
      nodes.push(n);
    }
    for (const g of gl) {
      const re = new RegExp(`(^|[^\\w])(${g.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?![\\w])`, "i");
      for (let i = 0; i < nodes.length; i++) {
        const m = re.exec(nodes[i].nodeValue);
        if (!m) continue;
        const start = m.index + m[1].length, end = start + m[2].length, text = nodes[i].nodeValue;
        const abbr = h("abbr", { class: "term", tabindex: "0", "data-term": g.term, "data-def": g.def, "aria-description": g.def }, m[2]);
        const after = document.createTextNode(text.slice(end)), frag = document.createDocumentFragment();
        if (start > 0) frag.append(text.slice(0, start));
        frag.append(abbr, after);
        nodes[i].replaceWith(frag);
        nodes[i] = after;
        break;
      }
    }
  })();

  // ---------- selection bar: copy a quote, or a link to its section
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch {
      const ta = h("textarea", { style: "position:fixed;opacity:0" }); ta.value = text; document.body.append(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch { /* ignore */ } ta.remove(); return ok;
    }
  };
  const nearestHeading = (node) => { let hit = null; for (const hd of heads) if (hd.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) hit = hd; return hit; };
  let selText = "", selNode = null;
  const flash = (b, label) => { const old = b.textContent; b.textContent = label; setTimeout(() => { b.textContent = old; }, 1100); };
  const quoteBtn = h("button", { type: "button", class: "r-btn", onpointerdown: (e) => e.preventDefault(), onclick: async () => flash(quoteBtn, (await copy(`“${selText}”\n${topic.title}, AI Base\n${location.href.split("?")[0]}`)) ? "Copied" : "Copy failed") }, "Copy quote");
  const linkBtn = h("button", { type: "button", class: "r-btn", onpointerdown: (e) => e.preventDefault(), onclick: async () => {
    const hd = selNode && nearestHeading(selNode);
    flash(linkBtn, (await copy(`${location.origin}${location.pathname}#/${topic.id}${hd ? "?at=" + hd.id : ""}`)) ? "Copied" : "Copy failed");
  } }, "Copy link");
  const selBar = add(h("div", { id: "rsel", class: "r-sel", hidden: true }, quoteBtn, linkBtn));
  let selTimer = 0;
  on(document, "selectionchange", () => {
    clearTimeout(selTimer);
    selTimer = setTimeout(() => {
      const s = getSelection();
      if (!s || s.isCollapsed || !s.rangeCount) { selBar.hidden = true; return; }
      const range = s.getRangeAt(0), text = s.toString().trim();
      if (!prose.contains(range.commonAncestorContainer) || text.length < 8) { selBar.hidden = true; return; }
      selText = text.replace(/\s+/g, " "); selNode = range.startContainer;
      const r = range.getBoundingClientRect();
      selBar.hidden = false;
      const w = selBar.offsetWidth;
      selBar.style.left = clamp(r.left + r.width / 2 - w / 2, 8, innerWidth - w - 8) + "px";
      selBar.style.top = (r.top - 52 < 12 ? r.bottom + 10 : r.top - 52) + "px";
    }, 140);
  });

  tick();
  return () => {
    cleanups.forEach((c) => c());
    cancelAnimationFrame(raf);
    mounted.forEach((el) => el.remove());
    if (line) line.style.transform = "scaleX(0)";
  };
}
