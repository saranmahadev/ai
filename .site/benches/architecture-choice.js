// Bench: pick a task shape and compare the three architecture families' attention-pair cost at chosen lengths.
const SHAPES = [
  { key: "classify", label: "Understanding only, no generation", family: "Encoder-only" },
  { key: "continue", label: "One growing sequence (prompt + generation)", family: "Decoder-only" },
  { key: "transform", label: "Two separate sequences (input → output)", family: "Encoder-decoder" }
];

function sumTo(n) { return (n * (n + 1)) / 2; }
function cost(N, M) {
  return {
    "Encoder-only": N * N,
    "Decoder-only": sumTo(N + M),
    "Encoder-decoder": N * N + sumTo(M) + M * N
  };
}

export default function mount(root, kit) {
  const { frame, canvas, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "Match the task shape to the architecture" });
  const say = live(body);
  let shape = "classify", N = 6, M = 4;

  const cv = canvas(body, { aspect: 0.5, label: "Attention-pair cost for each architecture at this input/output length" });
  const st = stats([["match", "matched family"]]);
  const ch = choice("Task shape", SHAPES.map((s) => [s.key, s.label]), shape, (v) => { shape = v; update(); });
  const slN = slider({ label: "input length (N)", min: 1, max: 20, step: 1, value: N, format: (v) => String(v), onInput: (v) => { N = v; update(); } });
  const slM = slider({ label: "output length (M)", min: 0, max: 20, step: 1, value: M, format: (v) => String(v), onInput: (v) => { M = v; update(); } });
  body.append(cv.box, st.el, ch.el, slN.el, slM.el);

  let costs = {};
  cv.onDraw((ctx, w, hh, p) => {
    const families = Object.keys(costs);
    const bw = w / (families.length + 1);
    const matched = SHAPES.find((s) => s.key === shape).family;
    const maxC = Math.max(...Object.values(costs), 1);
    families.forEach((f, i) => {
      const bh = (costs[f] / maxC) * (hh - 50);
      ctx.fillStyle = f === matched ? p.good : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 30 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(f, bw * (i + 0.5) + bw * 0.3, hh - 10);
      ctx.fillText(String(costs[f]), bw * (i + 0.5) + bw * 0.3, hh - 34 - bh);
    });
  });

  function update() {
    costs = cost(N, M);
    const matched = SHAPES.find((s) => s.key === shape).family;
    st.set("match", matched);
    say(`${matched} fits this task shape; costs: ${Object.entries(costs).map(([f, c]) => `${f} ${c}`).join(", ")}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
