// Bench: drag two vectors and watch the dot product, the angle between them and the projection.
export default function mount(root, kit) {
  const { h, fmt, canvas, slider, stats, button, dragHandles, frame, live } = kit;
  const body = frame(root, {
    title: "Dot product playground"
  });
  const say = live(body);

  const R = 6; // the canvas shows -R..R on the x axis
  let a = [3, 1.5], b = [1.5, 3];
  const cv = canvas(body, { aspect: 0.62, label: "Two vectors a and b drawn from the origin, with the projection of b onto a" });
  const readout = stats([["dot", "a · b"], ["angle", "angle θ"], ["cos", "cos θ"], ["proj", "shadow of b"]]);
  const sum = h("p", { class: "bench-line" });
  const verdict = h("p", { class: "bench-verdict", "aria-live": "off" });

  const polar = (v) => [Math.hypot(v[0], v[1]), (Math.atan2(v[1], v[0]) * 180) / Math.PI];
  const cart = (len, deg) => [len * Math.cos((deg * Math.PI) / 180), len * Math.sin((deg * Math.PI) / 180)];
  const clampLen = (v) => { const l = Math.hypot(v[0], v[1]); return l > 5.5 ? [(v[0] * 5.5) / l, (v[1] * 5.5) / l] : v; };

  const sl = {
    la: slider({ label: "length of a", min: 0.5, max: 5.5, step: 0.1, value: 1, format: (v) => fmt(v, 1), onInput: (v) => { a = cart(v, polar(a)[1]); update(false); } }),
    aa: slider({ label: "direction of a", min: -180, max: 180, step: 1, value: 0, format: (v) => v + "°", onInput: (v) => { a = cart(polar(a)[0], v); update(false); } }),
    lb: slider({ label: "length of b", min: 0.5, max: 5.5, step: 0.1, value: 1, format: (v) => fmt(v, 1), onInput: (v) => { b = cart(v, polar(b)[1]); update(false); } }),
    ab: slider({ label: "direction of b", min: -180, max: 180, step: 1, value: 0, format: (v) => v + "°", onInput: (v) => { b = cart(polar(b)[0], v); update(false); } })
  };
  const presets = h("div", { class: "bench-row" },
    button("Same direction", () => { a = [3, 0]; b = [4.5, 0]; update(); }),
    button("Perpendicular", () => { a = [3.5, 0]; b = [0, 3]; update(); }),
    button("Opposite", () => { a = [3.5, 0]; b = [-2.5, 0]; update(); }),
    button("Unit length (cosine similarity)", () => { a = cart(1, 20); b = cart(1, 70); update(); })
  );
  const controls = h("div", { class: "bench-controls" }, sl.la.el, sl.aa.el, sl.lb.el, sl.ab.el);
  body.append(readout.el, sum, controls, presets);

  const toPx = (v) => { const s = cv.w / (2 * R); return { x: cv.w / 2 + v[0] * s, y: cv.h / 2 - v[1] * s }; };
  const fromPx = (x, y) => { const s = cv.w / (2 * R); return [(x - cv.w / 2) / s, (cv.h / 2 - y) / s]; };

  function arrow(ctx, from, to, color, width = 4) {
    const ang = Math.atan2(to.y - from.y, to.x - from.x), head = 13;
    ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = width; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x - Math.cos(ang) * head * 0.6, to.y - Math.sin(ang) * head * 0.6); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - head * Math.cos(ang - 0.42), to.y - head * Math.sin(ang - 0.42));
    ctx.lineTo(to.x - head * Math.cos(ang + 0.42), to.y - head * Math.sin(ang + 0.42));
    ctx.closePath(); ctx.fill();
  }

  cv.onDraw((ctx, w, hgt, p) => {
    const s = w / (2 * R), o = toPx([0, 0]);
    ctx.lineWidth = 1; ctx.strokeStyle = p.soft2;
    for (let i = -R; i <= R; i++) { ctx.beginPath(); ctx.moveTo(o.x + i * s, 0); ctx.lineTo(o.x + i * s, hgt); ctx.stroke(); }
    for (let j = -Math.ceil(hgt / s / 2); j <= Math.ceil(hgt / s / 2); j++) { ctx.beginPath(); ctx.moveTo(0, o.y + j * s); ctx.lineTo(w, o.y + j * s); ctx.stroke(); }
    ctx.strokeStyle = p.muted; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, o.y); ctx.lineTo(w, o.y); ctx.moveTo(o.x, 0); ctx.lineTo(o.x, hgt); ctx.stroke();

    const aa = a[0] ** 2 + a[1] ** 2, k = aa ? (a[0] * b[0] + a[1] * b[1]) / aa : 0;
    const pr = toPx([a[0] * k, a[1] * k]), A = toPx(a), B = toPx(b);
    ctx.setLineDash([6, 6]); ctx.strokeStyle = p.muted; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(B.x, B.y); ctx.lineTo(pr.x, pr.y); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = p.good; ctx.lineWidth = 9; ctx.globalAlpha = 0.55; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(pr.x, pr.y); ctx.stroke(); ctx.globalAlpha = 1;

    arrow(ctx, o, A, p.accent); arrow(ctx, o, B, p.warm);
    for (const [pt, col, name] of [[A, p.accent, "a"], [B, p.warm, "b"]]) {
      ctx.fillStyle = p.white; ctx.strokeStyle = col; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 9, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = p.ink; ctx.font = "800 16px Nunito, system-ui, sans-serif";
      ctx.fillText(name, pt.x + 14, pt.y - 12);
    }
  });

  dragHandles(cv.cv, () => [toPx(a), toPx(b)], (i, x, y) => {
    const v = clampLen(fromPx(x, y));
    if (i === 0) a = v; else b = v;
    update(false);
  });

  function update(syncSliders = true) {
    const dot = a[0] * b[0] + a[1] * b[1];
    const [la, aa] = polar(a), [lb, ab] = polar(b);
    const cos = la && lb ? dot / (la * lb) : 0;
    const theta = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
    readout.set("dot", fmt(dot));
    readout.set("angle", fmt(theta, 0) + "°");
    readout.set("cos", fmt(cos, 2));
    readout.set("proj", fmt(la ? dot / la : 0));
    sum.textContent = `a · b = (${fmt(a[0])} × ${fmt(b[0])}) + (${fmt(a[1])} × ${fmt(b[1])}) = ${fmt(dot)}   and   |a| |b| cos θ = ${fmt(la)} × ${fmt(lb)} × ${fmt(cos)} = ${fmt(la * lb * cos)}`;
    const msg = Math.abs(cos) < 0.02 ? "Perpendicular: the dot product is 0, so they share no direction."
      : cos > 0 ? "They point roughly the same way: the dot product is positive."
      : "They point roughly opposite ways: the dot product is negative.";
    verdict.textContent = msg;
    say(`a dot b is ${fmt(dot)}, angle ${fmt(theta, 0)} degrees. ${msg}`);
    const idle = (s) => document.activeElement !== s.input;
    if (syncSliders || idle(sl.la)) sl.la.set(la, true);
    if (syncSliders || idle(sl.aa)) sl.aa.set(Math.round(aa), true);
    if (syncSliders || idle(sl.lb)) sl.lb.set(lb, true);
    if (syncSliders || idle(sl.ab)) sl.ab.set(Math.round(ab), true);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
