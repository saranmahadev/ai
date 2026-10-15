// Bench: route an input to its top-k experts via a softmax router, then combine their outputs.
import { softmax } from "./dlkit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Routing an input to its top experts" });
  const say = live(body);
  let logits = [1.2, 0.3, 2.5, -0.5], outputs = [3, 1, 5, 2], k = 2;

  const cv = canvas(body, { aspect: 0.5, label: "Router scores (bars) with selected experts highlighted" });
  const st = stats([["selected", "selected experts"], ["weights", "renormalised weights"], ["out", "combined output"]]);
  const logitSliders = logits.map((v, i) => slider({ label: `expert ${i} router score`, min: -2, max: 3, step: 0.1, value: v, format: (val) => val.toFixed(1), onInput: (val) => { logits[i] = val; update(); } }));
  const outSliders = outputs.map((v, i) => slider({ label: `expert ${i} output`, min: 0, max: 10, step: 0.5, value: v, onInput: (val) => { outputs[i] = val; update(); } }));
  const sk = slider({ label: "k (experts kept)", min: 1, max: 4, step: 1, value: k, onInput: (v) => { k = v; update(); } });
  body.append(cv.box, st.el, ...logitSliders.map((s) => s.el), ...outSliders.map((s) => s.el), sk.el);

  function compute() {
    const probs = softmax(logits);
    const order = probs.map((p, i) => [p, i]).sort((a, b) => b[0] - a[0]).slice(0, k);
    const sum = order.reduce((s, [p]) => s + p, 0);
    const weighted = order.map(([p, i]) => [i, p / sum]);
    const combined = weighted.reduce((s, [i, w]) => s + w * outputs[i], 0);
    return { probs, weighted, combined };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const { probs, weighted } = compute();
    const selected = new Set(weighted.map(([i]) => i));
    const n = probs.length, gw = w / n;
    probs.forEach((prob, i) => {
      const bh = prob * (hh - 30);
      ctx.fillStyle = selected.has(i) ? p.accent : p.soft2;
      ctx.fillRect(i * gw + gw * 0.25, hh - 20 - bh, gw * 0.5, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`expert ${i}`, i * gw + gw / 2, hh - 4);
    });
  });

  function update() {
    const { weighted, combined } = compute();
    st.set("selected", weighted.map(([i]) => `expert ${i}`).join(", "));
    st.set("weights", weighted.map(([i, w]) => `${i}: ${w.toFixed(3)}`).join(", "));
    st.set("out", combined.toFixed(4));
    say(`combined output ${combined.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
