// Bench: a small graph with editable node features; step through mean-aggregation GNN layers.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live, stepper } = kit;
  const body = frame(root, { title: "Updating a node from its graph neighbours" });
  const say = live(body);
  const EDGES = { A: ["B"], B: ["A", "C", "D"], C: ["B"], D: ["B"] };
  const POS = { A: [0.2, 0.3], B: [0.5, 0.5], C: [0.8, 0.3], D: [0.5, 0.85] };
  let feat = { A: 1, B: 2, C: 3, D: 4 }, layer = 0;

  const cv = canvas(body, { aspect: 0.75, label: "The graph, with node colour intensity showing its current value" });
  const st = stats([["vals", "current node values"], ["layer", "GNN layers applied"]]);
  const sliders = Object.keys(feat).map((k) => slider({ label: k, min: 0, max: 10, step: 0.5, value: feat[k], onInput: (v) => { feat[k] = v; layer = 0; update(); } }));
  const sp = stepper({ onStep: step, onReset: reset, interval: 500, stepLabel: "Apply one layer" });
  body.append(cv.box, st.el, ...sliders.map((s) => s.el), sp.el);

  function reset() { layer = 0; update(); return undefined; }
  function step() {
    const next = {};
    for (const v of Object.keys(feat)) {
      const neigh = EDGES[v].map((u) => feat[u]);
      const mean = neigh.reduce((a, b) => a + b, 0) / neigh.length;
      next[v] = (feat[v] + mean) / 2;
    }
    feat = next;
    layer++;
    update();
    return layer < 4;
  }

  cv.onDraw((ctx, w, hh, p) => {
    for (const [v, u] of Object.entries(EDGES)) for (const n of u) {
      ctx.strokeStyle = p.muted; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(POS[v][0] * w, POS[v][1] * hh); ctx.lineTo(POS[n][0] * w, POS[n][1] * hh); ctx.stroke();
    }
    const maxV = Math.max(...Object.values(feat), 1);
    for (const [v, [x, y]] of Object.entries(POS)) {
      const t = feat[v] / maxV;
      ctx.fillStyle = p.accent; ctx.globalAlpha = 0.3 + 0.7 * t;
      ctx.beginPath(); ctx.arc(x * w, y * hh, 22, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = p.ink; ctx.font = "700 13px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(`${v}\n${feat[v].toFixed(2)}`.split("\n")[0], x * w, y * hh - 6);
      ctx.fillText(feat[v].toFixed(2), x * w, y * hh + 10);
    }
  });

  function update() {
    st.set("vals", Object.entries(feat).map(([k, v]) => `${k}=${v.toFixed(2)}`).join(", "));
    st.set("layer", String(layer));
    say(`after ${layer} layer(s): ${Object.entries(feat).map(([k, v]) => `${k}=${v.toFixed(2)}`).join(", ")}`);
    cv.redraw();
  }
  update();
  return () => { cv.destroy(); sp.stop(); };
}
