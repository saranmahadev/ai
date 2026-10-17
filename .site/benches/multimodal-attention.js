// Bench: combine text and image-patch embeddings into one sequence and see how attention spreads across both.
import { embeddingLookup, matvec, selfAttention, layerNorm } from "./tfkit.js";
import { rng } from "./kit.js";

const D_MODEL = 4, PATCH_DIM = 8;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "One sequence, two modalities" });
  const say = live(body);
  let numText = 2, numPatches = 2;

  const cv = canvas(body, { aspect: 0.5, label: "Text position 0's attention across the combined sequence" });
  const st = stats([["toText", "attention to text positions"], ["toImage", "attention to image positions"]]);
  const slT = slider({ label: "number of text tokens", min: 1, max: 5, step: 1, value: numText, format: (v) => String(v), onInput: (v) => { numText = v; update(); } });
  const slP = slider({ label: "number of image patches", min: 1, max: 5, step: 1, value: numPatches, format: (v) => String(v), onInput: (v) => { numPatches = v; update(); } });
  body.append(cv.box, st.el, slT.el, slP.el);

  let weightsRow = [];
  cv.onDraw((ctx, w, hh, p) => {
    const n = weightsRow.length;
    const bw = w / (n + 1);
    weightsRow.forEach((v, i) => {
      const isText = i < numText;
      const bh = v * (hh - 50);
      ctx.fillStyle = isText ? p.accent : p.warm;
      ctx.fillRect(bw * (i + 0.5), hh - 24 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(isText ? `t${i}` : `p${i - numText}`, bw * (i + 0.5) + bw * 0.3, hh - 8);
    });
  });

  function update() {
    const rand = rng(53);
    const randMat = (a, b, scale) => Array.from({ length: a }, () => Array.from({ length: b }, () => (rand() * 2 - 1) * scale));
    const textTable = randMat(10, D_MODEL, 0.5);
    const textIds = Array.from({ length: numText }, () => Math.floor(rand() * 10));
    const textEmbeds = textIds.map((id) => embeddingLookup(textTable, id));
    const Wproj = randMat(D_MODEL, PATCH_DIM, 0.3);
    const patchEmbeds = Array.from({ length: numPatches }, () => matvec(Wproj, Array.from({ length: PATCH_DIM }, () => rand())));
    const seq = [...textEmbeds, ...patchEmbeds];

    const Wq = randMat(D_MODEL, D_MODEL, 0.5), Wk = randMat(D_MODEL, D_MODEL, 0.5), Wv = randMat(D_MODEL, D_MODEL, 0.5);
    const normed = seq.map((x) => layerNorm(x));
    const { weights } = selfAttention(normed, { Wq, Wk, Wv });
    weightsRow = weights[0];

    const toText = weightsRow.slice(0, numText).reduce((a, b) => a + b, 0);
    const toImage = weightsRow.slice(numText).reduce((a, b) => a + b, 0);
    st.set("toText", toText.toFixed(4));
    st.set("toImage", toImage.toFixed(4));
    say(`text position 0 spends ${(toText * 100).toFixed(0)}% attention on text, ${(toImage * 100).toFixed(0)}% on image patches`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
