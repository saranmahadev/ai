// Bench: use a tied embedding matrix as the output projection, and compare tied vs untied parameter counts.
import { dot } from "./tfkit.js";

const E = [
  [0.1, -0.2, 0.3],
  [0.4, 0.1, -0.1],
  [-0.3, 0.5, 0.2],
  [0.2, 0.2, 0.2]
];
const LABELS = ["token 0", "token 1", "token 2", "token 3"];

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "One matrix, two jobs" });
  const say = live(body);
  let h = [0.5, -1.0, 0.2];
  let vocabSize = 30522, dModel = 768;

  const cv = canvas(body, { aspect: 0.4, label: "Output logits from the tied embedding matrix" });
  const st = stats([["untied", "untied parameters"], ["tied", "tied parameters"], ["saved", "saved"]]);
  const sliders = h.map((v, i) => slider({ label: `hidden state h[${i}]`, min: -2, max: 2, step: 0.1, value: v, format: (x) => x.toFixed(1), onInput: (x) => { h[i] = x; update(); } }));
  const slV = slider({ label: "vocabulary size", min: 1000, max: 60000, step: 1000, value: vocabSize, format: (v) => v.toLocaleString(), onInput: (v) => { vocabSize = v; update(); } });
  const slD = slider({ label: "d_model", min: 64, max: 1024, step: 64, value: dModel, format: (v) => String(v), onInput: (v) => { dModel = v; update(); } });
  body.append(cv.box, st.el, ...sliders.map((s) => s.el), slV.el, slD.el);

  let logits = [];
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (E.length + 1);
    const maxAbs = Math.max(...logits.map(Math.abs), 0.1);
    logits.forEach((v, i) => {
      const bh = (Math.abs(v) / maxAbs) * (hh / 2 - 20);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.5), hh / 2 - (v >= 0 ? bh : 0), bw * 0.6, v >= 0 ? bh : -bh);
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(LABELS[i], bw * (i + 0.5) + bw * 0.3, hh - 6);
      ctx.fillText(v.toFixed(3), bw * (i + 0.5) + bw * 0.3, hh / 2 - (v >= 0 ? bh + 8 : -bh - 8));
    });
    ctx.strokeStyle = p.muted; ctx.beginPath(); ctx.moveTo(0, hh / 2); ctx.lineTo(w, hh / 2); ctx.stroke();
  });

  function update() {
    logits = E.map((row) => dot(row, h));
    const untied = 2 * vocabSize * dModel, tied = vocabSize * dModel;
    st.set("untied", untied.toLocaleString());
    st.set("tied", tied.toLocaleString());
    st.set("saved", `${(untied - tied).toLocaleString()} (50%)`);
    say(`logits ${logits.map((v) => v.toFixed(2)).join(", ")}; tying saves ${(untied - tied).toLocaleString()} parameters`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
