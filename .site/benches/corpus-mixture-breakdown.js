// Bench: filter a toy pretraining corpus by a quality threshold and watch its composition shift.
const DOCS = [
  { source: "web", quality: 0.9 }, { source: "web", quality: 0.3 }, { source: "web", quality: 0.6 },
  { source: "web", quality: 0.2 }, { source: "web", quality: 0.8 }, { source: "web", quality: 0.1 },
  { source: "books", quality: 0.95 }, { source: "books", quality: 0.85 },
  { source: "code", quality: 0.9 }, { source: "code", quality: 0.4 },
];

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Filtering shifts what's left" });
  const say = live(body);
  let threshold = 0;

  const cv = canvas(body, { aspect: 0.45, label: "Documents kept, by source" });
  const st = stats([["kept", "documents kept"]]);
  const sl = slider({ label: "quality threshold", min: 0, max: 1, step: 0.05, value: threshold, format: (v) => v.toFixed(2), onInput: (v) => { threshold = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let counts = {};
  cv.onDraw((ctx, w, hh, p) => {
    const labels = Object.keys(counts), bw = w / (labels.length + 1);
    labels.forEach((l, i) => {
      const bh = (counts[l] / DOCS.length) * (hh - 40);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.5), hh - 20 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(l, bw * (i + 0.5) + bw * 0.3, hh - 6);
    });
  });

  function update() {
    const kept = DOCS.filter((d) => d.quality >= threshold);
    counts = { web: 0, books: 0, code: 0 };
    kept.forEach((d) => counts[d.source]++);
    st.set("kept", `${kept.length} of ${DOCS.length}`);
    say(`threshold ${threshold.toFixed(2)}: kept ${kept.length} of ${DOCS.length} documents`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
