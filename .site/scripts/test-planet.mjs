// Walks the planet scene in Chromium (options: --planet=id, --time=HH:MM, --shots=DIR): › walks to the first topic's street, the lodge prompt appears, E opens the article,
// and "back" returns to that street. Needs Playwright (not a site dependency): `npm run test:planet`. Add --shots=DIR for screenshots.
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const shots = (process.argv.find((a) => a.startsWith("--shots=")) || "").slice(8);
const planetId = (process.argv.find((a) => a.startsWith("--planet=")) || "--planet=fundamentals").slice(9);
const time = (process.argv.find((a) => a.startsWith("--time=")) || "--time=12:00").slice(7); // e.g. --time=22:30 to test night
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
  await page.goto(`${base}?time=${time}#/${planetId}`);
  await page.waitForSelector("#planet:not([hidden])", { timeout: 20000 });
  await page.waitForTimeout(2500);
  check("planet scene shows", true);
  await shot("planet-start");

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

check("no console errors", errors.length === 0, errors.join(" | "));
await browser.close(); server.close();
process.exit(steps.every((s) => s.ok) ? 0 : 1);
