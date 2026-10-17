// Bench: compare full fine-tuning's parameter count against a LoRA-style low-rank update's.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "How many parameters actually need to change" });
  const say = live(body);
  let d = 1024, r = 8;

  const cv = canvas(body, { aspect: 0.4, label: "Trainable parameters, full vs. low-rank" });
  const st = stats([["full", "full fine-tune params"], ["lora", "low-rank params"], ["ratio", "fewer by"]]);
  const sd = slider({ label: "hidden size d", min: 128, max: 4096, step: 128, value: d, format: (v) => String(v), onInput: (v) => { d = v; update(); } });
  const sr = slider({ label: "rank r", min: 1, max: 64, step: 1, value: r, format: (v) => String(v), onInput: (v) => { r = v; update(); } });
  body.append(cv.box, st.el, sd.el, sr.el);

  cv.onDraw((ctx, w, hh, p) => {
    const full = d * d, lora = 2 * d * r;
    const maxV = full;
    const bw = w / 3;
    [["full fine-tune", full, p.warm], ["LoRA", lora, p.accent]].forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 30);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.3, hh - 2);
    });
  });

  function update() {
    const full = d * d, lora = 2 * d * r;
    st.set("full", full.toLocaleString());
    st.set("lora", lora.toLocaleString());
    st.set("ratio", `${(full / lora).toFixed(1)}×`);
    say(`d=${d}, r=${r}: full fine-tune ${full.toLocaleString()} parameters, LoRA ${lora.toLocaleString()} parameters, ${(full / lora).toFixed(1)} times fewer`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
