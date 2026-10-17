// Bench: compare full fine-tuning's parameter count against a LoRA low-rank update's, and its effect on output.
import { loraDelta, addMatrix } from "./gakit.js";
import { rng } from "./kit.js";

const D = 64;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "A low-rank update instead of a full one" });
  const say = live(body);
  let rank = 4;

  const cv = canvas(body, { aspect: 0.4, label: "Parameter count: full fine-tune vs. LoRA" });
  const st = stats([["savings", "parameter savings"], ["change", "output change magnitude"]]);
  const sl = slider({ label: "LoRA rank (r)", min: 1, max: 16, step: 1, value: rank, format: (v) => String(v), onInput: (v) => { rank = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  let fullParams = D * D, loraParams = 0;
  cv.onDraw((ctx, w, hh, p) => {
    const maxH = hh - 30, bw = w / 3;
    const fh = (fullParams / fullParams) * maxH, lh = (loraParams / fullParams) * maxH;
    ctx.fillStyle = p.soft; ctx.fillRect(bw * 0.5, hh - 15 - fh, bw * 0.8, fh);
    ctx.fillStyle = p.accent; ctx.fillRect(bw * 1.7, hh - 15 - lh, bw * 0.8, lh);
  });

  function update() {
    const rand = rng(42);
    const randMat = (rows, cols, scale) => Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rand() * 2 - 1) * scale));
    const W = randMat(D, D, 0.3), A = randMat(D, rank, 0.2), B = randMat(rank, D, 0.2);
    const Wprime = addMatrix(W, loraDelta(A, B));
    const x = randMat(1, D, 1)[0];
    const matvec = (M, v) => M.map((row) => row.reduce((s, val, i) => s + val * v[i], 0));
    const yBase = matvec(W, x), yAdapted = matvec(Wprime, x);
    const diff = Math.sqrt(yBase.reduce((s, v, i) => s + (v - yAdapted[i]) ** 2, 0));

    loraParams = 2 * D * rank;
    st.set("savings", `${((1 - loraParams / fullParams) * 100).toFixed(1)}%`);
    st.set("change", diff.toFixed(4));
    say(`rank ${rank}: ${loraParams} LoRA parameters vs ${fullParams} full, output change ${diff.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
