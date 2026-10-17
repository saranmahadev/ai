// Bench: compare the ALiBi distance bias across heads with different slopes, including at very long distances.
import { alibiBias } from "./tfkit.js";

const NUM_HEADS = 8;
const SLOPES = Array.from({ length: NUM_HEADS }, (_, h) => 2 ** (-8 * (h + 1) / NUM_HEADS));

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "A distance penalty, different per head" });
  const say = live(body);
  let dist = 20;

  const cv = canvas(body, { aspect: 0.5, label: "ALiBi bias at this distance, one bar per head" });
  const st = stats([["steep", "steepest head's bias"], ["shallow", "shallowest head's bias"]]);
  const sl = slider({ label: "distance", min: 1, max: 20000, step: 1, value: dist, format: (v) => v.toLocaleString(), onInput: (v) => { dist = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let biases = [];
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (NUM_HEADS + 1);
    const maxAbs = Math.max(...biases.map((b) => Math.abs(b)), 0.1);
    biases.forEach((b, i) => {
      const bh = (Math.abs(b) / maxAbs) * (hh - 50);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.5), hh - 24 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`h${i}`, bw * (i + 0.5) + bw * 0.3, hh - 8);
    });
  });

  function update() {
    biases = SLOPES.map((slope) => alibiBias(slope, dist, 0));
    st.set("steep", biases[0].toFixed(4));
    st.set("shallow", biases[NUM_HEADS - 1].toFixed(4));
    say(`distance ${dist.toLocaleString()}; steepest head bias ${biases[0].toFixed(3)}, shallowest ${biases[NUM_HEADS - 1].toFixed(4)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
