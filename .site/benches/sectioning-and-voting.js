// Bench: compare sequential vs. sectioned (parallel) latency, and watch majority-vote accuracy climb with more samples.
import { majorityVoteAccuracy } from "./agentkit.js";

const SECTION_TIMES = [1200, 1500, 900];
const SAMPLE_ACCURACY = 0.6;

export default function mount(root, kit) {
  const { frame, canvas, choice, slider, stats, live } = kit;
  const body = frame(root, { title: "Splitting work up, or asking several times" });
  const say = live(body);
  let mode = "sectioning";
  let n = 1;

  const cv = canvas(body, { aspect: 0.4, label: "Sectioning latency, or voting accuracy" });
  const st = stats([["value", "result"]]);
  const ch = choice("Pattern", [["sectioning", "sectioning (parallel subtasks)"], ["voting", "voting (majority of N samples)"]], mode, (v) => { mode = v; update(); });
  const sl = slider({ label: "N samples (voting only)", min: 1, max: 9, step: 1, value: n, format: (v) => String(v), onInput: (v) => { n = v; update(); } });
  body.append(cv.box, st.el, ch.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    if (mode === "sectioning") {
      const seqTotal = SECTION_TIMES.reduce((a, b) => a + b, 0), parTotal = Math.max(...SECTION_TIMES);
      const bw = w / 3, maxV = seqTotal;
      [["sequential", seqTotal, p.warm], ["sectioned", parTotal, p.accent]].forEach(([label, v, color], i) => {
        const bh = (v / maxV) * (hh - 30);
        ctx.fillStyle = color; ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
        ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(label, bw * (i + 0.6) + bw * 0.3, hh - 2);
      });
    } else {
      const allN = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const bw = w / allN.length;
      allN.forEach((nn, i) => {
        const acc = majorityVoteAccuracy(nn, SAMPLE_ACCURACY);
        const bh = acc * (hh - 30);
        ctx.fillStyle = nn === n ? p.accent : p.soft;
        ctx.fillRect(bw * (i + 0.2), hh - 15 - bh, bw * 0.6, bh);
        ctx.fillStyle = p.ink; ctx.font = "700 8px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(String(nn), bw * (i + 0.2) + bw * 0.3, hh - 2);
      });
    }
  });

  function update() {
    if (mode === "sectioning") {
      const seqTotal = SECTION_TIMES.reduce((a, b) => a + b, 0), parTotal = Math.max(...SECTION_TIMES);
      st.set("value", `sequential ${seqTotal}ms vs. sectioned ${parTotal}ms (${(seqTotal / parTotal).toFixed(2)}× faster)`);
      say(`sectioning: sequential ${seqTotal}ms, sectioned ${parTotal}ms, ${(seqTotal / parTotal).toFixed(2)} times faster`);
    } else {
      const acc = majorityVoteAccuracy(n, SAMPLE_ACCURACY);
      st.set("value", `${(acc * 100).toFixed(1)}%`);
      say(`voting with N=${n} samples at 60 percent per-sample accuracy: majority-vote accuracy ${(acc * 100).toFixed(1)} percent`);
    }
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
