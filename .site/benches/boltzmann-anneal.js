// Bench: temperature controls how willing a unit is to move against its own local field; simulated annealing cools it over a run.
import { boltzmannProb, sampleState, hopfieldWeights, hopfieldEnergy } from "./nnkit.js";
import { rng, plot } from "./kit.js";

const PATTERNS = [[1, 1, -1, -1], [-1, 1, 1, -1]];
const N = 4;
const W = hopfieldWeights(PATTERNS);

export default function mount(root, kit) {
  const { frame, canvas, slider, stepper, stats, live } = kit;
  const body = frame(root, { title: "Temperature and escaping a shallow dip" });
  const say = live(body);
  const rand = rng(3);

  let T = 1;
  const cv = canvas(body, { aspect: 0.5, label: "Energy during a simulated-annealing run, cooling from the chosen temperature" });
  const st = stats([["t", "current temperature"], ["prob", "P(stay against field)"], ["energy", "current energy"]]);
  const sl = slider({ label: "stay-against-field probability at W=−1, s=+1", min: 0.2, max: 5, step: 0.1, value: T, format: (v) => v.toFixed(1), onInput: (v) => { T = v; updateStats(T); } });

  let s, history, t0;
  function reset() {
    s = [1, 1, 1, 1];
    history = [hopfieldEnergy(W, s)];
    t0 = 0;
  }
  reset();

  const sp = stepper({
    onStep: () => {
      t0++;
      const temp = Math.max(0.1, T * Math.exp(-0.15 * t0));
      const i = t0 % N;
      const p = boltzmannProb(W, s, i, temp);
      s[i] = sampleState(p, rand);
      history.push(hopfieldEnergy(W, s));
      cv.redraw();
      updateStats(temp);
      return t0 < 40;
    },
    onReset: () => { reset(); cv.redraw(); updateStats(T); }
  });
  body.append(cv.box, st.el, sl.el, sp.el);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, Math.max(10, history.length - 1)], [Math.min(...history) - 1, Math.max(...history) + 1]);
    m.axes(ctx, p, { xlabel: "annealing step", ylabel: "energy" });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    history.forEach((e, i) => { const x = m.X(i), y = m.Y(e); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();
  });

  function updateStats(temp) {
    const prob = boltzmannProb(W, [1, 1], 0, temp);
    st.set("t", temp.toFixed(2));
    st.set("prob", prob.toFixed(3));
    st.set("energy", history[history.length - 1].toFixed(1));
    say(`temperature ${temp.toFixed(2)}, energy ${history[history.length - 1].toFixed(1)}`);
  }
  updateStats(T);
  return () => cv.destroy();
}
