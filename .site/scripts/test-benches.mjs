// Smoke test: opens every topic that embeds a bench, scrolls to it and checks it mounts without console errors.
// Every bench is opened at 1280, 768 and 390px wide and must not overflow horizontally.
// Needs Playwright with Chromium (not a dependency of the site): `npm run test:benches`. Options: --shots=DIR saves screenshots, --only=bench-id tests one bench.
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const shots = (process.argv.find((a) => a.startsWith("--shots=")) || "").slice(8);
const only = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7); // test a single bench id
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };

let chromium;
try { ({ chromium } = await import("playwright")); } catch { console.error("Playwright is not installed; skipping bench smoke test."); process.exit(2); }
if (!existsSync(join(SITE, "content.json"))) { console.error("Run `npm run content` first."); process.exit(1); }
const content = JSON.parse(readFileSync(join(SITE, "content.json"), "utf8"));
const withBenches = Object.values(content.topics).filter((t) => t.benches && t.benches.length);
if (!withBenches.length) { console.log("No benches in the vault yet."); process.exit(0); }
if (shots) mkdirSync(shots, { recursive: true });

const server = createServer((req, res) => {
  const path = join(SITE, decodeURIComponent(req.url.split("?")[0]).replace(/^\/$/, "/index.html"));
  if (!path.startsWith(SITE) || !existsSync(path)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
  res.end(readFileSync(path));
}).listen(0);
const base = `http://localhost:${server.address().port}/`;

const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
let failed = 0;
const WIDTHS = [1280, 768, 390];
for (const topic of withBenches) for (const bench of [...new Set(topic.benches)]) {
  if (only && bench !== only) continue;
  const errors = [];
  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on("console", (m) => { if (m.type() === "error") errors.push(`[${width}] ${m.text()}`); });
    page.on("pageerror", (e) => errors.push(`[${width}] ${e}`));
    await page.goto(`${base}?time=12:00#/${topic.id}`);
    await page.addStyleTag({ content: "#rbar, .r-toast { display: none !important; }" }); // the reading bar is tested in test:reader
    const sel = `.bench[data-bench="${bench}"]`;
    try {
      await page.waitForSelector(sel, { timeout: 15000 });
      await page.waitForFunction((s) => { const el = document.querySelector(s); if (el) el.scrollIntoView({ block: "center" }); return el && el.classList.contains("ready"); }, sel, { timeout: 10000, polling: 200 });
      if (width === WIDTHS[0]) { // exercise every control once
        for (const btn of await page.locator(`${sel} .bench-btn`).all()) await btn.click();
        for (const c of await page.locator(`${sel} input[type=checkbox]`).all()) await c.click();
        for (let i = 0; i < 40 && (await page.locator(`${sel} .sorter-pool .sorter-chip`).count()); i++) { // sorters: place every chip in one of two bins
          await page.locator(`${sel} .sorter-pool .sorter-chip`).first().click();
          await page.locator(`${sel} .sorter-bin-btn`).nth(i % 2).click();
        }
        if (await page.locator(`${sel} .sorter`).count()) await page.locator(`${sel} .sorter .bench-btn`).first().click();
        for (const r of await page.locator(`${sel} input[type=range]`).all()) await r.evaluate((el) => { el.value = el.max; el.dispatchEvent(new Event("input", { bubbles: true })); });
        await page.waitForTimeout(150);
      }
      const over = await page.evaluate((s) => { const el = document.querySelector(s); return { bench: el.scrollWidth - el.clientWidth, page: document.documentElement.scrollWidth - innerWidth }; }, sel);
      if (over.bench > 1) errors.push(`[${width}] bench overflows horizontally by ${over.bench}px`);
      if (over.page > 1) errors.push(`[${width}] page scrolls horizontally by ${over.page}px`);
      if (shots) await page.locator(sel).screenshot({ path: join(shots, `${bench}-${width}.png`) });
    } catch (e) { errors.push(`[${width}] did not mount: ${e.message.split("\n")[0]}`); }
    await page.close();
  }
  console.log(`${errors.length ? "FAIL" : "ok  "} ${topic.id} · ${bench}${errors.length ? "\n  - " + errors.join("\n  - ") : ""}`);
  if (errors.length) failed++;
}
await browser.close(); server.close();
process.exit(failed ? 1 : 0);
