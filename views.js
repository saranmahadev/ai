// Page templates: pure functions from the content index to HTML strings. The same code renders the app
// (main.js, in the browser) and the prerendered pages (scripts/build-static.mjs, in Node), so the two can
// never drift apart. Nothing here touches the DOM, localStorage or the network: the caller passes in
// how to link (`link`, `anchor`, `prose`) and what the reader has done (`read`, `progress`).
//
// Structure: a course has chapters; a chapter has an optional intro page and its lessons.

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const REPO = "https://github.com/saranmahadev/ai";
const pad = (n) => String(n).padStart(2, "0");
const plural = (n, one, many = one + "s") => `${n} ${n === 1 ? one : many}`;
export const minutes = (t) => Math.max(1, Math.round((t.words || 0) / 200));

const MARK = {
  done: `<svg class="mark" viewBox="0 0 18 18" role="img" aria-label="Read"><circle cx="9" cy="9" r="8" fill="var(--orange)"/><path d="M5.5 9.2l2.4 2.4 4.6-5" fill="none" stroke="var(--on-orange)" stroke-width="1.6"/></svg>`,
  next: `<svg class="mark" viewBox="0 0 18 18" role="img" aria-label="Up next"><circle cx="9" cy="9" r="7" fill="none" stroke="var(--orange)" stroke-width="2"/><circle cx="9" cy="9" r="3" fill="var(--orange)"/></svg>`,
  todo: `<svg class="mark" viewBox="0 0 18 18" role="img" aria-label="Not read yet"><circle cx="9" cy="9" r="7.25" fill="none" stroke="var(--muted)" stroke-width="1.5"/></svg>`
};
const ARROW = `<svg class="arrow" viewBox="0 0 18 18" aria-hidden="true"><path d="M3 9h12M10 4l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;
const SEARCH_ICON = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10.5 10.5 14 14" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;
const THEME_ICON = `<svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><circle cx="9" cy="9" r="6.25" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M9 2.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor"/></svg>`;

// ---------- the shell around every page (index.html carries the same header and footer by hand)
export function siteHeader({ home, glossary, progress, search }) {
  return `<header class="site-head"><div class="wrap">
  <a class="brand" href="${home}"><span class="dot" aria-hidden="true"></span>AI Base</a>
  <nav class="site-nav" aria-label="Main">
    <a class="nav-curriculum" href="${home}">Curriculum</a>
    <a class="nav-glossary" href="${glossary}">Glossary</a>
    <a class="nav-progress" href="${progress}">My progress</a>
  </nav>
  <div class="site-tools">
    ${search.href ? `<a class="search-btn" href="${search.href}">${SEARCH_ICON}<span>Search lessons</span></a>` : `<button type="button" class="search-btn" data-search aria-label="Search lessons (press /)">${SEARCH_ICON}<span>Search lessons</span><kbd>/</kbd></button>`}
    <button type="button" class="icon-btn" data-theme-toggle aria-label="Switch between light and dark">${THEME_ICON}</button>
  </div>
</div></header>`;
}
export function siteFooter() {
  return `<footer class="site-foot"><div class="wrap">
  <span>AI Base. Written as an open Obsidian vault, MIT licensed.</span>
  <span class="foot-links"><a href="${REPO}">GitHub</a><a href="/feed.xml">Feed</a><a href="${REPO}/blob/main/CONTRIBUTING.md">Contributing</a></span>
</div></footer>`;
}

