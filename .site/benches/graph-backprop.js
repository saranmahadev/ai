// Bench: forward and backward passes through f(x, y) = x·y + sin x.
export default function mount(root, kit) {
  const { h, frame, slider, stepper, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Forward and backward through a graph" });
  const say = live(body);
  let x = 2, y = 3, step = 0;
  const cv = canvas(body, { aspect: 0.5, label: "A computational graph with values and derivatives at each node" });
  const st = stats([["msg", "this step"], ["num", "numerical check of (∂f/∂x, ∂f/∂y)"]]);
  const sx = slider({ label: "x", min: -3, max: 3, step: 0.5, value: x, format: (v) => fmt(v, 1), onInput: (v) => { x = v; update(); } });
  const sy = slider({ label: "y", min: -3, max: 3, step: 0.5, value: y, format: (v) => fmt(v, 1), onInput: (v) => { y = v; update(); } });
  const stp = stepper({ interval: 900, stepLabel: "Next step", onStep: () => { if (step >= 7) return false; step++; update(); if (step >= 7) return false; }, onReset: () => { step = 0; update(); } });
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sx.el, sy.el), stp.el);
  const F = (X, Y) => X * Y + Math.sin(X);
  const vals = () => ({ a: x * y, b: Math.sin(x), f: x * y + Math.sin(x) });
  const grads = () => ({ f: 1, a: 1, b: 1, x: y + Math.cos(x), y: x, ax: y, ay: x, bx: Math.cos(x) });
  const NODES = { x: [0.1, 0.25], y: [0.1, 0.75], a: [0.45, 0.25], b: [0.45, 0.75], f: [0.85, 0.5] };
  const EDGES = [["x", "a"], ["y", "a"], ["x", "b"], ["a", "f"], ["b", "f"]];
  const MSG = ["Start: inputs x and y are known.", "Forward: a = x · y.", "Forward: b = sin x.", "Forward: f = a + b.", "Backward: the derivative of f with respect to itself is 1.", "Backward: f = a + b, so ∂f/∂a = 1 and ∂f/∂b = 1.", "Backward: a = x·y gives ∂a/∂x = y, ∂a/∂y = x; b = sin x gives ∂b/∂x = cos x.", "Backward: x is used twice, so ∂f/∂x = y + cos x (both paths add); ∂f/∂y = x."];
  cv.onDraw((ctx, w, hh, p) => {
    const V = vals(), G = grads(), pos = (k) => [NODES[k][0] * w, NODES[k][1] * hh];
    ctx.lineWidth = 2; ctx.strokeStyle = p.muted; for (const [s, t] of EDGES) { const a = pos(s), b = pos(t); ctx.beginPath(); ctx.moveTo(a[0] + 30, a[1]); ctx.lineTo(b[0] - 30, b[1]); ctx.stroke(); }
    const show = { x: 0, y: 0, a: 1, b: 2, f: 3 }, gshow = { f: 4, a: 5, b: 5, x: 7, y: 7 }, fwd = { x: x, y: y, a: V.a, b: V.b, f: V.f }, lab = { x: "x", y: "y", a: "a = x·y", b: "b = sin x", f: "f = a + b" };
    for (const k of Object.keys(NODES)) { const [cx, cy] = pos(k), on = step >= show[k]; ctx.fillStyle = on ? p.accent : p.soft; ctx.globalAlpha = on ? 0.25 : 1; ctx.fillRect(cx - 42, cy - 26, 84, 52); ctx.globalAlpha = 1; ctx.strokeStyle = on ? p.accent : p.soft2; ctx.lineWidth = 2; ctx.strokeRect(cx - 42, cy - 26, 84, 52);
      ctx.fillStyle = p.ink; ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText(lab[k], cx, cy - 12); ctx.font = "800 14px Nunito, system-ui, sans-serif"; ctx.fillText(on ? fmt(fwd[k], 3) : "?", cx, cy + 4);
      if (step >= gshow[k]) { ctx.fillStyle = p.warm; ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.fillText(`∂f/∂${k} = ${fmt(G[k], 3)}`, cx, cy + 20); } }
  });
  function update() { const g = grads(), e = 1e-5; st.set("msg", MSG[step]); st.set("num", `(${fmt((F(x + e, y) - F(x - e, y)) / (2 * e), 3)}, ${fmt((F(x, y + e) - F(x, y - e)) / (2 * e), 3)})  and autodiff gives (${fmt(g.x, 3)}, ${fmt(g.y, 3)})`); say(MSG[step]); cv.redraw(); }
  update();
  return () => { stp.stop(); cv.destroy(); };
}
