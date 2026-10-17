// Bench: compare batch processing time and throughput at a chosen batch size.
const T_FIXED = 10, T_MARGINAL = 0.5; // ms

function batchTime(B) { return T_FIXED + T_MARGINAL * B; }

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Throughput and the cost of waiting for a full batch" });
  const say = live(body);
  let batchSize = 8;

  const cv = canvas(body, { aspect: 0.5, label: "Throughput as batch size grows" });
  const st = stats([["time", "processing time"], ["throughput", "throughput"]]);
  const sl = slider({ label: "batch size", min: 1, max: 64, step: 1, value: batchSize, format: (v) => String(v), onInput: (v) => { batchSize = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const sizes = [1, 2, 4, 8, 16, 32, 64];
    const bw = w / (sizes.length + 1);
    const maxThroughput = Math.max(...sizes.map((b) => b / (batchTime(b) / 1000)));
    sizes.forEach((b, i) => {
      const t = batchTime(b) / 1000;
      const throughput = b / t;
      const bh = (throughput / maxThroughput) * (hh - 50);
      ctx.fillStyle = b === batchSize ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 24 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`B=${b}`, bw * (i + 0.5) + bw * 0.3, hh - 8);
    });
  });

  function update() {
    const t = batchTime(batchSize);
    const throughput = batchSize / (t / 1000);
    st.set("time", `${t.toFixed(1)} ms`);
    st.set("throughput", `${throughput.toFixed(1)} req/s`);
    say(`batch size ${batchSize}: ${t.toFixed(1)} ms processing time, ${throughput.toFixed(1)} requests per second`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
