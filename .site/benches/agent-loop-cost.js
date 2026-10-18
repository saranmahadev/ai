// Bench: total cost/latency of an n-step agent loop with a growing transcript, reusing apiCostLatency (LLMs planet) and rawTranscriptTokens (Memory district).
import { apiCostLatency } from "./llmkit.js";
import { rawTranscriptTokens } from "./agentkit.js";

const PRICING = { priceIn: 0.003, priceOut: 0.015, prefillPerTok: 0.0005, decodePerTok: 0.02, fixedOverhead: 0.1 };
const BASE_INPUT = 500, PER_TURN = 150, OUTPUT_TOKENS = 120;

export default function mount(root, kit) {
  const { frame, h, slider, stats, live } = kit;
  const body = frame(root, { title: "One loop, growing transcript, compounding cost" });
  const say = live(body);
  let nSteps = 5;

  const list = h("ol", { class: "isai-list" });
  const st = stats([["total", "total loop cost"], ["ratio", "loop cost ÷ (single call × n)"]]);
  const sl = slider({ label: "loop length", min: 1, max: 10, step: 1, value: nSteps, format: (v) => `${v} steps`, onInput: (v) => { nSteps = v; update(); } });
  body.append(list, st.el, sl.el);

  function update() {
    let totalCost = 0;
    list.textContent = "";
    for (let i = 1; i <= nSteps; i++) {
      const inputTokens = BASE_INPUT + rawTranscriptTokens(i - 1, PER_TURN);
      const { cost } = apiCostLatency(inputTokens, OUTPUT_TOKENS, PRICING);
      totalCost += cost;
      list.append(h("li", {}, `step ${i}: ${inputTokens} input tokens → $${cost.toFixed(5)}`));
    }
    const single = apiCostLatency(BASE_INPUT, OUTPUT_TOKENS, PRICING).cost;
    const naive = single * nSteps;
    st.set("total", `$${totalCost.toFixed(5)}`);
    st.set("ratio", (totalCost / naive).toFixed(3));
    say(`${nSteps}-step loop costs $${totalCost.toFixed(5)}, ${(totalCost / naive).toFixed(2)} times a flat single-call estimate`);
  }
  update();
  return () => {};
}
