// Bench: training nudges the model's numbers to shrink the error; then the model is frozen and used on new inputs.
export default function mount(root, kit) {
  const { h, frame, stepper, button, canvas, rng, plot, live, fmt, stats } = kit;
  const body = frame(root, {
    title: "Training, then inference"
  });
  const say = live(body);
  const r = rng(5);
  const data = Array.from({ length: 14 }, () => { const size = 35 + r() * 110; return { size, price: 40 + 2.2 * size + (r() - 0.5) * 90 }; });
  // internal units: size/100, price/100 so plain gradient descent behaves
  let w, b, steps, hist, frozen, query;
  const cv = canvas(body, { aspect: 0.55, label: "House data with the model's line, which moves while training and stops when frozen" });
  const lossCv = canvas(body, { aspect: 0.28, label: "Average error against training steps", maxH: 150 });
  const st = stats([["phase", "phase"], ["steps", "training steps"], ["err", "average miss ($k)"], ["pred", "prediction"]]);
  const out = h("p", { class: "bench-verdict" });
  const s = stepper({ onStep: train, onReset: reset, interval: 220, stepLabel: "Train 1 step" });
  const freeze = button("Freeze the model, then ask it questions", () => { if (steps === 0) { out.textContent = "Train for a few steps first."; return; } frozen = true; s.stop(); update("Frozen. Now click the plot to ask about a house size."); });
  body.append(cv.box, lossCv.box, st.el, s.el, h("div", { class: "bench-row" }, freeze));
  const err = () => data.reduce((a, d) => a + Math.abs((w * d.size / 100 + b) * 100 - d.price), 0) / data.length;
  function reset() { w = 0; b = 0; steps = 0; hist = [err0()]; frozen = false; query = null; update("Untrained: both numbers are 0, so the model predicts $0 for every house."); }
  function err0() { return data.reduce((a, d) => a + Math.abs(d.price), 0) / data.length; }
  function train() {
    if (frozen) return false;
    let gw = 0, gb = 0;
    for (const d of data) { const x = d.size / 100, y = d.price / 100, e = w * x + b - y; gw += 2 * e * x; gb += 2 * e; }
    w -= 0.04 * gw / data.length; b -= 0.04 * gb / data.length; steps++; hist.push(err());
    update(steps < 4 ? "Each step nudges w and b a little in the direction that reduces the error." : steps < 25 ? "The error keeps falling, more slowly each time." : "It has almost stopped improving: training has settled."); return steps < 300;
  }
  cv.cv.addEventListener("click", (e) => {
    if (!frozen) return;
    const rect = cv.cv.getBoundingClientRect(), m = plot(cv.w, cv.h, [20, 170], [0, 450]);
    query = Math.max(20, Math.min(170, m.x(e.clientX - rect.left))); update(`Inference: the frozen model answers for a ${fmt(query, 0)} m² house without learning anything new.`);
  });
  cv.onDraw((ctx, W, H, p) => {
    const m = plot(W, H, [20, 170], [0, 450]);
    m.axes(ctx, p, { xlabel: "size (m²)", ylabel: "price ($k)" });
    ctx.fillStyle = p.ink; for (const d of data) { ctx.beginPath(); ctx.arc(m.X(d.size), m.Y(d.price), 5, 0, 7); ctx.fill(); }
    const f = (x) => (w * x / 100 + b) * 100;
    ctx.strokeStyle = frozen ? p.good : p.accent; ctx.lineWidth = 4; ctx.save(); ctx.beginPath(); ctx.rect(m.pad.l, m.pad.t, m.iw, m.ih); ctx.clip(); ctx.beginPath(); ctx.moveTo(m.X(20), m.Y(f(20))); ctx.lineTo(m.X(170), m.Y(f(170))); ctx.stroke(); ctx.restore();
    if (query != null) { ctx.fillStyle = p.warm; ctx.beginPath(); ctx.arc(m.X(query), m.Y(f(query)), 8, 0, 7); ctx.fill(); }
  });
  lossCv.onDraw((ctx, W, H, p) => {
    const m = plot(W, H, [0, Math.max(20, steps)], [0, hist[0] * 1.05], { l: 44, r: 10, t: 8, b: 36 });
    m.axes(ctx, p, { xlabel: "training steps", ticks: 2 }); ctx.strokeStyle = p.warm; ctx.lineWidth = 3; ctx.beginPath(); hist.forEach((v, i) => (i ? ctx.lineTo(m.X(i), m.Y(v)) : ctx.moveTo(m.X(i), m.Y(v)))); ctx.stroke();
  });
  function update(msg) {
    st.set("phase", frozen ? "inference (frozen)" : "training"); st.set("steps", String(steps)); st.set("err", fmt(err(), 0));
    st.set("pred", query != null ? `$${fmt((w * query / 100 + b) * 100, 0)}k for ${fmt(query, 0)} m²` : "—");
    out.textContent = msg; say(msg); cv.redraw(); lossCv.redraw();
  }
  reset();
  return () => { s.stop(); cv.destroy(); lossCv.destroy(); };
}
