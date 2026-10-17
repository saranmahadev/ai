// Bench: slide input/output token counts and watch cost and latency respond very differently.
import { apiCostLatency } from "./llmkit.js";

const PRICE = { priceIn: 0.003, priceOut: 0.015, prefillPerTok: 0.0005, decodePerTok: 0.02, fixedOverhead: 0.1 };

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Cost scales with tokens, latency with output length" });
  const say = live(body);
  let inputTokens = 50, outputTokens = 150;

  const cv = canvas(body, { aspect: 0.4, label: "Cost ($) and latency (s), to scale" });
  const st = stats([["cost", "cost ($, illustrative pricing)"], ["latency", "latency (s)"]]);
  const s1 = slider({ label: "input tokens", min: 50, max: 8000, step: 50, value: inputTokens, format: (v) => String(v), onInput: (v) => { inputTokens = v; update(); } });
  const s2 = slider({ label: "output tokens", min: 10, max: 1000, step: 10, value: outputTokens, format: (v) => String(v), onInput: (v) => { outputTokens = v; update(); } });
  body.append(cv.box, st.el, s1.el, s2.el);

  cv.onDraw((ctx, w, hh, p) => {
    const { cost, latency } = apiCostLatency(inputTokens, outputTokens, PRICE);
    const bw = w / 3;
    [["cost", cost / 0.03, p.accent], ["latency", latency / 10, p.warm]].forEach(([label, frac, color], i) => {
      const bh = Math.min(1, frac) * (hh - 30);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.3, hh - 2);
    });
  });

  function update() {
    const { cost, latency } = apiCostLatency(inputTokens, outputTokens, PRICE);
    st.set("cost", `$${cost.toFixed(5)}`);
    st.set("latency", `${latency.toFixed(2)}s`);
    say(`${inputTokens} input tokens, ${outputTokens} output tokens: cost ${cost.toFixed(5)} dollars, latency ${latency.toFixed(2)} seconds`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
