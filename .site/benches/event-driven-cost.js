// Bench: compare clocked (check-every-neuron-every-step) cost against event-driven (spikes-only) cost.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Clocked checks vs. spike events" });
  const say = live(body);
  let N = 1000, T = 1000, rate = 0.25;

  const cv = canvas(body, { aspect: 0.5, label: "Synchronous cost vs event-driven cost, as bars" });
  const st = stats([["sync", "synchronous cost"], ["event", "event-driven cost"], ["adv", "sparsity advantage"]]);
  const slN = slider({ label: "population size (N)", min: 100, max: 5000, step: 100, value: N, format: (v) => String(v), onInput: (v) => { N = v; update(); } });
  const slT = slider({ label: "time steps (T)", min: 100, max: 5000, step: 100, value: T, format: (v) => String(v), onInput: (v) => { T = v; update(); } });
  const slR = slider({ label: "firing rate (r)", min: 0.02, max: 1, step: 0.02, value: rate, format: (v) => v.toFixed(2), onInput: (v) => { rate = v; update(); } });
  body.append(cv.box, st.el, slN.el, slT.el, slR.el);

  cv.onDraw((ctx, w, hh, p) => {
    const sync = N * T, event = N * rate * T;
    const maxV = sync;
    const bw = w / 3;
    [["synchronous", sync, p.warm], ["event-driven", event, p.good]].forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 50);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 1) - bw * 0.3, hh - 30 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 1), hh - 10);
      ctx.fillText(v.toLocaleString(), bw * (i + 1), hh - 34 - bh);
    });
  });

  function update() {
    const sync = N * T, event = N * rate * T;
    st.set("sync", sync.toLocaleString());
    st.set("event", event.toLocaleString());
    st.set("adv", `${(1 / rate).toFixed(1)}×`);
    say(`synchronous cost ${sync.toLocaleString()}, event-driven cost ${event.toLocaleString()}, advantage ${(1 / rate).toFixed(1)} times`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
