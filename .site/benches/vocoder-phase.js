// Bench: compare a phase discontinuity between naively concatenated frames against phase-continued ones.
import { sineFrame } from "./gakit.js";

const SR = 8000, FREQ = 440, N = 40;

export default function mount(root, kit) {
  const { frame, canvas, toggles, stats, live } = kit;
  const body = frame(root, { title: "Stitching audio frames without a click" });
  const say = live(body);
  let continuous = false;

  const cv = canvas(body, { aspect: 0.45, label: "Two stitched frames of a tone" });
  const st = stats([["jump", "boundary jump"]]);
  const tg = toggles([["continuous", "continue phase across frames", continuous]], (v) => { continuous = v.continuous; update(); });
  body.append(cv.box, st.el, tg.el);

  let samples = [];
  cv.onDraw((ctx, w, hh, p) => {
    const mid = hh / 2, amp = hh / 2 - 10;
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    samples.forEach((v, i) => {
      const x = (i / (samples.length - 1)) * w, y = mid - v * amp;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.strokeStyle = p.soft; ctx.setLineDash([4, 4]); ctx.beginPath();
    ctx.moveTo((N / samples.length) * w, 0); ctx.lineTo((N / samples.length) * w, hh); ctx.stroke(); ctx.setLineDash([]);
  });

  function update() {
    const f1 = sineFrame(FREQ, 1, N, SR, 0);
    const f2 = sineFrame(FREQ, 1, N, SR, continuous ? f1.endPhase : 0);
    samples = [...f1.samples, ...f2.samples];
    const jump = Math.abs(f2.samples[0] - f1.samples[N - 1]);
    st.set("jump", jump.toFixed(4));
    say(`${continuous ? "phase-continued" : "naive"} stitching: boundary jump of ${jump.toFixed(4)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
