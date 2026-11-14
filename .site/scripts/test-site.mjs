// Exercises the site-level features in Chromium: the home page and curriculum, a course page, search, the
// glossary, My progress, cross-course prerequisite tags, old links, the 404 page, the theme switch and a
// prerendered page. Needs Playwright (a devDependency, installed via `npm ci`): `npm run test:site`.
// Add --shots=DIR to save screenshots. Set PW_CHROMIUM to a Chromium binary to use one already installed.
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const shots = (process.argv.find((a) => a.startsWith("--shots=")) || "").slice(8);
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
let chromium;
try { ({ chromium } = await import("playwright")); } catch { console.error("Playwright is not installed; skipping."); process.exit(2); }
if (!existsSync(join(SITE, "content.json"))) { console.error("Run `npm run content` first."); process.exit(1); }
if (shots) mkdirSync(shots, { recursive: true });
const server = createServer((req, res) => {
  let path = join(SITE, decodeURIComponent(req.url.split("?")[0]));
  if (path.startsWith(SITE) && existsSync(path) && statSync(path).isDirectory()) path = join(path, "index.html"); // the prerendered pages live at <path>/index.html
  if (!path.startsWith(SITE) || !existsSync(path)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
  res.end(readFileSync(path));
}).listen(0);
const base = `http://localhost:${server.address().port}/`;
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const errors = [], results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? " · " + detail : ""}`); };
const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 }, reducedMotion: "reduce", colorScheme: "light" });
const page = await ctx.newPage();
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
const shot = async (name) => { if (shots) await page.screenshot({ path: join(shots, `${name}.png`) }); };
const hash = () => page.evaluate(() => location.hash);
const content = JSON.parse(readFileSync(join(SITE, "content.json"), "utf8"));

try {
  // home: the curriculum in order
  await page.goto(`${base}#/`);
  await page.waitForSelector(".path-list .path-row");
  const rows = await page.locator(".path-list .path-row .title").allInnerTexts();
  check("home lists every course in order", rows.length === content.stats.courses && rows[0] === content.courses[0].title, `${rows.length} courses, first: ${rows[0]}`);
  check("home offers a first lesson", (await page.locator(".hero .btn.primary").innerText()).trim() === "Start with lesson one");
  check("the header marks the current section", (await page.locator(".nav-curriculum").evaluate((a) => getComputedStyle(a).borderBottomColor)) !== "rgba(0, 0, 0, 0)");
  await shot("home");

  // old links from earlier versions of the site
  for (const old of ["#/explore", "#/list", "#/galaxy"]) { await page.goto(`${base}${old}`); await page.waitForSelector(".path-list"); }
  check("old catalog links land on the curriculum", (await page.locator(".hero h1").count()) === 1);

  // course page
  await page.goto(`${base}#/math`);
  await page.waitForSelector(".chapter");
  const math = content.courses.find((c) => c.id === "math");
  check("a course lists its chapters", (await page.locator(".chapter").count()) === math.chapters.length, `${math.chapters.length} chapters`);
  check("the first chapter is open and shows its lessons", (await page.locator(".chapter[open] .lesson-row").count()) === math.chapters[0].lessons.length);
  await page.locator(".chapter summary").nth(5).click();
  check("a chapter opens on click", (await page.locator(".chapter").nth(5).locator(".lesson-row").first().isVisible()));
  await shot("course");

  // search
  await page.keyboard.press("/");
  check("/ opens the search box", await page.locator("#search:not([hidden])").count() === 1);
  await page.keyboard.type("logarith");
  await page.waitForSelector("#search-results [role=option]");
  const first = (await page.locator("#search-results [role=option] b").first().innerText()).trim();
  check("search finds a lesson by a word prefix", first === "Logarithms", first);
  await shot("search");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => location.hash === "#/math/logarithms");
  check("Enter opens the lesson", (await hash()) === "#/math/logarithms");
  await page.keyboard.press("Control+k");
  await page.keyboard.type("zzzzqq");
  await page.waitForTimeout(150);
  check("search reports when nothing matches", (await page.locator("#search-results .empty").count()) === 1);
  await page.keyboard.press("Escape");
  check("Esc closes the search box and stays on the page", (await page.locator("#search[hidden]").count()) === 1 && (await hash()) === "#/math/logarithms");

  // cross-course prerequisite tag
  await page.goto(`${base}#/fundamentals/a-model-is-a-function`);
  await page.waitForSelector(".lesson .prose");
  const tags = await page.locator(".needs .xc").allInnerTexts();
  check("a prerequisite in another course names that course", tags.includes("Math"), tags.join(","));

  // glossary
  await page.goto(`${base}#/glossary`);
  await page.waitForSelector(".path-row");
  check("the glossary index lists every course", (await page.locator(".path-row").count()) === content.stats.courses);
  await page.goto(`${base}#/fundamentals/glossary`);
  await page.waitForSelector(".gl-entry");
  const glossaryCount = await page.locator(".gl-entry").count();
  check("a course glossary lists its key terms", glossaryCount > 50, `${glossaryCount} terms`);
  await page.fill("#gfilter", "agent");
  await page.waitForTimeout(100);
  const visibleCount = await page.locator(".gl-entry:not([hidden])").count();
  check("the glossary filter narrows the list", visibleCount > 0 && visibleCount < glossaryCount, `${visibleCount} of ${glossaryCount}`);
  await page.fill("#gfilter", "zzzzqq");
  check("the glossary says when nothing matches", await page.locator("#gempty").isVisible());
  await page.fill("#gfilter", "");
  await shot("glossary");
  await page.locator(".gl-entry .src a").first().click();
  await page.waitForFunction(() => location.hash !== "#/fundamentals/glossary");
  check("a glossary term links to its lesson", (await hash()).startsWith("#/fundamentals/"), await hash());

  // My progress
  await page.evaluate(() => localStorage.setItem("ai-base-read", JSON.stringify(["math/logarithms", "math/exponents-and-roots"])));
  await page.goto(`${base}#/progress`);
  await page.waitForSelector(".progress .path-row");
  const summary = await page.locator(".page-head .lede").innerText();
  check("My progress counts read lessons", /^2 of \d+ lessons read/.test(summary), summary.slice(0, 40));
  check("My progress offers where to continue", (await page.locator(".progress .continue").count()) === 1, await page.locator(".progress .continue .title").innerText());
  await shot("progress");
  await page.goto(`${base}#/math`);
  await page.waitForSelector(".chapter");
  check("read lessons are marked on the course page", (await page.locator('.lesson-row svg[aria-label="Read"]').count()) === 2);
  check("the course offers the next unread lesson", (await page.locator(".panel .btn").innerText()).trim() === "Continue reading");
  await page.goto(`${base}#/`);
  await page.waitForSelector(".continue");
  check("home offers to continue", (await page.locator(".hero .btn.primary").innerText()).trim() === "Continue reading");
  await page.goto(`${base}#/path`);
  await page.waitForSelector(".progress");
  page.once("dialog", (d) => d.accept());
  await page.click("[data-reset-progress]");
  await page.waitForFunction(() => /^0 of \d+ lessons read/.test(document.querySelector(".page-head .lede").textContent));
  check("progress can be reset (and the old #/path link still works)", true);

  // 404
  await page.goto(`${base}#/no/such/page`);
  await page.waitForSelector(".page-head h1");
  check("an unknown route shows the 404 page", (await page.locator(".page-head h1").innerText()).trim() === "Nothing here");

  // theme switch: follows the system until chosen, then remembered
  await page.goto(`${base}#/`);
  await page.waitForSelector(".path-list");
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const light = await bg();
  await page.click("[data-theme-toggle]");
  const dark = await bg();
  check("the theme switch turns the page dark", light === "rgb(251, 246, 236)" && dark === "rgb(28, 18, 12)", `${light} → ${dark}`);
  await page.reload();
  await page.waitForSelector(".path-list");
  check("the chosen theme is remembered", (await bg()) === dark);
  await shot("home-dark");
  await page.click("[data-theme-toggle]");

  // a prerendered page: the same lesson as a plain document at a real path
  await page.goto(`${base}math/logarithms/`);
  await page.waitForSelector(".lesson .prose");
  check("a prerendered lesson carries the text and real links", (await page.locator(".lesson-head h1").innerText()).trim() === "Logarithms" && (await page.locator('.lesson-side a[href="/math/exponents-and-roots/"]').count()) === 1);
  check("a prerendered lesson links into the app", (await page.locator('.markbar a[href="/#/math/logarithms"]').count()) === 1);
  await shot("static-lesson");
} catch (e) { check("site run", false, e.message.split("\n")[0]); }
check("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
await browser.close(); server.close();
process.exit(results.every(Boolean) ? 0 : 1);
