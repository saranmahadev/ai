// Bench: one goal, several options. Weights turn the goal into a score and the score picks the action.
export default function mount(root, kit) {
  const { h, frame, slider, button, canvas, live, fmt } = kit;
  const body = frame(root, {
    title: "Choosing a route",
    hint: "The agent scores each route. Change what it cares about and watch the best choice change."
  });
  const say = live(body);
  // time (min), toll ($), chance of delay, delay length (min)
  const R = [
    { name: "Highway", time: 25, cost: 6, p: 0.3, delay: 20 },
    { name: "Back roads", time: 35, cost: 0, p: 0.05, delay: 10 },
    { name: "Train", time: 40, cost: 4, p: 0.02, delay: 15 }
  ];
  const w = { time: 5, cost: 3, risk: 3 };
  const mk = (k, label) => slider({ label, min: 0, max: 10, step: 1, value: w[k], format: (v) => v, onInput: (v) => { w[k] = v; update(); } });
  const st = { time: mk("time", "how much I care about time"), cost: mk("cost", "how much I care about cost"), risk: mk("risk", "how much I dislike risk") };
  const set = (t, c, r) => { w.time = t; w.cost = c; w.risk = r; st.time.set(t, true); st.cost.set(c, true); st.risk.set(r, true); update(); };
  const presets = h("div", { class: "bench-row" }, button("In a hurry", () => set(10, 1, 1)), button("On a budget", () => set(2, 10, 2)), button("Hates surprises", () => set(3, 3, 10)));
  const cv = canvas(body, { aspect: 0.42, label: "Bar chart of each route's score" });
  const table = h("dl", { class: "bench-stats" });
  const verdict = h("p", { class: "bench-verdict" });
  body.append(cv.box, table, verdict, h("div", { class: "bench-controls" }, st.time.el, st.cost.el, st.risk.el), presets);

  let scores = [];
  function compute() {
    const exp = R.map((r) => ({ ...r, expTime: r.time + r.p * r.delay, exp: r.p * r.delay }));
    const norm = (key) => { const v = exp.map((e) => e[key]), lo = Math.min(...v), hi = Math.max(...v); return (x) => (hi === lo ? 0 : (x - lo) / (hi - lo)); };
    const nT = norm("expTime"), nC = norm("cost"), nR = norm("exp");
    const tot = w.time + w.cost + w.risk || 1;
    scores = exp.map((e) => ({ ...e, u: 1 - (w.time * nT(e.expTime) + w.cost * nC(e.cost) + w.risk * nR(e.exp)) / tot }));
  }
  cv.onDraw((ctx, W, H, p) => {
    const bw = Math.min(90, W / 5), gap = (W - bw * 3) / 4, top = 24, base = H - 30;
    const best = scores.reduce((a, b) => (b.u > a.u ? b : a));
    ctx.font = "800 13px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    scores.forEach((s, i) => {
      const x = gap + i * (bw + gap), ht = Math.max(4, s.u * (base - top));
      ctx.fillStyle = s === best ? p.accent : p.soft2;
      ctx.beginPath(); ctx.roundRect(x, base - ht, bw, ht, 12); ctx.fill();
      ctx.fillStyle = p.ink; ctx.fillText(s.name, x + bw / 2, H - 10); ctx.fillText(fmt(s.u, 2), x + bw / 2, base - ht - 8);
    });
  });
  function update() {
    compute();
    const best = scores.reduce((a, b) => (b.u > a.u ? b : a));
    table.textContent = "";
    for (const s of scores) table.append(h("div", {}, h("dt", {}, s.name), h("dd", {}, `${fmt(s.expTime, 1)} min · $${s.cost}`), h("small", { class: "bench-line" }, `expected time = ${s.time} + ${fmt(s.p, 2)} × ${s.delay} = ${fmt(s.expTime, 1)}`)));
    const msg = `The agent chooses: ${best.name} (score ${fmt(best.u, 2)}). Same routes, different priorities, different action.`;
    verdict.textContent = msg; say(msg); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
