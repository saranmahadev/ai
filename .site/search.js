// Topic search: a keyboard-first overlay ("/" or Ctrl/Cmd+K). It searches titles, summaries, key terms and planets
// in the content index; results open the topic. Everything is local.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const words = (s) => (s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").match(/[a-z0-9]+/g) || []);

export function buildIndex(content) {
  const docs = [];
  for (const p of content.planets) docs.push({ id: p.id, kind: "planet", title: p.title, sub: p.planned ? "Planet · not explored yet" : "Planet", text: p.blurb, terms: "", planet: p.title });
  for (const t of Object.values(content.topics)) {
    if (t.status === "outlined") continue;
    const p = t.planet && content.planets.find((x) => x.id === t.planet), d = p && p.districts.find((x) => x.id === t.district);
    docs.push({ id: t.id, kind: "topic", title: t.title, sub: p ? `${p.title}${d && d.title !== p.title ? " · " + d.title : ""}` : "Overview", text: t.summary || "", terms: (t.glossary || []).map((g) => g.term).join(" "), planet: p ? p.title : "" });
  }
  for (const d of docs) { d.tw = words(d.title); d.sw = words(d.text); d.gw = words(d.terms); d.tl = d.title.toLowerCase(); }
  return docs;
}

export function search(docs, query, limit = 8) {
  const qw = words(query);
  if (!qw.length) return [];
  const q = qw.join(" "), out = [];
  for (const d of docs) {
    let score = 0, all = true;
    for (const w of qw) {
      let s = 0;
      if (d.tw.includes(w)) s = 30;
      else if (d.tw.some((x) => x.startsWith(w))) s = 22;
      else if (d.gw.includes(w)) s = 16;
      else if (d.gw.some((x) => x.startsWith(w))) s = 11;
      else if (d.sw.includes(w)) s = 7;
      else if (d.sw.some((x) => x.startsWith(w))) s = 4;
      else if (d.tl.includes(w)) s = 6;
      if (!s) { all = false; break; }
      score += s;
    }
    if (!all) continue;
    if (d.tl === q) score += 60; else if (d.tl.startsWith(q)) score += 30;
    if (d.kind === "planet") score += 6;
    out.push([score, d]);
  }
  return out.sort((a, b) => b[0] - a[0] || a[1].title.localeCompare(b[1].title)).slice(0, limit).map((x) => x[1]);
}

export function mountSearch({ content, onGo }) {
  const docs = buildIndex(content), root = document.getElementById("search"), input = root.querySelector("input"), list = root.querySelector("ul");
  let results = [], active = 0, opener = null;
  const render = () => {
    const q = input.value.trim();
    results = q ? search(docs, q) : [];
    active = 0;
    list.innerHTML = results.length
      ? results.map((d, i) => `<li role="option" id="sr-${i}" data-i="${i}" aria-selected="${i === active}"><b>${esc(d.title)}</b><small>${esc(d.sub)}</small><span>${esc(d.text.length > 110 ? d.text.slice(0, 108).replace(/\s+\S*$/, "") + "…" : d.text)}</span></li>`).join("")
      : `<li class="empty" role="presentation">${q ? "No topics match. Try a shorter word." : "Type a word: a topic, a term or a planet."}</li>`;
    input.setAttribute("aria-activedescendant", results.length ? "sr-0" : "");
  };
  const mark = () => { list.querySelectorAll("[role=option]").forEach((li, i) => { li.setAttribute("aria-selected", String(i === active)); if (i === active) li.scrollIntoView({ block: "nearest" }); }); input.setAttribute("aria-activedescendant", results.length ? `sr-${active}` : ""); };
  const open = () => { opener = document.activeElement; root.hidden = false; document.body.classList.add("searching"); input.value = ""; render(); input.focus(); };
  const close = () => { root.hidden = true; document.body.classList.remove("searching"); if (opener && opener.focus) opener.focus(); };
  const go = (d) => { close(); onGo(d); };
  input.addEventListener("input", render);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(results.length - 1, active + 1); mark(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(0, active - 1); mark(); }
    else if (e.key === "Enter" && results[active]) { e.preventDefault(); go(results[active]); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
  });
  list.addEventListener("click", (e) => { const li = e.target.closest("[data-i]"); if (li) go(results[+li.dataset.i]); });
  root.addEventListener("click", (e) => { if (e.target === root) close(); });
  addEventListener("keydown", (e) => {
    const typing = e.target.closest && e.target.closest("input, textarea, select, [contenteditable]");
    if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey)) { e.preventDefault(); root.hidden ? open() : close(); }
  }, true);
  document.querySelectorAll("[data-search]").forEach((b) => b.addEventListener("click", open));
  return { open, close };
}
