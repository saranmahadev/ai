// Bench: compare raw transcript size against a fixed summarization budget as a conversation grows.
import { rawTranscriptTokens, compressionRatio } from "./agentkit.js";

const PER_TURN = 120, CAP = 400;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Keeping everything, or keeping a summary" });
  const say = live(body);
  let turns = 50;

  const cv = canvas(body, { aspect: 0.42, label: "Raw transcript tokens vs. a fixed summary budget" });
  const st = stats([["raw", "raw transcript tokens"], ["cap", "summary budget"], ["ratio", "compression ratio"]]);
  const sT = slider({ label: "Conversation turns", min: 5, max: 200, step: 5, value: turns, onInput: (v) => { turns = v; update(); } });
  body.append(cv.box, st.el, sT.el);

  cv.onDraw((ctx, w, hh, p) => {
    const raw = rawTranscriptTokens(turns, PER_TURN);
    const maxV = Math.max(raw, CAP) * 1.1;
    const bw = w / 3;
    [["raw transcript", raw, p.warm], ["summary budget", CAP, p.good]].forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 40);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 24 - bh, bw * 0.7, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(String(v), bw * (i + 0.6) + bw * 0.35, hh - 24 - bh - 6);
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.35, hh - 6);
    });
  });

  function update() {
    const raw = rawTranscriptTokens(turns, PER_TURN);
    const ratio = compressionRatio(turns, PER_TURN, CAP);
    st.set("raw", String(raw));
    st.set("cap", String(CAP));
    st.set("ratio", `${ratio.toFixed(1)}×`);
    say(`${turns} turns: raw transcript ${raw} tokens, summary budget stays at ${CAP}, a ${ratio.toFixed(1)}-times compression`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
