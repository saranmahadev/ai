// Exercises the reading experience in Chromium: typography, cover, street strip, settings and themes, outline drawer,
// link previews, key-term popovers, selection bar, resume position and ?at= links, at desktop and phone widths.
// Needs Playwright (not a site dependency): `npm run test:reader`. Add --shots=DIR to save screenshots.
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const shots = (process.argv.find((a) => a.startsWith("--shots=")) || "").slice(8);
const TOPIC = "#/fundamentals/features-and-labels";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
let chromium;
try { ({ chromium } = await import("playwright")); } catch { console.error("Playwright is not installed; skipping reader test."); process.exit(2); }
if (!existsSync(join(SITE, "content.json"))) { console.error("Run `npm run content` first."); process.exit(1); }
if (shots) mkdirSync(shots, { recursive: true });

const server = createServer((req, res) => {
  const path = join(SITE, decodeURIComponent(req.url.split("?")[0]).replace(/^\/$/, "/index.html"));
  if (!path.startsWith(SITE) || !existsSync(path)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
  res.end(readFileSync(path));
}).listen(0);
const base = `http://localhost:${server.address().port}/`;
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const errors = [], results = [];
const check = (name, ok, detail = "") => { results.push(ok); console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? " · " + detail : ""}`); };

async function open(width, height, hash = TOPIC, extra = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", permissions: ["clipboard-read", "clipboard-write"], ...extra });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${base}?time=12:00${hash}`);
  await page.waitForSelector(".doc .prose");
  await page.waitForTimeout(500);
  return { ctx, page };
}
const scrollTo = (page, f) => page.evaluate((frac) => { const p = document.querySelector(".prose"); const top = p.getBoundingClientRect().top + scrollY; scrollTo(0, top + p.offsetHeight * frac - innerHeight * 0.4); }, f);
const shot = async (page, name) => { if (shots) await page.screenshot({ path: join(shots, `${name}.png`) }); };

