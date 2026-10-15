// Bench: split a batch of gradients across workers, confirm the averaged result matches, and show speedup vs overhead.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Splitting a batch across workers" });
  const say = live(body);
  const GRADS = [1, 2, 3, 4, 5, 6, 7, 8];
  let K = 4, overhead = 0.1;

  const cv = canvas(body, { aspect: 0.5, label: "Each worker's local mean, against the global mean" });
  const st = stats([["global", "global mean"], ["avgofmeans", "average of worker means"], ["speedup", "ideal vs actual speedup"]]);
  const sk = slider({ label: "workers (K)", min: 1, max: 8, step: 1, value: K, onInput: (v) => { K = v; update(); } });
  const so = slider({ label: "communication overhead (fraction of compute)", min: 0, max: 0.5, step: 0.02, value: overhead, format: (v) => (v * 100).toFixed(0) + "%", onInput: (v) => { overhead = v; update(); } });
  body.append(cv.box, st.el, sk.el, so.el);

  function compute() {
    const shardSize = GRADS.length / K;
    const means = [];
    for (let i = 0; i < K; i++) {
      const shard = GRADS.slice(Math.round(i * shardSize), Math.round((i + 1) * shardSize));
      means.push(shard.length ? shard.reduce((a, b) => a + b, 0) / shard.length : 0);
    }
    const avgOfMeans = means.reduce((a, b) => a + b, 0) / K;
    const globalMean = GRADS.reduce((a, b) => a + b, 0) / GRADS.length;
    const actualTime = 1 / K + overhead;
    const speedup = 1 / actualTime;
    return { means, avgOfMeans, globalMean, speedup };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const { means } = compute();
    const gw = w / K;
    means.forEach((m, i) => {
      const bh = (m / 8) * (hh - 30);
      ctx.fillStyle = p.accent;
      ctx.fillRect(i * gw + gw * 0.2, hh - 20 - bh, gw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`worker ${i + 1}`, i * gw + gw / 2, hh - 4);
      ctx.fillText(m.toFixed(2), i * gw + gw / 2, hh - 24 - bh);
    });
  });

  function update() {
    const { avgOfMeans, globalMean, speedup } = compute();
    st.set("global", globalMean.toFixed(4));
    st.set("avgofmeans", avgOfMeans.toFixed(4));
    st.set("speedup", `ideal ${K}×, actual ${speedup.toFixed(2)}×`);
    say(`average of worker means ${avgOfMeans.toFixed(2)}, matching global mean ${globalMean.toFixed(2)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
