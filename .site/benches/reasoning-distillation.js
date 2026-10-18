// Bench: compare a small model trained on answers only against one trained on full reasoning traces.
const APPROACHES = {
  "answer-only training": 0.42,
  "distilled from reasoning traces": 0.68,
};

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Learning the steps, not just the answer" });
  const say = live(body);
  let key = Object.keys(APPROACHES)[0];

  const cv = canvas(body, { aspect: 0.4, label: "Small-model accuracy" });
  const st = stats([["accuracy", "accuracy"]]);
  const ch = choice("Training approach", Object.keys(APPROACHES).map((k) => [k, k]), key, (v) => { key = v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bh = APPROACHES[key] * (hh - 30);
    ctx.fillStyle = p.accent;
    ctx.fillRect(w / 2 - 30, hh - 15 - bh, 60, bh);
  });

  function update() {
    st.set("accuracy", `${(APPROACHES[key] * 100).toFixed(0)}%`);
    say(`"${key}": ${(APPROACHES[key] * 100).toFixed(0)} percent accuracy`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
