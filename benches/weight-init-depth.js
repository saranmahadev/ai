// Bench: how the standard deviation of activations grows or shrinks across ten random dense layers, by initialization scale.
import { dot, label } from "./mathkit.js";
import { gaussMatrix, sd } from "./dlkit.js";

const DEPTH = 10;

function run(width, multiplier, rand) {
  const scale = (multiplier / Math.sqrt(width));
  let a = Array.from({ length: width }, (_, i) => Math.sin(i + 1));
  const sds = [sd(a)];
  for (let l = 0; l < DEPTH; l++) {
    const W = gaussMatrix(width, width, scale, rand);
    a = W.map((row) => row.reduce((s, w, j) => s + w * a[j], 0));
    sds.push(sd(a));
  }
  return sds;
}

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live, rng } = kit;
  const body = frame(root, { title: "Signal scale across ten random layers" });
  const say = live(body);
  let width = 100, mult = 1, sds;

  const cv = canvas(body, { aspect: 0.6, label: "Standard deviation of activations at each layer, on a log scale" });
  const st = stats([["last", "standard deviation after 10 layers"]]);
  const sm = slider({ label: "scale multiplier (1 = the 1/√n baseline)", min: 0.1, max: 10, step: 0.1, value: mult, format: (v) => v.toFixed(1) + "×", onInput: (v) => { mult = v; update(); } });
  const sw = slider({ label: "layer width", min: 20, max: 300, step: 10, value: width, onInput: (v) => { width = v; update(); } });
  body.append(cv.box, st.el, sm.el, sw.el);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, DEPTH], [-6, 10]);
    m.axes(ctx, p, { xlabel: "layer", ylabel: "log10(activation sd)", ticks: 4 });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 3; ctx.beginPath();
    sds.forEach((v, i) => { const y = Math.log10(Math.max(1e-6, v)); const px = m.X(i), py = m.Y(y); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
    ctx.stroke();
    sds.forEach((v, i) => dot(ctx, m.X(i), m.Y(Math.log10(Math.max(1e-6, v))), 4, p.ink));
  });

  function update() {
    sds = run(width, mult, rng(7));
    st.set("last", sds[sds.length - 1].toExponential(2));
    say(`after 10 layers, standard deviation is ${sds[sds.length - 1].toExponential(2)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