try {
  // ---- desktop
  let { ctx, page } = await open(1280, 900);
  const fonts = await page.evaluate(() => ({ prose: getComputedStyle(document.querySelector(".prose")).fontFamily, title: getComputedStyle(document.querySelector(".doc-title")).fontFamily }));
  check("serif body and sans headline", /Source Serif 4/.test(fonts.prose) && /Nunito/.test(fonts.title), fonts.prose.split(",")[0]);
  check("generated cover is present", await page.locator(".doc-cover svg").count() === 1);
  await shot(page, "reader-top");
  const stops = await page.locator(".prose h1, .prose h2").count();
  check("one lamp per major section", (await page.locator(".rb-lamp").count()) === stops && stops > 2, `${stops} lamps`);

  await scrollTo(page, 0.4);
  await page.waitForTimeout(600);
  check("floating bar appears while reading", await page.locator("#rbar.show").count() === 1);
  const walkerLeft = await page.locator(".rb-walker").evaluate((el) => parseFloat(el.style.left));
  check("walker has moved along the street", walkerLeft > 15 && walkerLeft < 70, `${walkerLeft.toFixed(0)}%`);
  check("time left is shown", /min left|Finished/.test(await page.locator(".rb-left").innerText()), await page.locator(".rb-left").innerText());
  check("site chrome tucks away when scrolling down", await page.evaluate(() => document.body.classList.contains("chrome-hidden")));
  await shot(page, "reader-mid");

  const before = await page.evaluate(() => scrollY);
  await page.locator(".rb-lamp").nth(Math.min(5, stops - 1)).click();
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => scrollY);
  check("clicking a lamp jumps to that section", after !== before, `${Math.round(before)} → ${Math.round(after)}`);

  // settings and themes
  await page.click(".rb-aa");
  check("settings popover opens", await page.locator("#rset:not([hidden])").count() === 1);
  await page.click('#rset button[aria-label="Larger text"]');
  const fs = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue("--r-fs").trim());
  check("larger text applies", fs === "22px", fs);
  await page.click('#rset button[data-theme-k="sepia"]');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check("sepia theme applies", bg === "rgb(244, 236, 216)", bg);
  await shot(page, "reader-sepia");
  await page.click('#rset button[data-theme-k="dark"]');
  check("dark theme applies", (await page.evaluate(() => getComputedStyle(document.body).backgroundColor)) === "rgb(13, 17, 23)");
  await page.click('#rset button[data-font="sans"]');
  await page.keyboard.press("Escape");
  check("Esc closes settings without leaving the article", (await page.locator("#rset:not([hidden])").count()) === 0 && (await page.evaluate(() => location.hash)).startsWith("#/fundamentals/features"));
  await page.reload(); await page.waitForSelector(".doc .prose"); await page.waitForTimeout(400);
  const persisted = await page.evaluate(() => ({ t: document.body.dataset.theme, f: document.body.dataset.font, s: getComputedStyle(document.body).getPropertyValue("--r-fs").trim() }));
  check("preferences persist after a reload", persisted.t === "dark" && persisted.f === "sans" && persisted.s === "22px", JSON.stringify(persisted));
  await ctx.close();

  // ---- fresh context: drawer, previews, terms, selection, resume, deep link
  ({ ctx, page } = await open(1280, 900));
  await scrollTo(page, 0.2); await page.waitForTimeout(400);
  await page.click('#rbar button[aria-label="Outline of this article"]');
  check("outline drawer opens with links", (await page.locator("#rdrawer:not([hidden]) nav a").count()) > 3);
  await shot(page, "reader-drawer");
  await page.keyboard.press("Escape");
  check("Esc closes the drawer", (await page.locator("#rdrawer:not([hidden])").count()) === 0);

  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
  const link = page.locator(".prose a[data-topic]").first();
  await link.scrollIntoViewIfNeeded(); await link.hover(); await page.waitForTimeout(500);
  check("hovering a topic link shows a preview card", (await page.locator("#rtip:not([hidden]) b").count()) === 1, (await page.locator("#rtip b").innerText().catch(() => "")));
  await shot(page, "reader-preview");
  await page.mouse.move(5, 5); await page.waitForTimeout(300);
  const term = page.locator(".prose abbr.term").first();
  const hasTerm = await term.count();
  check("key terms are underlined", hasTerm > 0, `${hasTerm} terms`);
  if (hasTerm) { await term.scrollIntoViewIfNeeded(); await term.hover(); await page.waitForTimeout(500); check("hovering a term shows its definition", (await page.locator("#rtip:not([hidden]) p").innerText().catch(() => "")).length > 10); }

  await page.mouse.move(5, 5);
  await page.evaluate(() => { const p = document.querySelectorAll(".prose h2 ~ p")[2]; p.scrollIntoView({ block: "center" }); const r = document.createRange(); r.selectNodeContents(p); const s = getSelection(); s.removeAllRanges(); s.addRange(r); });
  await page.waitForSelector("#rsel:not([hidden])", { timeout: 4000 }).catch(() => {});
  check("selecting text shows the copy bar", await page.locator("#rsel:not([hidden])").count() === 1);
  await shot(page, "reader-selection");
  await page.locator("#rsel button", { hasText: "Copy link" }).click();
  await page.waitForTimeout(300);
  const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => ""));
  check("copy link points at the section", /#\/fundamentals\/features-and-labels\?at=/.test(clip), clip.replace(/^.*#/, "#"));

  await page.evaluate(() => getSelection().removeAllRanges());
  await scrollTo(page, 0.5); await page.waitForTimeout(900);
  await page.reload(); await page.waitForSelector(".doc .prose"); await page.waitForTimeout(600);
  check("offers to resume where you left off", await page.locator(".r-toast").count() === 1, (await page.locator(".r-toast span").innerText().catch(() => "")));
  await page.locator(".r-toast button", { hasText: "Continue" }).click();
  await page.waitForTimeout(400);
  check("continue jumps back into the article", (await page.evaluate(() => scrollY)) > 800);
  await ctx.close();

  ({ ctx, page } = await open(1280, 900, `${TOPIC}?at=key-terms`));
  await page.waitForTimeout(500);
  const top = await page.evaluate(() => document.getElementById("key-terms").getBoundingClientRect().top);
  check("?at= scrolls to the section", top < 400 && top > -50, `${Math.round(top)}px from top`);
  await ctx.close();

  // ---- phone
  ({ ctx, page } = await open(390, 844));
  await scrollTo(page, 0.3); await page.waitForTimeout(600);
  const phone = await page.evaluate(() => ({ over: document.documentElement.scrollWidth - innerWidth, bar: document.querySelector("#rbar.show") ? document.querySelector(".rb-street").getBoundingClientRect().width : 0 }));
  check("phone: no horizontal overflow", phone.over <= 1, `${phone.over}px`);
  check("phone: street strip is usable", phone.bar > 120, `${Math.round(phone.bar)}px wide`);
  await shot(page, "reader-phone");
  await ctx.close();
} catch (e) { check("reader run", false, e.message.split("\n")[0]); }

check("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
await browser.close(); server.close();
process.exit(results.every(Boolean) ? 0 : 1);
