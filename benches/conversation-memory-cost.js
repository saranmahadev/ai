// Bench: compare full-history replay against a bounded summarized history as a conversation grows.
import { fullReplayTokens, summarizedTokens } from "./llmkit.js";

const TPT = 150, BUDGET = 500;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "One grows forever, one doesn't" });
  const say = live(body);
  let turn = 10;

  const cv = canvas(body, { aspect: 0.45, label: "Token cost vs. turn number" });
  const st = stats([["full", "full replay tokens"], ["summarized", "summarized tokens"]]);
  const sl = slider({ label: "turn number", min: 1, max: 40, step: 1, value: turn, format: (v) => String(v), onInput: (v) => { turn = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const steps = 40;
    const maxTok = fullReplayTokens(40, TPT);
    const draw = (fn, color) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
      for (let t = 1; t <= steps; t++) {
        const px = (t / steps) * w, py = hh - 15 - (fn(t, TPT, BUDGET) / maxTok) * (hh - 30);
        t === 1 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.stroke();
    };
    draw((t) => fullReplayTokens(t, TPT), p.warm);
    draw((t) => summarizedTokens(t, TPT, BUDGET), p.accent);
  });

  function update() {
    st.set("full", String(fullReplayTokens(turn, TPT)));
    st.set("summarized", String(summarizedTokens(turn, TPT, BUDGET)));
    say(`turn ${turn}: full replay ${fullReplayTokens(turn, TPT)} tokens, summarized ${summarizedTokens(turn, TPT, BUDGET)} tokens`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
