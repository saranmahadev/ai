// Bench: a toy grid search over depth and width, scoring accuracy proxy minus a cost penalty.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Searching a small architecture grid" });
  const say = live(body);
  const DEPTHS = [2, 3, 4], WIDTHS = [8, 16, 32];
  let costWeight = 0.0005;

  const cv = canvas(body, { aspect: 0.55, label: "Score for every (depth, width) candidate; the best is highlighted" });
  const st = stats([["best", "best candidate"], ["score", "best score"]]);
  const sw = slider({ label: "cost penalty weight", min: 0, max: 0.002, step: 0.0001, value: costWeight, format: (v) => v.toFixed(4), onInput: (v) => { costWeight = v; update(); } });
  body.append(cv.box, st.el, sw.el);

  function score(d, w) {
    const acc = 1 - 1 / (1 + 0.1 * d * w);
    const cost = costWeight * (d * w) ** 2;
    return { acc, cost, score: acc - cost };
  }

  function grid() {
    const results = [];
    for (const d of DEPTHS) for (const w of WIDTHS) results.push({ d, w, ...score(d, w) });
    return results;
  }

  cv.onDraw((ctx, w, hh, p) => {
    const results = grid();
    const best = results.reduce((a, b) => (b.score > a.score ? b : a));
    const n = results.length, gw = w / n;
    const maxScore = Math.max(...results.map((r) => r.score), 0.1);
    const minScore = Math.min(...results.map((r) => r.score), 0);
    results.forEach((r, i) => {
      const t = (r.score - minScore) / (maxScore - minScore || 1);
      const bh = Math.max(2, t * (hh - 34));
      ctx.fillStyle = r === best ? p.good : p.accent;
      ctx.fillRect(i * gw + gw * 0.2, hh - 20 - bh, gw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`d${r.d}w${r.w}`, i * gw + gw / 2, hh - 4);
    });
  });

  function update() {
    const results = grid();
    const best = results.reduce((a, b) => (b.score > a.score ? b : a));
    st.set("best", `depth ${best.d}, width ${best.w}`);
    st.set("score", best.score.toFixed(4));
    say(`best candidate depth ${best.d}, width ${best.w}, score ${best.score.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
