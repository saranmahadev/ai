// Exercises the PWA layer in Chromium: the manifest is linked and valid, the service worker registers,
// and a topic visited once online still renders after going offline and reloading.
// Needs Playwright (a devDependency, installed via `npm ci`): `npm run test:pwa`.
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const shots = (process.argv.find((a) => a.startsWith("--shots=")) || "").slice(8);
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
let chromium;
try { ({ chromium } = await import("playwright")); } catch { console.error("Playwright is not installed; skipping PWA test."); process.exit(2); }
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
const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 } });
const page = await ctx.newPage();
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));

try {
  // manifest: linked from the page and parses with the fields a browser needs to consider it installable
  await page.goto(`${base}?time=12:00#/`);
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
  check("manifest is linked from the page", manifestHref === "/manifest.json", manifestHref);
  const manifest = await page.evaluate(() => fetch("/manifest.json").then((r) => r.json()));
  check("manifest has the fields a browser needs to install the app", Boolean(manifest.name && manifest.start_url && manifest.icons?.length >= 2), JSON.stringify(Object.keys(manifest)));

  // service worker: registers and reaches the active state
  await page.goto(`${base}?time=12:00#/math/logarithms`);
  await page.waitForSelector(".doc .prose");
  const swState = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return reg.active ? reg.active.state : null;
  });
  check("service worker reaches the active state", swState === "activated", String(swState));
  await shot(page, "pwa-online");
  check("no console errors while online", errors.length === 0, errors.slice(0, 3).join(" | "));

  // offline: a topic visited once online (so the shell and its body are cached) still renders after reload.
  // Fonts and a bench's own module are deliberately not precached (see sw.js) and fail to load here, which
  // is expected degradation, not a bug — only the core reading experience is asserted.
  errors.length = 0;
  await ctx.setOffline(true);
  await page.reload();
  await page.waitForSelector(".doc .prose", { timeout: 10000 });
  const title = await page.locator(".doc-title").innerText();
  check("a visited topic still renders offline", title.trim() === "Logarithms", title);
  await shot(page, "pwa-offline");
  await ctx.setOffline(false);
} catch (e) { check("pwa run", false, e.message.split("\n")[0]); }
await browser.close(); server.close();
process.exit(results.every(Boolean) ? 0 : 1);

async function shot(p, name) { if (shots) await p.screenshot({ path: join(shots, `${name}.png`) }); }
