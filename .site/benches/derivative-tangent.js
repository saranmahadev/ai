// Bench: slide a second point towards the first and watch the secant line become the tangent.
export default function mount(root, kit) {
  const { h, fmt, canvas, slider, stats, button, frame, live } = kit;
  const body = frame(root, {
    title: "From secant to tangent",
    hint: "Shrink h and the secant slope closes in on the derivative. The right-hand plot shows the derivative at every x."
  });
  const say = live(body);

  const FUNCS = {
    "x²": { f: (x) => x * x, d: (x) => 2 * x, range: [-3, 3], yr: [-1, 9], dr: [-6, 6] },
    "sin x": { f: Math.sin, d: Math.cos, range: [-6.3, 6.3], yr: [-1.6, 1.6], dr: [-1.6, 1.6] },
    "x³ − 3x": { f: (x) => x ** 3 - 3 * x, d: (x) => 3 * x * x - 3, range: [-2.5, 2.5], yr: [-6, 6], dr: [-4, 10] },
    "eˣ": { f: Math.exp, d: Math.exp, range: [-3, 2.5], yr: [-1, 12], dr: [-1, 12] },
    "|x|": { f: Math.abs, d: (x) => (x === 0 ? NaN : Math.sign(x)), range: [-3, 3], yr: [-0.5, 3.2], dr: [-1.6, 1.6] }
  };
  let name = "x²", x0 = 1, exp = -0.3, side = 1; // h = side * 10^exp

  const picker = h("div", { class: "bench-row", role: "group", "aria-label": "Choose a function" });
  const btns = Object.keys(FUNCS).map((n) => { const b = button(n, () => choose(n), { pressed: n === name }); picker.append(b); return b; });
  const left = canvas(body, { aspect: 0.62, label: "The function with its secant and tangent lines" });
  const right = canvas(body, { aspect: 0.62, label: "The derivative function with the current point marked" });
  const plots = h("div", { class: "bench-two" }, left.box, right.box);
  body.append(picker, plots);
  const readout = stats([["h", "h"], ["sec", "secant slope"], ["tan", "true slope f′(x)"], ["gap", "gap"]]);
  const verdict = h("p", { class: "bench-verdict" });
  const sx = slider({ label: "point x", min: -3, max: 3, step: 0.05, value: x0, format: (v) => fmt(v, 2), onInput: (v) => { x0 = v; update(); } });
  const sh = slider({ label: "distance h (log scale)", min: -3, max: 0.3, step: 0.01, value: exp, format: (v) => fmt(side * 10 ** v, 3), onInput: (v) => { exp = v; update(); } });
  const flipText = () => `Second point is on the ${side > 0 ? "right" : "left"} · switch side`;
  const flip = button(flipText(), () => { side = -side; flip.textContent = flipText(); update(); });
  body.append(readout.el, verdict, h("div", { class: "bench-controls" }, sx.el, sh.el), h("div", { class: "bench-row" }, flip));

  function choose(n) {
    name = n;
    btns.forEach((b) => b.setAttribute("aria-pressed", String(b.textContent === n)));
    const r = FUNCS[n].range;
    sx.input.min = r[0]; sx.input.max = r[1];
    x0 = Math.min(r[1], Math.max(r[0], x0)); sx.set(x0, true);
    update();
  }

  const map = (w, hh, rx, ry) => ({
    X: (x) => ((x - rx[0]) / (rx[1] - rx[0])) * w,
    Y: (y) => hh - ((y - ry[0]) / (ry[1] - ry[0])) * hh
  });
  function axes(ctx, m, w, hh, p) {
    ctx.strokeStyle = p.muted; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, m.Y(0)); ctx.lineTo(w, m.Y(0)); ctx.moveTo(m.X(0), 0); ctx.lineTo(m.X(0), hh); ctx.stroke();
  }
  function curve(ctx, fn, rx, m, color, width) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = "round"; ctx.beginPath();
    let pen = false;
    for (let i = 0; i <= 320; i++) {
      const x = rx[0] + ((rx[1] - rx[0]) * i) / 320, y = fn(x);
      if (!Number.isFinite(y)) { pen = false; continue; }
      if (pen) ctx.lineTo(m.X(x), m.Y(y)); else { ctx.moveTo(m.X(x), m.Y(y)); pen = true; }
    }
    ctx.stroke();
  }
  const dot = (ctx, x, y, r, fill, stroke) => { ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke(); };
  const line = (ctx, m, p0, slope, rx, color, width, dash) => {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.moveTo(m.X(rx[0]), m.Y(p0[1] + slope * (rx[0] - p0[0]))); ctx.lineTo(m.X(rx[1]), m.Y(p0[1] + slope * (rx[1] - p0[0]))); ctx.stroke(); ctx.setLineDash([]);
  };

  left.onDraw((ctx, w, hh, p) => {
    const F = FUNCS[name], m = map(w, hh, F.range, F.yr);
    axes(ctx, m, w, hh, p);
    const y0 = F.f(x0), hv = side * 10 ** exp, x1 = x0 + hv, y1 = F.f(x1), sec = (y1 - y0) / hv, tan = F.d(x0);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, hh); ctx.clip();
    if (Number.isFinite(tan)) line(ctx, m, [x0, y0], tan, F.range, p.good, 3, [7, 6]);
    line(ctx, m, [x0, y0], sec, F.range, p.warm, 3);
    ctx.restore();
    curve(ctx, F.f, F.range, m, p.accent, 4);
    dot(ctx, m.X(x1), m.Y(y1), 7, p.white, p.warm);
    dot(ctx, m.X(x0), m.Y(y0), 8, p.white, p.accent);
    ctx.font = "800 13px Nunito, system-ui, sans-serif"; ctx.fillStyle = p.ink;
    ctx.fillText("f(x)", 10, 20);
    ctx.fillStyle = p.warm; ctx.fillText("secant", 10, 38); ctx.fillStyle = p.good; ctx.fillText("tangent", 10, 56);
  });
  right.onDraw((ctx, w, hh, p) => {
    const F = FUNCS[name], m = map(w, hh, F.range, F.dr);
    axes(ctx, m, w, hh, p);
    curve(ctx, F.d, F.range, m, p.good, 4);
    const t = F.d(x0);
    ctx.setLineDash([5, 5]); ctx.strokeStyle = p.muted; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(m.X(x0), 0); ctx.lineTo(m.X(x0), hh); ctx.stroke(); ctx.setLineDash([]);
    if (Number.isFinite(t)) dot(ctx, m.X(x0), m.Y(t), 8, p.white, p.good);
    ctx.font = "800 13px Nunito, system-ui, sans-serif"; ctx.fillStyle = p.ink; ctx.fillText("f′(x): the slope at each x", 10, 20);
  });

  function update() {
    const F = FUNCS[name], hv = side * 10 ** exp, y0 = F.f(x0), sec = (F.f(x0 + hv) - y0) / hv, tan = F.d(x0);
    sh.set(exp, true);
    readout.set("h", fmt(hv, 3));
    readout.set("sec", fmt(sec, 4));
    readout.set("tan", Number.isFinite(tan) ? fmt(tan, 4) : "not defined here");
    readout.set("gap", Number.isFinite(tan) ? fmt(Math.abs(sec - tan), 4) : "—");
    const msg = !Number.isFinite(tan)
      ? "At the sharp corner the slope from the left is −1 and from the right is +1. They never agree, so there is no derivative here."
      : Math.abs(sec - tan) < 0.01 ? "The secant and the tangent are now almost the same line."
      : "Make h smaller and watch the orange secant swing onto the green tangent.";
    verdict.textContent = msg;
    say(`Secant slope ${fmt(sec, 3)}, true slope ${Number.isFinite(tan) ? fmt(tan, 3) : "undefined"}.`);
    left.redraw(); right.redraw();
  }
  choose(name);
  return () => { left.destroy(); right.destroy(); };
}
