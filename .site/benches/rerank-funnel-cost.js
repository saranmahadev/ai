// Bench: compare the cost of cross-encoding an entire collection against a bi-encoder-then-re-rank funnel.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Expensive scoring, saved for a short list" });
  const say = live(body);
  let shortlist = 50;
  const COLLECTION = 10000;

  const cv = canvas(body, { aspect: 0.4, label: "Cost units: cross-encoding everything vs. the funnel" });
  const st = stats([["speedup", "funnel speedup"]]);
  const sl = slider({ label: "shortlist size kept for re-ranking", min: 10, max: 500, step: 10, value: shortlist, format: (v) => String(v), onInput: (v) => { shortlist = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  function costs() {
    const full = COLLECTION * 100;
    const funnel = COLLECTION + shortlist * 100;
    return { full, funnel };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const { full, funnel } = costs();
    const bw = w / 3, maxV = full;
    [["cross-encode everything", full, p.warm], ["bi-encode + re-rank shortlist", funnel, p.accent]].forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 30);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.3, hh - 2);
    });
  });

  function update() {
    const { full, funnel } = costs();
    st.set("speedup", `${(full / funnel).toFixed(1)}×`);
    say(`shortlist ${shortlist}: cross-encoding the full ${COLLECTION.toLocaleString()}-document collection costs ${full.toLocaleString()} units; the funnel costs ${funnel.toLocaleString()} units, a ${(full / funnel).toFixed(1)}x speedup`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
