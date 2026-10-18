// Bench: retrain recursively on model-generated data and watch the distribution's variance collapse.
import { rng } from "./kit.js";

function gaussianApprox(rand) {
  let s = 0;
  for (let i = 0; i < 6; i++) s += rand();
  return s - 3;
}
function variance(samples) {
  const m = samples.reduce((a, b) => a + b, 0) / samples.length;
  return samples.reduce((s, x) => s + (x - m) ** 2, 0) / samples.length;
}

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Training on your own output, generation after generation" });
  const say = live(body);
  let generations = 0;

  const cv = canvas(body, { aspect: 0.5, label: "Distribution variance across generations" });
  const st = stats([["variance", "current variance"]]);
  const sl = slider({ label: "generations of recursive training", min: 0, max: 4, step: 1, value: generations, format: (v) => String(v), onInput: (v) => { generations = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let curve = [];
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (curve.length + 1);
    const maxV = curve[0] || 1;
    curve.forEach((v, i) => {
      const bh = (v / maxV) * (hh - 30);
      ctx.fillStyle = i === generations ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`gen ${i}`, bw * (i + 0.5) + bw * 0.3, hh - 2);
    });
  });

  function run() {
    const rand = rng(17);
    let gen = Array.from({ length: 1000 }, () => gaussianApprox(rand));
    const variances = [variance(gen)];
    for (let g = 1; g <= 4; g++) {
      const mean = gen.reduce((a, b) => a + b, 0) / gen.length;
      const fitSample = Array.from({ length: 50 }, () => gen[rand.int(gen.length)]);
      const fitVar = variance(fitSample);
      gen = Array.from({ length: 1000 }, () => mean + Math.sqrt(fitVar) * gaussianApprox(rand));
      variances.push(variance(gen));
    }
    return variances;
  }

  function update() {
    curve = run();
    st.set("variance", curve[generations].toFixed(4));
    say(`after ${generations} generations of recursive training, variance is ${curve[generations].toFixed(4)}, down from ${curve[0].toFixed(4)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
