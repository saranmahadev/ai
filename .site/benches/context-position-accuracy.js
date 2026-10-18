// Bench: slide where the most relevant passage sits in the assembled context and watch the odds it actually gets used.
import { lostInMiddleAccuracy } from "./llmkit.js";

const N = 5;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "First, last, or buried in the middle" });
  const say = live(body);
  let position = 0;

  const cv = canvas(body, { aspect: 0.4, label: "Accuracy by position of the most relevant passage" });
  const st = stats([["accuracy", "chance the passage actually gets used"]]);
  const sl = slider({ label: `position among ${N} assembled passages`, min: 0, max: N - 1, step: 1, value: position, format: (v) => `${v + 1} of ${N}`, onInput: (v) => { position = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / N;
    for (let i = 0; i < N; i++) {
      const frac = i / (N - 1);
      const acc = lostInMiddleAccuracy(frac);
      const bh = acc * (hh - 30);
      ctx.fillStyle = i === position ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.2), hh - 15 - bh, bw * 0.6, bh);
    }
  });

  function update() {
    const frac = position / (N - 1);
    const acc = lostInMiddleAccuracy(frac);
    st.set("accuracy", `${(acc * 100).toFixed(0)}%`);
    say(`most relevant passage at position ${position + 1} of ${N}: ${(acc * 100).toFixed(0)} percent chance it's actually used`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
