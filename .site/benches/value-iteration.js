// Bench: value iteration sweep by sweep: the goal's value spreads backwards through the grid.
import { gridMdp, valueSweep } from "./mlkit.js";
import { drawGrid } from "./rlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, stepper, live, fmt } = kit;
  const body = frame(root, { title: "Values spread backwards" });
  const say = live(body);
  let gamma = 0.9, slip = 0, m = gridMdp(), V = new Array(m.S).fill(0), pol = new Array(m.S).fill(-1), sweeps = 0, delta = 1;
  const sg = slider({ label: "discount γ", min: 0.5, max: 0.99, step: 0.01, value: gamma, format: (v) => fmt(v, 2), onInput: (v) => { gamma = v; reset(); } });
  const ss = slider({ label: "slip (chance of a random move)", min: 0, max: 0.4, step: 0.05, value: slip, format: (v) => fmt(v * 100, 0) + "%", onInput: (v) => { slip = v; m = gridMdp({ slip }); reset(); } });
  const cv = canvas(body, { aspect: 0.8, maxH: 380, label: "Grid world with each cell's value and the best action found so far" });
  const st = stats([["s", "sweeps"], ["d", "largest change in the last sweep"], ["v", "value of the start cell"]]);
  const sp = stepper({ interval: 500, stepLabel: "One sweep", onStep: () => { const r = valueSweep(m, V, gamma); V = r.V; pol = r.pol; delta = r.delta; sweeps++; update(); if (delta < 1e-4) return false; }, onReset: reset });
  body.append(cv.box, st.el, sg.el, ss.el, sp.el);
  cv.onDraw((ctx, w, hh, p) => { drawGrid(ctx, m, w, hh, p, { values: V, pol: sweeps ? pol : null, vmax: 1 }); });
  function reset() { sp.stop(); V = new Array(m.S).fill(0); pol = new Array(m.S).fill(-1); sweeps = 0; delta = 1; update(); }
  function update() { st.set("s", sweeps); st.set("d", sweeps ? fmt(delta, 4) : "—"); st.set("v", fmt(V[m.start], 3)); say(`Sweep ${sweeps}, start value ${fmt(V[m.start], 3)}`); cv.redraw(); }
  update(); return () => { sp.stop(); cv.destroy(); };
}
