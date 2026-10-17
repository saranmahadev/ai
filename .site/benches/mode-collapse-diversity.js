// Bench: watch a generator's sample diversity shrink across training "epochs" -- mode collapse.
import { avgPairwiseDist } from "./gakit.js";
import { rng } from "./kit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Sample diversity shrinking over training" });
  const say = live(body);
  let epoch = 0;

  const cv = canvas(body, { aspect: 0.5, label: "Generated samples at this epoch" });
  const st = stats([["spread", "average pairwise distance"]]);
  const sl = slider({ label: "training epoch", min: 0, max: 6, step: 1, value: epoch, format: (v) => String(v), onInput: (v) => { epoch = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let samples = [];
  cv.onDraw((ctx, w, hh, p) => {
    const cx = w / 2, cy = hh / 2, scalePx = Math.min(w, hh) / 5;
    samples.forEach(([x, y]) => {
      ctx.fillStyle = p.accent;
      ctx.beginPath(); ctx.arc(cx + x * scalePx, cy - y * scalePx, 6, 0, Math.PI * 2); ctx.fill();
    });
  });

  function update() {
    const rand = rng(epoch + 1);
    const spread = Math.max(0.1, 2 - epoch * 0.3);
    samples = Array.from({ length: 8 }, () => [(rand() * 2 - 1) * spread, (rand() * 2 - 1) * spread]);
    const d = avgPairwiseDist(samples);
    st.set("spread", d.toFixed(3));
    say(`epoch ${epoch}: average pairwise distance ${d.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
