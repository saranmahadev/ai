// The reading experience for article pages: reader preferences, a floating bar with a "street strip" (a lamp per
// section, a small walker that moves as you read), settings, an outline drawer, resume position, link previews,
// key-term popovers and a selection bar. Everything is local: preferences and positions live in localStorage.

const PREFS_KEY = "ai-base-reader";
const SIZES = [17, 18, 20, 22, 24];
const DEFAULTS = { size: 2, font: "serif", theme: "auto" };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const STATUS = { written: "Written", outlined: "Outlined", index: "Index" };

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

export function loadPrefs() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") }; } catch { return { ...DEFAULTS }; }
}
function savePrefs(p) { try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch { /* private mode */ } }
export function applyPrefs(p = loadPrefs()) {
  const b = document.body;
  b.dataset.theme = p.theme;
  b.dataset.font = p.font;
  b.style.setProperty("--r-fs", SIZES[clamp(p.size, 0, SIZES.length - 1)] + "px");
}

export function mountReader({ art, topic, content, reduce }) {
  const prose = art.querySelector(".prose");
  if (!prose) return () => {};
  const heads = [...prose.querySelectorAll("h1,h2,h3")].filter((x) => x.id);
  const stops = heads.filter((x) => x.tagName !== "H3"); // one lamp per major section
  const smooth = reduce ? "auto" : "smooth";
  const cleanups = [];
  const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); cleanups.push(() => t.removeEventListener(ev, fn, opt)); };
  const mounted = [];
  const add = (el) => { document.body.append(el); mounted.push(el); return el; };
  let prefs = loadPrefs();
  applyPrefs(prefs);

  // ---------- the floating bar: outline button, street strip, time left, settings
  const lamps = stops.map((hd) => h("button", { class: "rb-lamp", type: "button", "aria-label": `Jump to ${hd.textContent}`, "data-title": hd.textContent, onclick: () => hd.scrollIntoView({ behavior: smooth, block: "start" }) }, h("i")));
  const fill = h("i", { class: "rb-fill" });
  const walker = h("span", { class: "rb-walker", "aria-hidden": "true" });
  const street = h("div", { class: "rb-street", role: "group", "aria-label": "Progress through the article" }, h("div", { class: "rb-road" }, fill), ...lamps, h("span", { class: "rb-lodge", "aria-hidden": "true" }), walker);
  const timeLeft = h("span", { class: "rb-left", "aria-live": "off" });
  const outlineBtn = h("button", { class: "rb-btn", type: "button", "aria-label": "Outline of this article", "aria-expanded": "false" });
  outlineBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
  const settingsBtn = h("button", { class: "rb-btn rb-aa", type: "button", "aria-label": "Reading settings", "aria-haspopup": "dialog", "aria-expanded": "false" }, "Aa");
  const bar = add(h("div", { id: "rbar", class: "r-bar", role: "toolbar", "aria-label": "Reading tools" }, outlineBtn, street, timeLeft, settingsBtn));
  bar.style.setProperty("--c", art.style.getPropertyValue("--c"));

  // ---------- settings popover
  const sizeLabel = h("span", { class: "rs-value" });
  const setPref = (patch) => { prefs = { ...prefs, ...patch }; savePrefs(prefs); applyPrefs(prefs); sync(); requestAnimationFrame(layout); };
  const btn = (label, fn, attrs = {}) => h("button", { type: "button", class: "rs-btn", onclick: fn, ...attrs }, label);
  const smaller = btn("A−", () => setPref({ size: clamp(prefs.size - 1, 0, SIZES.length - 1) }), { "aria-label": "Smaller text" });
  const larger = btn("A+", () => setPref({ size: clamp(prefs.size + 1, 0, SIZES.length - 1) }), { "aria-label": "Larger text" });
  const fontBtns = [["serif", "Serif"], ["sans", "Sans"]].map(([k, t]) => btn(t, () => setPref({ font: k }), { "data-font": k }));
  const themeBtns = [["auto", "Auto"], ["light", "Light"], ["sepia", "Sepia"], ["dark", "Dark"]].map(([k, t]) => btn(t, () => setPref({ theme: k }), { "data-theme-k": k }));
  const row = (label, ...c) => h("div", { class: "rs-row" }, h("span", { class: "rs-label" }, label), h("div", { class: "rs-ctrls" }, ...c));
  const settings = add(h("div", { id: "rset", class: "r-pop", role: "dialog", "aria-label": "Reading settings", hidden: true },
    row("Text size", smaller, sizeLabel, larger), row("Typeface", ...fontBtns), row("Theme", ...themeBtns),
    h("div", { class: "rs-row rs-foot" }, btn("Reset", () => setPref({ ...DEFAULTS }))))
  );
  function sync() {
    fontBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.font === prefs.font)));
    themeBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeK === prefs.theme)));
    smaller.disabled = prefs.size <= 0; larger.disabled = prefs.size >= SIZES.length - 1;
    sizeLabel.textContent = SIZES[prefs.size] + "px";
  }
  sync();
  const closeSettings = () => { settings.hidden = true; settingsBtn.setAttribute("aria-expanded", "false"); };
  settingsBtn.addEventListener("click", () => {
    const open = settings.hidden;
    closeDrawer(); settings.hidden = !open; settingsBtn.setAttribute("aria-expanded", String(open));
    if (open) settings.querySelector("button:not([disabled])").focus();
  });

  // ---------- outline drawer
  const links = topic.toc.map((t) => h("a", { class: "d" + t.depth, href: `#/${topic.id}`, "data-scroll": t.id }, t.text));
  const closeBtn = h("button", { class: "rs-btn", type: "button", "aria-label": "Close outline", onclick: () => closeDrawer() }, "✕");
  const drawer = add(h("aside", { id: "rdrawer", class: "r-drawer", "aria-label": "Outline", hidden: true }, h("div", { class: "rd-head" }, h("b", {}, "On this page"), closeBtn), h("nav", { "aria-label": "On this page" }, ...links)));
  const scrim = add(h("div", { class: "r-scrim", hidden: true, onclick: () => closeDrawer() }));
  function closeDrawer() { if (drawer.hidden) return; drawer.hidden = true; scrim.hidden = true; outlineBtn.setAttribute("aria-expanded", "false"); }
  outlineBtn.addEventListener("click", () => {
    const open = drawer.hidden;
    closeSettings(); drawer.hidden = !open; scrim.hidden = !open; outlineBtn.setAttribute("aria-expanded", String(open));
    if (open) links[0] && links[0].focus();
  });
  drawer.querySelector("nav").addEventListener("click", (e) => { if (e.target.closest("a")) setTimeout(closeDrawer, 0); });
  on(document, "keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!settings.hidden) { closeSettings(); settingsBtn.focus(); e.preventDefault(); }
    else if (!drawer.hidden) { closeDrawer(); outlineBtn.focus(); e.preventDefault(); }
  });
  on(document, "pointerdown", (e) => { if (!settings.hidden && !settings.contains(e.target) && !settingsBtn.contains(e.target)) closeSettings(); });

  // ---------- geometry and progress
  let lampFrac = [], lastY = scrollY, raf = 0, lastSave = 0;
  const geom = () => { const r = prose.getBoundingClientRect(); return { top: r.top + scrollY, H: Math.max(1, prose.offsetHeight) }; };
  function layout() {
    const { top, H } = geom();
    lampFrac = stops.map((hd) => clamp((hd.getBoundingClientRect().top + scrollY - top) / H, 0.02, 0.98));
    const w = street.offsetWidth || 1;
    let lastX = -99;
    lamps.forEach((l, i) => { // on a narrow strip, skip lamps that would sit on top of the previous one
      const x = lampFrac[i] * w, hide = x - lastX < 15;
      l.style.left = lampFrac[i] * 100 + "%"; l.style.display = hide ? "none" : "";
      if (!hide) lastX = x;
    });
    tick();
  }
  const frac = () => { const { top, H } = geom(); return clamp((scrollY + innerHeight * 0.4 - top) / H, 0, 1); };
  const readbar = document.getElementById("readbar");
  if (readbar) readbar.style.setProperty("--c", art.style.getPropertyValue("--c"));
  function tick() {
    const f = frac(), y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    fill.style.width = f * 100 + "%";
    walker.style.left = f * 100 + "%";
    lamps.forEach((l, i) => l.classList.toggle("lit", lampFrac[i] <= f));
    timeLeft.textContent = f >= 0.98 ? "Finished" : `${Math.max(1, Math.ceil(((1 - f) * (topic.words || 0)) / 230))} min left`;
    if (readbar) readbar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
    bar.classList.toggle("show", y > 160);
    // the site chrome tucks away while you read down and returns when you scroll up
    if (Math.abs(y - lastY) > 8) { document.body.classList.toggle("chrome-hidden", y > 140 && y > lastY); lastY = y; }
    if (y <= 140) document.body.classList.remove("chrome-hidden");
    let cur = null;
    for (const hd of heads) if (hd.getBoundingClientRect().top < 160) cur = hd.id;
    links.forEach((a) => a.classList.toggle("active", a.dataset.scroll === cur));
    hideTip();
    if (Date.now() - lastSave > 400) { lastSave = Date.now(); savePos(f); }
  }
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; tick(); }); };
  on(window, "scroll", onScroll, { passive: true });
  on(window, "resize", () => layout());
  const ro = new ResizeObserver(() => layout());
  ro.observe(prose);
  cleanups.push(() => ro.disconnect());

  // ---------- resume where you left off
  const posKey = "ai-base-pos:" + topic.id;
  function savePos(f) { try { if (f > 0.97) localStorage.removeItem(posKey); else if (f > 0.03) localStorage.setItem(posKey, f.toFixed(3)); } catch { /* ignore */ } }
  let saved = 0;
  try { saved = parseFloat(localStorage.getItem(posKey)) || 0; } catch { /* ignore */ }
  if (saved > 0.08 && saved < 0.95 && scrollY < 60) {
    const go = () => { const { top, H } = geom(); scrollTo({ top: top + saved * H - innerHeight * 0.4, behavior: smooth }); toast.remove(); };
    const toast = add(h("div", { class: "r-toast", role: "status" }, h("span", {}, `Continue from ${Math.round(saved * 100)}%?`), h("button", { type: "button", class: "rs-btn", onclick: go }, "Continue"), h("button", { type: "button", class: "rs-btn", onclick: () => toast.remove() }, "Start over")));
    const t = setTimeout(() => toast.remove(), 9000);
    cleanups.push(() => clearTimeout(t));
  }

  // ---------- previews for topic links and key terms
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
      html = `<b>${esc(t.title)}</b> <span class="tip-status">${esc(STATUS[t.status] || t.status)}</span><p>${esc(t.summary || "Not written yet.")}</p><small>Click to read</small>`;
    }
    tip.innerHTML = html; tip.hidden = false;
    const r = target.getBoundingClientRect(), pw = tip.offsetWidth, ph = tip.offsetHeight;
    tip.style.left = clamp(r.left + r.width / 2 - pw / 2, 12, innerWidth - pw - 12) + "px";
    tip.style.top = (r.top - ph - 10 < 70 ? r.bottom + 10 : r.top - ph - 10) + "px";
  }
  const tipTarget = (e) => e.target.closest && e.target.closest("a[data-topic], abbr.term");
  on(art, "mouseover", (e) => { if (!fine) return; const t = tipTarget(e); if (!t) return; clearTimeout(tipTimer); tipTimer = setTimeout(() => showTip(t), 220); });
  on(art, "mouseout", (e) => { if (tipTarget(e)) hideTip(); });
  on(art, "focusin", (e) => { const t = tipTarget(e); if (t) showTip(t); });
  on(art, "focusout", hideTip);

  // underline each key term the first time it appears, before the "Key terms" section itself
  (function markTerms() {
    const gl = (topic.glossary || []).map((g) => ({ ...g, key: g.term.replace(/\s*\([^)]*\)/g, "").trim() })).filter((g) => g.key.length >= 4 && !/ or /.test(g.key));
    if (!gl.length) return;
    const stopAt = prose.querySelector("#key-terms");
    const skip = "a, h1, h2, h3, code, pre, details, abbr, .bench, table, blockquote.callout";
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
  const quoteBtn = h("button", { type: "button", class: "rs-btn", onpointerdown: (e) => e.preventDefault(), onclick: async () => flash(quoteBtn, (await copy(`“${selText}”\n${topic.title}, AI Base\n${location.href.split("?")[0]}`)) ? "Copied ✓" : "Copy failed") }, "Copy quote");
  const linkBtn = h("button", { type: "button", class: "rs-btn", onpointerdown: (e) => e.preventDefault(), onclick: async () => {
    const hd = selNode && nearestHeading(selNode);
    flash(linkBtn, (await copy(`${location.origin}${location.pathname}#/${topic.id}${hd ? "?at=" + hd.id : ""}`)) ? "Copied ✓" : "Copy failed");
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
      selBar.style.top = (r.top - 52 < 60 ? r.bottom + 10 : r.top - 52) + "px";
    }, 140);
  });

  layout();
  return () => {
    cleanups.forEach((c) => c());
    mounted.forEach((el) => el.remove());
    document.body.classList.remove("chrome-hidden");
    if (readbar) readbar.style.transform = "scaleX(0)";
  };
}
