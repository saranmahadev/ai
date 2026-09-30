// Bench: a policy for a small grid world, and the return it earns from the start cell.
import { gridMdp } from "./mlkit.js";
import { drawGrid } from "./rlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, live, fmt } = kit;
  const body = frame(root, { title: "A policy and its return" });
  const say = live(body);
  const N = 0, E = 1;
  let gamma = 0.9, slip = 0, cost = -0.04, preset = "safe", pol;
  const build = (name, m) => Array.from({ length: m.S }, (_, s) => { const x = s % m.w, y = (s / m.w) | 0; if (name === "random") return -1; if (name === "safe") return x === 0 && y > 0 ? N : E; return y === m.h - 1 && x < m.w - 1 ? E : N; });
  const pc = choice("Policy", [["safe", "up the left side, then east"], ["risky", "east along the bottom, then north"], ["random", "random moves"]], preset, (v) => { preset = v; pol = build(v, mdp()); update(); });
  const sg = slider({ label: "discount γ", min: 0.5, max: 1, step: 0.05, value: gamma, format: (v) => fmt(v, 2), onInput: (v) => { gamma = v; update(); } });
  const ss = slider({ label: "slip (chance of a random move)", min: 0, max: 0.4, step: 0.05, value: slip, format: (v) => fmt(v * 100, 0) + "%", onInput: (v) => { slip = v; update(); } });
  const sc = slider({ label: "cost of each step", min: -0.2, max: 0, step: 0.01, value: cost, format: (v) => fmt(v, 2), onInput: (v) => { cost = v; update(); } });
  const cv = canvas(body, { aspect: 0.8, maxH: 380, label: "A four by four grid with a goal, a pit, a wall and the arrows of the chosen policy" });
  const st = stats([["r", "expected return from the start"], ["v", "start cell value under the policy"]]);
  body.append(cv.box, st.el, pc.el, sg.el, ss.el, sc.el);
  const mdp = () => gridMdp({ slip, stepCost: cost });
  const evalPol = (m) => { const V = new Array(m.S).fill(0); for (let k = 0; k < 500; k++) for (let s = 0; s < m.S; s++) if (!m.isTerm(s) && !m.isWall(s)) { const acts = pol[s] === -1 ? [0, 1, 2, 3] : [pol[s]]; V[s] = acts.reduce((t, a) => t + m.trans(s, a).reduce((q, [p, s2, r]) => q + p * (r + gamma * V[s2]), 0), 0) / acts.length; } return V; };
  let V = [];
  cv.onDraw((ctx, w, hh, p) => { drawGrid(ctx, mdp(), w, hh, p, { values: V, pol, vmax: 1 }); });
  pol = build(preset, mdp());
  function update() { const m = mdp(); V = evalPol(m); st.set("r", fmt(V[m.start], 3)); st.set("v", fmt(V[m.start], 2)); say(`Expected return from the start: ${fmt(V[m.start], 3)}`); cv.redraw(); }
  update(); return () => cv.destroy();
}