export function createViews({ content, link, anchor, prose = (h) => h, read = () => new Set(), progress = () => ({}), app = false }) {
  const T = content.topics;
  const courses = content.courses.filter((c) => !c.planned);
  const lessonsOf = (c) => c.chapters.flatMap((ch) => ch.lessons).filter((id) => T[id]);
  const orderOf = (c) => c.chapters.flatMap((ch) => [ch.intro, ...ch.lessons]).filter((id) => id && T[id]);
  const courseOf = (id) => courses.find((c) => T[id] && c.id === T[id].course);
  const chapterOf = (c, id) => c && c.chapters.find((ch) => ch.intro === id || ch.lessons.includes(id));
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
  const bar = (p, label) => `<span class="bar" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}"><i style="width:${p}%"></i></span>`;
  const crumbs = (items) => `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map((c) => `<li>${c.href ? `<a href="${c.href}">${esc(c.label)}</a>` : `<span aria-current="page">${esc(c.label)}</span>`}</li>`).join("")}</ol></nav>`;
  const home = link("");

  function courseProgress(c) {
    const ids = lessonsOf(c), seen = read(), n = ids.filter((id) => seen.has(id)).length;
    return { n, total: ids.length, pct: pct(n, ids.length) };
  }
  // The lesson to offer next: the first unread one after the last lesson read, else the very first lesson.
  function nextUp(within) {
    const seen = read();
    const pool = within ? [within] : courses;
    const last = [...seen].reverse().find((id) => T[id] && pool.some((c) => c.id === T[id].course));
    if (last) {
      const c = courseOf(last), ids = lessonsOf(c), at = ids.indexOf(last);
      const id = ids.slice(at + 1).find((x) => !seen.has(x)) || ids.find((x) => !seen.has(x));
      if (id) return { id, started: true };
    }
    for (const c of pool) { const id = lessonsOf(c).find((x) => !seen.has(x)); if (id) return { id, started: seen.size > 0 && !!last }; }
    return null;
  }
  const whereIs = (id) => {
    const c = courseOf(id), ch = chapterOf(c, id);
    return [c && c.title, ch && ch.title !== (c && c.title) && ch.title].filter(Boolean).join(" · ");
  };

  // ---------- home
  function pathList() {
    return `<ol class="path-list">${courses.map((c, i) => {
      const p = courseProgress(c);
      return `<li><a class="path-row" href="${link(c.id)}">
        <span class="num">${pad(i + 1)}</span>
        <span class="title">${esc(c.title)}</span>
        <span class="blurb">${esc(c.blurb)}</span>
        <span class="meta">${plural(c.chapters.length, "chapter")} · ${plural(p.total, "lesson")}${p.n ? `<br><b>${p.n} read</b>` : ""}</span>
      </a></li>`;
    }).join("")}</ol>`;
  }
  function continueStrip() {
    const up = nextUp();
    if (!up || !up.started) return "";
    const t = T[up.id], c = courseOf(up.id), p = courseProgress(c);
    return `<a class="continue" href="${link(up.id)}">
      <span class="label">Continue</span>
      <span class="title">${esc(t.title)}</span>
      <span class="where">${esc(whereIs(up.id))}</span>
      ${bar(p.pct, `${c.title} progress`)}
      ${ARROW}
    </a>`;
  }
  function homeView() {
    const first = courses[0] && lessonsOf(courses[0])[0];
    const up = nextUp();
    const s = content.stats;
    return `<div class="page home">
      <section class="hero">
        <p class="eyebrow">A free, open curriculum</p>
        <h1>Learn artificial intelligence in order, from arithmetic to agents.</h1>
        <p class="lede">${plural(s.courses, "course")}, read one after the other. Every lesson answers one question, works a small example by hand, and lets you try the idea on an interactive bench.</p>
        <div class="actions">
          ${up && up.started ? `<a class="btn primary" href="${link(up.id)}">Continue reading</a>` : first ? `<a class="btn primary" href="${link(first)}">Start with lesson one</a>` : ""}
          <a class="btn" href="${anchor("", "path")}" data-scroll="path">See the whole path</a>
        </div>
      </section>
      <dl class="stats">
        <div><dd>${s.courses}</dd><dt>courses, in learning order</dt></div>
        <div><dd>${s.chapters}</dd><dt>chapters</dt></div>
        <div><dd>${s.lessons}</dd><dt>lessons, each with a bench</dt></div>
        <div><dd>0</dd><dt>accounts, ads or trackers</dt></div>
      </dl>
      ${continueStrip()}
      <section class="block" id="path">
        <div class="block-head"><h2>The path</h2><p>Each course builds only on the ones above it. Start at the top, or jump to where you are.</p></div>
        ${pathList()}
        ${T.ai ? `<p class="aside-link"><a href="${link("ai")}">Read the big picture first: ${esc(T.ai.title)}</a></p>` : ""}
      </section>
      <section class="block">
        <div class="block-head"><h2>Every lesson has the same shape</h2></div>
        <ol class="shape">
          <li><span class="num">1</span><h3>The question</h3><p>One question per lesson, with the intuition in plain language before any notation.</p></li>
          <li><span class="num">2</span><h3>A worked example</h3><p>Small numbers you can follow with a pencil, checked against the same code the bench runs.</p></li>
          <li><span class="num">3</span><h3>The bench</h3><p>A small simulation with sliders and steps, plus experiments to try and what to notice.</p></li>
          <li><span class="num">4</span><h3>A quick check</h3><p>Three questions with hidden answers, the key terms, and the lesson that comes next.</p></li>
        </ol>
      </section>
    </div>`;
  }
  function curriculumView() {
    return `<div class="page">
      ${crumbs([{ label: "Curriculum" }])}
      <header class="page-head"><h1>Curriculum</h1>
      <p class="lede">${plural(content.stats.courses, "course")}, ${plural(content.stats.chapters, "chapter")} and ${plural(content.stats.lessons, "lesson")}, in learning order. Each course builds only on the ones above it.</p></header>
      <section class="block tight">${pathList()}</section>
    </div>`;
  }

  // ---------- course
  function lessonRow(id, n, upId) {
    const t = T[id], seen = read().has(id), up = id === upId;
    const part = !seen ? Math.round((progress()[id] || 0) * 100) : 0;
    return `<li><a class="lesson-row${up ? " up" : ""}" href="${link(id)}">
      ${seen ? MARK.done : up ? MARK.next : MARK.todo}
      <span class="n">${n}</span><span class="t">${esc(t.title)}</span>
      <span class="time">${part > 0 ? `${part}% · ` : ""}${t.status === "written" ? `${minutes(t)} min` : "not written"}</span>
    </a></li>`;
  }
  function courseView(c) {
    const i = courses.indexOf(c), p = courseProgress(c), up = nextUp(c), seen = read();
    const upChapter = up && chapterOf(c, up.id);
    const nextCourse = courses[i + 1], prevCourse = courses[i - 1];
    const chapters = c.chapters.map((ch, k) => {
      const ids = ch.lessons.filter((id) => T[id]), n = ids.filter((id) => seen.has(id)).length;
      const status = ids.length && n === ids.length ? "Complete" : n ? `${n} of ${ids.length} read` : plural(ids.length, "lesson");
      const open = upChapter ? ch === upChapter : k === 0;
      return `<details class="chapter"${open ? " open" : ""}>
        <summary><span class="num">${pad(k + 1)}</span><span class="title">${esc(ch.title)}</span><span class="status">${status}</span><span class="sign" aria-hidden="true"></span></summary>
        <div class="chapter-body">
          ${ch.intro && T[ch.intro] ? `<p class="chapter-intro">${esc(T[ch.intro].summary || "")} <a href="${link(ch.intro)}">Chapter overview</a></p>` : ""}
          <ol class="lessons">${ids.map((id, n2) => lessonRow(id, n2 + 1, up && up.id)).join("")}</ol>
        </div>
      </details>`;
    }).join("");
    const panel = up
      ? `<aside class="panel" aria-label="Your progress">
          <div class="panel-top"><span class="label">${app ? "Your progress" : "This course"}</span><span>${app ? `${p.n} of ${p.total} lessons` : plural(p.total, "lesson")}</span></div>
          ${app ? bar(p.pct, `${c.title} progress`) : ""}
          <div class="panel-next"><span>${up.started ? `Up next in ${esc((upChapter || {}).title || c.title)}` : "Start with"}</span><b>${esc(T[up.id].title)}</b></div>
          <a class="btn primary" href="${link(up.id)}">${up.started ? "Continue reading" : "Start the course"}</a>
        </aside>`
      : `<aside class="panel" aria-label="Your progress"><div class="panel-top"><span class="label">Your progress</span><span>${p.n} of ${p.total} lessons</span></div>${bar(100, `${c.title} progress`)}<div class="panel-next"><span>Course complete</span><b>Every lesson read</b></div></aside>`;
    return `<div class="page course">
      ${crumbs([{ label: "Curriculum", href: home }, { label: c.title }])}
      <header class="course-head">
        <div class="course-intro">
          <p class="eyebrow mono">Course ${pad(i + 1)} of ${courses.length}</p>
          <h1>${esc(c.title)}</h1>
          <p class="lede">${esc(c.blurb)}</p>
          <p class="meta">${plural(c.chapters.length, "chapter")} · ${plural(p.total, "lesson")}${prevCourse ? ` · builds on <a href="${link(prevCourse.id)}">${esc(prevCourse.title)}</a>` : ""}${c.index && T[c.index] ? ` · <a href="${link(c.index)}">About this course</a>` : ""}</p>
        </div>
        ${panel}
      </header>
      <section class="chapters" aria-label="Chapters">${chapters}</section>
      <section class="cards">
        <a class="card" href="${link(c.id + "/glossary")}"><b>${esc(c.title)} glossary</b><span>Every key term from this course in one alphabetical list.</span></a>
        ${nextCourse ? `<a class="card" href="${link(nextCourse.id)}"><span>Next course · ${pad(i + 2)}</span><b>${esc(nextCourse.title)}</b></a>` : ""}
      </section>
    </div>`;
  }

  // ---------- lesson
  // The note's "You need:" line becomes a row of prerequisite chips; one from another course names that course.
  function polish(html, t) {
    return html.replace(/<p><strong>You need:<\/strong>([\s\S]*?)<\/p>/, (whole, rest) => {
      const links = [...rest.matchAll(/<a class="wikilink[^"]*" href="[^"]*" data-(topic|course)="([^"]+)">([\s\S]*?)<\/a>/g)];
      if (!links.length) return whole;
      return `<div class="needs"><span class="label">You need</span>${links.map((m) => {
        const other = m[1] === "topic" && T[m[2]] && T[m[2]].course !== t.course && courseOf(m[2]);
        return `<a class="chip wikilink" href="#/${m[2]}" data-${m[1]}="${m[2]}">${m[3]}${other ? `<small class="xc">${esc(other.title)}</small>` : ""}</a>`;
      }).join("")}</div>`;
    });
  }
  function lessonView(t) {
    const c = courseOf(t.id), ch = chapterOf(c, t.id), seen = read();
    const ci = c ? courses.indexOf(c) : -1, ki = ch ? c.chapters.indexOf(ch) : -1;
    const order = c ? orderOf(c) : [], at = order.indexOf(t.id);
    const prev = at > 0 ? T[order[at - 1]] : null, next = at >= 0 && at < order.length - 1 ? T[order[at + 1]] : null;
    const li = ch ? ch.lessons.indexOf(t.id) : -1;
    const kind = li >= 0 ? `Lesson ${li + 1} of ${ch.lessons.length}` : ch ? `Chapter ${pad(ki + 1)} · overview` : c ? `Course ${pad(ci + 1)} · overview` : "Overview";
    const trail = [{ label: "Curriculum", href: home }];
    if (c) trail.push({ label: c.title, href: link(c.id) });
    if (ch && ch.title !== c.title) trail.push(ch.intro && ch.intro !== t.id ? { label: ch.title, href: link(ch.intro) } : { label: ch.title });
    if (!ch || ch.intro !== t.id) trail.push({ label: t.title });

    const side = ch ? (() => {
      const n = ch.lessons.filter((id) => seen.has(id)).length;
      return `<nav class="lesson-side" aria-label="${esc(ch.title)} chapter">
        <div class="side-head">
          <a class="side-course" href="${link(c.id)}">${esc(c.title)} · Chapter ${pad(ki + 1)}</a>
          ${ch.intro ? `<a class="side-chapter" href="${link(ch.intro)}"${ch.intro === t.id ? ' aria-current="page"' : ""}>${esc(ch.title)}</a>` : `<span class="side-chapter">${esc(ch.title)}</span>`}
          ${app ? `<span class="side-count">${n} of ${ch.lessons.length} read</span>` : `<span class="side-count">${plural(ch.lessons.length, "lesson")}</span>`}
        </div>
        <ol>${ch.lessons.filter((id) => T[id]).map((id) => `<li><a href="${link(id)}"${id === t.id ? ' aria-current="page"' : ""}${seen.has(id) ? ' class="read"' : ""}>${esc(T[id].title)}</a></li>`).join("")}</ol>
      </nav>`;
    })() : "";

    const toc = (t.toc || []).filter((h) => h.depth <= 2 && h.id !== "related");
    const aside = `<aside class="lesson-toc">
        ${toc.length ? `<nav aria-label="On this page"><span class="label">On this page</span>${toc.map((h) => `<a href="${anchor(t.id, h.id)}" data-scroll="${esc(h.id)}">${esc(h.text)}</a>`).join("")}</nav>` : ""}
        ${app ? `<div class="textsize" role="group" aria-label="Text size"><span class="label">Text size</span><button type="button" data-size="-1" aria-label="Smaller text">A−</button><button type="button" data-size="1" aria-label="Larger text">A+</button></div>` : ""}
      </aside>`;

    const done = seen.has(t.id);
    const markbar = !app
      ? `<div class="markbar"><span>Track your progress and run the bench in the interactive lesson.</span><a class="btn primary" href="/#/${t.id}">Open the interactive lesson</a></div>`
      : li >= 0 && t.status === "written"
        ? `<div class="markbar" data-markbar><span>${done ? "You have read this lesson." : "Finished? Mark it and keep your place in the course."}</span><button type="button" class="btn${done ? "" : " primary"}" data-mark-read="${esc(t.id)}" aria-pressed="${done}">${done ? "Mark as unread" : "Mark as read"}</button></div>`
        : "";
    const step = (o, dir) => o ? `<a class="step ${dir}" href="${link(o.id)}" data-topic="${esc(o.id)}"><span>${dir === "prev" ? "Previous" : "Next"}${(() => { const oc = chapterOf(c, o.id), n = oc ? oc.lessons.indexOf(o.id) : -1; return n >= 0 ? ` · lesson ${n + 1}` : oc ? " · chapter overview" : ""; })()}</span><b>${esc(o.title)}</b></a>` : `<span class="step empty"></span>`;

    return `<div class="page lesson${side ? "" : " no-side"}">
      ${side}
      <article class="lesson-main" data-lesson="${esc(t.id)}">
        <header class="lesson-head">
          ${crumbs(trail)}
          <p class="eyebrow mono">${kind}${t.status === "written" ? ` · ${minutes(t)} min read` : ""}</p>
          <h1>${esc(t.title)}</h1>
        </header>
        ${t.status === "outlined" ? `<p class="notice">This lesson is outlined but not written yet.</p>` : `<div class="prose">${prose(polish(t.html || "", t))}</div>`}
        <footer class="lesson-end">
          ${markbar}
          ${prev || next ? `<nav class="steps" aria-label="Previous and next lesson">${step(prev, "prev")}${step(next, "next")}</nav>` : ""}
          <p class="source"><a href="${REPO}/blob/main/${encodeURI(t.path)}">View the source note on GitHub</a></p>
        </footer>
      </article>
      ${aside}
    </div>`;
  }

  // ---------- glossary: every lesson's Key terms, gathered per course
  function glossaryData(c) {
    const byTerm = new Map();
    for (const id of orderOf(c)) {
      const t = T[id];
      if (t.status !== "written" || !t.glossary) continue;
      for (const g of t.glossary) {
        const key = g.term.trim().toLowerCase();
        if (!byTerm.has(key)) byTerm.set(key, { term: g.term, entries: [] });
        const group = byTerm.get(key);
        if (!group.entries.some((e) => e.def === g.def)) group.entries.push({ def: g.def, id, title: t.title });
      }
    }
    return [...byTerm.values()].sort((a, b) => a.term.localeCompare(b.term));
  }
  const letterOf = (term) => { const l = term.trim()[0].toUpperCase(); return /[A-Z]/.test(l) ? l : "#"; };
  function glossaryView(c) {
    const terms = glossaryData(c);
    const groups = new Map();
    for (const g of terms) { const l = letterOf(g.term); if (!groups.has(l)) groups.set(l, []); groups.get(l).push(g); }
    const present = [...groups.keys()];
    const letters = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", ...(groups.has("#") ? ["#"] : [])];
    const idOf = (l) => `gl-${l === "#" ? "other" : l}`;
    return `<div class="page glossary">
      ${crumbs([{ label: "Curriculum", href: home }, { label: c.title, href: link(c.id) }, { label: "Glossary" }])}
      <header class="page-head"><h1>${esc(c.title)} glossary</h1>
      <p class="lede">${plural(terms.length, "key term")}, each in one sentence, with the lesson that teaches it.</p></header>
      <nav class="gl-courses" aria-label="Glossaries by course">${courses.map((x) => `<a href="${link(x.id + "/glossary")}"${x === c ? ' aria-current="page"' : ""}>${esc(x.title)}</a>`).join("")}</nav>
      ${app && terms.length ? `<label class="gl-filter">${SEARCH_ICON}<span class="sr-only">Filter terms</span><input id="gfilter" type="search" placeholder="Filter terms" autocomplete="off"><span id="gcount" aria-live="polite">${plural(terms.length, "term")}</span></label>` : ""}
      ${terms.length ? `<p class="gl-letters" aria-label="Jump to letter">${letters.map((l) => present.includes(l) ? `<a href="${anchor(c.id + "/glossary", idOf(l))}" data-scroll="${idOf(l)}" data-letter="${l}">${l}</a>` : `<span>${l}</span>`).join("")}</p>` : `<p class="notice">No key terms yet.</p>`}
      <div class="gl-groups" id="glist">${present.map((l) => `<section class="gl-group" id="${idOf(l)}"><h2>${l}</h2><dl>${groups.get(l).map((g) => `<div class="gl-entry" data-term="${esc(g.term.toLowerCase())}"><dt>${esc(g.term)}</dt>${g.entries.map((e) => `<dd>${esc(e.def)}</dd><dd class="src"><a href="${link(e.id)}">${esc(e.title)}</a></dd>`).join("")}</div>`).join("")}</dl></section>`).join("")}</div>
      <p class="notice" id="gempty" hidden>No term matches that filter.</p>
    </div>`;
  }
  function glossaryIndexView() {
    return `<div class="page">
      ${crumbs([{ label: "Glossary" }])}
      <header class="page-head"><h1>Glossary</h1>
      <p class="lede">Every key term, in one sentence, with the lesson that teaches it. Pick a course.</p></header>
      <section class="block tight"><ol class="path-list">${courses.map((c, i) => `<li><a class="path-row" href="${link(c.id + "/glossary")}">
        <span class="num">${pad(i + 1)}</span><span class="title">${esc(c.title)}</span><span class="blurb">${esc(c.blurb)}</span><span class="meta">${plural(glossaryData(c).length, "term")}</span>
      </a></li>`).join("")}</ol></section>
    </div>`;
  }

  // ---------- my progress (the app only: progress lives in this browser)
  function progressView() {
    const all = courses.map(courseProgress), done = all.reduce((n, p) => n + p.n, 0), total = all.reduce((n, p) => n + p.total, 0);
    const up = nextUp();
    return `<div class="page progress">
      ${crumbs([{ label: "My progress" }])}
      <header class="page-head"><h1>My progress</h1>
      <p class="lede">${done} of ${total} lessons read. A lesson counts as read when you reach its end or mark it yourself. Progress is kept in this browser only.</p>
      ${bar(pct(done, total), "Overall progress")}</header>
      ${up ? `<a class="continue" href="${link(up.id)}"><span class="label">${up.started ? "Continue" : "Start here"}</span><span class="title">${esc(T[up.id].title)}</span><span class="where">${esc(whereIs(up.id))}</span>${ARROW}</a>` : `<p class="notice">Every lesson is read. New ones appear here as they are added.</p>`}
      <section class="block tight"><ol class="path-list">${courses.map((c, i) => `<li><a class="path-row" href="${link(c.id)}">
        <span class="num">${pad(i + 1)}</span><span class="title">${esc(c.title)}</span>
        <span class="blurb">${bar(all[i].pct, `${c.title} progress`)}</span>
        <span class="meta">${all[i].n} of ${all[i].total} read</span>
      </a></li>`).join("")}</ol></section>
      ${done ? `<p class="source"><button type="button" class="linklike" data-reset-progress>Reset my progress</button></p>` : ""}
    </div>`;
  }

  function notFoundView() {
    return `<div class="page">
      <header class="page-head"><p class="eyebrow mono">404</p><h1>Nothing here</h1>
      <p class="lede">That page does not exist, or the link is out of date.</p>
      <div class="actions"><a class="btn primary" href="${home}">Back to the curriculum</a></div></header>
    </div>`;
  }

  return { homeView, curriculumView, courseView, lessonView, glossaryView, glossaryIndexView, progressView, notFoundView, glossaryData, courseOf, chapterOf, lessonsOf, orderOf, nextUp, courseProgress };
}
