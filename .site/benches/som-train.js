// Bench: train a 1D chain of SOM units on 2D points and watch the chain bend to cover the data's shape.
import { somStep } from "./nnkit.js";
import { rng } from "./kit.js";

const UNITS = 8;
const SHAPES = {
  Blobs: (rand) => (rand() < 0.5 ? [0.2 + rand() * 0.15, 0.2 + rand() * 0.15] : [0.8 - rand() * 0.15, 0.8 - rand() * 0.15]),
  Ring: (rand) => { const a = rand() * Math.PI * 2; return [0.5 + 0.35 * Math.cos(a), 0.5 + 0.35 * Math.sin(a)]; },
  Square: (rand) => [0.15 + rand() * 0.7, 0.15 + rand() * 0.7]
};

export default function mount(root, kit) {
  const { frame, canvas, slider, choice, stepper, stats, live } = kit;
  const body = frame(root, { title: "A chain of units organizes itself" });
  const say = live(body);
  let shape = "Blobs", lr = 0.3, radius = 2, rand, weights, steps;

  function reset() {
    rand = rng(4);
    weights = Array.from({ length: UNITS }, () => [0.4 + rand() * 0.2, 0.4 + rand() * 0.2]);
    steps = 0;
  }
  reset();

  const cv = canvas(body, { aspect: 1, label: "Data points and the chain of SOM units" });
  const st = stats([["steps", "training steps"], ["winner", "last winning unit"]]);
  const chShape = choice("Data shape", Object.keys(SHAPES).map((s) => [s, s]), shape, (v) => { shape = v; reset(); draw(); });
  const slLr = slider({ label: "learning rate η", min: 0.05, max: 0.6, step: 0.05, value: lr, format: (v) => v.toFixed(2), onInput: (v) => { lr = v; } });
  const slR = slider({ label: "neighbourhood radius", min: 0, max: 4, step: 1, value: radius, format: (v) => String(v), onInput: (v) => { radius = v; } });
  const sp = stepper({
    stepLabel: "Train on 20 points",
    onStep: () => {
      let winner = 0;
      for (let i = 0; i < 20; i++) { const x = SHAPES[shape](rand); winner = somStep(weights, x, { lr, radius }); steps++; }
      st.set("winner", String(winner));
      draw();
      return true;
    },
    onReset: () => { reset(); draw(); }
  });
  body.append(cv.box, st.el, chShape.el, slLr.el, slR.el, sp.el);

  cv.onDraw((ctx, w, hh, p) => {
    const X = (x) => x * w, Y = (y) => y * hh;
    ctx.fillStyle = p.soft;
    for (let i = 0; i < 150; i++) { const [x, y] = SHAPES[shape](rng(100 + i)); ctx.beginPath(); ctx.arc(X(x), Y(y), 2, 0, 7); ctx.fill(); }
    ctx.strokeStyle = p.muted; ctx.lineWidth = 1.5; ctx.beginPath();
    weights.forEach(([x, y], i) => { i === 0 ? ctx.moveTo(X(x), Y(y)) : ctx.lineTo(X(x), Y(y)); });
    ctx.stroke();
    weights.forEach(([x, y]) => { ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(X(x), Y(y), 5, 0, 7); ctx.fill(); });
  });

  function draw() {
    st.set("steps", String(steps));
    say(`${steps} training steps on the ${shape} shape`);
    cv.redraw();
  }
  draw();
  return () => cv.destroy();
}
