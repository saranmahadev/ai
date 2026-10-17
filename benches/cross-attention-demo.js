// Bench: compare a decoder position's restricted causal self-attention against its unrestricted cross-attention.
import { selfAttention, crossAttention, causalMask } from "./tfkit.js";
import { rng } from "./kit.js";

const D = 4, ENC_LEN = 3;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Looking back at the whole source while generating" });
  const say = live(body);
  let decLen = 2, decPos = 0;

  const cv = canvas(body, { aspect: 0.5, label: "Self-attention weights vs cross-attention weights for this decoder position" });
  const st = stats([["self", "self-attention span"], ["cross", "cross-attention span"]]);
  const slLen = slider({ label: "decoder tokens so far", min: 1, max: 5, step: 1, value: decLen, format: (v) => String(v), onInput: (v) => { decLen = v; decPos = Math.min(decPos, v - 1); update(); } });
  const slPos = slider({ label: "decoder position to inspect", min: 0, max: decLen - 1, step: 1, value: decPos, format: (v) => String(v), onInput: (v) => { decPos = v; update(); } });
  body.append(cv.box, st.el, slLen.el, slPos.el);

  let selfW = [], crossW = [];
  cv.onDraw((ctx, w, hh, p) => {
    const rows = [["self-attention (decoder)", selfW, decLen], ["cross-attention (encoder)", crossW, ENC_LEN]];
    const rowH = hh / rows.length;
    rows.forEach(([label, weights, n], r) => {
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left";
      ctx.fillText(label, 4, r * rowH + 14);
      const bw = w / (n + 1);
      weights.forEach((v, i) => {
        const bh = v * (rowH - 40);
        ctx.fillStyle = p.accent;
        ctx.fillRect(bw * (i + 0.5), (r + 1) * rowH - 10 - bh, bw * 0.6, bh);
        ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(v.toFixed(2), bw * (i + 0.5) + bw * 0.3, (r + 1) * rowH - 12 - bh);
      });
    });
  });

  function update() {
    slPos.input.max = decLen - 1;
    const rand = rng(21);
    const randMat = (a, b, scale) => Array.from({ length: a }, () => Array.from({ length: b }, () => (rand() * 2 - 1) * scale));
    const Wq = randMat(D, D, 0.5), Wk = randMat(D, D, 0.5), Wv = randMat(D, D, 0.5);
    const enc = Array.from({ length: ENC_LEN }, () => Array.from({ length: D }, () => rand() * 2 - 1));
    const dec = Array.from({ length: decLen }, () => Array.from({ length: D }, () => rand() * 2 - 1));

    const { weights: sw } = selfAttention(dec, { Wq, Wk, Wv, mask: causalMask(decLen) });
    const { weights: cw } = crossAttention(dec, enc, { Wq, Wk, Wv });
    selfW = sw[decPos];
    crossW = cw[decPos];
    st.set("self", String(selfW.filter((v) => v > 0.001).length));
    st.set("cross", String(ENC_LEN));
    say(`decoder position ${decPos} of ${decLen}: self-attention spans ${selfW.filter((v) => v > 0.001).length} positions, cross-attention spans all ${ENC_LEN} encoder positions`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
