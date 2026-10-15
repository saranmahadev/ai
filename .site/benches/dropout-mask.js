// Bench: one dropout mask on a hidden layer, and the running average over many draws.
export default function mount(root, kit) {
  const { frame, canvas, plot, slider, button, stats, live, rng, h } = kit;
  const body = frame(root, { title: "One dropout mask, and the average over many" });
  const say = live(body);
  const H = [0.8, 1.2, -0.5, 2.0, 0.3, -1.1, 1.5, 0.6];
  let p = 0.5, r = rng(5), draws = 0, runningSum = H.map(() => 0), last = H.map(() => 0);

  const cv = canvas(body, { aspect: 0.55, label: "Original activations, the current masked draw, and the running average" });
  const st = stats([["n", "draws so far"], ["err", "average distance from the original"]]);
  const sl = slider({ label: "drop probability p", min: 0.1, max: 0.9, step: 0.05, value: p, format: (v) => v.toFixed(2), onInput: (v) => { p = v; reset(); } });
  const bRow = h("div", { class: "bench-row" }, button("Draw a mask", draw), button("Reset", reset));
  body.append(cv.box, st.el, sl.el, bRow);

  function reset() { draws = 0; runningSum = H.map(() => 0); last = H.map(() => 0); update(); }
  function draw() {
    const scale = 1 / (1 - p);
    last = H.map((v) => (r.chance(1 - p) ? v * scale : 0));
    draws++;
    runningSum = runningSum.map((s, i) => s + last[i]);
    update();
  }

  cv.onDraw((ctx, w, hh, pal) => {
    const n = H.length, groupW = w / n;
    const m = plot(w, hh, [0, n], [-3, 3]);
    m.axes(ctx, pal, { xlabel: "unit", ylabel: "value", ticks: 3 });
    const avg = draws ? runningSum.map((s) => s / draws) : H.map(() => 0);
    for (let i = 0; i < n; i++) {
      const x0 = m.X(i) + groupW * 0.08;
      const bw = groupW * 0.22;
      const bar = (val, dx, color) => { const y0 = m.Y(0), y1 = m.Y(val); ctx.fillStyle = color; ctx.fillRect(x0 + dx, Math.min(y0, y1), bw, Math.abs(y1 - y0)); };
      bar(H[i], 0, pal.muted);
      bar(last[i], bw + 4, pal.accent);
      if (draws) bar(avg[i], 2 * (bw + 4), pal.good);
    }
  });

  function update() {
    const avg = draws ? runningSum.map((s) => s / draws) : H.map(() => 0);
    const err = draws ? H.reduce((s, v, i) => s + Math.abs(v - avg[i]), 0) / H.length : 0;
    st.set("n", String(draws));
    st.set("err", err.toFixed(3));
    say(draws ? `${draws} draws, average error from original ${err.toFixed(3)}` : "no draws yet");
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
