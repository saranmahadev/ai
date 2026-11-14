// Exercises the lesson reading experience in Chromium: type, the three-column layout, prerequisites, the reading
// line, "On this page", text size, read tracking (automatic and by button), resume, ?at= links, link previews,
// key terms, the selection bar, the bench, and phone width.
// Needs Playwright (a devDependency, installed via `npm ci`): `npm run test:reader`. Add --shots=DIR to save
// screenshots. Set PW_CHROMIUM to a Chromium binary to use one already installed.
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
const LESSON = "#/math/derivatives";

async function open(width, height, hash = LESSON, extra = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", colorScheme: "light", permissions: ["clipboard-read", "clipboard-write"], ...extra });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${base}${hash}`);
  await page.waitForSelector(".lesson .prose");
  await page.waitForTimeout(400);
  return { ctx, page };
}
const scrollToFrac = (page, f) => page.evaluate((frac) => { const p = document.querySelector(".prose"); const top = p.getBoundingClientRect().top + scrollY; scrollTo(0, top + p.offsetHeight * frac - innerHeight * 0.4); }, f);
const shot = async (page, name) => { if (shots) await page.screenshot({ path: join(shots, `${name}.png`) }); };

try {
  // ---- desktop
  let { ctx, page } = await open(1360, 900);
  await page.evaluate(() => document.fonts.ready);
  const fonts = await page.evaluate(() => ({ prose: getComputedStyle(document.querySelector(".prose")).fontFamily, title: getComputedStyle(document.querySelector(".lesson-head h1")).fontFamily, ui: getComputedStyle(document.querySelector(".site-nav a")).fontFamily, loaded: [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, "")) }));
  check("serif title and body, sans interface", /Newsreader/.test(fonts.prose) && /Newsreader/.test(fonts.title) && /Inter/.test(fonts.ui), fonts.prose.split(",")[0]);
  check("the self-hosted fonts load", fonts.loaded.includes("Newsreader") && fonts.loaded.includes("Inter"), [...new Set(fonts.loaded)].join(","));
  const cols = await page.evaluate(() => ["lesson-side", "lesson-main", "lesson-toc"].map((c) => Math.round(document.querySelector("." + c).getBoundingClientRect().left)));
  check("three columns: chapter, article, on this page", cols[0] < cols[1] && cols[1] < cols[2], cols.join(" < "));
  check("the chapter list marks the current lesson", (await page.locator(".lesson-side a[aria-current]").innerText()).trim() === "Derivatives");
  check("the eyebrow places the lesson in its chapter", /^Lesson 4 of 15 · \d+ min read$/.test((await page.locator(".lesson-head .eyebrow").innerText()).trim()), await page.locator(".lesson-head .eyebrow").innerText());
  check("prerequisites are a row of links", (await page.locator(".needs .chip").count()) === 3);
  check("previous and next lessons are offered", (await page.locator(".step.prev b").innerText()).trim() === "Continuity" && (await page.locator(".step.next b").innerText()).trim() === "Derivative Rules");
  await shot(page, "reader-top");

  // reading line and scroll-spy
  await scrollToFrac(page, 0.4);
  await page.waitForTimeout(400);
  const line = await page.locator("#readline").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  check("the reading line follows the scroll", line > 0.25 && line < 0.6, line.toFixed(2));
  check("On this page marks the current section", (await page.locator(".lesson-toc a.active").count()) === 1, await page.locator(".lesson-toc a.active").innerText().catch(() => ""));
  await shot(page, "reader-mid");
  await page.locator(".lesson-toc a").last().click();
  await page.waitForTimeout(300);
  check("an On this page link jumps without leaving the lesson", (await page.evaluate(() => location.hash)) === LESSON && (await page.locator(".lesson-toc a.active").innerText()).trim() === (await page.locator(".lesson-toc a").last().innerText()).trim());

  // text size
  const size = () => page.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".prose")).fontSize));
  const before = await size();
  await page.click('.textsize [data-size="1"]');
  check("A+ enlarges the text", (await size()) > before, `${before} → ${await size()}`);
  await page.click('.textsize [data-size="-1"]');
  check("A− restores it", (await size()) === before);

  // the bench mounts when scrolled to
  await page.locator(".bench").scrollIntoViewIfNeeded();
  await page.waitForSelector(".bench.ready", { timeout: 10000 });
  check("the bench mounts", true);
  await shot(page, "reader-bench");

  // key terms and link previews
  check("key terms are marked in the text", (await page.locator(".prose abbr.term").count()) >= 1);
  await page.evaluate(() => scrollTo(0, 0));
  await page.locator(".prose abbr.term").first().focus();
  check("a key term shows its definition", await page.locator("#rtip:not([hidden])").count() === 1, (await page.locator("#rtip").innerText()).slice(0, 40));
  await page.locator(".prose a[data-topic]").first().focus();
  await page.waitForTimeout(100);
  check("a lesson link previews its summary", (await page.locator("#rtip:not([hidden]) p").count()) === 1);

  // selection bar
  await page.evaluate(() => { const p = document.querySelectorAll(".prose > p")[1]; p.scrollIntoView({ block: "center" }); const r = document.createRange(); r.selectNodeContents(p); const s = getSelection(); s.removeAllRanges(); s.addRange(r); });
  await page.waitForTimeout(300);
  check("selecting text offers copy quote and copy link", await page.locator("#rsel:not([hidden]) button").count() === 2);
  await page.locator("#rsel button").nth(1).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  check("copy link points at the lesson", copied.includes("#/math/derivatives"), copied.slice(-40));
  await page.evaluate(() => getSelection().removeAllRanges());

  await ctx.close();

  // ---- read tracking: the button, then (in a fresh visit) automatically at the end
  ({ ctx, page } = await open(1360, 900));
  check("a lesson starts unread", (await page.locator("[data-mark-read]").innerText()).trim() === "Mark as read");
  await page.click("[data-mark-read]");
  let read = await page.evaluate(() => JSON.parse(localStorage.getItem("ai-base-read") || "[]"));
  check("Mark as read records the lesson", read.includes("math/derivatives") && (await page.locator("[data-mark-read]").innerText()).trim() === "Mark as unread" && (await page.locator(".side-count").innerText()).trim() === "1 of 15 read");
  await page.click("[data-mark-read]");
  read = await page.evaluate(() => JSON.parse(localStorage.getItem("ai-base-read") || "[]"));
  check("Mark as unread clears it", !read.includes("math/derivatives"));
  await ctx.close();
  ({ ctx, page } = await open(1360, 900));
  await scrollToFrac(page, 0.95);
  await page.waitForTimeout(500);
  read = await page.evaluate(() => JSON.parse(localStorage.getItem("ai-base-read") || "[]"));
  check("reaching the end marks the lesson read", read.includes("math/derivatives") && (await page.locator(".lesson-side a[aria-current].read").count()) === 1);
  await ctx.close();

  // ---- resume and ?at= links
  ({ ctx, page } = await open(1360, 900));
  await scrollToFrac(page, 0.5);
  await page.waitForTimeout(700);
  await page.reload();
  await page.waitForSelector(".r-toast");
  check("coming back offers to continue where you left off", /Continue from \d+%/.test(await page.locator(".r-toast span").innerText()));
  await page.locator(".r-toast button").first().click();
  await page.waitForTimeout(300);
  check("Continue scrolls back to that place", (await page.evaluate(() => scrollY)) > 400);
  await page.goto(`${base}#/math/derivatives?at=common-pitfalls`);
  await page.waitForSelector(".lesson .prose");
  await page.waitForTimeout(400);
  const top = await page.locator("#common-pitfalls").evaluate((el) => el.getBoundingClientRect().top);
  check("a ?at= link opens the lesson at that section", top > -5 && top < 200, `${Math.round(top)}px from the top`);
  await ctx.close();

  // ---- an overview page has no chapter list
  ({ ctx, page } = await open(1360, 900, "#/ai"));
  check("the overview page reads as a two-column article", (await page.locator(".page.lesson.no-side").count()) === 1 && (await page.locator(".lesson-side").count()) === 0);
  await ctx.close();

  // ---- dark
  ({ ctx, page } = await open(1360, 900, LESSON, { colorScheme: "dark" }));
  const dark = await page.evaluate(() => ({ bg: getComputedStyle(document.body).backgroundColor, ink: getComputedStyle(document.querySelector(".prose")).color }));
  check("the lesson follows a dark system setting", dark.bg === "rgb(28, 18, 12)" && dark.ink === "rgb(246, 238, 223)", `${dark.bg} / ${dark.ink}`);
  await shot(page, "reader-dark");
  await ctx.close();

  // ---- phone
  ({ ctx, page } = await open(390, 844));
  const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check("no horizontal scroll at phone width", over <= 1, `${over}px`);
  const order = await page.evaluate(() => document.querySelector(".lesson-main").getBoundingClientRect().top < document.querySelector(".lesson-side").getBoundingClientRect().top);
  check("on a phone the article comes first, the chapter list after it", order && !(await page.locator(".lesson-toc").isVisible()));
  await shot(page, "reader-phone");
  await ctx.close();
} catch (e) { check("reader run", false, e.message.split("\n")[0]); }
check("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
await browser.close(); server.close();
process.exit(results.every(Boolean) ? 0 : 1);
