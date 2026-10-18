// Bench: slide a safety filter's block threshold and watch over-blocking trade off against catching real attacks.
import { guardrailStats } from "./llmkit.js";

const SAFE_SCORES = [0.05, 0.08, 0.1, 0.15, 0.18, 0.22, 0.28, 0.35, 0.42, 0.55];
const UNSAFE_SCORES = [0.45, 0.5, 0.58, 0.62, 0.68, 0.72, 0.8, 0.85, 0.9, 0.95];

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Looser catches more, and over-blocks more" });
  const say = live(body);
  let threshold = 0.5;

  const cv = canvas(body, { aspect: 0.4, label: "Safe (left) and unsafe (right) example scores, against the threshold" });
  const st = stats([["falsePos", "safe content wrongly blocked"], ["catch", "unsafe content caught"]]);
  const sl = slider({ label: "block threshold", min: 0, max: 1, step: 0.02, value: threshold, format: (v) => v.toFixed(2), onInput: (v) => { threshold = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const tx = threshold * w;
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx, 10); ctx.lineTo(tx, hh - 10); ctx.stroke();
    function dot(score, y, blocked) {
      ctx.fillStyle = blocked ? p.warm : p.accent;
      ctx.beginPath(); ctx.arc(score * w, y, 5, 0, Math.PI * 2); ctx.fill();
    }
    SAFE_SCORES.forEach((s) => dot(s, hh * 0.35, s >= threshold));
    UNSAFE_SCORES.forEach((s) => dot(s, hh * 0.65, s >= threshold));
    ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "left";
    ctx.fillText("safe examples", 6, hh * 0.35 - 12);
    ctx.fillText("unsafe examples", 6, hh * 0.65 - 12);
  });

  function update() {
    const { falsePositiveRate, catchRate } = guardrailStats(SAFE_SCORES, UNSAFE_SCORES, threshold);
    st.set("falsePos", `${(falsePositiveRate * 100).toFixed(0)}%`);
    st.set("catch", `${(catchRate * 100).toFixed(0)}%`);
    say(`threshold ${threshold.toFixed(2)}: ${(falsePositiveRate * 100).toFixed(0)} percent of safe content wrongly blocked, ${(catchRate * 100).toFixed(0)} percent of unsafe content caught`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
