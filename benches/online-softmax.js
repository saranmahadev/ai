// Bench: step through computing attention block by block with online softmax, comparing against the naive full-row result.
import { onlineSoftmaxInit, onlineSoftmaxBlock, onlineSoftmaxOutput, dot, softmax } from "./tfkit.js";
import { rng } from "./kit.js";

const N = 8, D = 3, BLOCK = 3;

export default function mount(root, kit) {
  const { frame, canvas, stepper, stats, live } = kit;
  const body = frame(root, { title: "The same softmax, one block at a time" });
  const say = live(body);

  const rand = rng(37);
  const q = Array.from({ length: D }, () => rand() * 2 - 1);
  const K = Array.from({ length: N }, () => Array.from({ length: D }, () => rand() * 2 - 1));
  const V = Array.from({ length: N }, () => Array.from({ length: D }, () => rand() * 2 - 1));
  const scores = K.map((k) => dot(q, k));
  const naive = (() => {
    const weights = softmax(scores);
    return V[0].map((_, j) => weights.reduce((s, w, i) => s + w * V[i][j], 0));
  })();

  let state, blockIdx;
  function reset() { state = onlineSoftmaxInit(D); blockIdx = 0; }
  reset();

  const cv = canvas(body, { aspect: 0.4, label: "Running output vs the naive full-row result" });
  const st = stats([["block", "blocks processed"], ["running", "running output"], ["naive", "naive output"]]);
  const sp = stepper({
    stepLabel: "Process next block",
    onStep: () => {
      const start = blockIdx * BLOCK, end = Math.min(N, start + BLOCK);
      if (start >= N) return false;
      state = onlineSoftmaxBlock(state, scores.slice(start, end), V.slice(start, end));
      blockIdx++;
      draw();
      return blockIdx * BLOCK < N;
    },
    onReset: () => { reset(); draw(); }
  });
  body.append(cv.box, st.el, sp.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (D + 1);
    const running = state.l > 0 ? onlineSoftmaxOutput(state) : new Array(D).fill(0);
    const maxAbs = Math.max(...naive.map(Math.abs), 0.1);
    for (let j = 0; j < D; j++) {
      const rh = (Math.abs(running[j]) / maxAbs) * (hh / 2 - 20);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (j + 0.5), hh / 2 - (running[j] >= 0 ? rh : 0), bw * 0.3, running[j] >= 0 ? rh : -rh);
      const nh = (Math.abs(naive[j]) / maxAbs) * (hh / 2 - 20);
      ctx.fillStyle = p.warm;
      ctx.fillRect(bw * (j + 0.5) + bw * 0.35, hh / 2 - (naive[j] >= 0 ? nh : 0), bw * 0.3, naive[j] >= 0 ? nh : -nh);
    }
    ctx.strokeStyle = p.muted; ctx.beginPath(); ctx.moveTo(0, hh / 2); ctx.lineTo(w, hh / 2); ctx.stroke();
  });

  function draw() {
    const running = state.l > 0 ? onlineSoftmaxOutput(state) : new Array(D).fill(0);
    st.set("block", String(blockIdx));
    st.set("running", running.map((v) => v.toFixed(4)).join(", "));
    st.set("naive", naive.map((v) => v.toFixed(4)).join(", "));
    say(`${blockIdx} blocks processed; running output ${running.map((v) => v.toFixed(3)).join(", ")}`);
    cv.redraw();
  }
  draw();
  return () => cv.destroy();
}
