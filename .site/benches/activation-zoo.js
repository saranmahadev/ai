// Bench: activation function curves with the tangent line (slope) at a chosen input.
import { curve, clip, dot, numDiff } from "./mathkit.js";
import { sigmoid, tanhAct, relu, leakyRelu, gelu } from "./dlkit.js";

const FNS = { sigmoid, tanh: tanhAct, "ReLU": relu, "leaky ReLU": leakyRelu, GELU: gelu };

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "Activation functions and their slopes" });
  const say = live(body);
  let name = "sigmoid", z = 2;

  const cv = canvas(body, { aspect: 0.65, label: "The activation curve with the tangent line at the chosen input" });
  const st = stats([["f", "f(z)"], ["d", "f'(z)"]]);
  const ch = choice("Function", Object.keys(FNS).map((k) => [k, k]), name, (v) => { name = v; update(); });
  const sl = slider({ label: "input z", min: -6, max: 6, step: 0.1, value: z, format: (v) => v.toFixed(1), onInput: (v) => { z = v; update(); } });
  body.append(cv.box, st.el, ch.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const f = FNS[name];
    const m = plot(w, hh, [-6, 6], [-1.5, 6]);
    m.axes(ctx, p, { xlabel: "z", ylabel: "f(z)" });
    curve(ctx, m, f, -6, 6, { color: p.accent, width: 3, clip: clip(m) });
    const d = numDiff(f, z);
    const fz = f(z);
    curve(ctx, m, (x) => fz + d * (x - z), Math.max(-6, z - 2.5), Math.min(6, z + 2.5), { color: p.warm, width: 2.5, dash: [6, 4], clip: clip(m) });
    dot(ctx, m.X(z), m.Y(fz), 6, p.ink);
  });

  function update() {
    const f = FNS[name];
    const fz = f(z), d = numDiff(f, z);
    st.set("f", fz.toFixed(4));
    st.set("d", d.toFixed(4));
    say(`f(${z.toFixed(1)}) = ${fz.toFixed(3)}, slope ${d.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
