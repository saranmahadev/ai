// Bench: rounds of parallel computation needed for an n x n matrix multiply, with P processors.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Rounds needed for a big matrix multiply" });
  const say = live(body);
  let n = 1000, cpuCores = 8, gpuCores = 5000;

  const cv = canvas(body, { aspect: 0.5, label: "Rounds needed, CPU-like vs GPU-like processor counts, on a log scale" });
  const st = stats([["ops", "total multiply-add operations"], ["cpu", "CPU-like rounds"], ["gpu", "GPU-like rounds"], ["speedup", "speedup"]]);
  const sn = slider({ label: "matrix size n", min: 100, max: 2000, step: 100, value: n, onInput: (v) => { n = v; update(); } });
  const sc = slider({ label: "CPU-like cores", min: 1, max: 64, step: 1, value: cpuCores, onInput: (v) => { cpuCores = v; update(); } });
  const sg = slider({ label: "GPU-like cores", min: 100, max: 10000, step: 100, value: gpuCores, onInput: (v) => { gpuCores = v; update(); } });
  body.append(cv.box, st.el, sn.el, sc.el, sg.el);

  function compute() {
    const ops = n ** 3;
    const cpuRounds = ops / cpuCores;
    const gpuRounds = ops / gpuCores;
    return { ops, cpuRounds, gpuRounds };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const { cpuRounds, gpuRounds } = compute();
    const maxLog = Math.log10(Math.max(cpuRounds, gpuRounds, 10));
    const bars = [["CPU-like", cpuRounds, p.warm], ["GPU-like", gpuRounds, p.accent]];
    const bw = w / 3;
    bars.forEach(([label, v, color], i) => {
      const bh = (Math.log10(Math.max(1, v)) / maxLog) * (hh - 36);
      ctx.fillStyle = color; ctx.fillRect(bw * (i + 1) - bw * 0.3, hh - 20 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 1), hh - 4);
      ctx.fillText(v.toExponential(2), bw * (i + 1), hh - 24 - bh);
    });
  });

  function update() {
    const { ops, cpuRounds, gpuRounds } = compute();
    st.set("ops", ops.toExponential(3));
    st.set("cpu", cpuRounds.toExponential(3));
    st.set("gpu", gpuRounds.toExponential(3));
    st.set("speedup", `${(cpuRounds / gpuRounds).toFixed(1)}×`);
    say(`${(cpuRounds / gpuRounds).toFixed(0)} times fewer rounds with the GPU-like processor count`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
