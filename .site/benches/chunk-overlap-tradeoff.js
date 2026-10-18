// Bench: slide chunk overlap and watch a boundary-straddling fact get rescued, at a redundancy cost.
import { chunkWithOverlap } from "./ragkit.js";

const DOC = "Returns are accepted within 30 days. Items must be unworn and in original packaging. Refunds are issued to the original payment method within 5 business days. Store credit is available as an alternative.";
const SIZE = 40;
const FACT = "original payment method";

const OVERLAPS = [0, 10, 20];

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Rescuing a split fact costs redundant tokens" });
  const say = live(body);
  let overlap = 0;

  const cv = canvas(body, { aspect: 0.4, label: "Redundancy vs. overlap" });
  const st = stats([["chunks", "chunk count"], ["redundancy", "redundant characters"], ["fact", `"${FACT}" intact in some chunk`]]);
  const ch = choice("overlap (characters)", OVERLAPS.map((v) => [String(v), String(v)]), String(overlap), (v) => { overlap = +v; update(); });
  body.append(cv.box, st.el, ch.el);

  function compute(ov) {
    const chunks = chunkWithOverlap(DOC, SIZE, ov);
    const totalChars = chunks.reduce((s, c) => s + c.length, 0);
    const redundancy = (totalChars - DOC.length) / DOC.length;
    const intact = chunks.some((c) => c.includes(FACT));
    return { chunks, redundancy, intact };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const points = OVERLAPS.map((ov) => compute(ov).redundancy);
    const bw = w / points.length;
    points.forEach((r, i) => {
      const bh = r * (hh - 30);
      ctx.fillStyle = OVERLAPS[i] === overlap ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.2), hh - 15 - bh, bw * 0.6, bh);
    });
  });

  function update() {
    const { chunks, redundancy, intact } = compute(overlap);
    st.set("chunks", String(chunks.length));
    st.set("redundancy", `${(redundancy * 100).toFixed(1)}%`);
    st.set("fact", intact ? "yes" : "no");
    say(`overlap ${overlap}: ${chunks.length} chunks, ${(redundancy * 100).toFixed(1)} percent redundant characters, fact intact: ${intact ? "yes" : "no"}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
