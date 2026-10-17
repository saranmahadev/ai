// Bench: a simplified firing-rate-above-threshold model, plotted against ReLU(input - threshold).
import { curve, clip, dot } from "./mathkit.js";
import { relu } from "./dlkit.js";

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "A real neuron's response, next to ReLU" });
  const say = live(body);
  let threshold = 0.3, input = 0.5;

  const cv = canvas(body, { aspect: 0.55, label: "Firing rate vs input, with the current input marked" });
  const st = stats([["rate", "firing rate at this input"]]);
  const st2 = slider({ label: "threshold", min: 0, max: 0.8, step: 0.05, value: threshold, format: (v) => v.toFixed(2), onInput: (v) => { threshold = v; update(); } });
  const si = slider({ label: "input", min: 0, max: 1.2, step: 0.05, value: input, format: (v) => v.toFixed(2), onInput: (v) => { input = v; update(); } });
  body.append(cv.box, st.el, st2.el, si.el);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, 1.2], [0, 1]);
    m.axes(ctx, p, { xlabel: "input", ylabel: "firing rate" });
    curve(ctx, m, (x) => relu(x - threshold), 0, 1.2, { color: p.accent, width: 3, clip: clip(m), steps: 200 });
    dot(ctx, m.X(input), m.Y(relu(input - threshold)), 6, p.warm);
  });

  function update() {
    st.set("rate", relu(input - threshold).toFixed(4));
    say(`firing rate ${relu(input - threshold).toFixed(3)} at input ${input.toFixed(2)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
