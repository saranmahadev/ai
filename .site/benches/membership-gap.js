// Bench: the gap between training-set loss and held-out loss, and what it implies for membership inference.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "The confidence gap overfitting leaves behind" });
  const say = live(body);
  let trainLoss = 0.5, heldOutLoss = 160;

  const cv = canvas(body, { aspect: 0.5, label: "Training-set loss vs held-out loss, on a log scale" });
  const st = stats([["gap", "gap (held-out / training)"], ["risk", "membership-inference risk"]]);
  const st1 = slider({ label: "training-set loss", min: 0.01, max: 20, step: 0.01, value: trainLoss, onInput: (v) => { trainLoss = v; update(); } });
  const st2 = slider({ label: "held-out loss", min: 0.01, max: 300, step: 1, value: heldOutLoss, onInput: (v) => { heldOutLoss = v; update(); } });
  body.append(cv.box, st.el, st1.el, st2.el);

  cv.onDraw((ctx, w, hh, p) => {
    const maxLog = Math.log10(Math.max(trainLoss, heldOutLoss, 10));
    const bars = [["training-set loss", trainLoss, p.good], ["held-out loss", heldOutLoss, p.warm]];
    const bw = w / 3;
    bars.forEach(([label, v, color], i) => {
      const bh = (Math.log10(Math.max(0.01, v)) / maxLog) * (hh - 36);
      ctx.fillStyle = color; ctx.fillRect(bw * (i + 1) - bw * 0.3, hh - 20 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 1), hh - 4);
      ctx.fillText(v.toFixed(2), bw * (i + 1), hh - 24 - bh);
    });
  });

  function update() {
    const ratio = heldOutLoss / trainLoss;
    st.set("gap", `${ratio.toFixed(1)}×`);
    st.set("risk", ratio > 10 ? "high — training membership is easy to guess" : ratio > 3 ? "moderate" : "low — losses are similar");
    say(`held-out loss is ${ratio.toFixed(1)} times the training-set loss`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
