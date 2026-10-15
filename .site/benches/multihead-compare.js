// Bench: two attention heads, each projecting a different part of the same tokens, compared side by side.
import { softmax } from "./dlkit.js";

const X = [[1, 0, 1, 0], [0, 1, 0, 1], [1, 1, 0, 0]];
const projA = (x) => [x[0], x[1]];
const projB = (x) => [x[2], x[3]];
const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];

function head(proj, queryIdx) {
  const Q = proj(X[queryIdx]);
  const Ks = X.map(proj), Vs = X.map(proj);
  const scores = Ks.map((k) => dot2(Q, k) / Math.SQRT2);
  const weights = softmax(scores);
  const out = [0, 0];
  weights.forEach((w, i) => { out[0] += w * Vs[i][0]; out[1] += w * Vs[i][1]; });
  return { weights, out };
}

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Two heads, two attention patterns" });
  const say = live(body);
  let q = 0;

  const cv = canvas(body, { aspect: 0.5, label: "Each head's attention weights over the three tokens" });
  const st = stats([["a", "head A output"], ["b", "head B output"]]);
  const ch = choice("Query token", [["0", "token 1"], ["1", "token 2"], ["2", "token 3"]], "0", (v) => { q = +v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const a = head(projA, q), b = head(projB, q);
    const n = 3, groupW = w / n;
    for (let i = 0; i < n; i++) {
      const x0 = i * groupW + groupW * 0.2, bw = groupW * 0.25;
      const barA = a.weights[i] * (hh - 30), barB = b.weights[i] * (hh - 30);
      ctx.fillStyle = p.accent; ctx.fillRect(x0, hh - 20 - barA, bw, barA);
      ctx.fillStyle = p.warm; ctx.fillRect(x0 + bw + 6, hh - 20 - barB, bw, barB);
      ctx.fillStyle = p.ink; ctx.font = "700 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`token ${i + 1}`, x0 + bw, hh - 4);
    }
  });

  function update() {
    const a = head(projA, q), b = head(projB, q);
    st.set("a", a.out.map((v) => v.toFixed(3)).join(", "));
    st.set("b", b.out.map((v) => v.toFixed(3)).join(", "));
    say(`head A weights ${a.weights.map((v) => v.toFixed(2)).join(", ")}; head B weights ${b.weights.map((v) => v.toFixed(2)).join(", ")}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
