// Bench: the modern (continuous) Hopfield update — a softmax-weighted average over stored patterns, exactly attention's formula.
import { modernHopfieldUpdate } from "./nnkit.js";

const PATTERNS = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const LABELS = ["pattern 1", "pattern 2", "pattern 3"];

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "One formula, two names" });
  const say = live(body);
  let q = [0.9, 0.1, 0.0], beta = 4;

  const cv = canvas(body, { aspect: 0.5, label: "Softmax weight on each stored pattern, and the resulting update" });
  const st = stats([["w1", "weight on pattern 1"], ["w2", "weight on pattern 2"], ["w3", "weight on pattern 3"]]);
  const sq1 = slider({ label: "query, component 1", min: 0, max: 1, step: 0.05, value: q[0], format: (v) => v.toFixed(2), onInput: (v) => { q[0] = v; update(); } });
  const sq2 = slider({ label: "query, component 2", min: 0, max: 1, step: 0.05, value: q[1], format: (v) => v.toFixed(2), onInput: (v) => { q[1] = v; update(); } });
  const sq3 = slider({ label: "query, component 3", min: 0, max: 1, step: 0.05, value: q[2], format: (v) => v.toFixed(2), onInput: (v) => { q[2] = v; update(); } });
  const sb = slider({ label: "inverse temperature β", min: 0.5, max: 12, step: 0.5, value: beta, format: (v) => v.toFixed(1), onInput: (v) => { beta = v; update(); } });
  body.append(cv.box, st.el, sq1.el, sq2.el, sq3.el, sb.el);

  let last;
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (PATTERNS.length + 1);
    PATTERNS.forEach((_, i) => {
      const bh = last.weights[i] * (hh - 50);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 1) - bw * 0.3, hh - 30 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(LABELS[i], bw * (i + 1), hh - 10);
      ctx.fillText(last.weights[i].toFixed(3), bw * (i + 1), hh - 34 - bh);
    });
  });

  function update() {
    last = modernHopfieldUpdate(PATTERNS, q, beta);
    st.set("w1", last.weights[0].toFixed(4));
    st.set("w2", last.weights[1].toFixed(4));
    st.set("w3", last.weights[2].toFixed(4));
    say(`query [${q.map((v) => v.toFixed(2)).join(", ")}], weights ${last.weights.map((v) => v.toFixed(3)).join(", ")}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
