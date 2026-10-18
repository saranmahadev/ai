// Bench: grow the system prompt and request volume and watch its share of total tokens climb.
import { templateOverhead } from "./llmkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "A fixed instruction, paid for on every request" });
  const say = live(body);
  let systemTokens = 20, nRequests = 1000;
  const userTokens = 30, assistantTokens = 60;

  const cv = canvas(body, { aspect: 0.4, label: "Total tokens: system prompt share vs. conversation share" });
  const st = stats([["total", "total tokens"], ["systemShare", "system prompt's share"]]);
  const s1 = slider({ label: "system prompt length (tokens)", min: 10, max: 400, step: 10, value: systemTokens, format: (v) => String(v), onInput: (v) => { systemTokens = v; update(); } });
  const s2 = slider({ label: "number of requests", min: 100, max: 5000, step: 100, value: nRequests, format: (v) => String(v), onInput: (v) => { nRequests = v; update(); } });
  body.append(cv.box, st.el, s1.el, s2.el);

  cv.onDraw((ctx, w, hh, p) => {
    const { systemFraction } = templateOverhead(systemTokens, userTokens, assistantTokens, nRequests);
    const barW = w - 40, x0 = 20;
    ctx.fillStyle = p.soft; ctx.fillRect(x0, hh / 2 - 15, barW, 30);
    ctx.fillStyle = p.warm; ctx.fillRect(x0, hh / 2 - 15, barW * systemFraction, 30);
    ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    ctx.fillText(`system prompt: ${(systemFraction * 100).toFixed(0)}% of all tokens sent`, w / 2, hh / 2 + 35);
  });

  function update() {
    const { totalTokens, systemFraction } = templateOverhead(systemTokens, userTokens, assistantTokens, nRequests);
    st.set("total", totalTokens.toLocaleString());
    st.set("systemShare", `${(systemFraction * 100).toFixed(1)}%`);
    say(`system prompt ${systemTokens} tokens across ${nRequests} requests: ${(systemFraction * 100).toFixed(1)} percent of all tokens sent`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
