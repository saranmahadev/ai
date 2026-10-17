// Bench: compare classical discrete Hopfield recall against the continuous, softmax-weighted (attention-equivalent) recall on the same cue.
import { hopfieldWeights, hopfieldSettle, modernHopfieldUpdate } from "./nnkit.js";

const PATTERNS = [
  [1, 1, 1, -1, -1, -1],
  [1, -1, 1, -1, 1, -1],
  [-1, -1, 1, 1, 1, -1]
];
const CUE = [1, 1, -1, -1, -1, -1];
const W = hopfieldWeights(PATTERNS);

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Classical and modern recall, side by side" });
  const say = live(body);
  let beta = 1;

  const cv = canvas(body, { aspect: 0.5, label: "The classical settled state, and the continuous version's weights at the chosen temperature" });
  const st = stats([["classical", "classical settled state"], ["w1", "modern weight on pattern 1"], ["w2", "modern weight on pattern 2"], ["w3", "modern weight on pattern 3"]]);
  const sl = slider({ label: "inverse temperature β", min: 0.2, max: 10, step: 0.2, value: beta, format: (v) => v.toFixed(1), onInput: (v) => { beta = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  const order = [0, 1, 2, 3, 4, 5];
  const { s: classical } = hopfieldSettle(W, CUE, order, 10);

  let modern = modernHopfieldUpdate(PATTERNS, CUE, beta);
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / 4;
    const cols = [["classical", 1, p.good], ["p1", modern.weights[0], p.accent], ["p2", modern.weights[1], p.accent], ["p3", modern.weights[2], p.accent]];
    cols.forEach(([label, v, color], i) => {
      const bh = v * (hh - 50);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.5) - bw * 0.3, hh - 30 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 0.5), hh - 10);
      ctx.fillText(v.toFixed(3), bw * (i + 0.5), hh - 34 - bh);
    });
  });

  function update() {
    modern = modernHopfieldUpdate(PATTERNS, CUE, beta);
    st.set("classical", `[${classical.join(", ")}]`);
    st.set("w1", modern.weights[0].toFixed(4));
    st.set("w2", modern.weights[1].toFixed(4));
    st.set("w3", modern.weights[2].toFixed(4));
    say(`classical settled on pattern 1; modern weights at β=${beta.toFixed(1)}: ${modern.weights.map((v) => v.toFixed(3)).join(", ")}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
