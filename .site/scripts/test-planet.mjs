// Walks the planet scene in Chromium (options: --planet=id, --time=HH:MM, --shots=DIR): the HUD (weather, detail, connections, radar), a draw-call budget and seeded scenery are checked first; then › walks to the first topic's street, the lodge prompt appears, E opens the article,
// and "back" returns to that street. Needs Playwright (not a site dependency): `npm run test:planet`. Add --shots=DIR for screenshots.
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const shots = (process.argv.find((a) => a.startsWith("--shots=")) || "").slice(8);
const planetId = (process.argv.find((a) => a.startsWith("--planet=")) || "--planet=fundamentals").slice(9);
const time = (process.argv.find((a) => a.startsWith("--time=")) || "--time=12:00").slice(7); // e.g. --time=22:30 to test night
const planetBudget = 190; // draw calls in Full detail (measured, with headroom)
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
let chromium;
try { ({ chromium } = await import("playwright")); } catch { console.error("Playwright is not installed; skipping planet test."); process.exit(2); }
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
const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
const errors = [], steps = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
const check = (name, ok, detail = "") => { steps.push({ name, ok }); console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? " · " + detail : ""}`); };
const shot = async (name) => { if (shots) await page.screenshot({ path: join(shots, `${name}.png`) }); };

try {
  await page.goto(`${base}?time=${time}&debug&detail=full#/${planetId}`);
  await page.waitForSelector("#planet:not([hidden])", { timeout: 20000 });
  await page.waitForTimeout(2500);
  check("planet scene shows", true);
  await shot("planet-start");

  // HUD: weather selector, detail, connections, radar
  const hudOk = await page.evaluate(() => ["#pmap", "#pweather", "#pdetail", "#pconn", "#pradar"].every((q) => document.querySelector(q)));
  check("HUD has radar, weather, detail, connections and radar controls", hudOk);
  const stats = await page.evaluate(() => window.__aiBase.planetScene.stats());
  check("knowledge grid draws connection beams", stats.beams > 0, `${stats.beams} beams`);
  for (const w of ["storm", "snow", "rain", "mist", "cloudy", "clear"]) {
    await page.selectOption("#pweather", w);
    const got = await page.evaluate(() => document.querySelector("#planet").dataset.weather);
    if (got !== w) check(`weather selector sets ${w}`, false, got);
    await page.waitForTimeout(150);
  }
  check("weather selector sets every mode", true);
  await page.selectOption("#pweather", "auto");
  const auto = await page.evaluate(() => document.querySelector("#planet").dataset.weather);
  check("auto weather resolves to a mode", ["clear", "cloudy", "mist", "rain", "snow", "storm"].includes(auto), auto);
  await page.selectOption("#pweather", "clear");
  await page.locator("#pconn").uncheck(); await page.locator("#pconn").check();
  await page.keyboard.press("m");
  check("M hides the radar", await page.locator("#pmap").isHidden());
  await page.keyboard.press("m");
  await page.waitForTimeout(600);
  const painted = await page.evaluate(() => { const c = document.querySelector("#pmap"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; });
  check("radar canvas is drawn", painted > 2000, `${painted} px`);
  await page.waitForTimeout(1200);
  const calls = await page.evaluate(() => window.__aiBase.stage.renderer.info.render.calls);
  check(`draw calls stay within budget (${planetBudget})`, calls > 0 && calls <= planetBudget, `${calls} calls`);
  await shot("planet-hud");
  for (const w of ["storm", "snow"]) { await page.selectOption("#pweather", w); await page.waitForTimeout(400); await shot(`planet-${w}`); }
  await page.selectOption("#pweather", "clear");
  const hashA = stats.sceneryHash;
  await page.goto(`${base}?time=${time}&debug&detail=full#/ai`); await page.waitForTimeout(300);
  await page.goto(`${base}?time=${time}&debug&detail=full#/${planetId}`);
  await page.waitForSelector("#planet:not([hidden])", { timeout: 20000 });
  await page.waitForTimeout(1500);
  const hashB = await page.evaluate(() => window.__aiBase.planetScene.stats().sceneryHash);
  check("scenery is the same on every visit", hashA === hashB, `${hashA} / ${hashB}`);

  await page.click("#pnext"); // the first stop is the district kiosk
  await page.waitForSelector("#pprompt:not([hidden])", { timeout: 60000 });
  const kiosk = (await page.locator("#pprompt h3").innerText()).trim();
  check("walking to the district kiosk shows its prompt", !!kiosk, kiosk);
  await page.click("#pnext"); // the next stop is the first street
  await page.waitForFunction((k) => { const el = document.querySelector("#pprompt:not([hidden]) h3"); return el && el.textContent.trim() !== k; }, kiosk, { timeout: 90000 });
  const prompt = (await page.locator("#pprompt h3").innerText()).trim();
  check("walking down a street reaches its lodge prompt", !!prompt && prompt !== kiosk, prompt);
  await page.waitForTimeout(400);
  await shot("planet-lodge");

  const progress = (await page.locator("#pmeta").innerText()).trim();
  await page.keyboard.press("e");
  await page.waitForFunction(() => /^#\/[^/]+\/[^/?]+/.test(location.hash), null, { timeout: 15000 });
  await page.waitForSelector(".doc .prose", { timeout: 15000 });
  const hash = await page.evaluate(() => location.hash);
  check("E opens the topic as a standard article", await page.locator("body.reading").count() === 1, hash);
  await shot("planet-article");

  await page.click(".nb-back");
  await page.waitForSelector("#planet:not([hidden])", { timeout: 15000 });
  await page.waitForTimeout(1500);
  const after = (await page.locator("#pmeta").innerText()).trim();
  check("back returns to the street you read", after !== "" && (progress === "" || after === progress), `${progress || "n/a"} → ${after}`);
  await shot("planet-back");
} catch (e) { check("planet walk", false, e.message.split("\n")[0]); }

// with motion on: rain, snow and storms animate (particles, lightning) without errors
try {
  const mctx = await browser.newContext({ viewport: { width: 1000, height: 700 } });
  const mp = await mctx.newPage();
  mp.on("console", (m) => { if (m.type() === "error") errors.push("[motion] " + m.text()); });
  mp.on("pageerror", (e) => errors.push("[motion] " + e));
  await mp.goto(`${base}?time=${time}&debug&detail=lite#/${planetId}`);
  await mp.waitForSelector("#planet:not([hidden])", { timeout: 20000 });
  await mp.waitForTimeout(4500);
  for (const w of ["rain", "snow", "storm"]) { await mp.selectOption("#pweather", w); await mp.waitForTimeout(1800); if (shots && w === "storm") await mp.screenshot({ path: join(shots, "planet-storm-motion.png") }); }
  check("weather animates with motion on", (await mp.evaluate(() => document.querySelector("#planet").dataset.weather)) === "storm");
  await mctx.close();
} catch (e) { check("weather with motion", false, e.message.split("\n")[0]); }

check("no console errors", errors.length === 0, errors.join(" | "));
await browser.close(); server.close();
process.exit(steps.every((s) => s.ok) ? 0 : 1);
