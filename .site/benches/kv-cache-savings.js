// Bench: compare total key/value computations needed to generate N tokens, with and without caching.
const sumTo = (n) => (n * (n + 1)) / 2;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Compute each key and value exactly once" });
  const say = live(body);
  let N = 100;

  const cv = canvas(body, { aspect: 0.5, label: "Total key/value computations, with and without caching" });
  const st = stats([["without", "without caching"], ["with", "with caching"], ["speedup", "speedup"]]);
  const sl = slider({ label: "generation length (N)", min: 2, max: 500, step: 1, value: N, format: (v) => String(v), onInput: (v) => { N = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const without = sumTo(N), withC = N;
    const bars = [["without caching", without, p.warm], ["with caching", withC, p.good]];
    const bw = w / 3;
    const maxV = without;
    bars.forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 50);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 1) - bw * 0.3, hh - 30 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 1), hh - 10);
      ctx.fillText(v.toLocaleString(), bw * (i + 1), hh - 34 - bh);
    });
  });

  function update() {
    const without = sumTo(N), withC = N;
    st.set("without", without.toLocaleString());
    st.set("with", withC.toLocaleString());
    st.set("speedup", `${(without / withC).toFixed(1)}×`);
    say(`at length ${N}: without caching ${without.toLocaleString()}, with caching ${withC.toLocaleString()}, ${(without / withC).toFixed(1)} times fewer computations`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
