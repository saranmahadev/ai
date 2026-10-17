// Bench: a leaky integrate-and-fire neuron accumulating constant input until it spikes.
import { lifStep } from "./nnkit.js";
import { plot } from "./kit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stepper, stats, live } = kit;
  const body = frame(root, { title: "A leaky bucket that fires when it's full" });
  const say = live(body);
  let input = 0.3, leak = 0.1;
  const threshold = 1;
  let v, t, history, spikes;

  function reset() { v = 0; t = 0; history = [0]; spikes = []; }
  reset();

  const cv = canvas(body, { aspect: 0.5, label: "Membrane potential over time, with spikes marked" });
  const st = stats([["t", "time step"], ["v", "membrane potential"], ["spikes", "spikes so far"]]);
  const slI = slider({ label: "input current", min: 0, max: 0.8, step: 0.05, value: input, format: (v2) => v2.toFixed(2), onInput: (v2) => { input = v2; reset(); draw(); } });
  const slL = slider({ label: "leak", min: 0.02, max: 0.5, step: 0.02, value: leak, format: (v2) => v2.toFixed(2), onInput: (v2) => { leak = v2; reset(); draw(); } });
  const sp = stepper({
    stepLabel: "Step",
    onStep: () => {
      t++;
      const r = lifStep(v, input, { leak, threshold });
      v = r.v;
      history.push(v);
      if (r.spiked) spikes.push(t);
      if (history.length > 60) { history.shift(); spikes = spikes.filter((s) => s > t - 60); }
      draw();
      return true;
    },
    onReset: () => { reset(); draw(); }
  });
  body.append(cv.box, st.el, slI.el, slL.el, sp.el);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [Math.max(0, t - 59), Math.max(10, t)], [0, threshold * 1.1]);
    m.axes(ctx, p, { xlabel: "time step", ylabel: "potential" });
    ctx.strokeStyle = p.warm; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(m.pad.l, m.Y(threshold)); ctx.lineTo(w, m.Y(threshold)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    const t0 = Math.max(0, t - history.length + 1);
    history.forEach((val, i) => { const x = m.X(t0 + i), y = m.Y(val); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();
    ctx.fillStyle = p.good;
    for (const s of spikes) { ctx.beginPath(); ctx.arc(m.X(s), m.Y(threshold), 3, 0, 7); ctx.fill(); }
  });

  function draw() {
    st.set("t", String(t));
    st.set("v", v.toFixed(3));
    st.set("spikes", String(spikes.length));
    say(`t=${t}, potential ${v.toFixed(2)}, ${spikes.length} spikes so far`);
    cv.redraw();
  }
  draw();
  return () => cv.destroy();
}
