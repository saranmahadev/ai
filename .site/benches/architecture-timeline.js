// Bench: step through four CNN architectures, plus a small-filter-vs-large-filter weight comparison.
const ARCHS = [
  { name: "LeNet", year: 1998, depth: "~5 layers", idea: "Convolution + pooling, repeated, reads handwritten digits." },
  { name: "AlexNet", year: 2012, depth: "8 layers", idea: "Much deeper, ReLU, dropout, GPU-trained; wins ImageNet by a wide margin." },
  { name: "VGGNet", year: 2014, depth: "16–19 layers", idea: "Uniform, small 3×3 filters throughout, stacked deeper still." },
  { name: "ResNet", year: 2015, depth: "up to 152 layers", idea: "Skip connections let depth keep scaling past the degradation problem." }
];

export default function mount(root, kit) {
  const { frame, canvas, stats, live, button, h, choice } = kit;
  const body = frame(root, { title: "Four generations of CNN design" });
  const say = live(body);
  let i = 0, showFilters = false;

  const cv = canvas(body, { aspect: 0.45, label: "The selected architecture's year, depth and headline idea" });
  const st = stats([["year", "year"], ["depth", "depth"], ["idea", "headline idea"]]);
  const nav = h("div", { class: "bench-row" }, button("‹ Previous", () => { i = (i + 3) % 4; update(); }), button("Next ›", () => { i = (i + 1) % 4; update(); }));
  const ch = choice("Compare filters", [["off", "Hide"], ["on", "Show weight comparison"]], "off", (v) => { showFilters = v === "on"; update(); });
  body.append(cv.box, st.el, nav, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const a = ARCHS[i];
    ctx.fillStyle = p.ink; ctx.textAlign = "center";
    ctx.font = "800 28px Nunito, system-ui, sans-serif";
    ctx.fillText(a.name, w / 2, hh * 0.35);
    ctx.font = "700 15px Nunito, system-ui, sans-serif"; ctx.fillStyle = p.muted;
    ctx.fillText(`${a.year} · ${a.depth}`, w / 2, hh * 0.35 + 28);
    if (showFilters) {
      ctx.font = "700 13px Nunito, system-ui, sans-serif"; ctx.fillStyle = p.accent;
      ctx.fillText("one 5×5 filter: 25 weights", w / 2, hh * 0.7);
      ctx.fillStyle = p.good;
      ctx.fillText("two stacked 3×3 filters: 9 + 9 = 18 weights", w / 2, hh * 0.7 + 22);
    }
  });

  function update() {
    const a = ARCHS[i];
    st.set("year", String(a.year));
    st.set("depth", a.depth);
    st.set("idea", a.idea);
    say(`${a.name}, ${a.year}: ${a.idea}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
