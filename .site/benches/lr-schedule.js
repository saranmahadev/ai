// Bench: four learning-rate schedules over a fixed-length run, with a step marker.
import { curve, clip, dot } from "./mathkit.js";

const LR0 = 0.1, T = 100;
const schedules = {
  "constant": (t) => LR0,
  "step decay": (t) => LR0 * 0.5 ** Math.floor(t / 30),
  "cosine decay": (t) => 0.5 * LR0 * (1 + Math.cos((Math.PI * Math.min(t, T)) / T)),
  "warmup + cosine": (t, warmup) => {
    if (t < warmup) return (LR0 * t) / warmup;
    const t2 = t - warmup, T2 = T - warmup;
    return 0.5 * LR0 * (1 + Math.cos((Math.PI * Math.min(t2, T2)) / T2));
  }
};

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "Learning rate over a training run" });
  const say = live(body);
  let name = "warmup + cosine", warmup = 10, step = 10;

  const cv = canvas(body, { aspect: 0.55, label: "The learning rate across the whole run, with the current step marked" });
  const st = stats([["lr", "rate at this step"]]);
  const ch = choice("Schedule", Object.keys(schedules).map((k) => [k, k]), name, (v) => { name = v; update(); });
  const sw = slider({ label: "warmup steps (warmup schedule only)", min: 0, max: 30, step: 1, value: warmup, onInput: (v) => { warmup = v; update(); } });
  const ss = slider({ label: "step", min: 0, max: T, step: 1, value: step, onInput: (v) => { step = v; update(); } });
  body.append(cv.box, st.el, ch.el, sw.el, ss.el);

  const f = (t) => schedules[name](t, warmup);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, T], [0, LR0 * 1.1]);
    m.axes(ctx, p, { xlabel: "step", ylabel: "learning rate" });
    curve(ctx, m, f, 0, T, { color: p.accent, width: 3, clip: clip(m), steps: 300 });
    dot(ctx, m.X(step), m.Y(f(step)), 6, p.warm);
  });

  function update() {
    st.set("lr", f(step).toFixed(4));
    say(`learning rate ${f(step).toFixed(4)} at step ${step}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
