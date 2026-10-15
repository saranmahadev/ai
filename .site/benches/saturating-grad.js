// Bench: gradient magnitude of the original (saturating) vs non-saturating generator loss, as D(fake) varies.
import { curve, clip } from "./mathkit.js";

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "Saturating vs non-saturating generator gradients" });
  const say = live(body);
  let dFake = 0.3;

  const cv = canvas(body, { aspect: 0.55, label: "Gradient magnitude vs D(fake), on a log scale" });
  const st = stats([["orig", "original loss gradient magnitude"], ["ns", "non-saturating loss gradient magnitude"]]);
  const sl = slider({ label: "D(fake)", min: 0.01, max: 0.99, step: 0.01, value: dFake, format: (v) => v.toFixed(2), onInput: (v) => { dFake = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  const origGrad = (d) => 1 / (1 - d);
  const nsGrad = (d) => 1 / d;

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0.01, 0.99], [-0.5, 2.5]);
    m.axes(ctx, p, { xlabel: "D(fake)", ylabel: "log10(gradient magnitude)" });
    curve(ctx, m, (d) => Math.log10(origGrad(d)), 0.01, 0.99, { color: p.accent, width: 3, clip: clip(m), steps: 200 });
    curve(ctx, m, (d) => Math.log10(nsGrad(d)), 0.01, 0.99, { color: p.warm, width: 3, clip: clip(m), steps: 200 });
    ctx.fillStyle = p.ink;
    ctx.beginPath(); ctx.arc(m.X(dFake), m.Y(Math.log10(origGrad(dFake))), 5, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(m.X(dFake), m.Y(Math.log10(nsGrad(dFake))), 5, 0, 7); ctx.fill();
  });

  function update() {
    st.set("orig", origGrad(dFake).toFixed(4));
    st.set("ns", nsGrad(dFake).toFixed(4));
    say(`original ${origGrad(dFake).toFixed(2)}, non-saturating ${nsGrad(dFake).toFixed(2)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
