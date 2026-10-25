// Exercises Graph Mode (graph.js) in Chromium: layout settles, node/edge counts match content.json,
// click-to-navigate, search-highlight, and planet filtering. Needs Playwright (a devDependency,
// installed via `npm ci`): `npm run test:graph`. Add --shots=DIR to save screenshots.
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const shots = (process.argv.find((a) => a.startsWith("--shots=")) || "").slice(8);
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
let chromium;
try { ({ chromium } = await import("playwright")); } catch { console.error("Playwright is not installed; skipping graph test."); process.exit(2); }
if (!existsSync(join(SITE, "content.json"))) { console.error("Run `npm run content` first."); process.exit(1); }
const content = JSON.parse(readFileSync(join(SITE, "content.json"), "utf8"));
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
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
const shot = async (name) => { if (shots) await page.screenshot({ path: join(shots, `${name}.png`) }); };
const hash = () => page.evaluate(() => location.hash);
const overflowing = () => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);

try {
  await page.goto(`${base}?debug&time=12:00#/graph`);
  await page.waitForSelector("#graphcanvas");
  await page.waitForFunction(() => document.getElementById("gstatus")?.hidden === true, { timeout: 15000 });
  await shot("graph-desktop");

  await page.waitForFunction(() => window.__aiBase && window.__aiBase.graph, { timeout: 15000 });
  const nodeCount = await page.evaluate(() => window.__aiBase.graph.nodes.length);
  check("every topic becomes a node", nodeCount === content.stats.topics, `${nodeCount} of ${content.stats.topics}`);
  const edgeCount = await page.evaluate(() => window.__aiBase.graph.edges.length);
  check("the link graph produces edges", edgeCount > 0, `${edgeCount} edges`);

  // click-to-navigate: pick any node, click its on-screen position
  const targetId = await page.evaluate(() => window.__aiBase.graph.nodes[0].id);
  const spot = await page.evaluate((id) => window.__aiBase.graph.screenPosOf(id), targetId);
  check("the clicked node has a screen position", !!spot && typeof spot.x === "number");
  if (spot) {
    await page.mouse.click(spot.x, spot.y);
    await page.waitForFunction((id) => location.hash === `#/${id}`, targetId, { timeout: 5000 }).catch(() => {});
    check("clicking a node opens that topic", (await hash()) === `#/${targetId}`, await hash());
  }

  // back to the graph, same mounted instance (cached layout, no resettle)
  await page.evaluate(() => { location.hash = "#/graph"; });
  await page.waitForSelector("#graphcanvas");

  // search highlights and Enter opens a single match
  await page.fill("#gsearch", "Logarithms");
  await page.waitForTimeout(100);
  await page.keyboard.press("Enter");
  await page.waitForFunction(() => location.hash === "#/math/logarithms", { timeout: 5000 }).catch(() => {});
  check("search + Enter opens the single match", (await hash()) === "#/math/logarithms", await hash());
  await page.evaluate(() => { location.hash = "#/graph"; });
  await page.waitForSelector("#graph:not([hidden])");
  await page.fill("#gsearch", "");

  // legend + planet filter
  await page.click("#gctltoggle");
  await page.waitForSelector("#gpanel:not([hidden])");
  const legendCount = await page.locator("#glegend input[type=checkbox]").count();
  check("the legend lists every planet with a written topic", legendCount > 0, `${legendCount} planets`);
  await page.uncheck('#glegend input[data-planet="math"]').catch(() => {});
  const hiddenHasMath = await page.evaluate(() => window.__aiBase.graph.toggleHiddenPlanets.has("math"));
  check("unchecking a planet hides it from the graph", hiddenHasMath);
  await page.check('#glegend input[data-planet="math"]').catch(() => {});

  await page.click("#greset");
  await shot("graph-after-filter");

  // phone width: no horizontal overflow, controls still usable
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(150);
  check("no horizontal overflow at phone width", !(await overflowing()));
  await shot("graph-mobile");
} catch (e) { check("graph run", false, e.message.split("\n")[0]); }
check("no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));
await browser.close(); server.close();
process.exit(results.every(Boolean) ? 0 : 1);
