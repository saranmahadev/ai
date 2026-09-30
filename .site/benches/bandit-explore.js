// Bench: epsilon-greedy on a five-armed bandit, averaged over 200 runs.
import { banditCurve } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Explore or exploit?" });
  const say = live(body);
  const EPS = [0, 0.01, 0.1, 0.3], curves = EPS.map((e) => banditCurve(e));
  let idx = 2;
  const sl = slider({ label: "exploration rate ε (index)", min: 0, max: 3, step: 1, value: idx, format: (v) => `ε = ${EPS[v]}`, onInput: (v) => { idx = v; update(); } });
  const cv = canvas(body, { aspect: 0.55, label: "Average reward over time for four exploration rates" });
  const st = stats([["a", "average reward, first 50 pulls"], ["b", "average reward, last 100 pulls"], ["o", "best possible on average"]]);
  body.append(cv.box, st.el, sl.el);
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [0, 500], [-0.1, 1.3], { l: 44, r: 14, t: 12, b: 32 }); m.axes(ctx, p, { xlabel: "pulls", ylabel: "average reward", ticks: 5 });
    ctx.strokeStyle = p.good; ctx.setLineDash([6, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.pad.l, m.Y(1.163)); ctx.lineTo(m.pad.l + m.iw, m.Y(1.163)); ctx.stroke(); ctx.setLineDash([]);
    const cols = [p.muted, p.soft2, p.warm, p.accent]; curves.forEach((c, i) => { ctx.strokeStyle = i === idx ? p.ink : cols[i]; ctx.lineWidth = i === idx ? 3.5 : 2; ctx.globalAlpha = i === idx ? 1 : 0.7; ctx.beginPath(); c.forEach((v, t) => { const X = m.X(t), Y = m.Y(Math.max(-0.1, v)); t ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke(); }); ctx.globalAlpha = 1;
    ctx.font = "800 11px Nunito, system-ui"; ctx.textAlign = "right"; EPS.forEach((e, i) => { ctx.fillStyle = i === idx ? p.ink : p.muted; ctx.fillText(`ε = ${e}`, m.pad.l + m.iw - 4, m.Y(curves[i][499]) - 5 - (i === 1 ? 10 : 0)); }); });
  function update() { st.set("a", fmt(avg(curves[idx].slice(0, 50)), 3)); st.set("b", fmt(avg(curves[idx].slice(-100)), 3)); st.set("o", "1.16"); say(`ε = ${EPS[idx]}: last hundred pulls average ${fmt(avg(curves[idx].slice(-100)), 3)}`); cv.redraw(); }
  update(); return () => cv.destroy();
}
