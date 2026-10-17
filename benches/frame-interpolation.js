// Bench: interpolate missing frames between two known frames, the inpainting idea applied along time.
import { harmonicInpaint } from "./gakit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Interpolating the frames in between" });
  const say = live(body);
  let gapFrames = 3;

  const cv = canvas(body, { aspect: 0.4, label: "Known frames (solid) and interpolated frames (hollow)" });
  const st = stats([["values", "frame positions"]]);
  const sl = slider({ label: "frames to interpolate", min: 1, max: 6, step: 1, value: gapFrames, format: (v) => String(v), onInput: (v) => { gapFrames = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let seq = [];
  cv.onDraw((ctx, w, hh, p) => {
    const n = seq.length, bw = w / (n + 1);
    seq.forEach((v, i) => {
      const bh = (v / 50) * (hh - 30);
      const known = i === 0 || i === n - 1;
      ctx.fillStyle = known ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
    });
  });

  function update() {
    seq = harmonicInpaint(10, 50, gapFrames + 1);
    st.set("values", seq.map((v) => v.toFixed(1)).join(", "));
    say(`${gapFrames} interpolated frames between the two known ones: ${seq.map((v) => v.toFixed(1)).join(", ")}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
