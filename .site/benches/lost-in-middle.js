// Bench: slide through a long context and watch retrieval accuracy dip in the middle.
import { lostInMiddleAccuracy } from "./llmkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Easiest to recall at the edges" });
  const say = live(body);
  let fracPos = 0.5;

  const cv = canvas(body, { aspect: 0.4, label: "Retrieval accuracy by position in context" });
  const st = stats([["accuracy", "accuracy at this position"]]);
  const sl = slider({ label: "position in context", min: 0, max: 1, step: 0.02, value: fracPos, format: (v) => `${(v * 100).toFixed(0)}%`, onInput: (v) => { fracPos = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const steps = 60;
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const f = i / steps, y = lostInMiddleAccuracy(f);
      const px = f * w, py = hh - 15 - y * (hh - 30);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    const mx = fracPos * w, my = hh - 15 - lostInMiddleAccuracy(fracPos) * (hh - 30);
    ctx.fillStyle = p.warm; ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2); ctx.fill();
  });

  function update() {
    const acc = lostInMiddleAccuracy(fracPos);
    st.set("accuracy", `${(acc * 100).toFixed(1)}%`);
    say(`position ${(fracPos * 100).toFixed(0)}%: accuracy ${(acc * 100).toFixed(1)}%`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
