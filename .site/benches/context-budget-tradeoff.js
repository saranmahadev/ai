// Bench: slide conversation history length and watch how many retrieved chunks still fit in a fixed context budget.
import { chunksThatFit } from "./ragkit.js";

const BUDGET = 2000, TOKENS_PER_CHUNK = 150;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Conversation history and retrieved chunks compete for the same space" });
  const say = live(body);
  let convTokens = 200;

  const cv = canvas(body, { aspect: 0.4, label: "Budget split: conversation history vs. retrieved chunks" });
  const st = stats([["chunks", "retrieved chunks that fit"]]);
  const sl = slider({ label: "conversation history (tokens)", min: 0, max: 1800, step: 50, value: convTokens, format: (v) => String(v), onInput: (v) => { convTokens = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const n = chunksThatFit(BUDGET, convTokens, TOKENS_PER_CHUNK);
    const chunkTokens = n * TOKENS_PER_CHUNK;
    const bw = w - 40;
    ctx.fillStyle = p.soft; ctx.fillRect(20, hh / 2 - 15, bw, 30);
    ctx.fillStyle = p.warm; ctx.fillRect(20, hh / 2 - 15, bw * (convTokens / BUDGET), 30);
    ctx.fillStyle = p.accent; ctx.fillRect(20 + bw * (convTokens / BUDGET), hh / 2 - 15, bw * (chunkTokens / BUDGET), 30);
  });

  function update() {
    const n = chunksThatFit(BUDGET, convTokens, TOKENS_PER_CHUNK);
    st.set("chunks", String(n));
    say(`conversation history ${convTokens} tokens of a ${BUDGET}-token budget: ${n} retrieved chunks fit`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
