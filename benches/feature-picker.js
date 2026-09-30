// Bench: the same fruit described by different features. Good features separate the classes.
export default function mount(root, kit) {
  const { h, frame, choice, canvas, rng, plot, live, fmt } = kit;
  const body = frame(root, {
    title: "Which features separate apples from oranges?"
  });
  const say = live(body);
  const FEATS = { redness: "Redness (0–1)", bumpy: "Skin bumpiness (0–1)", weight: "Weight (g)", seeds: "Seeds counted" };
  const r = rng(11), gauss = () => { let s = 0; for (let i = 0; i < 6; i++) s += r(); return (s - 3) / 0.7071; };
  const data = [];
  for (let i = 0; i < 90; i++) {
    const orange = i % 2 === 1, w = 160 + gauss() * 32;
    data.push({ orange, redness: (orange ? 0.35 : 0.72) + gauss() * 0.13, bumpy: (orange ? 0.7 : 0.3) + gauss() * 0.13, weight: w + (orange ? 12 : 0), seeds: 5 + Math.round(gauss() * 1.8) });
  }
  let fx = "weight", fy = "seeds";
  const opts = Object.entries(FEATS);
  const cx = choice("Horizontal axis", opts, fx, (v) => { fx = v; render(); });
  const cy = choice("Vertical axis", opts, fy, (v) => { fy = v; render(); });
  const cv = canvas(body, { aspect: 0.62, label: "Scatter plot of apples and oranges on the chosen two features" });
  const st = kit.stats([["acc", "fruits on the correct side"]]);
  body.append(cx.el, cy.el, cv.box, st.el);
  const stat = (k) => { const v = data.map((d) => d[k]), mu = v.reduce((a, b) => a + b, 0) / v.length; return { mu, sd: Math.sqrt(v.reduce((a, b) => a + (b - mu) ** 2, 0) / v.length) || 1, lo: Math.min(...v), hi: Math.max(...v) }; };
  function model() {
    const ks = fx === fy ? [fx] : [fx, fy], st = ks.map(stat), z = (d) => ks.map((k, i) => (d[k] - st[i].mu) / st[i].sd);
    const cen = (o) => { const pts = data.filter((d) => d.orange === o).map(z); return ks.map((_, i) => pts.reduce((a, p) => a + p[i], 0) / pts.length); };
    const A = cen(false), B = cen(true), pred = (d) => { const p = z(d), da = p.reduce((s, v, i) => s + (v - A[i]) ** 2, 0), db = p.reduce((s, v, i) => s + (v - B[i]) ** 2, 0); return db < da; };
    return { ks, st, pred, A, B, acc: data.filter((d) => pred(d) === d.orange).length / data.length };
  }
  cv.onDraw((ctx, w, hh, p) => {
    const M = model(), sx = stat(fx), sy = stat(fy), px = (sx.hi - sx.lo) * 0.08, py = (sy.hi - sy.lo) * 0.08;
    const m = plot(w, hh, [sx.lo - px, sx.hi + px], [sy.lo - py, sy.hi + py]);
    m.axes(ctx, p, { xlabel: FEATS[fx], ylabel: FEATS[fy] });
    if (M.ks.length === 2) { // boundary: equal distance to both centres, in standardised units
      const d = [M.B[0] - M.A[0], M.B[1] - M.A[1]], mid = [(M.A[0] + M.B[0]) / 2, (M.A[1] + M.B[1]) / 2];
      const ys = (x) => M.st[1].mu + M.st[1].sd * (mid[1] - (d[0] / d[1]) * ((x - M.st[0].mu) / M.st[0].sd - mid[0]));
      ctx.strokeStyle = p.muted; ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.save(); ctx.beginPath(); ctx.rect(m.pad.l, m.pad.t, m.iw, m.ih); ctx.clip(); ctx.beginPath();
      if (Math.abs(d[1]) < 1e-6) { const x = M.st[0].mu + M.st[0].sd * mid[0]; ctx.moveTo(m.X(x), m.pad.t); ctx.lineTo(m.X(x), m.pad.t + m.ih); }
      else { const x0 = m.x(m.pad.l), x1 = m.x(m.pad.l + m.iw); ctx.moveTo(m.X(x0), m.Y(ys(x0))); ctx.lineTo(m.X(x1), m.Y(ys(x1))); }
      ctx.stroke(); ctx.restore(); ctx.setLineDash([]);
    } else { const x = M.st[0].mu + M.st[0].sd * (M.A[0] + M.B[0]) / 2; ctx.strokeStyle = p.muted; ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.X(x), m.pad.t); ctx.lineTo(m.X(x), m.pad.t + m.ih); ctx.stroke(); ctx.setLineDash([]); }
    data.forEach((d, i) => {
      const yv = fx === fy ? sy.lo + ((i * 37) % 100) / 100 * (sy.hi - sy.lo) : d[fy], ok = M.pred(d) === d.orange;
      ctx.fillStyle = d.orange ? p.warm : p.accent; ctx.globalAlpha = 0.85;
      ctx.beginPath(); ctx.arc(m.X(d[fx]), m.Y(yv), 5, 0, 7); ctx.fill();
      if (!ok) { ctx.globalAlpha = 1; ctx.strokeStyle = p.ink; ctx.lineWidth = 1.6; ctx.stroke(); }
    });
    ctx.globalAlpha = 1;
  });
  function render() {
    const M = model(), a = Math.round(M.acc * 100);
    const msg = `${a}% of the 90 fruits land on the correct side (circled dots are misplaced). ` + (fx === fy ? "Same feature on both axes, so only one feature is really used. " : "") + (a >= 92 ? "These features tell the fruits apart well." : a <= 65 ? "These features barely help. The groups overlap almost completely." : "Some help, but the groups still overlap.");
    st.set("acc", a + "%"); say(msg); cv.redraw();
  }
  render();
  return () => cv.destroy();
}
