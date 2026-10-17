// Bench: store K random patterns in an N-unit Hopfield network and measure recall success as K grows.
import { hopfieldWeights, hopfieldSettle, hammingDistance, corrupt } from "./nnkit.js";
import { rng, plot } from "./kit.js";

const N = 50;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "How many patterns fit?" });
  const say = live(body);
  const history = {}; // K -> success rate

  let K = 4;
  const cv = canvas(body, { aspect: 0.55, label: "Recall success rate as the number of stored patterns grows" });
  const st = stats([["k", "patterns stored (K)"], ["ratio", "K / N"], ["rate", "recall success rate"]]);
  const sl = slider({ label: "patterns stored", min: 2, max: 20, step: 1, value: K, format: (v) => String(v), onInput: (v) => { K = v; run(); } });
  body.append(cv.box, st.el, sl.el);

  function run() {
    if (history[K] == null) history[K] = trial(K);
    update();
  }

  function trial(k) {
    const rand = rng(1000 + k);
    const patterns = Array.from({ length: k }, () => Array.from({ length: N }, () => (rand() < 0.5 ? 1 : -1)));
    const W = hopfieldWeights(patterns);
    const order = Array.from({ length: N }, (_, i) => i);
    let successes = 0;
    for (const p of patterns) {
      const s0 = corrupt(p, Math.round(N * 0.1), rand);
      const { s } = hopfieldSettle(W, s0, order, 20);
      if (hammingDistance(s, p) === 0) successes++;
    }
    return successes / k;
  }

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [2, 20], [0, 1]);
    m.axes(ctx, p, { xlabel: "patterns stored (K)", ylabel: "success rate" });
    const xs = Object.keys(history).map(Number).sort((a, b) => a - b);
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    xs.forEach((k, i) => { const x = m.X(k), y = m.Y(history[k]); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();
    ctx.fillStyle = p.accent;
    xs.forEach((k) => { ctx.beginPath(); ctx.arc(m.X(k), m.Y(history[k]), 4, 0, 7); ctx.fill(); });
    const kmax = 0.138 * N;
    ctx.strokeStyle = p.warm; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(m.X(kmax), m.Y(0)); ctx.lineTo(m.X(kmax), m.Y(1)); ctx.stroke(); ctx.setLineDash([]);
  });

  function update() {
    const rate = history[K];
    st.set("k", String(K));
    st.set("ratio", (K / N).toFixed(2));
    st.set("rate", `${Math.round(rate * 100)}%`);
    say(`${K} patterns stored, ratio ${(K / N).toFixed(2)}, recall success ${Math.round(rate * 100)}%`);
    cv.redraw();
  }
  run();
  return () => cv.destroy();
}
