// Bench: distances between random points concentrate as dimensions grow.
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, rng, plot, fmt, live } = kit;
  const body = frame(root, { title: "Distances in many dimensions" });
  const say = live(body);
  let d = 2;
  const sd = slider({ label: "dimensions", min: 1, max: 500, step: 1, value: d, onInput: (v) => { d = v; update(); } });
  const cv = canvas(body, { aspect: 0.55, label: "Histogram of distances between random points" });
  const st = stats([["mean", "average distance"], ["cv", "spread ÷ average"], ["core", "cube volume in the core (0.9ⁿ)"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sd.el));
  let dist = [], mean = 0, sd_ = 0;
  function sample() {
    const r = rng(7 + d); dist = [];
    for (let i = 0; i < 400; i++) { let s = 0; for (let j = 0; j < d; j++) { const t = r() - r(); s += t * t; } dist.push(Math.sqrt(s)); }
    mean = dist.reduce((a, b) => a + b, 0) / dist.length; sd_ = Math.sqrt(dist.reduce((a, b) => a + (b - mean) ** 2, 0) / dist.length);
  }
  cv.onDraw((ctx, w, hh, p) => {
    const hiX = Math.sqrt(500 / 6) * 1.25, bins = 40, cnt = new Array(bins).fill(0);
    for (const v of dist) cnt[Math.min(bins - 1, Math.floor((v / hiX) * bins))]++;
    const m = plot(w, hh, [0, hiX], [0, Math.max(...cnt) * 1.1]); m.axes(ctx, p, { xlabel: "distance between two random points", ylabel: "pairs" });
    cnt.forEach((c, i) => { ctx.fillStyle = p.accent; ctx.fillRect(m.X((i / bins) * hiX) + 1, m.Y(c), m.iw / bins - 2, m.Y(0) - m.Y(c)); });
  });
  function update() { sample(); st.set("mean", fmt(mean, 3)); st.set("cv", fmt(sd_ / mean, 3)); st.set("core", fmt(0.9 ** d, 6)); say(`In ${d} dimensions the average distance is ${fmt(mean, 2)} with relative spread ${fmt(sd_ / mean, 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
