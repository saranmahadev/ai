// Bench: slide collection size and watch exact nearest-neighbor search's comparison count grow with it.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Checking every single vector, every single query" });
  const say = live(body);
  let n = 1000;

  const cv = canvas(body, { aspect: 0.35, label: "Comparisons needed per query" });
  const st = stats([["comparisons", "comparisons per query"]]);
  const sl = slider({ label: "collection size (N)", min: 100, max: 10_000_000, step: 100, value: n, format: (v) => v.toLocaleString(), onInput: (v) => { n = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const frac = Math.min(1, n / 10_000_000);
    ctx.fillStyle = p.soft; ctx.fillRect(20, hh / 2 - 15, w - 40, 30);
    ctx.fillStyle = p.accent; ctx.fillRect(20, hh / 2 - 15, (w - 40) * frac, 30);
  });

  function update() {
    st.set("comparisons", n.toLocaleString());
    say(`a collection of ${n.toLocaleString()} vectors needs ${n.toLocaleString()} comparisons for one exact query`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
