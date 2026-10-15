// Bench: magnitude-prune a weight vector and compare the pruned output's relative error.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Pruning the smallest weights" });
  const say = live(body);
  let w = [0.9, -0.05, 0.6, 0.02, -0.8, 0.1, 0.3, -0.15];
  let pruneCount = 3;

  const cv = canvas(body, { aspect: 0.5, label: "Original weights (muted where pruned) and the resulting outputs" });
  const st = stats([["sparsity", "sparsity"], ["full", "full output"], ["pruned", "pruned output"], ["err", "relative error"]]);
  const sliders = w.map((v, i) => slider({ label: `w${i + 1}`, min: -1, max: 1, step: 0.01, value: v, format: (val) => val.toFixed(2), onInput: (val) => { w[i] = val; update(); } }));
  const sp = slider({ label: "weights pruned", min: 0, max: w.length - 1, step: 1, value: pruneCount, onInput: (v) => { pruneCount = v; update(); } });
  body.append(cv.box, st.el, ...sliders.map((s) => s.el), sp.el);

  function compute() {
    const full = w.reduce((s, v) => s + v, 0);
    const order = w.map((v, i) => [Math.abs(v), i]).sort((a, b) => a[0] - b[0]).slice(0, pruneCount).map(([, i]) => i);
    const pruned = w.map((v, i) => (order.includes(i) ? 0 : v));
    const prunedOut = pruned.reduce((s, v) => s + v, 0);
    return { full, pruned, prunedOut, order };
  }

  cv.onDraw((ctx, wd, hh, p) => {
    const { pruned, order } = compute();
    const n = w.length, gw = wd / n;
    w.forEach((v, i) => {
      const bh = Math.abs(v) * (hh - 30);
      ctx.fillStyle = order.includes(i) ? p.soft2 : v >= 0 ? p.accent : p.warm;
      ctx.fillRect(i * gw + gw * 0.25, hh - 20 - (v >= 0 ? bh : 0), gw * 0.5, bh);
    });
  });

  function update() {
    const { full, prunedOut } = compute();
    st.set("sparsity", `${pruneCount} of ${w.length} (${((pruneCount / w.length) * 100).toFixed(0)}%)`);
    st.set("full", full.toFixed(4));
    st.set("pruned", prunedOut.toFixed(4));
    st.set("err", full !== 0 ? `${((Math.abs(full - prunedOut) / Math.abs(full)) * 100).toFixed(1)}%` : "n/a");
    say(`pruned ${pruneCount} of ${w.length} weights, output ${prunedOut.toFixed(3)} vs full ${full.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
