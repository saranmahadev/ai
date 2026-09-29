// Bench: one model, two groups whose data behave differently. Whoever dominates the training data shapes the model.
export default function mount(root, kit) {
  const { h, frame, slider, toggles, canvas, rng, live, stats, fmt } = kit;
  const body = frame(root, {
    title: "Whose data shaped the model?",
    hint: "The model picks one cut-off on a single reading. Group B's readings sit differently from group A's, so one cut-off cannot suit both."
  });
  const say = live(body);
  const tA = 0.55, tB = 0.4, noise = 0.04;
  const mk = (seed, n, t) => { const r = rng(seed); return Array.from({ length: n }, () => { const x = r(); let l = x > t ? 1 : 0; if (r() < noise) l = 1 - l; return { x, l }; }); };
  const poolA = mk(1, 300, tA), poolB = mk(2, 300, tB);
  let share = 10, shift = 0, split = false;
  const ss = slider({ label: "share of training examples from group B", min: 5, max: 50, step: 5, value: share, format: (v) => v + "%", onInput: (v) => { share = v; update(); } });
  const sh = slider({ label: "the world changes after training (group A shifts)", min: 0, max: 20, step: 5, value: shift, format: (v) => (v ? `+${v / 100}` : "no change"), onInput: (v) => { shift = v; update(); } });
  const tg = toggles([["split", "Tell the model which group each example comes from", false]], (v) => { split = v.split; update(); });
  const cv = canvas(body, { aspect: 0.32, label: "Two rows of readings for groups A and B with the model's cut-off line", maxH: 220 });
  const st = stats([["a", "group A: correct"], ["b", "group B: correct"], ["thr", "learned cut-off"]]);
  const out = h("p", { class: "bench-verdict" });
  body.append(cv.box, st.el, out, h("div", { class: "bench-controls" }, ss.el, sh.el), tg.el);

  function fit(data) {
    let best = -1, ts = [];
    for (let i = 0; i <= 200; i++) { const t = i / 200, a = data.filter((p) => (p.x > t ? 1 : 0) === p.l).length / data.length; if (a > best + 1e-9) { best = a; ts = [t]; } else if (Math.abs(a - best) < 1e-9) ts.push(t); }
    return ts.reduce((a, b) => a + b, 0) / ts.length;
  }
  let model = {}, tests = {};
  function update() {
    const nB = Math.round((share / 100) * 200), nA = 200 - nB, A = poolA.slice(0, nA), B = poolB.slice(0, nB);
    model = split ? { A: fit(A), B: fit(B) } : (() => { const t = fit([...A, ...B]); return { A: t, B: t }; })();
    tests = { A: mk(11, 600, tA + shift / 100), B: mk(12, 600, tB) };
    const acc = (g) => Math.round(100 * tests[g].filter((p) => (p.x > model[g] ? 1 : 0) === p.l).length / tests[g].length);
    const a = acc("A"), b = acc("B");
    st.set("a", a + "%"); st.set("b", b + "%"); st.set("thr", split ? `A ${fmt(model.A, 2)} · B ${fmt(model.B, 2)}` : fmt(model.A, 2));
    const msg = split ? `Given the group, the model sets a cut-off for each (A ${fmt(model.A, 2)}, B ${fmt(model.B, 2)}) and both groups do well, because the missing context was the problem.`
      : a - b > 8 ? `One cut-off (${fmt(model.A, 2)}) sits near the majority group's pattern, so group B suffers: ${a}% for A against ${b}% for B.`
      : b - a > 8 ? `With so much of group B in the data the cut-off (${fmt(model.A, 2)}) moves towards B, and now group A pays: ${a}% against ${b}%.`
      : `Roughly equal accuracy, ${a}% and ${b}%.`;
    out.textContent = msg + (shift ? " The world has also shifted for group A since training, which costs it accuracy." : ""); say(out.textContent); cv.redraw();
  }
  cv.onDraw((ctx, W, H, p) => {
    const L = 90, X = (x) => L + x * (W - L - 12), rows = [["Group A", "A", tA + shift / 100, 0], ["Group B", "B", tB, 1]], rh = H / 2;
    ctx.font = "800 12px Nunito, system-ui, sans-serif"; ctx.textBaseline = "middle";
    for (const [name, g, tt, i] of rows) {
      const cy = i * rh + rh / 2;
      ctx.fillStyle = p.ink; ctx.textAlign = "left"; ctx.fillText(name, 8, cy);
      ctx.strokeStyle = p.soft2; ctx.lineWidth = 10; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(X(0), cy); ctx.lineTo(X(1), cy); ctx.stroke();
      (tests[g] || []).slice(0, 60).forEach((q, j) => { ctx.fillStyle = q.l ? p.warm : p.accent; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(X(q.x), cy + ((j % 5) - 2) * 4, 3.2, 0, 7); ctx.fill(); });
      ctx.globalAlpha = 1;
      ctx.strokeStyle = p.good; ctx.lineWidth = 3; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(tt), cy - rh * 0.4); ctx.lineTo(X(tt), cy + rh * 0.4); ctx.stroke(); ctx.setLineDash([]);
      const mt = model[g]; if (mt !== undefined) { ctx.strokeStyle = p.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(mt), cy - rh * 0.45); ctx.lineTo(X(mt), cy + rh * 0.45); ctx.stroke(); }
    }
    ctx.fillStyle = p.muted; ctx.textAlign = "left"; ctx.fillText("green dashes: where the truth switches for this group · black line: the model's cut-off · orange = should be “yes”", L, H - 6);
  });
  update();
  return () => cv.destroy();
}
