// Bench: shift a generic pitch contour to match a reference speaker's mean pitch from a few samples.
const GENERIC = [120, 125, 130, 128, 122];

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Adapting a voice from a few reference samples" });
  const say = live(body);
  let refMean = 178.67;

  const cv = canvas(body, { aspect: 0.5, label: "Generic (left) vs. cloned (right) pitch contour" });
  const st = stats([["ratio", "pitch-shift ratio"], ["clonedMean", "cloned mean pitch"]]);
  const sl = slider({ label: "reference speaker's mean pitch (Hz)", min: 100, max: 260, step: 1, value: refMean, format: (v) => `${v.toFixed(0)} Hz`, onInput: (v) => { refMean = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let cloned = [];
  cv.onDraw((ctx, w, hh, p) => {
    const maxPitch = 280, bw = w / (GENERIC.length * 2 + 1);
    GENERIC.forEach((v, i) => {
      const bh = (v / maxPitch) * (hh - 30);
      ctx.fillStyle = p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.7, bh);
    });
    cloned.forEach((v, i) => {
      const bh = (v / maxPitch) * (hh - 30);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (GENERIC.length + i + 1), hh - 15 - bh, bw * 0.7, bh);
    });
  });

  function update() {
    const genericMean = GENERIC.reduce((a, b) => a + b, 0) / GENERIC.length;
    const ratio = refMean / genericMean;
    cloned = GENERIC.map((v) => v * ratio);
    const clonedMean = cloned.reduce((a, b) => a + b, 0) / cloned.length;
    st.set("ratio", ratio.toFixed(3));
    st.set("clonedMean", `${clonedMean.toFixed(1)} Hz`);
    say(`pitch-shift ratio ${ratio.toFixed(3)}; cloned mean ${clonedMean.toFixed(1)} Hz`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
