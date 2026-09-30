// Bench: tabular Q-learning in the grid world, episode by episode.
import { rng, gridMdp, newQ, qEpisode } from "./mlkit.js";
import { drawGrid } from "./rlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, button, canvas, stats, live, fmt } = kit;
  const body = frame(root, { title: "Learn by trying" });
  const say = live(body);
  const m = gridMdp();
  let alpha = 0.5, eps = 0.2, Q, r, episodes, last;
  const sa = slider({ label: "learning rate α", min: 0.05, max: 1, step: 0.05, value: alpha, format: (v) => fmt(v, 2), onInput: (v) => { alpha = v; } });
  const se = slider({ label: "exploration ε", min: 0, max: 0.6, step: 0.05, value: eps, format: (v) => fmt(v, 2), onInput: (v) => { eps = v; } });
  const cv = canvas(body, { aspect: 0.8, maxH: 380, label: "Grid world with the best value and best action the agent currently believes in each cell" });
  const st = stats([["e", "episodes played"], ["l", "steps in the last episode"], ["g", "steps the greedy policy needs"]]);
  const run = (n) => button(n === 1 ? "Play 1 episode" : `Play ${n} episodes`, () => { for (let i = 0; i < n; i++) last = qEpisode(m, Q, { alpha, gamma: 0.9, eps }, r).steps; episodes += n; update(); });
  body.append(cv.box, st.el, sa.el, se.el, h("div", { class: "bench-row" }, run(1), run(10), run(100), button("Forget everything", reset)));
  const V = () => Q.map((q, s) => (m.isTerm(s) || m.isWall(s) ? 0 : Math.max(...q))), pol = () => Q.map((q) => (q.every((v) => v === 0) ? -1 : q.indexOf(Math.max(...q))));
  cv.onDraw((ctx, w, hh, p) => { drawGrid(ctx, m, w, hh, p, { values: V(), pol: pol(), vmax: 1 }); });
  function reset() { Q = newQ(m); r = rng(3); episodes = 0; last = null; update(); }
  function update() { const P = pol(); let s = m.start, n = 0; while (!m.isTerm(s) && n < 30 && P[s] >= 0) { s = m.move(s, P[s]); n++; } st.set("e", episodes); st.set("l", last == null ? "—" : last); st.set("g", m.isTerm(s) && s === m.goal ? n : "not yet"); say(`${episodes} episodes played`); cv.redraw(); }
  reset(); return () => cv.destroy();
}
