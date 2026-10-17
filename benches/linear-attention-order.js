// Bench: compute attention two mathematically equivalent ways and compare their arithmetic cost at different scales.
import { linearAttentionQuadraticOrder, linearAttentionLinearOrder } from "./tfkit.js";
import { rng } from "./kit.js";

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Same answer, two different costs" });
  const say = live(body);
  let n = 5, d = 3, seqLen = 1000, width = 64;

  const cv = canvas(body, { aspect: 0.5, label: "Arithmetic cost of each order at the chosen scale" });
  const st = stats([["match", "small-example outputs match?"], ["quad", "quadratic-order cost"], ["lin", "linear-order cost"], ["ratio", "reduction"]]);
  const slN = slider({ label: "sequence length (for the cost comparison)", min: 10, max: 20000, step: 10, value: seqLen, format: (v) => v.toLocaleString(), onInput: (v) => { seqLen = v; update(); } });
  const slD = slider({ label: "model width d", min: 4, max: 256, step: 4, value: width, format: (v) => String(v), onInput: (v) => { width = v; update(); } });
  body.append(cv.box, st.el, slN.el, slD.el);

  cv.onDraw((ctx, w, hh, p) => {
    const quad = 2 * seqLen * seqLen * width, lin = 2 * seqLen * width * width;
    const bars = [["quadratic order", quad, p.warm], ["linear order", lin, p.good]];
    const bw = w / 3;
    const maxV = Math.max(quad, lin);
    bars.forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 50);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 1) - bw * 0.3, hh - 30 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 1), hh - 10);
      ctx.fillText(v.toLocaleString(), bw * (i + 1), hh - 34 - bh);
    });
  });

  function update() {
    const rand = rng(31);
    const randMat = (a, b, scale) => Array.from({ length: a }, () => Array.from({ length: b }, () => (rand() * 2 - 1) * scale));
    const Q = randMat(n, d, 1), K = randMat(n, d, 1), V = randMat(n, d, 1);
    const outQuad = linearAttentionQuadraticOrder(Q, K, V);
    const outLin = linearAttentionLinearOrder(Q, K, V);
    const match = outQuad.every((row, i) => row.every((v, j) => Math.abs(v - outLin[i][j]) < 1e-9));

    const quadCost = 2 * seqLen * seqLen * width, linCost = 2 * seqLen * width * width;
    st.set("match", match ? "yes, identical" : "no");
    st.set("quad", quadCost.toLocaleString());
    st.set("lin", linCost.toLocaleString());
    st.set("ratio", `${(quadCost / linCost).toFixed(1)}×`);
    say(`outputs ${match ? "match" : "differ"}; at n=${seqLen}, d=${width}: ${(quadCost / linCost).toFixed(1)} times fewer operations`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
