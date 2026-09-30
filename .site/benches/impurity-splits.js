// Bench: Gini and entropy of a split on ten labelled points.
import { gini, entropyBits } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Score a split" });
  const say = live(body);
  const labels = [0, 0, 0, 0, 1, 0, 1, 1, 1, 1];
  let cut = 5.5, crit = "gini";
  const I = () => (crit === "gini" ? gini : entropyBits);
  const cc = choice("Impurity", [["gini", "Gini"], ["entropy", "entropy (bits)"]], crit, (v) => { crit = v; update(); });
  const sl = slider({ label: "split between", min: 1.5, max: 9.5, step: 1, value: cut, format: (v) => `${v - 0.5} and ${v + 0.5}`, onInput: (v) => { cut = v; update(); } });
  const cv = canvas(body, { aspect: 0.32, maxH: 190, label: "Ten labelled points on a line with a vertical split" });
  const st = stats([["p", "before the split"], ["l", "left side"], ["r", "right side"], ["w", "after (weighted)"], ["g", "gain"], ["b", "best gain possible"]]);
  body.append(cv.box, st.el, cc.el, sl.el);
  const score = (c) => { const L = labels.slice(0, c - 0.5), R = labels.slice(c - 0.5), c1 = (a) => a.reduce((x, y) => x + y, 0), f = I(); const parent = f(10 - c1(labels), c1(labels)), l = f(L.length - c1(L), c1(L)), r = f(R.length - c1(R), c1(R)), w = (L.length * l + R.length * r) / 10; return { parent, l, r, w, g: parent - w }; };
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [0.5, 10.5], [0, 1], { l: 16, r: 16, t: 10, b: 30 }); m.axes(ctx, p, { xlabel: "feature value", ticks: 5 });
    ctx.globalAlpha = 0.14; ctx.fillStyle = p.accent; ctx.fillRect(m.pad.l, m.pad.t, m.X(cut) - m.pad.l, m.ih); ctx.fillStyle = p.warm; ctx.fillRect(m.X(cut), m.pad.t, m.pad.l + m.iw - m.X(cut), m.ih); ctx.globalAlpha = 1;
    labels.forEach((c, i) => { ctx.fillStyle = c ? p.warm : p.accent; ctx.beginPath(); ctx.arc(m.X(i + 1), m.pad.t + m.ih / 2, 9, 0, 7); ctx.fill(); }); ctx.strokeStyle = p.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.X(cut), m.pad.t); ctx.lineTo(m.X(cut), m.pad.t + m.ih); ctx.stroke(); });
  function update() { const s = score(cut); let best = 0; for (let c = 1.5; c <= 9.5; c++) best = Math.max(best, score(c).g);
    st.set("p", fmt(s.parent, 3)); st.set("l", fmt(s.l, 3)); st.set("r", fmt(s.r, 3)); st.set("w", fmt(s.w, 3)); st.set("g", fmt(s.g, 3)); st.set("b", fmt(best, 3)); say(`Gain ${fmt(s.g, 3)} of a possible ${fmt(best, 3)}`); cv.redraw(); }
  update(); return () => cv.destroy();
}
