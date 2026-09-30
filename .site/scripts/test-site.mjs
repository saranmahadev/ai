// Exercises the site-level features in Chromium: search, My path, cross-planet prerequisite tags and the lazily loaded topics.
// Needs Playwright (not a site dependency): `npm run test:site`. Add --shots=DIR to save screenshots.
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const shots = (process.argv.find((a) => a.startsWith("--shots=")) || "").slice(8);
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
let chromium;
try { ({ chromium } = await import("playwright")); } catch { console.error("Playwright is not installed; skipping site test."); process.exit(2); }
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
const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
const shot = async (name) => { if (shots) await page.screenshot({ path: join(shots, `${name}.png`) }); };
const hash = () => page.evaluate(() => location.hash);

try {
  await page.goto(`${base}?time=12:00#/list`);
  await page.waitForSelector(".planet-grid");

  // search
  await page.keyboard.press("/");
  check("/ opens the search box", await page.locator("#search:not([hidden])").count() === 1);
  await page.keyboard.type("logarith");
  await page.waitForSelector("#search-results [role=option]");
  const first = (await page.locator("#search-results [role=option] b").first().innerText()).trim();
  check("search finds a topic by a word prefix", first === "Logarithms", first);
  await shot("search");
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => location.hash === "#/math/logarithms");
  check("Enter opens the topic", (await hash()) === "#/math/logarithms");
  await page.keyboard.press("Control+k");
  await page.keyboard.type("zzzzqq");
  await page.waitForTimeout(150);
  check("search reports when nothing matches", (await page.locator("#search-results .empty").count()) === 1);
  await page.keyboard.press("Escape");
  check("Esc closes the search box and stays on the page", (await page.locator("#search[hidden]").count()) === 1 && (await hash()) === "#/math/logarithms");

  // cross-planet prerequisite tag
  await page.goto(`${base}?time=12:00#/fundamentals/a-model-is-a-function`);
  await page.waitForSelector(".doc .prose");
  const tags = await page.locator(".prose .xp").allInnerTexts();
  check("a prerequisite on another planet gets a planet tag", tags.includes("Math"), tags.join(","));

  // My path
  await page.evaluate(() => localStorage.setItem("ai-base-read", JSON.stringify(["math/logarithms", "math/exponents-and-roots"])));
  await page.goto(`${base}?time=12:00#/path`);
  await page.waitForSelector(".path-planet");
  const summary = await page.locator(".page-head .blurb").innerText();
  check("My path counts read topics", /2 of \d+ topics read/.test(summary), summary.slice(0, 60));
  check("My path offers where to continue", (await page.locator(".path-continue").count()) === 1, await page.locator(".path-continue b").innerText());
  check("read topics are marked", (await page.locator(".chip.read").count()) >= 2);
  await shot("path");
  page.once("dialog", (d) => d.accept());
  await page.click("[data-reset-progress]");
  await page.waitForFunction(() => /0 of \d+ topics read/.test(document.querySelector(".page-head .blurb").textContent));
  check("progress can be reset", true);
} catch (e) { check("site run", false, e.message.split("\n")[0]); }
check("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
await browser.close(); server.close();
process.exit(results.every(Boolean) ? 0 : 1);
