// Bench: upweight a small, high-quality domain and watch its share of a sampled training budget grow.
import { weightedMixture } from "./llmkit.js";

const RAW = { web: 900, books: 60, code: 40 };

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Upweighting a small domain" });
  const say = live(body);
  let codeWeight = 1;

  const cv = canvas(body, { aspect: 0.45, label: "Sampled budget by domain" });
  const st = stats([["code", "code's share of the budget"]]);
  const sl = slider({ label: "code sampling weight", min: 1, max: 10, step: 1, value: codeWeight, format: (v) => `${v}×`, onInput: (v) => { codeWeight = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let sampled = {};
  cv.onDraw((ctx, w, hh, p) => {
    const labels = Object.keys(sampled), bw = w / (labels.length + 1);
    const max = 1000;
    labels.forEach((l, i) => {
      const bh = (sampled[l] / max) * (hh - 40);
      ctx.fillStyle = l === "code" ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 20 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(l, bw * (i + 0.5) + bw * 0.3, hh - 6);
    });
  });

  function update() {
    const { sampled: s } = weightedMixture(RAW, { web: 1, books: 1, code: codeWeight }, 1000);
    sampled = s;
    st.set("code", `${sampled.code} / 1000 (raw share: 40 / 1000)`);
    say(`code sampling weight ${codeWeight}×: code now makes up ${sampled.code} of 1000 sampled tokens`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
