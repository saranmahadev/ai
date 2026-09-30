// Bench: the learning rate decides whether descent converges, bounces or diverges.
import { curve, clip } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Too small, just right, too big" });
  const say = live(body);
  let eta = 0.1, land = "one";
  const se = slider({ label: "learning rate η", min: 0.02, max: 1.2, step: 0.02, value: eta, format: (v) => fmt(v, 2), onInput: (v) => { eta = v; update(); } });
  const ch = choice("Landscape", [["one", "w² (one curvature)"], ["two", "w² and 10·v² (two curvatures)"]], land, (k) => { land = k; update(); });
  const cv = canvas(body, { aspect: 0.55, label: "How the parameters change over 20 steps" });
  const st = stats([["f", "factor per step on w (1 − 2η)"], ["fv", "factor per step on v (1 − 20η)"], ["res", "outcome"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, se.el));
  const run = (k) => { const out = [4]; for (let i = 0; i < 20; i++) out.push(out[i] * (1 - k * eta)); return out; };
  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, 20], [-6, 6]); m.axes(ctx, p, { xlabel: "step", ylabel: "parameter value" });
    ctx.strokeStyle = p.soft2; ctx.beginPath(); ctx.moveTo(m.X(0), m.Y(0)); ctx.lineTo(m.X(20), m.Y(0)); ctx.stroke();
    const line = (vals, col) => curve(ctx, m, (t) => { const i = Math.floor(t), fr = t - i; return i >= 20 ? vals[20] : vals[i] * (1 - fr) + vals[i + 1] * fr; }, 0, 20, { color: col, width: 3.5, clip: clip(m), steps: 200 });
    line(run(2), p.accent); if (land === "two") line(run(20), p.warm);
    ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = p.accent; ctx.fillText("w", m.pad.l + 8, m.pad.t + 12); if (land === "two") { ctx.fillStyle = p.warm; ctx.fillText("v", m.pad.l + 8, m.pad.t + 26); }
  });
  const verdict = (f) => { const a = Math.abs(f); return a < 1e-9 ? "lands on the minimum in one step" : a < 1 ? (f < 0 ? "bounces across the minimum but settles" : "converges steadily") : a === 1 ? "bounces forever without settling" : "diverges"; };
  function update() { const f = 1 - 2 * eta, g = 1 - 20 * eta; st.set("f", fmt(f, 3)); st.set("fv", land === "two" ? fmt(g, 3) : "—"); const bad = land === "two" && Math.abs(g) >= 1; st.set("res", land === "two" ? `w ${verdict(f)}; v ${verdict(g)}${bad ? " (the steep direction limits η to below 0.1)" : ""}` : `w ${verdict(f)}`); say(st ? `Factor ${fmt(f, 2)}` : ""); cv.redraw(); }
  update();
  return () => cv.destroy();
}
