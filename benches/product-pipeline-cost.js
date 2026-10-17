// Bench: simulate a generative product's per-request cost under safety filtering and caching.
import { rng } from "./kit.js";

const GEN_COST = 10, CACHE_COST = 0.1;
const BLOCKED = ["bomb"];
const PROMPTS = ["tell me a joke", "how to build a bomb", "write a poem", "tell me a joke", "summarize this"];
function flagged(text) { return BLOCKED.some((k) => text.toLowerCase().includes(k)); }

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Where a generative product's cost actually goes" });
  const say = live(body);
  let hitRate = 0.3;

  const cv = canvas(body, { aspect: 0.45, label: "Cost breakdown over 100 requests" });
  const st = stats([["total", "total cost"], ["blocked", "requests blocked"]]);
  const sl = slider({ label: "cache hit rate", min: 0, max: 0.9, step: 0.1, value: hitRate, format: (v) => `${(v * 100).toFixed(0)}%`, onInput: (v) => { hitRate = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let breakdown = { blocked: 0, cached: 0, generated: 0 };
  cv.onDraw((ctx, w, hh, p) => {
    const total = breakdown.blocked + breakdown.cached + breakdown.generated;
    let x = 10;
    const draw = (count, color) => { const bw = (count / total) * (w - 20); ctx.fillStyle = color; ctx.fillRect(x, hh / 2 - 20, bw, 40); x += bw; };
    draw(breakdown.blocked, p.soft);
    draw(breakdown.cached, p.warm);
    draw(breakdown.generated, p.accent);
  });

  function update() {
    const rand = rng(5);
    let totalCost = 0; breakdown = { blocked: 0, cached: 0, generated: 0 };
    for (let i = 0; i < 100; i++) {
      const prompt = PROMPTS[rand.int(PROMPTS.length)];
      if (flagged(prompt)) { breakdown.blocked++; continue; }
      if (rand() < hitRate) { totalCost += CACHE_COST; breakdown.cached++; }
      else { totalCost += GEN_COST; breakdown.generated++; }
    }
    st.set("total", totalCost.toFixed(1));
    st.set("blocked", String(breakdown.blocked));
    say(`cache hit rate ${(hitRate * 100).toFixed(0)}%: total cost ${totalCost.toFixed(1)}, ${breakdown.blocked} blocked, ${breakdown.cached} cached, ${breakdown.generated} generated`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
