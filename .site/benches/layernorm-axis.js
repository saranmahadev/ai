// Bench: the same table normalized down each column (batch norm) or across each row (layer norm).
export default function mount(root, kit) {
  const { frame, canvas, plot, choice, stats, live, slider } = kit;
  const body = frame(root, { title: "Batch norm's column vs layer norm's row" });
  const say = live(body);
  let X = [[2, 4, 4, 4], [5, 1, 3, 6], [0, 2, 8, 2]];
  let mode = "batch";
  const R = X.length, C = X[0].length;

  const cv = canvas(body, { aspect: 0.55, label: "The table, with the current normalization group highlighted" });
  const st = stats([["mean", "mean of the highlighted group"], ["var", "variance of the highlighted group"]]);
  const ch = choice("Normalize", [["batch", "Batch norm (down columns)"], ["layer", "Layer norm (across rows)"]], mode, (v) => { mode = v; update(); });
  const sliders = [];
  for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) {
    const s = slider({ label: `e${i} f${j}`, min: -2, max: 10, step: 0.5, value: X[i][j], format: (v) => v.toFixed(1), onInput: (v) => { X[i][j] = v; update(); } });
    sliders.push(s);
  }
  body.append(cv.box, st.el, ch.el, ...sliders.map((s) => s.el));

  function groupStats(idx) {
    const vals = mode === "batch" ? X.map((row) => row[idx]) : X[idx];
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
    return { mean, variance };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const cellW = w / C, cellH = hh / R;
    for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) {
      ctx.fillStyle = p.soft2;
      ctx.fillRect(j * cellW + 3, i * cellH + 3, cellW - 6, cellH - 6);
      ctx.fillStyle = p.ink;
      ctx.font = "700 14px Nunito, system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(X[i][j].toFixed(1), j * cellW + cellW / 2, i * cellH + cellH / 2);
    }
    ctx.strokeStyle = p.accent; ctx.lineWidth = 3;
    if (mode === "batch") { const j = 0; ctx.strokeRect(j * cellW + 1, 1, cellW - 2, hh - 2); }
    else { const i = 0; ctx.strokeRect(1, i * cellH + 1, w - 2, cellH - 2); }
  });

  function update() {
    const g = groupStats(0);
    st.set("mean", g.mean.toFixed(3));
    st.set("var", g.variance.toFixed(3));
    say(`highlighted group mean ${g.mean.toFixed(2)}, variance ${g.variance.toFixed(2)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
