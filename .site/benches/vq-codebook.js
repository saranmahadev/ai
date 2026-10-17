// Bench: pure winner-take-all competitive learning — only the closest codebook vector moves on each input.
import { bmu } from "./nnkit.js";
import { rng } from "./kit.js";

function gauss(rand, cx, cy, s) {
  const u1 = rand(), u2 = rand();
  const r = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-9)));
  return [cx + s * r * Math.cos(2 * Math.PI * u2), cy + s * r * Math.sin(2 * Math.PI * u2)];
}

export default function mount(root, kit) {
  const { frame, canvas, slider, stepper, stats, live } = kit;
  const body = frame(root, { title: "Codebook vectors claim their clusters" });
  const say = live(body);
  let lr = 0.1, rand, codebook, points, seen;

  function reset() {
    rand = rng(5);
    codebook = [[0.5, 0.5], [0.51, 0.49]];
    points = [];
    seen = 0;
  }
  reset();

  const cv = canvas(body, { aspect: 1, label: "Data points and the two codebook vectors" });
  const st = stats([["seen", "points seen"], ["c0", "codebook vector 0"], ["c1", "codebook vector 1"]]);
  const sl = slider({ label: "learning rate η", min: 0.02, max: 0.4, step: 0.02, value: lr, format: (v) => v.toFixed(2), onInput: (v) => { lr = v; } });
  const sp = stepper({
    stepLabel: "Feed 20 points",
    onStep: () => {
      for (let i = 0; i < 20; i++) {
        const x = rand() < 0.5 ? gauss(rand, 0.2, 0.2, 0.05) : gauss(rand, 0.8, 0.8, 0.05);
        const b = bmu(codebook, x);
        codebook[b] = codebook[b].map((wi, k) => wi + lr * (x[k] - wi));
        points.push(x);
        seen++;
      }
      if (points.length > 200) points = points.slice(-200);
      draw();
      return seen < 400;
    },
    onReset: () => { reset(); draw(); }
  });
  body.append(cv.box, st.el, sl.el, sp.el);

  cv.onDraw((ctx, w, hh, p) => {
    const X = (x) => x * w, Y = (y) => y * hh;
    ctx.fillStyle = p.soft;
    for (const [x, y] of points) { ctx.beginPath(); ctx.arc(X(x), Y(y), 2, 0, 7); ctx.fill(); }
    const colors = [p.accent, p.warm];
    codebook.forEach(([x, y], i) => { ctx.fillStyle = colors[i]; ctx.beginPath(); ctx.arc(X(x), Y(y), 7, 0, 7); ctx.fill(); });
  });

  function draw() {
    st.set("seen", String(seen));
    st.set("c0", `[${codebook[0].map((v) => v.toFixed(2)).join(", ")}]`);
    st.set("c1", `[${codebook[1].map((v) => v.toFixed(2)).join(", ")}]`);
    say(`${seen} points seen; codebook at [${codebook[0].map((v) => v.toFixed(2)).join(", ")}] and [${codebook[1].map((v) => v.toFixed(2)).join(", ")}]`);
    cv.redraw();
  }
  draw();
  return () => cv.destroy();
}
