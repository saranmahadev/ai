// Bench: slide corpus size and compare how much of it a human could hand-write test questions for against automatic synthetic generation.
const HAND_WRITE_RATE_PER_HOUR = 10;
const WORKDAY_HOURS = 8;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "One workday of writing questions by hand" });
  const say = live(body);
  let corpusSize = 500;

  const cv = canvas(body, { aspect: 0.4, label: "Coverage: hand-written vs. synthetic" });
  const st = stats([["hand", "hand-written coverage (1 workday)"], ["synthetic", "synthetic coverage"]]);
  const sl = slider({ label: "corpus size (chunks)", min: 50, max: 5000, step: 50, value: corpusSize, format: (v) => v.toLocaleString(), onInput: (v) => { corpusSize = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  function handCoverage() { return Math.min(corpusSize, WORKDAY_HOURS * HAND_WRITE_RATE_PER_HOUR); }

  cv.onDraw((ctx, w, hh, p) => {
    const hand = handCoverage(), bw = w - 40;
    ctx.fillStyle = p.soft; ctx.fillRect(20, hh / 2 - 15, bw, 30);
    ctx.fillStyle = p.warm; ctx.fillRect(20, hh / 2 - 15, bw * (hand / corpusSize), 30);
  });

  function update() {
    const hand = handCoverage();
    st.set("hand", `${hand} of ${corpusSize} (${((hand / corpusSize) * 100).toFixed(0)}%)`);
    st.set("synthetic", `${corpusSize} of ${corpusSize} (100%)`);
    say(`corpus of ${corpusSize.toLocaleString()} chunks: one workday of hand-writing covers ${((hand / corpusSize) * 100).toFixed(0)} percent; synthetic generation covers 100 percent`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
