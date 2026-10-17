// Bench: the spike-timing-dependent plasticity window — weight change as a function of the pre/post spike time gap.
import { plot } from "./kit.js";

const A_PLUS = 0.1, A_MINUS = 0.12, TAU_PLUS = 20, TAU_MINUS = 20;

function stdp(dt) {
  if (dt > 0) return A_PLUS * Math.exp(-dt / TAU_PLUS);
  if (dt < 0) return -A_MINUS * Math.exp(dt / TAU_MINUS);
  return 0;
}

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "The STDP learning window" });
  const say = live(body);
  let dt = 10;

  const cv = canvas(body, { aspect: 0.55, label: "Weight change as a function of the pre/post spike time gap" });
  const st = stats([["dt", "time gap (post − pre)"], ["dw", "weight change Δw"], ["dir", "direction"]]);
  const sl = slider({ label: "Δt = t_post − t_pre (ms)", min: -60, max: 60, step: 1, value: dt, format: (v) => `${v} ms`, onInput: (v) => { dt = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [-60, 60], [-A_MINUS * 1.1, A_PLUS * 1.1]);
    m.axes(ctx, p, { xlabel: "Δt (ms)", ylabel: "Δw" });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    for (let t = -60; t <= 60; t++) { const x = m.X(t), y = m.Y(stdp(t)); t === -60 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
    ctx.fillStyle = p.warm;
    ctx.beginPath(); ctx.arc(m.X(dt), m.Y(stdp(dt)), 5, 0, 7); ctx.fill();
  });

  function update() {
    const dw = stdp(dt);
    st.set("dt", `${dt} ms`);
    st.set("dw", dw.toFixed(4));
    st.set("dir", dt === 0 ? "none" : dt > 0 ? "strengthen (causal)" : "weaken (anti-causal)");
    say(`time gap ${dt} ms, weight change ${dw.toFixed(4)}, ${dt > 0 ? "strengthening" : dt < 0 ? "weakening" : "no change"}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
