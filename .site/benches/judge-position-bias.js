// Bench: watch an LLM judge's preference flip purely from which response is shown first.
import { judgeScoreWithPositionBias } from "./llmkit.js";

const RESPONSE_A = 0.6, RESPONSE_B = 0.65;

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "The same two answers, a different winner" });
  const say = live(body);
  let order = "A-first";

  const cv = canvas(body, { aspect: 0.4, label: "Judge scores by display order" });
  const st = stats([["winner", "judge prefers"]]);
  const ch = choice("Display order", [["A-first", "A shown first"], ["B-first", "B shown first"]], order, (v) => { order = v; update(); });
  body.append(cv.box, st.el, ch.el);

  let scoreA, scoreB;
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / 3;
    const aH = scoreA * (hh - 30), bH = scoreB * (hh - 30);
    ctx.fillStyle = scoreA > scoreB ? p.accent : p.soft; ctx.fillRect(bw * 0.5, hh - 15 - aH, bw * 0.6, aH);
    ctx.fillStyle = scoreB > scoreA ? p.accent : p.soft; ctx.fillRect(bw * 1.7, hh - 15 - bH, bw * 0.6, bH);
    ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    ctx.fillText("A", bw * 0.8, hh - 2); ctx.fillText("B", bw * 2.0, hh - 2);
  });

  function update() {
    scoreA = judgeScoreWithPositionBias(RESPONSE_A, order === "A-first" ? "first" : "second");
    scoreB = judgeScoreWithPositionBias(RESPONSE_B, order === "B-first" ? "first" : "second");
    st.set("winner", scoreA > scoreB ? "A" : "B");
    say(`${order === "A-first" ? "A" : "B"} shown first: judge prefers ${scoreA > scoreB ? "A" : "B"} (A=${scoreA.toFixed(2)}, B=${scoreB.toFixed(2)})`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
