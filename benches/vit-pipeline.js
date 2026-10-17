// Bench: patchify a small image, project patches, prepend a CLS token, and attend over the sequence.
import { patchify, matvec, vecAdd, selfAttention, layerNorm } from "./tfkit.js";
import { rng } from "./kit.js";

const SIZE = 8, D_MODEL = 4;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "From patches to a classification token" });
  const say = live(body);
  let patchSize = 4, seed = 47;

  const cv = canvas(body, { aspect: 0.5, label: "CLS token's vector, before and after attending over the patches" });
  const st = stats([["patches", "number of patches"], ["before", "CLS before attention"], ["after", "CLS after attention"]]);
  const slP = slider({ label: "patch size", min: 2, max: 8, step: 2, value: patchSize, format: (v) => `${v}×${v}`, onInput: (v) => { patchSize = v; update(); } });
  body.append(cv.box, st.el, slP.el);

  let before, after;
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (D_MODEL + 1);
    const rows = [["before", before, p.warm], ["after", after, p.accent]];
    const rowH = hh / rows.length;
    rows.forEach(([label, vec, color], r) => {
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left";
      ctx.fillText(label, 4, r * rowH + 14);
      const maxAbs = Math.max(...vec.map(Math.abs), 0.1);
      vec.forEach((v, i) => {
        const bh = (Math.abs(v) / maxAbs) * (rowH / 2 - 16);
        ctx.fillStyle = color;
        ctx.fillRect(bw * (i + 0.7), r * rowH + rowH / 2 - (v >= 0 ? bh : 0), bw * 0.5, v >= 0 ? bh : -bh);
      });
      ctx.strokeStyle = p.muted; ctx.beginPath(); ctx.moveTo(0, r * rowH + rowH / 2); ctx.lineTo(w, r * rowH + rowH / 2); ctx.stroke();
    });
  });

  function update() {
    const rand = rng(seed);
    const img = Array.from({ length: SIZE }, (_, r) => Array.from({ length: SIZE }, (_, c) => (r * SIZE + c) / 63));
    const patches = patchify(img, patchSize);
    const randMat = (a, b, scale) => Array.from({ length: a }, () => Array.from({ length: b }, () => (rand() * 2 - 1) * scale));
    const Wproj = randMat(D_MODEL, patches[0].length, 0.3);
    const patchEmbeds = patches.map((pt) => matvec(Wproj, pt));
    const clsToken = Array.from({ length: D_MODEL }, () => (rand() * 2 - 1) * 0.3);
    const seq = [clsToken, ...patchEmbeds];
    const posEmbeds = randMat(seq.length, D_MODEL, 0.2);
    const withPos = seq.map((v, i) => vecAdd(v, posEmbeds[i]));
    before = withPos[0];
    const Wq = randMat(D_MODEL, D_MODEL, 0.5), Wk = randMat(D_MODEL, D_MODEL, 0.5), Wv = randMat(D_MODEL, D_MODEL, 0.5);
    const normed = withPos.map((v) => layerNorm(v));
    const { out } = selfAttention(normed, { Wq, Wk, Wv });
    after = out[0];
    st.set("patches", String(patches.length));
    st.set("before", before.map((v) => v.toFixed(3)).join(", "));
    st.set("after", after.map((v) => v.toFixed(3)).join(", "));
    say(`${patches.length} patches; CLS token's vector updated after attending over all of them`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
