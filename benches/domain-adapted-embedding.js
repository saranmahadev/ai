// Bench: compare a general-purpose embedding's sense confusion against a domain-adapted one's clean separation.
import { cosineSim } from "./gakit.js";

const MODELS = {
  "general-purpose": { query: [0.5, 0.5], medicalSense: [0.6, 0.4], geoSense: [0.45, 0.55] },
  "domain-adapted (fine-tuned on medical text)": { query: [0.9, 0.1], medicalSense: [0.92, 0.08], geoSense: [0.1, 0.9] },
};

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "The same two letters, two very different meanings" });
  const say = live(body);
  let model = Object.keys(MODELS)[0];

  const cv = canvas(body, { aspect: 0.4, label: "Similarity of \"MI\" to its medical sense vs. its geographic sense" });
  const st = stats([["medical", "similarity to medical sense"], ["geo", "similarity to geographic sense"]]);
  const ch = choice("Embedding model", Object.keys(MODELS).map((k) => [k, k]), model, (v) => { model = v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const m = MODELS[model];
    const medical = cosineSim(m.query, m.medicalSense), geo = cosineSim(m.query, m.geoSense);
    const bw = w / 3;
    [["medical", medical, p.accent], ["geographic", geo, p.warm]].forEach(([label, v, color], i) => {
      const bh = v * (hh - 30);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.3, hh - 2);
    });
  });

  function update() {
    const m = MODELS[model];
    const medical = cosineSim(m.query, m.medicalSense), geo = cosineSim(m.query, m.geoSense);
    st.set("medical", medical.toFixed(4));
    st.set("geo", geo.toFixed(4));
    say(`${model}: "MI" similarity to medical sense ${medical.toFixed(3)}, to geographic sense ${geo.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
