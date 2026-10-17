// Bench: step through single-unit Hopfield updates and plot the energy trace, which never rises.
import { hopfieldWeights, hopfieldUpdateUnit, hopfieldEnergy, corrupt } from "./nnkit.js";
import { rng, plot } from "./kit.js";

const PATTERN = [1, 1, -1, -1, 1, -1, -1, 1];
const N = PATTERN.length;

export default function mount(root, kit) {
  const { frame, canvas, stepper, stats, live } = kit;
  const body = frame(root, { title: "Energy only ever falls" });
  const say = live(body);
  const rand = rng(11);

  const W = hopfieldWeights([PATTERN]);
  let s, order, cursor, history;

  function reset() {
    s = corrupt(PATTERN, 3, rand);
    order = Array.from({ length: N }, (_, i) => i);
    cursor = 0;
    history = [hopfieldEnergy(W, s)];
  }
  reset();

  const cv = canvas(body, { aspect: 0.5, label: "Energy after each single-unit update" });
  const st = stats([["energy", "current energy"], ["step", "updates so far"]]);
  const sp = stepper({
    onStep: () => {
      const i = order[cursor % N];
      const v = hopfieldUpdateUnit(W, s, i);
      const changed = v !== s[i];
      s[i] = v;
      cursor++;
      history.push(hopfieldEnergy(W, s));
      update();
      if (!changed && cursor % N === 0) return false;
      return true;
    },
    onReset: () => { reset(); update(); }
  });
  body.append(cv.box, st.el, sp.el);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, Math.max(5, history.length - 1)], [Math.min(...history) - 1, Math.max(...history) + 1]);
    m.axes(ctx, p, { xlabel: "update", ylabel: "energy" });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    history.forEach((e, i) => { const x = m.X(i), y = m.Y(e); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();
    ctx.fillStyle = p.accent;
    history.forEach((e, i) => { ctx.beginPath(); ctx.arc(m.X(i), m.Y(e), 3, 0, 7); ctx.fill(); });
  });

  function update() {
    const e = history[history.length - 1];
    st.set("energy", e.toFixed(1));
    st.set("step", String(cursor));
    say(`energy ${e.toFixed(1)} after ${cursor} update${cursor === 1 ? "" : "s"}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
